import { Router } from 'express';
import { signupHandler, loginHandler } from './auth.controller.js';
const router = Router();
// Route for user registration
router.post('/signup', signupHandler);
// Route for user login
router.post('/login', loginHandler);
export default router;
