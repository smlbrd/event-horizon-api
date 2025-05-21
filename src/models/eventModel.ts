import db from '../db/connection';
import { Event } from '../types/Event';

export const eventModel = {
  async getEvents(): Promise<Event[]> {
    const result = await db.query(
      'SELECT id, title, description, location, price, start_time, end_time FROM events'
    );
    return result.rows;
  },
};
