import dotenv from 'dotenv';

dotenv.config();

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
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
};

export default config;