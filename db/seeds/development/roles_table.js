//Importo los datos de seed
const rolesData = require('./data/roles');
const usuariosData = require('./data/usuarios');

//Empieza el seed de la BD
exports.seed = function(knex, Promise) {
  // Primero se elimina la data existente de todas las tablas
  return knex('usuarios').del()
    .then(() => {
      return knex('roles').del()
    })
    //Una vez eliminadas todas las tablas, se seedean
    .then(() => {
      return knex('roles').insert(rolesData);
    })
    //En las tablas que tienen una clave foranea, hay que normalizar la data del json para que tome el id como foreign key en lugar de la data en si
    .then(() => {
      let usuariosPromises = [];
      //Por cada usuario del json de data seed me quedo con el rol y llamo a la funcion crearUsuario y lo guardo en el array de promesas
      usuariosData.forEach((usuario) => {
        let rol = usuario.rol;
        usuariosPromises.push(crearUsuario(knex, usuario, rol));
      });
      return Promise.all(usuariosPromises);
    })
};


//--------- Normalización de Usuarios ------------
const crearUsuario = (knex, usuario, rol) => {
  return knex('roles').where('descripcion', rol).first()
    .then((rolRecord) => {
      return knex('usuarios').insert({
        joined: usuario.joined,
        estado: usuario.estado,
        dni: usuario.dni,
        password: usuario.password,
        id_rol: rolRecord.id
      });
    });
};
