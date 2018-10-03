const db_password = require ('../localconfigs/db');

//Configuración de conexión a la BD postgresql
const connection_config = `postgres://postgres:${db_password.db_password}@localhost:5432/tesis_medica`;

//Conexión a redis
const redis_config = 'redis://redis:6379';

module.exports = {
  connection_config,
  redis_config
};
