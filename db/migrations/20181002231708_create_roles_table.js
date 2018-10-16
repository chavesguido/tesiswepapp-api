
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('descripcion').unique();
    }),

    knex.schema.createTable('usuarios', (table) => {
      table.increments('id').primary();
      table.string('dni').unique();
      table.date('joined');
      table.string('password');
      table.string('estado');
      table.integer('id_rol').unsigned().references('roles.id');
    }),

    knex.schema.createTable('pacientes', (table) => {
      table.increments('id').primary();
      table.string('nombre');
      table.string('apellido');
      table.date('fechaNacimiento');
      table.string('sexo');
      table.string('email').unique();
      table.integer('id_usuario').unsigned().references('usuarios.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('pacientes'),
    knex.schema.dropTable('usuarios'),
    knex.schema.dropTable('roles')
  ]);
};
