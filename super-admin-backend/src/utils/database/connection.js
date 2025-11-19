const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'school_saas_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
}
async function query(text, params) { await connectDB(); return client.query(text, params); }
async function disconnectDB() { if (isConnected) { await client.end(); isConnected = false; } }

module.exports = { connectDB, query, disconnectDB };
