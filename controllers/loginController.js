const jwt = require('jsonwebtoken');//Usado para el manejo de los tokens
const redis = require('redis');//Usado para el manejo de Redis

//Configuración de conexión a redis
const config = require('../db/config');
const REDIS_URL = config.redis_config;
// Setup de redis
const redisClient = redis.createClient({ REDIS_URL });

// Secreto de tokens
const secrets = require('../localconfigs/secrets.js');

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
          .then(usuario => usuario[0])
          .catch(err => Promise.reject('Error buscando usuario'))
      } else {
        Promise.reject('DNI o password incorrectos.');
      }
    })
    .catch(err => Promise.reject('DNI o password incorrectos.'));
};


// Obtengo token de Redis
const getAuthToken = (req, res) => {
	const { authorization } = req.headers;
	return redisClient.get(authorization, (err, reply) => {
		if(err || !reply)
			return res.status(400).json('No tiene autorización');
		return res.json({token: reply})
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

// Creo una nueva sesión
const createSession = (usuario, db) => {
  const { dni, id, rol_id } = usuario;
	const token = signToken(dni);
	return setToken(token, id)
		.then(() => {
      return getRol(rol_id, db)
      .then((rol) => {
        const usuario_rol = rol.descripcion;
        return { success: 'true', usuarioId: id, token, usuario_rol };
      }).catch((err) => Promise.reject('Error obteniendo rol.'));
		}).catch(console.log);
}

// Obtener el rol de un determinado usuario
const getRol = (rol_id, db) => {
  return db.select('descripcion')
          .from('roles')
          .where('id', rol_id)
          .then(data => data[0])
          .catch(err => Promise.reject('Usuario sin rol asociado'))
}

const loginAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  // Si tiene un token en el header lo busco en redis para ver si es un token válido y si existe, lo devuelvo
  // Si no tiene un token en el header, busco si los datos corresponen a un usuario verdadero, le genero una nueva sesión a ese usuario y devuelvo el token generado
  return authorization ? getAuthToken(req, res) :
    handleLogin (db, bcrypt, req, res)
      .then(data => data.id && data.dni && data.rol_id ? createSession(data, db) : Promise.reject(data))
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err));
};

module.exports = { loginAuthentication };
