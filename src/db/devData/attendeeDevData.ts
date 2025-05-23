import { EventAttendee } from '../../types/event.types';

export const attendeeDevData: EventAttendee[] = [
  { user_id: 1, event_id: 2, status: 'attending' },
  { user_id: 1, event_id: 3, status: 'attending' },
  { user_id: 1, event_id: 5, status: 'attending' },

  { user_id: 2, event_id: 2, status: 'cancelled' },
  { user_id: 2, event_id: 3, status: 'attending' },
  { user_id: 2, event_id: 7, status: 'attending' },

  { user_id: 3, event_id: 1, status: 'cancelled' },
  { user_id: 3, event_id: 4, status: 'attending' },
  { user_id: 3, event_id: 10, status: 'attending' },

  { user_id: 4, event_id: 5, status: 'attending' },
  { user_id: 4, event_id: 6, status: 'attending' },

  { user_id: 5, event_id: 8, status: 'cancelled' },
  { user_id: 5, event_id: 9, status: 'attending' },
];
