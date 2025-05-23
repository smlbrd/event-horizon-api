import { EventAttendee } from '../../types/event.types';

export const attendeeTestData: EventAttendee[] = [
  { user_id: 1, event_id: 1, status: 'attending' },
  { user_id: 1, event_id: 2, status: 'attending' },

  { user_id: 2, event_id: 2, status: 'cancelled' },
  { user_id: 2, event_id: 1, status: 'attending' },
];
