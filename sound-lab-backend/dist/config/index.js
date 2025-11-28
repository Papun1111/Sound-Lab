import dotenv from 'dotenv';
dotenv.config();
const getEnvVariable = (key) => {
    const value = process.env[key];
    if (!value) {
        // Making these optional so the app doesn't crash if they aren't set yet
        // In production, you would want to throw an error here for required vars
        if (key.startsWith('GOOGLE_'))
            return '';
        throw new Error(`FATAL ERROR: Environment variable "${key}" is not set.`);
    }
    return value;
};
const config = {
    port: parseInt(process.env.PORT || '8080', 10),
    corsOrigin: getEnvVariable('CORS_ORIGIN'),
    database: {
        url: getEnvVariable('DATABASE_URL'),
    },
    jwt: {
        secret: getEnvVariable('JWT_SECRET'),
    },
    youtube: {
        apiKey: getEnvVariable('YOUTUBE_API_KEY'),
    },
    // ✨ NEW: Google Config
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
    }
};
export default config;
