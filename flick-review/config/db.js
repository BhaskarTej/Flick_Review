require("dotenv").config(); // Load environment variables
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

//Connect to MySQL
db.connect(err => {
    if (err) {
        console.error("MySQL Connection Error:", err);
        return;
    }
    console.log(`Connected to MySQL Database: ${process.env.DB_NAME}`);
});

module.exports = db;
