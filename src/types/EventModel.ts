import { Event, EventInput } from './Event';

export interface EventModel {
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event>;
  addEvent(event: EventInput): Promise<Event>;
  updateEvent(id: number, fields: Partial<EventInput>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  addAttendee(attendee: {
    user_id: number;
    event_id: number;
    status: string;
  }): Promise<any>;
}
