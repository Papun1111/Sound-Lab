import { Router } from 'express';
import { createRoomHandler, getRoomByIdHandler, addVideoToQueueHandler, } from './rooms.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
const router = Router();
// Create a new room (requires user to be logged in)
router.post('/', authMiddleware, createRoomHandler);
// Get details for a specific room (publicly accessible)
router.get('/:roomId', getRoomByIdHandler);
// Add a video to a specific room's queue (requires user to be logged in)
router.post('/:roomId/videos', authMiddleware, addVideoToQueueHandler);
export default router;
