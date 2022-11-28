import mysql from 'mysql2';

const dbconfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'your-passwords',
  database: 'your-db',
  port: 3306,
};

const pool = mysql.createPool(dbconfig);

export default pool.promise();
