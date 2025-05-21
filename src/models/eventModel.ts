import db from '../db/connection';
import { Event } from '../types/Event';

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
};
