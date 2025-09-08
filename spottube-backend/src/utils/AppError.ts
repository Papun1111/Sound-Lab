// src/utils/AppError.ts
import dotenv from "dotenv";
dotenv.config();

export class AppError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;

  /**
   * Creates a new operational error.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   */
  constructor(message: string, statusCode: number) {
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