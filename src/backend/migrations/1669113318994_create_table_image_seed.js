module.exports = {
  // You can add mock data to here
  up:
    'INSERT IGNORE INTO image (user_id, image_path, type)\n' +
    "VALUES ('temp_wallet_id', 'test-path', 'test-type');",
  down: "DELETE FROM image WHERE user_id = 'temp_wallet_id';",
};
