'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();
// Application Dependencies
const pg = require('pg');
//Connecting to DataBase
const client = new pg.Client(process.env.DATABASE_URL);

module.exports=client;