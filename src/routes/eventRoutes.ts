import { Router } from 'express';
import {
  getEvents,
  createEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  addAttendee,
  getAttendeesForEvent,
} from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/', getEvents(eventModel));
router.post('/', createEvent(eventModel));

router.get('/:event_id', getEventDetails(eventModel));
router.patch('/:event_id', updateEvent(eventModel));
router.delete('/:event_id', deleteEvent(eventModel));

router.post('/:event_id/attendees', addAttendee(eventModel));
router.get('/:event_id/attendees', getAttendeesForEvent(eventModel));

export default router;
