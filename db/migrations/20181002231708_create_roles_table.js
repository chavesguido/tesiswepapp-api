
exports.up = function(knex, Promise) {
  return Promise.all([

    //Tabla con todos los roles del sistema.
    //La descripcion indica el rol
    knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('descripcion').unique();
    }),

    //Tabla con todas las provincias de la Argentina
    knex.schema.createTable('provincias', (table) => {
      table.increments('id').primary();
      table.string('provincia');
    }),

    //Tabla con todas las localidades de la Argentina y su respectiva provincia asociada
    knex.schema.createTable('localidades', (table) => {
      table.increments('id').primary();
      table.string('localidad');
      table.integer('id_provincia').unsigned().references('provincias.id');
    }),

    //Tabla con todos los usuarios del sistema, tiene una referencia al rol del usuario
    knex.schema.createTable('usuarios', (table) => {
      table.increments('id').primary();
      table.string('dni').unique();
      table.date('joined');
      table.string('password');
      table.string('estado');
      table.integer('id_rol').unsigned().references('roles.id');
    }),

    //Tabla de domicilios
    //Esta tabla contiene una referencia a una localidad y todos los datos en si de un domicilio
    knex.schema.createTable('domicilios', (table) => {
      table.increments('id').primary();
      table.integer('id_localidad').unsigned().references('localidades.id');
      table.string('calle');
      table.integer('codigo_postal');
      table.integer('nro');
    }),

    //Tabla con todas las historias clinicas
    knex.schema.createTable('historias_clinicas', (table) => {
      table.increments('id').primary();
      table.date('createdAt');
    }),

    //Tabla con toda la informacion de pacientes
    //Tiene una referencia al usuario, una al domicilio y una a la historia
    knex.schema.createTable('pacientes', (table) => {
      table.increments('id').primary();
      table.string('nombre');
      table.string('apellido');
      table.date('fechaNacimiento');
      table.string('sexo');
      table.string('email').unique();
      table.string('nacionalidad').nullable();
      table.string('edad');
      table.string('estado_civil').nullable();
      table.string('telefono_fijo').nullable();
      table.string('telefono_celular').nullable();
      table.string('imagen').nullable();
      table.integer('id_historia').unsigned().references('historias_clinicas.id');
      table.integer('id_usuario').unsigned().references('usuarios.id');
      table.integer('id_domicilio').unsigned().references('domicilios.id').nullable();
    }),

    //Esta tabla contiene todos los datos de los contactos de emergencia
    knex.schema.createTable('contactos_emergencia', (table) => {
      table.increments('id').primary();
      table.integer('id_paciente').unsigned().references('pacientes.id');
      table.string('nombre');
      table.string('apellido');
      table.integer('id_domicilio').unsigned().references('domicilios.id');
      table.string('telefono_fijo').nullable();
      table.string('telefono_celular').nullable();
      table.string('parentesco');
    })

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('contactos_emergencia'),
    knex.schema.dropTableIfExists('pacientes'),
    knex.schema.dropTableIfExists('historias_clinicas'),
    knex.schema.dropTableIfExists('domicilios'),
    knex.schema.dropTableIfExists('usuarios'),
    knex.schema.dropTableIfExists('roles'),
    knex.schema.dropTableIfExists('localidades'),
    knex.schema.dropTableIfExists('provincias')
  ]);
};
