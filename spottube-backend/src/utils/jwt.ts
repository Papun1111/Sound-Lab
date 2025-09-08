// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const JWT_SECRET = config.jwt.secret;

export const signJwt = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET);
};


export const verifyJwt = (token: string): object | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as object;
  } catch (err) {
    return null;
  }
};