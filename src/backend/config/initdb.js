import pool from './db.js'

function initUserTable() {
  const sql = 'CREATE TABLE IF NOT EXISTS user('
                + 'id bigint NOT NULL AUTO_INCREMENT, '
                + 'walletId varchar(65) NOT NULL, '
                + 'slug varchar(64), '
                + 'name varchar(64) NOT NULL, '
                + 'PRIMARY KEY(id), '
                + 'UNIQUE KEY(walletId), '
                + 'UNIQUE KEY(slug));';
  pool.execute(sql);
}

function initDB() {
  initUserTable();
}

initDB();
