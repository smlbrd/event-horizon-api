import { Router } from 'express';
import { getEvents, getEventDetails } from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/', getEvents(eventModel));
router.get('/:id', getEventDetails(eventModel));

export default router;
