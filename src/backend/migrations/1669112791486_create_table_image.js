module.exports = {
  up:
    'CREATE TABLE IF NOT EXISTS image(' +
    'id bigint NOT NULL AUTO_INCREMENT, ' +
    'user_id varchar(65) NOT NULL, ' +
    'image_path varchar(255) NOT NULL, ' +
    'type varchar(32) NOT NULL, ' +
    'PRIMARY KEY(id), ' +
    'FOREIGN KEY(user_id) REFERENCES user(walletId));',
  down: 'DROP TABLE IF EXISTS image;'
};
