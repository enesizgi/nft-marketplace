module.exports = {
  up: `INSERT IGNORE INTO transaction(price, event, sender, owner, contract_id, block_number)
        values (100, 'mint', '0xca502b9dff7c0455cb39df1c9de80d0485179120', '0x2546bcd3c84621e976d8185a91a922ae77ecec30', 'sample_contract_id', 1);`,
  down: "DELETE FROM transaction WHERE contract_id = 'sample_contract_id';"
};
