import db from '../db/connection';
import {
  Event,
  EventInput,
  EventAttendee,
  UpdateAttendeeStatusBody,
} from '../types/event.types';
import { checkExists } from '../utils/checkExists';
import { makeError } from '../utils/makeError';

const VALID_ATTENDEE_STATUSES = ['attending', 'cancelled'];

export const eventModel = {
  async getEvents(): Promise<Event[]> {
    const result = await db.query(
      'SELECT id, title, description, location, price, start_time, end_time, image_url, image_alt_text FROM events'
    );
    return result.rows.map((row) => ({
      ...row,
      price: Number(row.price),
    }));
  },

  async getEventById(id: number): Promise<Event> {
    const result = await db.query(
      'SELECT id, title, description, location, price, start_time, end_time,  image_url, image_alt_text FROM events WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) throw makeError('Event not found', 404);
    return {
      ...result.rows[0],
      price: Number(result.rows[0].price),
    };
  },

  async addEvent(event: EventInput): Promise<Event> {
    const {
      title,
      description,
      location,
      price,
      start_time,
      end_time,
      image_url,
      image_alt_text,
    } = event;
    if (
      !title ||
      !description ||
      !location ||
      price === undefined ||
      !start_time ||
      !end_time
    ) {
      throw makeError('Missing required fields', 400);
    }
    const result = await db.query(
      `INSERT INTO events (title, description, location, price, start_time, end_time, image_url, image_alt_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, location, price, start_time, end_time,  image_url, image_alt_text`,
      [
        title,
        description,
        location,
        price,
        start_time,
        end_time,
        image_url,
        image_alt_text,
      ]
    );
    const row = result.rows[0];
    return {
      ...row,
      price: Number(row.price),
    };
  },

  async updateEvent(
    id: number,
    fields: Partial<
      Pick<
        Event,
        | 'title'
        | 'description'
        | 'location'
        | 'price'
        | 'start_time'
        | 'end_time'
        | 'image_url'
        | 'image_alt_text'
      >
    >
  ): Promise<Event> {
    if (!(await checkExists('events', id))) {
      throw makeError('Event not found', 404);
    }
    const keys = Object.keys(fields);
    if (keys.length === 0)
      throw makeError('No fields provided for update', 400);

    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = keys.map((key) => (fields as any)[key]);
    values.push(id);

    const result = await db.query(
      `UPDATE events SET ${setClause} WHERE id = $${values.length} RETURNING id, title, description, location, price, start_time, end_time,  image_url, image_alt_text`,
      values
    );
    if (!result.rows[0]) throw makeError('Event not found', 404);
    const row = result.rows[0];
    return {
      ...row,
      price: Number(row.price),
    };
  },

  async deleteEvent(id: number): Promise<void> {
    if (!(await checkExists('events', id))) {
      throw makeError('Event not found', 404);
    }
    await db.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
  },

  async addAttendee(attendee: EventAttendee): Promise<EventAttendee> {
    if (
      attendee.user_id === undefined ||
      attendee.event_id === undefined ||
      !attendee.status
    ) {
      throw makeError('Missing required fields', 400);
    }

    if (!VALID_ATTENDEE_STATUSES.includes(attendee.status)) {
      throw makeError('Invalid status', 400);
    }

    if (!(await checkExists('events', attendee.event_id))) {
      throw makeError('Event not found', 404);
    }

    if (!(await checkExists('users', attendee.user_id))) {
      throw makeError('User not found', 404);
    }

    const existsResult = await db.query(
      'SELECT id FROM event_attendees WHERE user_id = $1 AND event_id = $2',
      [attendee.user_id, attendee.event_id]
    );
    if (existsResult.rows.length > 0) {
      throw makeError('User already attending', 409);
    }

    const result = await db.query(
      `INSERT INTO event_attendees (user_id, event_id, status)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, event_id, status`,
      [attendee.user_id, attendee.event_id, attendee.status]
    );
    return result.rows[0];
  },

  async getAttendeesForEvent(event_id: number): Promise<EventAttendee[]> {
    if (!(await checkExists('events', event_id))) {
      throw makeError('Event not found', 404);
    }
    const result = await db.query(
      `SELECT user_id, event_id, status FROM event_attendees WHERE event_id = $1`,
      [event_id]
    );
    return result.rows;
  },

  async getEventsForUser(user_id: number) {
    if (!(await checkExists('users', user_id))) {
      throw makeError('User not found', 404);
    }
    const result = await db.query(
      `SELECT e.*
      FROM events e
      JOIN event_attendees a ON a.event_id = e.id
      WHERE a.user_id = $1`,
      [user_id]
    );
    return result.rows.map((row) => ({
      ...row,
      price: Number(row.price),
    }));
  },

  async updateAttendeeStatus(
    event_id: number,
    user_id: number,
    status: UpdateAttendeeStatusBody['status']
  ): Promise<EventAttendee> {
    if (!VALID_ATTENDEE_STATUSES.includes(status)) {
      throw makeError('Invalid status', 400);
    }

    if (!(await checkExists('events', event_id))) {
      throw makeError('Event not found', 404);
    }

    if (!(await checkExists('users', user_id))) {
      throw makeError('User not found', 404);
    }

    const attendeeRes = await db.query(
      'SELECT * FROM event_attendees WHERE event_id = $1 AND user_id = $2',
      [event_id, user_id]
    );
    if (!attendeeRes.rows[0]) throw makeError('Attendee not found', 404);

    const result = await db.query(
      `UPDATE event_attendees
        SET status = $1
        WHERE event_id = $2 AND user_id = $3
        RETURNING id, user_id, event_id, status`,
      [status, event_id, user_id]
    );
    return result.rows[0];
  },
};
