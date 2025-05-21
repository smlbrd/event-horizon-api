import { Router } from 'express';
import { getEvents } from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/', getEvents(eventModel));

export default router;
