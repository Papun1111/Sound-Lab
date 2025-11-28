import { Router } from 'express'; // ✨ Imported RequestHandler
import { getTrendingVideosHandler, getUserRecommendationsHandler, searchVideosHandler } from './youtube.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
const router = Router();
// Public trending route
router.get('/trending', getTrendingVideosHandler);
// Protected route for user-specific recommendations
// ✨ FIX: Cast both authMiddleware and the controller to RequestHandler
router.get('/recommendations', authMiddleware, getUserRecommendationsHandler);
// ✨ NEW: Search route
router.get('/search', searchVideosHandler);
export default router;
