module.exports = {
  up:
    'CREATE TABLE IF NOT EXISTS transaction( \n' +
    'id     bigint       NOT NULL AUTO_INCREMENT,\n' +
    'price  int,\n' +
    'event  varchar(10)  NOT NULL,\n' +
    'sender varchar(255) NOT NULL,\n' +
    'owner  varchar(255) NOT NULL,\n' +
    'contract_id varchar(255) NOT NULL,\n' +
    'block_number int NOT NULL,\n' +
    'PRIMARY KEY (id),\n' +
    'FOREIGN KEY (sender) REFERENCES user (walletId),\n' +
    'FOREIGN KEY (owner) REFERENCES user (walletId));',
  down: 'DROP TABLE IF EXISTS transaction'
};
