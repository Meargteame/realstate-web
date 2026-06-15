/**
 * Security Middleware
 * Enterprise-grade security headers and protection
 */

const helmet = require('helmet');

/**
 * Comprehensive security headers configuration
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://maps.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'http:',
        'blob:'
      ],
      connectSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://maps.googleapis.com',
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      frameSrc: [
        "'self'",
        'https://my.matterport.com',
        'https://www.youtube.com',
        'https://player.vimeo.com'
      ],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // XSS Protection
  xssFilter: true,

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // Permissions Policy
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
});

/**
 * Additional custom security headers
 */
const additionalHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
};

/**
 * Request sanitization middleware
 *
 * NOTE: In Express 5 `req.query` is a read-only getter, so we mutate the
 * existing objects in place rather than reassigning them.
 */
const sanitizeInput = (req, res, next) => {
  // Remove null bytes from all inputs, mutating in place.
  const sanitizeInPlace = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = value.replace(/\0/g, '');
      } else if (value && typeof value === 'object') {
        sanitizeInPlace(value);
      }
    });
  };

  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);

  next();
};

/**
 * Prevent parameter pollution
 *
 * Mutates req.query in place (read-only getter in Express 5).
 */
const preventParameterPollution = (req, res, next) => {
  const query = req.query;
  if (query && typeof query === 'object') {
    Object.keys(query).forEach(key => {
      if (Array.isArray(query[key])) {
        query[key] = query[key][0];
      }
    });
  }

  next();
};

/**
 * API key validation middleware
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header'
    });
  }

  // Validate API key format (basic validation)
  if (apiKey.length < 32) {
    return res.status(401).json({ 
      error: 'Invalid API key format',
      message: 'API key must be at least 32 characters'
    });
  }

  // In production, validate against database
  // For now, check against environment variable
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
    return res.status(403).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

/**
 * CORS configuration for production
 */
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

module.exports = {
  securityHeaders,
  additionalHeaders,
  sanitizeInput,
  preventParameterPollution,
  validateApiKey,
  corsOptions
};
