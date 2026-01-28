import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app: Express = express();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the uploads directory exists relative to the project root
        // This matches the static serving path
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

app.use(cors({
    origin: '*', // Allow all origins for dev simplicity to prevent Network Errors
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[GLOBAL_LOG] ${req.method} ${req.url}`);
    next();
});

// Basic health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'transparency-platform' });
});

// Route imports
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import complaintRoutes from './routes/complaint.routes';

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/complaints', complaintRoutes);
app.use('/upload', uploadRoutes);
app.use('/admin', adminRoutes);
app.use('/analytics', analyticsRoutes);

// Middleware for error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

export default app;
