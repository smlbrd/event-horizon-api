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

router.get('/:id', getEventDetails(eventModel));
router.patch('/:id', updateEvent(eventModel));
router.delete('/:id', deleteEvent(eventModel));

router.post('/:id/attendees', addAttendee(eventModel));
router.get('/:id/attendees', getAttendeesForEvent(eventModel));

export default router;
