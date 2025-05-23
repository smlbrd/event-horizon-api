export interface EventInput {
  title: string;
  description: string;
  location: string;
  price: number;
  start_time: string;
  end_time: string;
}

export interface Event extends EventInput {
  id: number;
}

export type EventParams = { event_id: number };

export interface EventAttendee {
  user_id: number;
  event_id: number;
  status: string;
}

export interface UpdateAttendeeStatusBody {
  status: 'attending' | 'cancelled';
}

export interface EventModel {
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event>;
  addEvent(event: EventInput): Promise<Event>;
  updateEvent(id: number, fields: Partial<EventInput>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  addAttendee(attendee: EventAttendee): Promise<EventAttendee>;
  getAttendeesForEvent(id: number): Promise<EventAttendee[]>;
  getEventsForUser(user_id: number): Promise<Event[]>;
  updateAttendeeStatus(
    event_id: number,
    user_id: number,
    status: UpdateAttendeeStatusBody['status']
  ): Promise<EventAttendee>;
}
