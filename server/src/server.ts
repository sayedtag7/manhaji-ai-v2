import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import miscRoutes from './routes/misc.js';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', miscRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT);

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${env.NODE_ENV}`);
            console.log(`🔗 CORS Origin: ${env.CORS_ORIGIN}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
