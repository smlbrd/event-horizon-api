import express from 'express';
import appRoutes from './routes/appRoutes';
import userRoutes from './routes/userRoutes';
import {
  serverErrorHandler,
  notFoundErrorHandler,
} from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use('/api', appRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundErrorHandler);
app.use(serverErrorHandler);

export default app;
