import { Router } from 'express';
import { signupHandler, loginHandler, googleLoginHandler, googleCallbackHandler } from './auth.controller.js';
const router = Router();
// Existing email/password authentication routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
// ✨ NEW GOOGLE AUTH ROUTES ✨
// Route to initiate the Google login flow
// The frontend should redirect the user to this URL (e.g., /api/auth/google)
router.get('/google', googleLoginHandler);
// Callback route that Google redirects to after user approval
// This handles exchanging the code for a token and redirecting back to the frontend
router.get('/google/callback', googleCallbackHandler);
export default router;
