import db from './connection';
import format from 'pg-format';

async function seed({
  userData,
  eventData,
}: {
  userData: any[];
  eventData: any[];
}) {
  try {
    await db.query('DROP TABLE IF EXISTS users;');
    await db.query('DROP TABLE IF EXISTS events;');

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

    await db.query(`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL
      );
    `);

    if (userData.length) {
      const userValues = userData.map(
        ({ username, hashed_password, email, name, role }) => [
          username,
          hashed_password,
          email,
          name,
          role,
        ]
      );
      const userInsert = format(
        'INSERT INTO users (username, hashed_password, email, name, role) VALUES %L;',
        userValues
      );
      await db.query(userInsert);
    }

    if (eventData.length) {
      const eventValues = eventData.map(
        ({ title, description, location, price, start_time, end_time }) => [
          title,
          description,
          location,
          price,
          start_time,
          end_time,
        ]
      );
      const eventInsert = format(
        'INSERT INTO events (title, description, location, price, start_time, end_time) VALUES %L;',
        eventValues
      );
      await db.query(eventInsert);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
}

export default seed;
