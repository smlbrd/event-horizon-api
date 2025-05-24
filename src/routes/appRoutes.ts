import { Router } from 'express';
import { getApi, loginUser } from '../controllers/appController';
import { userModel } from '../models/userModel';

const router = Router();

router.get('/', getApi);
router.post('/login', loginUser(userModel));

export default router;
