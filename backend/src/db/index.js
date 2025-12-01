// src/db/index.js
const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../util/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false   // <-- REQUIRED FOR NON-SSL SETUP
});

module.exports = { pool };
