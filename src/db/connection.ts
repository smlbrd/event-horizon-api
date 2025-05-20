import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

const ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../../.env.${ENV}`),
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

const config: any = {};

if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

const pool = new Pool(config);

export default pool;
