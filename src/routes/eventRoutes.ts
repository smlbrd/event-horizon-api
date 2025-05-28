import { Router } from 'express';
import {
  getEvents,
  createEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  addAttendee,
  getAttendeesForEvent,
  updateAttendeeStatus,
} from '../controllers/eventController';
import { eventModel } from '../models/eventModel';
import { authenticateJWT } from '../middleware/authenticateJWT';

const router = Router();

router.get('/', getEvents(eventModel));
router.post('/', authenticateJWT, createEvent(eventModel));

router.get('/:event_id', getEventDetails(eventModel));
router.patch('/:event_id', authenticateJWT, updateEvent(eventModel));
router.delete('/:event_id', authenticateJWT, deleteEvent(eventModel));

router.post('/:event_id/attendees', authenticateJWT, addAttendee(eventModel));
router.get('/:event_id/attendees', getAttendeesForEvent(eventModel));
router.patch(
  '/:event_id/attendees/:user_id',
  authenticateJWT,
  updateAttendeeStatus(eventModel)
);

export default router;
