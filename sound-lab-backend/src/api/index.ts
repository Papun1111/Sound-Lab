import { Router } from 'express';
import authRouter from './auth/auth.routes.js';
import roomRouter from './rooms/rooms.routes.js';

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/rooms', roomRouter);

export default apiRouter;