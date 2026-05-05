/**
 * Monitoring & Observability Middleware
 * Enterprise-grade performance tracking and error monitoring
 */

const morgan = require('morgan');

/**
 * Performance tracking middleware
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      endpoints: {}
    };
  }

  /**
   * Track request performance
   */
  trackRequest() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Track request count
      this.metrics.requests++;

      // Capture response
      res.on('finish', () => {
        const duration = Date.now() - start;
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        
        // Track total response time
        this.metrics.totalResponseTime += duration;

        // Track slow requests (>1 second)
        if (duration > 1000) {
          this.metrics.slowRequests++;
          console.warn(`⚠️  Slow request detected: ${endpoint} took ${duration}ms`);
        }

        // Track per-endpoint metrics
        if (!this.metrics.endpoints[endpoint]) {
          this.metrics.endpoints[endpoint] = {
            count: 0,
            totalTime: 0,
            errors: 0,
            statusCodes: {}
          };
        }

        this.metrics.endpoints[endpoint].count++;
        this.metrics.endpoints[endpoint].totalTime += duration;
        
        // Track status codes
        const statusCode = res.statusCode;
        if (!this.metrics.endpoints[endpoint].statusCodes[statusCode]) {
          this.metrics.endpoints[endpoint].statusCodes[statusCode] = 0;
        }
        this.metrics.endpoints[endpoint].statusCodes[statusCode]++;

        // Track errors
        if (statusCode >= 400) {
          this.metrics.errors++;
          this.metrics.endpoints[endpoint].errors++;
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          const statusColor = statusCode >= 500 ? '\x1b[31m' : 
                            statusCode >= 400 ? '\x1b[33m' : 
                            '\x1b[32m';
          console.log(
            `${statusColor}${statusCode}\x1b[0m ${req.method} ${req.path} - ${duration}ms`
          );
        }
      });

      next();
    };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const avgResponseTime = this.metrics.requests > 0 
      ? Math.round(this.metrics.totalResponseTime / this.metrics.requests)
      : 0;

    const errorRate = this.metrics.requests > 0
      ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2)
      : 0;

    const endpointStats = Object.entries(this.metrics.endpoints).map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgTime: Math.round(data.totalTime / data.count),
      errors: data.errors,
      errorRate: ((data.errors / data.count) * 100).toFixed(2),
      statusCodes: data.statusCodes
    }));

    // Sort by count (most popular endpoints first)
    endpointStats.sort((a, b) => b.count - a.count);

    return {
      summary: {
        totalRequests: this.metrics.requests,
        totalErrors: this.metrics.errors,
        errorRate: `${errorRate}%`,
        avgResponseTime: `${avgResponseTime}ms`,
        slowRequests: this.metrics.slowRequests
      },
      endpoints: endpointStats.slice(0, 20) // Top 20 endpoints
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      endpoints: {}
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Request logging middleware (Morgan)
 */
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: (req, res) => {
      // Skip logging health checks in production
      return process.env.NODE_ENV === 'production' && req.path === '/api/health';
    }
  }
);

/**
 * Error tracking middleware
 */
const errorTracker = (err, req, res, next) => {
  // Log error details
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry.captureException(err);
  }

  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Business metrics tracking
 */
class BusinessMetrics {
  constructor() {
    this.metrics = {
      propertyViews: 0,
      propertySearches: 0,
      leadsGenerated: 0,
      favoritesAdded: 0,
      savedSearches: 0,
      openHouseRSVPs: 0,
      reviewsSubmitted: 0
    };
  }

  track(event, data = {}) {
    switch (event) {
      case 'property.view':
        this.metrics.propertyViews++;
        break;
      case 'property.search':
        this.metrics.propertySearches++;
        break;
      case 'lead.generated':
        this.metrics.leadsGenerated++;
        break;
      case 'favorite.added':
        this.metrics.favoritesAdded++;
        break;
      case 'search.saved':
        this.metrics.savedSearches++;
        break;
      case 'openhouse.rsvp':
        this.metrics.openHouseRSVPs++;
        break;
      case 'review.submitted':
        this.metrics.reviewsSubmitted++;
        break;
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Business Event: ${event}`, data);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service (Amplitude, Mixpanel, etc.)
    }
  }

  getMetrics() {
    return this.metrics;
  }

  reset() {
    this.metrics = {
      propertyViews: 0,
      propertySearches: 0,
      leadsGenerated: 0,
      favoritesAdded: 0,
      savedSearches: 0,
      openHouseRSVPs: 0,
      reviewsSubmitted: 0
    };
  }
}

const businessMetrics = new BusinessMetrics();

/**
 * Health check endpoint data
 */
const getHealthStatus = async () => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      percentage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
    },
    performance: performanceMonitor.getStats(),
    business: businessMetrics.getMetrics()
  };
};

module.exports = {
  performanceMonitor,
  requestLogger,
  errorTracker,
  businessMetrics,
  getHealthStatus
};
