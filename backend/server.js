
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const notificationService = require('./services/notificationService');
const cacheService = require('./services/cacheService');
const { securityHeaders, additionalHeaders, sanitizeInput, preventParameterPollution } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiter');
const { performanceMonitor, requestLogger, errorTracker } = require('./middleware/monitoring');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// High-speed API Response Compression (Gzip / Brotli)
app.use(compression());

// =====================================================
// TRUST PROXY — required behind Caddy / Nginx / load balancers
// =====================================================
// Express needs this to read X-Forwarded-For/Proto correctly.
// '1' = trust the nearest proxy (Caddy in Docker, or Nginx in production).
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
} else {
  // In dev, trust localhost proxy (Vite dev server)
  app.set('trust proxy', 'loopback');
}

// =====================================================
// CORS CONFIGURATION
// =====================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://localhost:5173'
];

// MUST BE FIRST: Hostinger LiteSpeed drops OPTIONS requests if security headers block it
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Explicit Preflight Handling for LiteSpeed
app.options(/.*/, cors());

// =====================================================
// SECURITY MIDDLEWARE (Applied After CORS)
// =====================================================
app.use(securityHeaders);
app.use(additionalHeaders);

// =====================================================
// BODY PARSING & INPUT SANITIZATION
// =====================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use(preventParameterPollution);

// =====================================================
// MONITORING & LOGGING
// =====================================================
app.use(requestLogger);
app.use(performanceMonitor.trackRequest());

// =====================================================
// RATE LIMITING (Global)
// =====================================================
app.use('/api/', globalLimiter);

// =====================================================
// STATIC FILES (Serve uploaded images)
// =====================================================
const path = require('path');

// Add CORS headers for static files
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// ROUTES
// =====================================================
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const leadRoutes = require('./routes/leadRoutes');
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const mapRoutes = require('./routes/mapRoutes');
const savedSearchRoutes = require('./routes/savedSearchRoutes');
const openHouseRoutes = require('./routes/openHouseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const virtualTourRoutes = require('./routes/virtualTourRoutes');
const marketDataRoutes = require('./routes/marketDataRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const blogRoutes = require('./routes/blogRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const videoRoutes = require('./routes/videoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/open-houses', openHouseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/virtual-tours', virtualTourRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// =====================================================
// HEALTH & MONITORING ENDPOINTS
// =====================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/metrics', (req, res) => {
  // Require API key for metrics endpoint
  const apiKey = req.headers['x-api-key'];
  if (!process.env.METRICS_API_KEY || apiKey !== process.env.METRICS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Valid API key required' });
  }

  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: memoryUsage,
    environment: process.env.NODE_ENV || 'development',
    note: 'Full monitoring temporarily disabled - basic metrics only'
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Centralized error tracker (must be the last middleware, 4-arg signature)
app.use(errorTracker);

// =====================================================
// SERVER STARTUP
// =====================================================
async function startServer() {
  try {
    // Connect to Redis cache
    await cacheService.connect();

    // Start server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log(`🚀 TORRA Real Estate Backend - ENTERPRISE MODE`);
      console.log('🚀 ============================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Cache: ${cacheService.isEnabled ? '✅ Enabled' : '⚠️  Disabled'}`);
      console.log(`🚀 Rate Limiting: ✅ Enabled`);
      console.log(`🚀 Security Headers: ✅ Enabled`);
      console.log(`🚀 Performance Monitoring: ✅ Enabled`);
      console.log('🚀 ============================================');
      console.log('');

      // Start notification service
      setTimeout(() => {
        notificationService.start();
      }, 2000);
    });

    // =====================================================
    // SOCKET.IO SETUP FOR VIDEO SIGNALING
    // =====================================================
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // WebRTC signaling for peer-to-peer video calls
    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Join a video room
      socket.on('join-room', (roomName, identity) => {
        socket.join(roomName);
        socket.to(roomName).emit('user-joined', { identity, socketId: socket.id });
        console.log(`👤 ${identity} joined room: ${roomName}`);
      });

      // WebRTC signaling: offer
      socket.on('offer', (roomName, offer) => {
        socket.to(roomName).emit('offer', offer);
      });

      // WebRTC signaling: answer
      socket.on('answer', (roomName, answer) => {
        socket.to(roomName).emit('answer', answer);
      });

      // WebRTC signaling: ICE candidate
      socket.on('ice-candidate', (roomName, candidate) => {
        socket.to(roomName).emit('ice-candidate', candidate);
      });

      // Leave room
      socket.on('leave-room', (roomName, identity) => {
        socket.leave(roomName);
        socket.to(roomName).emit('user-left', { identity, socketId: socket.id });
        console.log(`👤 ${identity} left room: ${roomName}`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    console.log('🎥 WebRTC signaling server ready');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully...');

      // Stop accepting new connections
      server.close(async () => {
        console.log('✅ HTTP server closed');

        // Disconnect services
        await cacheService.disconnect();
        notificationService.stop();
        io.close();

        console.log('✅ All services stopped');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    });

    // Periodic cache clean-up to keep event loop alive
    setInterval(() => cacheService.cleanup?.(), 1000 * 60 * 15);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

process.on("exit", (code) => {
  console.log("Node exited with code", code);
  notificationService.stop();
});

