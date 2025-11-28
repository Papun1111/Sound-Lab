import axios from 'axios';
import prisma from '../../services/prisma.service.js';
import { signJwt } from '../../utils/jwt.js';
export const getGoogleAuthURL = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
};
export const googleAuthCallback = async (code) => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
    // 1. Exchange the authorization code for tokens
    const { data: { id_token, access_token } } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
    });
    // 2. Get the user's information from Google
    const { data: googleUser } = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
            Authorization: `Bearer ${id_token}`,
        },
    });
    // 3. Find existing user or create a new one
    let user = await prisma.user.findFirst({
        where: { email: googleUser.email },
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: googleUser.email,
                username: googleUser.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000),
                googleId: googleUser.id,
            },
        });
    }
    // 4. Generate the Session Token (JWT)
    // This uses your existing signJwt utility, so the token is identical 
    // to what your app expects.
    const token = signJwt({ userId: user.id });
    return token;
};
