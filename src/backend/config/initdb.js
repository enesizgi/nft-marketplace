const db = require('./db');

function initUserTable(){
    let sql = "CREATE TABLE IF NOT EXISTS user(" +
                "id bigint NOT NULL AUTO_INCREMENT, " +
                "walletId varchar(65) NOT NULL, " +
                "PRIMARY KEY(id), " +
                "UNIQUE KEY(walletId));"
    db.execute(sql);
}

function initDB() {
    initUserTable();
}

initDB();