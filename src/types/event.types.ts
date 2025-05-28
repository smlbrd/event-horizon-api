export interface EventInput {
  title: string;
  description: string;
  location: string;
  price: number;
  start_time: string;
  end_time: string;
  image_url?: string;
  image_alt_text?: string;
  created_by: string;
}

export interface Event extends EventInput {
  id: string;
}

export type EventParams = { event_id: string };

export interface EventAttendee {
  user_id: string;
  event_id: string;
  status: string;
}

export interface UpdateAttendeeStatusBody {
  status: 'attending' | 'cancelled';
}

export interface EventModel {
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event>;
  addEvent(event: EventInput): Promise<Event>;
  updateEvent(id: string, fields: Partial<EventInput>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  addAttendee(attendee: EventAttendee): Promise<EventAttendee>;
  getAttendeesForEvent(id: string): Promise<EventAttendee[]>;
  getEventsForUser(user_id: string): Promise<Event[]>;
  updateAttendeeStatus(
    event_id: string,
    user_id: string,
    status: UpdateAttendeeStatusBody['status']
  ): Promise<EventAttendee>;
}
