const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const notificationService = require('./services/notificationService');
const cacheService = require('./services/cacheService');
const { securityHeaders, additionalHeaders, sanitizeInput, preventParameterPollution } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiter');
const { performanceMonitor, requestLogger, errorTracker, getHealthStatus } = require('./middleware/monitoring');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// SECURITY MIDDLEWARE (Applied First)
// =====================================================
app.use(securityHeaders);
app.use(additionalHeaders);

// =====================================================
// CORS CONFIGURATION
// =====================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
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

// =====================================================
// BODY PARSING & INPUT SANITIZATION
// =====================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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
const videoRoutes = require('./routes/videoRoutes');
const adminRoutes = require('./routes/adminRoutes');

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
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);

// =====================================================
// HEALTH & MONITORING ENDPOINTS
// =====================================================
app.get('/api/health', async (req, res) => {
  const health = await getHealthStatus();
  res.json(health);
});

app.get('/api/metrics', async (req, res) => {
  // Require API key for metrics endpoint
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.METRICS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const health = await getHealthStatus();
  res.json(health);
});

// =====================================================
// ERROR HANDLING
// =====================================================
app.use(errorTracker);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

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
      console.log(`🚀 KW Real Estate Backend - ENTERPRISE MODE`);
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

    // A hack to keep the event loop alive in this specific Node environment
    setInterval(() => {}, 1000 * 60 * 60);

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

