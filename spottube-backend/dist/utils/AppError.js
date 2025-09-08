// src/utils/AppError.ts
import dotenv from "dotenv";
dotenv.config();
export class AppError extends Error {
    statusCode;
    status;
    isOperational;
    /**
     * Creates a new operational error.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code.
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Set status based on the status code
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Operational errors are predictable issues (e.g., user not found), not bugs
        this.isOperational = true;
        // Capture the stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
