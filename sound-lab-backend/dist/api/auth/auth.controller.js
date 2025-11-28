import { signup, login } from './auth.service.js';
import { getGoogleAuthURL, googleAuthCallback } from './google.service.js';
import { AppError } from '../../utils/AppError.js';
export const signupHandler = async (req, res) => {
    try {
        const user = await signup(req.body);
        res.status(201).json({ status: 'success', data: { user } });
    }
    catch (error) {
        if (error instanceof AppError)
            return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const loginHandler = async (req, res) => {
    try {
        const token = await login(req.body);
        res.status(200).json({ status: 'success', token });
    }
    catch (error) {
        if (error instanceof AppError)
            return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ message: 'Internal server error' });
    }
};
// ✨ NEW GOOGLE HANDLERS ✨
// 1. Initiates the login by redirecting to Google
export const googleLoginHandler = (req, res) => {
    const url = getGoogleAuthURL();
    res.redirect(url);
};
// 2. Handles the return trip from Google
export const googleCallbackHandler = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(401).json({ message: 'Authorization code missing' });
    }
    try {
        // Get the JWT from our service
        const token = await googleAuthCallback(code);
        // Redirect back to the frontend homepage with the token in the URL.
        // The frontend will pluck this token from the URL and save it.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?token=${token}`);
    }
    catch (error) {
        console.error('Google Auth Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
};
