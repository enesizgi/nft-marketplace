module.exports = {
  up: `INSERT IGNORE INTO nft (cid, user_id, path)
VALUES ('temp_nft', 'temp_wallet_id', 'temp_path'),
       ('temp_nft2', 'temp_wallet_id', 'temp_path2');`,
  down: "DELETE FROM nft WHERE cid = 'temp_nft' AND path = 'temp_path';"
};
