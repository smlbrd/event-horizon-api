import { Pool, PoolConfig } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

const ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../../.env.${ENV}`),
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

const config: PoolConfig = {};

if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 5;
}

const pool = new Pool(config);

pool.on('error', async (err) => {
  console.error('Unexpected error on idle client', err);
  try {
    console.log('Attempting to close database pool due to error...');
    await pool.end();
    console.log('Database pool closed.');
  } catch (closeErr) {
    console.error('Error while closing database pool', closeErr);
  } finally {
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received: closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

export default pool;
