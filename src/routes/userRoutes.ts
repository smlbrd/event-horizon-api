import { Router } from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { userModel } from '../models/userModel';

const router = Router();

router.post('/', createUser(userModel));
router.get('/:id', getUser(userModel));
router.patch('/:id', updateUser(userModel));
router.delete('/:id', deleteUser(userModel));

export default router;
