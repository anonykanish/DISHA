import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initSchema } from './database/schema.js';
import { seedDatabase } from './database/seed.js';
import { initSocketIO } from './services/socketService.js';

import hospitalsRouter from './routes/hospitals.js';
import departmentsRouter from './routes/departments.js';
import mapRouter from './routes/map.js';
import navigationRouter from './routes/navigation.js';
import visitsRouter from './routes/visits.js';
import queueRouter from './routes/queue.js';
import adminRouter from './routes/admin.js';
import caregiverRouter from './routes/caregiver.js';
import feedbackRouter from './routes/feedback.js';
import announcementsRouter from './routes/announcements.js';
import demoRouter from './routes/demo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/map', mapRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/admin', adminRouter);
app.use('/api/caregiver', caregiverRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/demo', demoRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DISHA - Hospital Navigation & Digital Queue Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Ensure DB schema and seeds are loaded
    await initSchema();
    await seedDatabase(false);

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  DISHA Backend Server running on port ${PORT}`);
      console.log(`  Socket.IO active for real-time queue syncing`);
      console.log(`  http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export { app, server };
