//Validador de data
const validator = require('./validators/validators');

//Clases
const Usuario = require('../classes/usuario');
const Paciente = require('../classes/paciente');

//logger
const loggerConfig = require('../configs/loggerConfig');
const logger = loggerConfig.logger;

//Envio de mail
const mailSender = require('./mailSender/mailSender');
const transporter = mailSender.transporter;
const jwt = require('jsonwebtoken');
const secrets = require('../localconfigs/secrets.js');

// Setup de redis
const config = require('../db/config');
const REDIS_URL = config.redis_config;
const redis = require('redis');//Usado para el manejo de Redis
const redisClient = redis.createClient({ REDIS_URL });

//Generacion de token
const signToken = (dni) => {
	const jwtPayload = { dni };
	return jwt.sign(jwtPayload, secrets.JWT_SECRET, {expiresIn: '2 hour'});
}

// Guardo en Redis el token generado
const setToken = (token, dni) => {
	return Promise.resolve(redisClient.set(token, dni));
}


// Manejo de creacion de una nueva cuenta
const crearNuevaCuenta = (db, bcrypt) => (req, res) => {
  const { nombre, apellido, fechaNacimiento, sexo, password, dni, email } = req.body;
  if(!nombre || !apellido || !fechaNacimiento || !sexo || !password || !dni || !email)
    return res.status(400).json();
  if(!validator.validarLetras(nombre) || !validator.validarLetras(apellido) || !validator.validarPassword(password) || !validator.validarNumeros(dni) || !validator.validarEmail(email))
    return res.status(400).json();
  buscarIdRolPaciente(db)
    .then((idRol) => {
      if(idRol.id){
        const nuevoUsuario = new Usuario(dni, password, bcrypt, idRol.id);
        db('usuarios').insert(nuevoUsuario)
          .then((data) => {
            const nuevoPaciente = new Paciente(nombre, apellido, fechaNacimiento, sexo, email);
            db('pacientes').insert(nuevoPaciente)
            .then(() => {
              //Genero el token
              const token = signToken(nuevoUsuario.dni);
              setToken(token, nuevoUsuario.dni);
              const mailOptions = mailSender.setMailOptions(nuevoPaciente.email, token);
              mailSender.sendEmail(transporter, mailOptions);
            })
            .catch((err) => {
              logger.error(err);
              return res.status(500).json();
            })
          })
          .catch((err) => {
            logger.error(err);
            return res.status(500).json();
          });
        return res.status(200).json('success');
      }
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json();
    });

}

// Buscar id rol paciente
const buscarIdRolPaciente = ((db) => {
  return db('roles').select('id')
    .where('descripcion', 'paciente')
    .then((data) => {
      return data[0];
    })
    .catch((error) => {
      logger.error(error);
      return undefined;
    });
});

const activarUsuario = (db) => (req, res) => {
  const token = req.params.token;
  if(token){
    redisClient.get(token, (err, reply) => {
  		if(err || !reply)
  			return res.status(400).json();
      db('usuarios')
         .where('dni', reply)
         .update({estado: 'activo'})
         .then(() => {
           logger.info('usuario activado');
           return res.status(200).json();
         })
         .catch((error) => {
           logger.error(error);
           return res.status(500).json();
         })
  	});
		redisClient.del(token);
		return res.status(200).redirect('http://localhost:4200/');
  } else {
		return res.status(400).json();
	}
};

module.exports = {
  crearNuevaCuenta,
  activarUsuario
}
