import { signup, login } from './auth.service.js';
import { AppError } from '../../utils/AppError.js';
/**
 * Handles the HTTP request for user signup.
 */
export const signupHandler = async (req, res) => {
    try {
        const user = await signup(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
/**
 * Handles the HTTP request for user login.
 */
export const loginHandler = async (req, res) => {
    try {
        const token = await login(req.body);
        res.status(200).json({
            status: 'success',
            token,
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
