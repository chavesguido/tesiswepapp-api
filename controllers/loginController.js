const jwt = require('jsonwebtoken');//Usado para el manejo de los tokens
const redis = require('redis');//Usado para el manejo de Redis

//Configuración de conexión a redis
const config = require('../db/config');
const REDIS_URL = config.redis_config;

// Setup de redis
const redisClient = redis.createClient({ REDIS_URL });

// Secreto de tokens
const secrets = require('../localconfigs/secrets.js');

//logger
const loggerConfig = require('../configs/loggerConfig');
const logger = loggerConfig.logger;

//Envio de mail
const mailSender = require('./mailSender/mailSender');
const transporter = mailSender.transporter;

//Validador de data
const validator = require('./validators/validators');

// Manejo del login en el sistema
const handleLogin = (db, bcrypt, req, res) => {
  const { dni, password } = req.body;
  if(!dni || !password){
    return Promise.reject('Credenciales inválidas');
  }
  return db.select('dni', 'password')
    .from('usuarios')
    .where('dni', dni)
    .then( data => {
      const claveValida = bcrypt.compareSync(password, data[0].password);
      if(claveValida){
        return db.select('*')
          .from('usuarios')
          .where('dni', dni)
          .then((usuario) => {
            if(usuario[0].estado != 'activo'){
              logger.info('El usuario no esta activo');
              return Promise.reject('El usuario no esta activo');
            }
            return usuario[0];
          })
          .catch((err) => {
            if(err == 'El usuario no esta activo')
              return Promise.reject('El usuario no esta activo');
            logger.error(err);
            return Promise.reject('Error buscando usuario');
          });
      } else {
        logger.info('DNI o password incorrectos');
        return Promise.reject('DNI o password incorrectos');
      }
    })
    .catch((err) => {
      if(err == 'El usuario no esta activo')
        return Promise.reject('El usuario no esta activo');
      if(err == 'Error buscando usuario')
        return Promise.reject('Error buscando usuario');
      logger.error(err);
      return Promise.reject('Error buscando usuario');
    });
};


// Obtengo token de Redis
const getAuthToken = (req, res) => {
	const { authorization } = req.headers;
	return redisClient.get(authorization, (err, reply) => {
		if(err || !reply)
			return res.status(400).json('No tiene autorización');
		return res.json({token: reply});
	})
}

// Genero un token y lo firmo con el DNI del usuario y un secreto
const signToken = (dni) => {
	const jwtPayload = { dni };
	return jwt.sign(jwtPayload, secrets.JWT_SECRET, {expiresIn: '1 hour'});
}

// Guardo en Redis el token generado
const setToken = (token, id) => {
	return Promise.resolve(redisClient.set(token, id));
}

// Guardo en Redis el codigo de 6 digitos generado por olvido de password
const setCodigo = (codigo, email) => {
	return Promise.resolve(redisClient.set(codigo, email));
}

// Creo una nueva sesión
const createSession = (usuario, db) => {
  const { dni, id, id_rol } = usuario;
	const token = signToken(dni);
	return setToken(token, id)
		.then(() => {
      return getRol(id_rol, db)
      .then((rol) => {
        const usuario_rol = rol.descripcion;
        return { success: 'true', usuarioId: id, token, usuario_rol };
      }).catch((err) => {
        logger.error(err);
        return Promise.reject('Error obteniendo rol.')
      });
		}).catch((err) => {
      logger.error(err);
      return Promise.reject(err);
    });
}

// Obtener el rol de un determinado usuario
const getRol = (id_rol, db) => {
  return db.select('descripcion')
          .from('roles')
          .where('id', id_rol)
          .then(data => data[0])
          .catch((err) => {
            logger.error(err);
            return Promise.reject(err);
          })
}

//Generar código aleatorio de 6 dígitos para resetear password
const generarCodigoPassword = () => {
  return Math.floor(Math.pow(10, 6-1) + Math.random() * (Math.pow(10, 6) - Math.pow(10, 6-1) - 1));
}

const loginAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  // Si tiene un token en el header lo busco en redis para ver si es un token válido y si existe, lo devuelvo
  // Si no tiene un token en el header, busco si los datos corresponen a un usuario verdadero, le genero una nueva sesión a ese usuario y devuelvo el token generado
  if(authorization)
    return getAuthToken(req, res);
  else
    return handleLogin (db, bcrypt, req, res)
      .then((data) => {
          if(data.id && data.dni && data.id_rol)
            return createSession(data, db);
          else
            return Promise.reject(data);
      })
      .then(session => res.json(session))
      .catch((err) => {
        logger.error(err);
        if(err=='DNI o password incorrectos')
          return res.status(404).json();
        if(err=='El usuario no esta activo')
          return res.status(403).json();
        return res.status(500).json(err);
      });
};

// Manejo de olvido de password. Se chequea que el email es valido
// Se genera un codigo de 6 digitos random y se le envia al mail
const olvidoPassword = (db) => (req, res) => {
  const { email } = req.body;
  if(!email)
    return res.status(400).json();
  //Busco si existe un paciente con el email ingresado
  db('pacientes')
    .select('*')
    .where('email', email)
    .then((pac) => {
      if(pac[0]){
        const codigo = generarCodigoPassword();
        const mailOptions = mailSender.setMailOptionsPassword(email, codigo);
        mailSender.sendEmail(transporter, mailOptions);
        setCodigo(codigo, email);
        return res.status(200).json();
      } else {
        logger.info('Paciente no encontrado.');
        return res.status(404).json();
      }
    })
    .catch((error) => {
      logger.error(error);
      return res.status(500).json(error);
    })
};

// Manejo de envio de codigo para verificar que es un codigo Valido
// Se obtiene de redis el email asociado al codigo y se verifica tanto que el codigo es valido
// como que el mail asociado al codigo es el del paciente en cuestion
const confirmCodigoPassword = (db) => (req, res) => {
  const { codigo } = req.body;
  if(!codigo)
    return res.status(400).json();
  redisClient.get(codigo, (err, reply) => {
    if(err || !reply)
      return res.status(400).json();
    db('pacientes')
       .select('*')
       .where('email', reply)
       .then((pac) => {
         console.log(pac[0]);
         if(!pac){
           logger.info('Paciente no encontrado.');
           return res.status(404).json();
         } else {
           redisClient.del(codigo);
           return res.status(200).json();
         }
       })
       .catch((error) => {
         logger.error(error);
         return res.status(500).json();
       })
  });
};


// Manejo del cambio de password una vez validado el codigo
// se hashea el nuevo password se busca el usuario asociado al paciente y se le modifica por la nueva password
const changePassword = (db, bcrypt) => (req, res) => {
  const { password, email } = req.body;
  if(!password || !validator.validarPassword(password) || !email || !validator.validarEmail(email))
    return res.status(400).json();
  const passwordHasheada = bcrypt.hashSync(password);
  // Busco el paciente y me quedo con el id del usuario
  db('pacientes')
    .select('id_usuario')
    .where('email', email)
    .then((pac) =>{
      if(pac){
        //Busco el usuario y cambio la pass por la nueva
        db('usuarios')
          .where('id', pac[0].id_usuario)
          .update({password : passwordHasheada})
          .then(() => {
            logger.info('password cambiada');
            return res.status(200).json();
          })
          .catch((err) => {
            logger.error(err);
            return res.status(500).json();
          });
      } else {
        logger.info('paciente no encontrado');
        return res.status(404).json();
      }
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json();
    });
};

// Manejo del cierre de sesion
const cerrarSesion = () => (res, req) => {
  const { token } = req.body;
  if(!token)
    return res.status(400).json();
  redisClient.del(token);
  return res.status(200).json();
};

module.exports = {
  loginAuthentication,
  olvidoPassword,
  confirmCodigoPassword,
  changePassword,
  cerrarSesion,
  redisClient
};
