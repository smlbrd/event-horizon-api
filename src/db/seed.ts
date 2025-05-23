import db from './connection';
import format from 'pg-format';

async function seed({
  userData,
  eventData,
  attendeeData,
}: {
  userData: any[];
  eventData: any[];
  attendeeData: any[];
}) {
  try {
    await db.query('DROP TABLE IF EXISTS event_attendees;');
    await db.query('DROP TABLE IF EXISTS events;');
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

    await db.query(`
      CREATE TABLE event_attendees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('attending', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, event_id)
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

    if (attendeeData.length) {
      const attendeeValues = attendeeData.map(
        ({ user_id, event_id, status }) => [user_id, event_id, status]
      );
      const attendeeInsert = format(
        'INSERT INTO event_attendees (user_id, event_id, status) VALUES %L;',
        attendeeValues
      );
      await db.query(attendeeInsert);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
}

export default seed;
