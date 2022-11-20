import mysql from 'mysql2';

const dbconfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_db',
  port: 3306
};

const pool = mysql.createPool(dbconfig);

export default pool.promise();
