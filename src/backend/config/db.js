import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const dbconfig = {
  host: DB_HOST ?? '127.0.0.1',
  user: DB_USER ?? 'root',
  password: DB_PASSWORD ?? 'your-passwords',
  database: DB_NAME ?? 'your-db',
  port: 3306,
};

const pool = mysql.createPool(dbconfig);

export default pool.promise();
