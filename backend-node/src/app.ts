import express from 'express';
import cors from 'cors';
import vendorRoutes from './routes/vendors';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api/vendors', vendorRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

export default app;
