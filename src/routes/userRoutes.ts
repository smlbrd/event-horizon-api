import { Router } from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/userController';
import { userModel } from '../models/userModel';
import { getEventsForUser } from '../controllers/eventController';
import { eventModel } from '../models/eventModel';

const router = Router();

router.get('/:user_id', getUser(userModel));
router.patch('/:user_id', updateUser(userModel));
router.delete('/:user_id', deleteUser(userModel));

router.get('/:user_id/events', getEventsForUser(eventModel));

export default router;
