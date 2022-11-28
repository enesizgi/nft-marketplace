module.exports = {
  // You can add mock data to here
  up:
    'INSERT IGNORE INTO user (walletId, slug, name)\n' +
    "VALUES ('temp_wallet_id', 'temp_slug', 'Emir-test');",
  down: 'DELETE FROM user WHERE id = 1;',
};
