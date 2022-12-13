module.exports = {
  up:
    'CREATE TABLE IF NOT EXISTS nft(cid varchar(255) NOT NULL,' +
    ' path varchar(255) NOT NULL,' +
    ' user_id varchar(65) NOT NULL,' +
    ' PRIMARY KEY(cid, path),' +
    ' FOREIGN KEY(user_id) REFERENCES user(walletId));',
  down: 'DROP TABLE IF EXISTS nft'
};
