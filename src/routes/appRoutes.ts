import { Router } from 'express';
import { getApi, loginUser } from '../controllers/appController';
import { userModel } from '../models/userModel';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { createUser } from '../controllers/userController';

const router = Router();

router.get('/', getApi);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

router.post('/register', createUser(userModel));
router.post('/login', loginUser(userModel));

router.get('/protected', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'You have access!', user: req.user });
});

export default router;
