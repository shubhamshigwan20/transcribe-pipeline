const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
});

module.exports = db;
