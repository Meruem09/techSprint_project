import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'transparency-platform' });
});

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);

// Middleware for error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

export default app;
