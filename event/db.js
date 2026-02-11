const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // change if needed
  password: "",// your MySQL password
  database: "event_app"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

module.exports = db;
