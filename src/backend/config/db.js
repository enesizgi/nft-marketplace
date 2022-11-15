const mysql = require('mysql2');

var dbconfig =
{
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_db',
    port: 3306
};

const dbpool = mysql.createPool(dbconfig);

module.exports = dbpool.promise();