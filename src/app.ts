import express from 'express';
import appRoutes from './routes/appRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import {
  serverErrorHandler,
  notFoundErrorHandler,
} from './middleware/errorHandler';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use('/api', appRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

app.use(notFoundErrorHandler);
app.use(serverErrorHandler);

export default app;
