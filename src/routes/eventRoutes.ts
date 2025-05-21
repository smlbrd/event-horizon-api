import { Router } from 'express';
import {
  getEvents,
  getEventDetails,
  createEvent,
} from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/', getEvents(eventModel));
router.get('/:id', getEventDetails(eventModel));
router.post('/', createEvent(eventModel));

export default router;
