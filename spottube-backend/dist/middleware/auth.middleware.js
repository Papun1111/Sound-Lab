import { verifyJwt } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
/**
 * Middleware to verify JWT and protect routes.
 */
export const authMiddleware = (req, res, next) => {
    try {
        let token;
        // 1. Check for the token in the Authorization header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw new AppError('You are not logged in. Please log in to get access.', 401);
        }
        // 2. Verify the token
        const decoded = verifyJwt(token);
        if (!decoded) {
            throw new AppError('Invalid or expired token. Please log in again.', 401);
        }
        // 3. Attach the decoded user payload to the request object
        // This makes it available to subsequent route handlers
        req.user = { userId: decoded.userId };
        // 4. Grant access to the protected route
        next();
    }
    catch (error) {
        // Forward the error to the global error handler or handle it here
        next(error);
    }
};
