const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iamabhi@1509',
    database: 'mysql'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// API endpoints

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

