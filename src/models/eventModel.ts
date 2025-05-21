import db from '../db/connection';
import { Event, EventInput } from '../types/Event';

export const eventModel = {
  async getEvents(): Promise<Event[]> {
    const result = await db.query(
      'SELECT id, title, description, location, price, start_time, end_time FROM events'
    );

    return result.rows.map((row) => ({
      ...row,
      price: Number(row.price),
    }));
  },

  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.query(
      'SELECT id, title, description, location, price, start_time, end_time FROM events WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) return undefined;
    return {
      ...result.rows[0],
      price: Number(result.rows[0].price),
    };
  },

  async addEvent(event: EventInput): Promise<Event> {
    const { title, description, location, price, start_time, end_time } = event;
    const result = await db.query(
      `INSERT INTO events (title, description, location, price, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, location, price, start_time, end_time`,
      [title, description, location, price, start_time, end_time]
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
      >
    >
  ): Promise<Event | undefined> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.getEventById(id);

    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = keys.map((key) => (fields as any)[key]);
    values.push(id);

    const result = await db.query(
      `UPDATE events SET ${setClause} WHERE id = $${values.length} RETURNING id, title, description, location, price, start_time, end_time`,
      values
    );
    if (!result.rows[0]) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      price: Number(row.price),
    };
  },

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result.rows[0];
  },
};
