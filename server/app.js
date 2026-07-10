import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import env from './config/env.js';
import initSocket from './socket/index.js';
import { initScheduler } from './services/scheduler.service.js';
import errorHandler from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import orderRoutes from './routes/order.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const httpServer = createServer(app);

// Connect Database
connectDB();

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});
initSocket(io);

// Expose io on app instance to use in controllers if needed
app.set('io', io);

// Security and utility middleware (disable CSP to allow static SPA assets to load)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize scheduler
initScheduler();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Resolve static build path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, '../client/dist');

// Serve static assets
app.use(express.static(clientBuildPath));

// Fallback all other client requests to SPA index.html
app.get('*any', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 DailyBite backend server is running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // In production, we might want to shut down gracefully
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});
// Nodemon trigger change comment
