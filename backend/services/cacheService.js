/**
 * Redis Caching Service
 * Enterprise-grade caching layer for performance optimization
 */

const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isEnabled = process.env.REDIS_ENABLED === 'true';
  }

  async connect() {
    if (!this.isEnabled) {
      console.log('⚠️  Redis caching is disabled. Set REDIS_ENABLED=true to enable.');
      return;
    }

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return retries * 100; // Exponential backoff
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready to accept commands');
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isEnabled = false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      console.log('✅ Redis disconnected');
    }
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached data or null
   */
  async get(key) {
    if (!this.isEnabled || !this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key, value, ttl = 300) {
    if (!this.isEnabled || !this.isConnected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key or pattern
   */
  async del(key) {
    if (!this.isEnabled || !this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Key pattern (e.g., 'properties:*')
   */
  async delPattern(pattern) {
    if (!this.isEnabled || !this.isConnected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error);
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!this.isEnabled || !this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Increment a counter
   * @param {string} key - Counter key
   * @returns {Promise<number>} - New value
   */
  async incr(key) {
    if (!this.isEnabled || !this.isConnected) return 0;

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    if (!this.isEnabled || !this.isConnected) return;

    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>}
   */
  async getStats() {
    if (!this.isEnabled || !this.isConnected) {
      return { enabled: false, connected: false };
    }

    try {
      const info = await this.client.info('stats');
      return {
        enabled: true,
        connected: true,
        info
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { enabled: true, connected: false, error: error.message };
    }
  }

  /**
   * Generate cache key for properties
   * @param {object} filters - Query filters
   * @returns {string}
   */
  generatePropertyKey(filters) {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
      }, {});
    return `properties:${JSON.stringify(sortedFilters)}`;
  }

  /**
   * Generate cache key for single property
   * @param {string} id - Property ID
   * @returns {string}
   */
  generatePropertyIdKey(id) {
    return `property:${id}`;
  }

  /**
   * Generate cache key for agent
   * @param {string} id - Agent ID
   * @returns {string}
   */
  generateAgentKey(id) {
    return `agent:${id}`;
  }

  /**
   * Generate cache key for market data
   * @param {string} zipCode - Zip code
   * @returns {string}
   */
  generateMarketDataKey(zipCode) {
    return `market:${zipCode}`;
  }
}

// Export singleton instance
const cacheService = new CacheService();
module.exports = cacheService;
