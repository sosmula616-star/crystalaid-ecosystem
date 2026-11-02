import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import activityRoutes from './routes/activities';
import leaderboardRoutes from './routes/leaderboard';
import rewardRoutes from './routes/rewards';
import shopRoutes from './routes/shop';
import achievementRoutes from './routes/achievements';
import eventRoutes from './routes/events';
import { setupWebSocketServer } from './realtime/websocketServer';
import { prisma } from '@crystalaid/database';

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded, please slow down your requests.',
    },
    timestamp: Date.now(),
  },
});
app.use('/api', limiter);

// Health Check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e: any) {
    dbStatus = `error: ${e.message}`;
  }

  res.json({
    name: 'CrystalAid API Gateway',
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: Date.now(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/events', eventRoutes);

// Static assets: serve project logo & client build if present
const assetsDir = path.resolve(__dirname, '../../../assets');
app.use('/assets', express.static(assetsDir));

const clientDistDir = path.resolve(__dirname, '../../activity/dist');
app.use(express.static(clientDistDir));

// Fallback SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  const indexPath = path.join(clientDistDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If frontend hasn't been built yet, provide informative landing JSON
      res.status(200).json({
        app: 'CrystalAid Mini App & API Gateway',
        status: 'Online',
        message: 'Frontend is compiling or accessible via development server.',
        endpoints: [
          '/health',
          '/api/auth/me',
          '/api/leaderboard',
          '/api/rewards/status',
          '/api/shop/items',
          '/api/achievements',
          '/api/events/active',
        ],
      });
    }
  });
});

// Setup WebSocket server
setupWebSocketServer(server);

// Start listening
server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`💎 CrystalAid Server running on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket Gateway active on ws://${HOST}:${PORT}/ws`);
  console.log(`🌐 Public Mini App URL: ${process.env.APP_URL || `http://${HOST}:${PORT}`}`);
  console.log(`====================================================`);
});
