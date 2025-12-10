const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL.replace('/recruitment_db', '/postgres')
});

async function createDatabase() {
  try {
    await client.connect();
    await client.query('CREATE DATABASE recruitment_db');
    console.log('Database "recruitment_db" created successfully.');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database "recruitment_db" already exists.');
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
