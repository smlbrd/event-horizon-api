import { Router } from 'express';
import { getApi } from '../controllers/appController';

const router = Router();

router.get('/', getApi);

export default router;
