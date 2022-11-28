const mysql = require('mysql2');
const migration = require('mysql-migrations');

const connection = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'Hitman.54',
  database: 'nftao',
  port: '3306',
});

migration.init(connection, `${__dirname}/migrations`);
