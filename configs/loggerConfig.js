const winston = require ('winston');// Usado para logs del server (errores e info)

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // - Si se esta en produccion
    // - Todos los logs con level 'info' o menor, van a el archivo 'combined.log'
    // - Todos los logs con level 'info' o menor, van a el archivo 'combined.log'
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// - Si no se esta en produccion
// - Se loguea a la consola con formato:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = {
  logger
}
