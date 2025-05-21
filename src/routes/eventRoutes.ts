import { Router } from 'express';
import {
  getEvents,
  getEventDetails,
  createEvent,
  updateEvent,
} from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/', getEvents(eventModel));
router.get('/:id', getEventDetails(eventModel));
router.post('/', createEvent(eventModel));
router.patch('/:id', updateEvent(eventModel));

export default router;
