import db from './connection';
import { userTestData } from './testData/userTestData';

async function seedUsers() {
  try {
    await db.query('DROP TABLE IF EXISTS users;');

    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'user'))
      );
    `);

    for (const user of userTestData) {
      await db.query(
        'INSERT INTO users (username, hashed_password, email, name, role) VALUES ($1, $2, $3, $4, $5);',
        [user.username, user.hashed_password, user.email, user.name, user.role]
      );
    }
  } catch (err) {
    console.error('Error seeding users:', err);
    throw err;
  }
}

export default seedUsers;
