// Update with your config settings.

const db_password = require ('./localconfigs/db');

module.exports = {

  development: {
    client: 'pg',
    connection: `postgres://postgres:${db_password.db_password}@localhost:5432/tesis_medica`,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    },
    useNullAsDefault: true
  }

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
