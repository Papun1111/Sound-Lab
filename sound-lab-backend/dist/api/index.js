import { Router } from 'express';
import authRouter from './auth/auth.routes.js';
import roomRouter from './rooms/rooms.routes.js';
import youtubeRouter from './youtube/youtube.routes.js'; // ✨ Import your new router
const apiRouter = Router();
// Mount auth routes (e.g., /api/auth/google)
apiRouter.use('/auth', authRouter);
// Mount room routes (e.g., /api/rooms)
apiRouter.use('/rooms', roomRouter);
// ✨ Mount YouTube routes (e.g., /api/youtube/trending, /api/youtube/recommendations)
apiRouter.use('/youtube', youtubeRouter);
export default apiRouter;
