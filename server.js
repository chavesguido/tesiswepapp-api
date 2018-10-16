// Paquetes
const express = require('express'); //Usado para generar el servidor
const bodyParser = require('body-parser'); //Usado para poder hablar con el req.body
const cors = require('cors'); //Usado para poder hacer peticiones desde otro dominio
const helmet = require ('helmet'); //Usado para asegurar los headers de los requests
const compression = require('compression'); //Usado para comprimir los requests con gzip
const morgan = require('morgan'); //Usado para log del server (logeo de todos los requests)
const knex = require('knex'); //Usado para conectar con la BD de PostgreSQL, queries, seeds, etc.
const bcrypt = require('bcrypt-nodejs'); //Usado para hashear las passwords

// Controllers
const loginController  = require('./controllers/loginController');
const usuarioController = require('./controllers/usuarioController');

// Configuraciones
const connection = require('./db/config');
const loggerConfig = require('./configs/loggerConfig');

// Genero el server de express
const app = express();

// Aplicacion de middlewares al server
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Puerto en el que escucha el server
const PORT = 3000;

// Genero logger
const logger = loggerConfig.logger;

// Conexion de la BD
const db = knex({
  client: 'pg',
  connection: connection.connection_config
});


//
// probarBase().then((data) => {
//   console.log(data);
// }).catch(err => console.log)

// Asociando el puerto al server
app.listen(PORT, () => {
  logger.info(`Server levantado en puerto: ${PORT}`);
});


//-------------------------- Comienzo servicios API rest ------------------------------

//-------------------------- Servicios asociados al login -----------------------------

//Logeo de un usuario
app.post('/logIn', loginController.loginAuthentication(db, bcrypt));
//Olvido de password
app.post('/olvidoPassword', loginController.olvidoPassword(db));
//Confirmar codigo para olvido de password
app.post('/confirmCodigoPassword', loginController.confirmCodigoPassword(db));
//Cambio de constraseña
app.post('/changePassword', loginController.changePassword(db, bcrypt));


//-------------------------- Servicios asociados a usuarios ---------------------------

//Creacion de una nueva cuenta
app.post('/crearNuevaCuenta', usuarioController.crearNuevaCuenta(db, bcrypt));
//Activacion de usuario
app.get('/confirmation/:token', usuarioController.activarUsuario(db));

//-------------------------- Fin servicios API rest -----------------------------------
