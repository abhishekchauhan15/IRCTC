const mysql = require("mysql");
const fs = require("fs");

const connection = mysql.createConnection({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");

  // Execute schema.sql
//   const schema = fs.readFileSync("./sql/schema.sql", "utf8");
//   connection.query(schema, (err, result) => {
//     if (err) {
//       console.error("Error executing schema.sql:", err);
//       return;
//     }
//     console.log("Schema executed successfully");
//   });
});

module.exports = connection;
