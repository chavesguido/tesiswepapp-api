const bcrypt = require('bcrypt-nodejs');

//Uso la misma pass para todos los usuarios en el seed de la BD de prueba
const pass = bcrypt.hashSync('123456');

module.exports = [
  {
    joined: new Date(),
    rol: 'administrador',
    dni: '123456',
    password: pass,
    estado: 'activo'
  },
  {
    joined: new Date(),
    rol: 'paciente',
    dni: '1234567',
    password: pass,
    estado: 'activo'
  },
  {
    joined: new Date(),
    rol: 'medico',
    dni: '12345678',
    password: pass,
    estado: 'activo'
  }
];
