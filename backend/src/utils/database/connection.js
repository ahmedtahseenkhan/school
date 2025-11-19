const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'school_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }
  return client;
}

async function query(text, params) {
  const db = await connectDB();
  return db.query(text, params);
}

async function disconnectDB() {
  if (isConnected) {
    await client.end();
    isConnected = false;
    console.log('✅ Database disconnected');
  }
}

module.exports = { connectDB, query, disconnectDB };
