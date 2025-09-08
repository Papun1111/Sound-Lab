// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
const JWT_SECRET = config.jwt.secret;
export const signJwt = (payload) => {
    return jwt.sign(payload, JWT_SECRET);
};
export const verifyJwt = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (err) {
        return null;
    }
};
