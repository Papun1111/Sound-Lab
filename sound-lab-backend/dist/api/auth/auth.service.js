import bcrypt from 'bcryptjs';
import prisma from '../../services/prisma.service.js';
import { signJwt } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
/**
 * Creates a new user in the database via Email/Password.
 * @param {UserInput} input - The user's email, username, and password.
 * @returns {Promise<object>} The created user object without the password.
 */
export const signup = async (input) => {
    const { email, username, password } = input;
    // Explicit check: Password is mandatory for this signup method
    if (!email || !username || !password) {
        throw new AppError('Email, username, and password are required', 400);
    }
    // Hash the user's password for security
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create the user in the database
    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });
        // Exclude password from the returned user object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    catch (error) {
        // Handle Prisma's unique constraint violation error
        if (error.code === 'P2002') {
            throw new AppError('A user with this email or username already exists', 409);
        }
        throw error;
    }
};
/**
 * Authenticates a user and returns a JWT via Email/Password.
 * @param {UserInput} input - The user's email and password.
 * @returns {Promise<string>} A JWT for the authenticated user.
 */
export const login = async (input) => {
    const { email, password } = input;
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }
    // Find the user by their email address
    const user = await prisma.user.findUnique({
        where: { email },
    });
    // If no user is found
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }
    // If user exists but has no password (e.g., created via Google OAuth)
    if (!user.password) {
        throw new AppError('This account uses Google Sign-In. Please log in with Google.', 400);
    }
    // Verify password
    if (!(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid email or password', 401);
    }
    // Generate a JWT for the user session
    const token = signJwt({ userId: user.id });
    return token;
};
