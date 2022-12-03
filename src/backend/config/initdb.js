import pool from './db.js';

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

function initImageTable() {
  const sql = 'CREATE TABLE IF NOT EXISTS image('
                + 'id bigint NOT NULL AUTO_INCREMENT, '
                + 'user_id varchar(65) NOT NULL, '
                + 'image_path varchar(255) NOT NULL, '
                + 'type varchar(32) NOT NULL, '
                + 'PRIMARY KEY(id), '
                + 'FOREIGN KEY(user_id) REFERENCES user(walletId));';
  pool.execute(sql);
}

function initNftTable() {
  const sql = 'CREATE TABLE IF NOT EXISTS nft('
    + 'cid varchar(255) NOT NULL, '
    + 'path varchar(255) NOT NULL, '
    + 'PRIMARY KEY(cid, path));';
  pool.execute(sql);
}

function initDB() {
  initUserTable();
  initImageTable();
  initNftTable();
}

initDB();
