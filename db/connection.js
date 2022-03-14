const mysql = require('mysql2');
const server = require('../server');

//import and configure dotenv:
require('dotenv').config();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.password,
    database: 'employee_db'
});

module.exports = db;