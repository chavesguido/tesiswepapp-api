
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
      table.integer('rol_id').unsigned().references('roles.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('roles'),
    knex.schema.dropTable('usuarios')
  ]);
};
