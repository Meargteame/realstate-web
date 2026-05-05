/**
 * Rate Limiting Middleware
 * Enterprise-grade DDoS protection and abuse prevention
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const cacheService = require('../services/cacheService');

/**
 * Create rate limiter with Redis store (if available) or memory store
 */
function createLimiter(options) {
  const config = {
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    ...options
  };

  // Use Redis store if available
  if (cacheService.isEnabled && cacheService.isConnected) {
    config.store = new RedisStore({
      client: cacheService.client,
      prefix: 'rl:',
    });
  }

  return rateLimit(config);
}

/**
 * Global rate limiter for all API endpoints
 * 100 requests per 15 minutes
 */
const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes
 */
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: '15 minutes'
  }
});

/**
 * Moderate rate limiter for search endpoints
 * 30 requests per minute
 */
const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Too many search requests, please slow down',
    retryAfter: '1 minute'
  }
});

/**
 * Lenient rate limiter for read-only endpoints
 * 200 requests per 15 minutes
 */
const readLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many requests, please try again later',
    retryAfter: '15 minutes'
  }
});

/**
 * Strict rate limiter for write operations
 * 20 requests per 15 minutes
 */
const writeLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many write operations, please try again later',
    retryAfter: '15 minutes'
  }
});

/**
 * API key rate limiter for authenticated API access
 * 1000 requests per minute
 */
const apiKeyLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '1 minute'
  }
});

/**
 * Lead submission rate limiter
 * 3 submissions per hour per IP
 */
const leadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: 'Too many lead submissions, please try again later',
    retryAfter: '1 hour'
  }
});

/**
 * Email rate limiter
 * 5 emails per hour per IP
 */
const emailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many email requests, please try again later',
    retryAfter: '1 hour'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  searchLimiter,
  readLimiter,
  writeLimiter,
  apiKeyLimiter,
  leadLimiter,
  emailLimiter,
  createLimiter
};
