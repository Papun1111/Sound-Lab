import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import config from './config/index.js';
import apiRouter from './api/index.js';
import { AppError } from './utils/AppError.js';

const app: Express = express();

app.use(
  cors({
    origin: config.corsOrigin, 
    credentials: true,
  })
);


app.use(express.json());


app.use('/api', apiRouter);


app.get('/', (req: Request, res: Response) => {
  res.status(200).send('SpotTube server is running!');
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error('UNHANDLED ERROR:', err);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

export default app;