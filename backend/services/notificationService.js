const cron = require('node-cron');
const prisma = require('../config/prisma');

class NotificationService {
  constructor() {
    this.prisma = prisma;
    this.emailService = null; // Lazy load to avoid circular dependency
    this.isRunning = false;
    this.jobs = new Map();
  }

  /**
   * Get email service (lazy loaded)
   */
  getEmailService() {
    if (!this.emailService) {
      this.emailService = require('./emailService');
    }
    return this.emailService;
  }
  /**
   * Start all notification cron jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Notification service is already running');
      return;
    }

    console.log('🔔 Starting notification service...');

    // Daily notifications at 9 AM
    this.jobs.set('daily', cron.schedule('0 9 * * *', async () => {
      console.log('📅 Running daily search notifications...');
      await this.processDailyNotifications();
    }, { scheduled: false }));

    // Weekly notifications on Monday at 9 AM
    this.jobs.set('weekly', cron.schedule('0 9 * * 1', async () => {
      console.log('📅 Running weekly search notifications...');
      await this.processWeeklyNotifications();
    }, { scheduled: false }));

    // Check for instant notifications every 15 minutes
    this.jobs.set('instant', cron.schedule('*/15 * * * *', async () => {
      console.log('⚡ Checking for instant notifications...');
      await this.processInstantNotifications();
    }, { scheduled: false }));

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started ${name} notification job`);
    });

    this.isRunning = true;
    console.log('🎉 Notification service started successfully');
  }

  /**
   * Stop all notification jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Notification service is not running');
      return;
    }

    console.log('🛑 Stopping notification service...');

    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped ${name} notification job`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Notification service stopped');
  }

  /**
   * Process daily notifications
   */
  async processDailyNotifications() {
    try {
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          frequency: 'daily',
          emailAlerts: true,
          isActive: true,
          OR: [
            { lastNotified: null },
            { lastNotified: { lt: this.getStartOfDay() } }
          ]
        },
        include: {
          user: true
        }
      });

      console.log(`📧 Processing ${savedSearches.length} daily notifications`);

      for (const search of savedSearches) {
        await this.processSearchNotification(search);
      }

    } catch (error) {
      console.error('❌ Daily notifications error:', error);
    }
  }

  /**
   * Process weekly notifications
   */
  async processWeeklyNotifications() {
    try {
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          frequency: 'weekly',
          emailAlerts: true,
          isActive: true,
          OR: [
            { lastNotified: null },
            { lastNotified: { lt: this.getStartOfWeek() } }
          ]
        },
        include: {
          user: true
        }
      });

      console.log(`📧 Processing ${savedSearches.length} weekly notifications`);

      for (const search of savedSearches) {
        await this.processSearchNotification(search);
      }

    } catch (error) {
      console.error('❌ Weekly notifications error:', error);
    }
  }

  /**
   * Process instant notifications
   */
  async processInstantNotifications() {
    try {
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          frequency: 'instant',
          emailAlerts: true,
          isActive: true,
          OR: [
            { lastNotified: null },
            { lastNotified: { lt: new Date(Date.now() - 15 * 60 * 1000) } } // 15 minutes ago
          ]
        },
        include: {
          user: true
        }
      });

      console.log(`⚡ Processing ${savedSearches.length} instant notifications`);

      for (const search of savedSearches) {
        await this.processSearchNotification(search);
      }

    } catch (error) {
      console.error('❌ Instant notifications error:', error);
    }
  }

  /**
   * Process notification for a single saved search
   */
  async processSearchNotification(savedSearch) {
    try {
      console.log(`🔍 Processing search: ${savedSearch.name} (${savedSearch.user.email})`);

      // Find new properties that match the search criteria
      const newProperties = await this.findMatchingProperties(savedSearch);

      if (newProperties.length === 0) {
        console.log(`  ℹ️  No new properties found for "${savedSearch.name}"`);
        
        // Update last notified time even if no properties found
        await this.prisma.savedSearch.update({
          where: { id: savedSearch.id },
          data: { lastNotified: new Date() }
        });
        
        return;
      }

      console.log(`  📧 Found ${newProperties.length} new properties for "${savedSearch.name}"`);

      // Send email notification
      const emailResult = await this.getEmailService().sendSearchAlert({
        user: savedSearch.user,
        savedSearch,
        newProperties
      });

      if (emailResult.success) {
        // Create alert records
        const alertPromises = newProperties.map(property => 
          this.prisma.searchAlert.create({
            data: {
              savedSearchId: savedSearch.id,
              propertyId: property.id,
              emailSent: true
            }
          }).catch(error => {
            // Handle duplicate alerts gracefully
            if (error.code === 'P2002') {
              console.log(`  ⚠️  Alert already exists for property ${property.id}`);
            } else {
              throw error;
            }
          })
        );

        await Promise.all(alertPromises);

        // Update last notified time
        await this.prisma.savedSearch.update({
          where: { id: savedSearch.id },
          data: { lastNotified: new Date() }
        });

        console.log(`  ✅ Sent notification for "${savedSearch.name}" to ${savedSearch.user.email}`);
      } else {
        console.log(`  ❌ Failed to send notification for "${savedSearch.name}"`);
      }

    } catch (error) {
      console.error(`❌ Error processing search "${savedSearch.name}":`, error);
    }
  }

  /**
   * Find properties that match saved search criteria
   */
  async findMatchingProperties(savedSearch) {
    const filters = savedSearch.filters;
    const lastNotified = savedSearch.lastNotified || savedSearch.createdAt;

    // Build where clause from saved filters
    let whereClause = {
      status: 'Active',
      createdAt: { gt: lastNotified } // Only new properties since last notification
    };

    // Apply price filters
    if (filters.minPrice || filters.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) whereClause.price.gte = parseInt(filters.minPrice);
      if (filters.maxPrice) whereClause.price.lte = parseInt(filters.maxPrice);
    }

    // Apply bed/bath filters
    if (filters.beds) whereClause.beds = { gte: parseFloat(filters.beds) };
    if (filters.baths) whereClause.baths = { gte: parseFloat(filters.baths) };
    if (filters.propertyType) whereClause.propertyType = filters.propertyType;

    // Apply location filters
    if (filters.city) whereClause.city = filters.city;
    if (filters.state) whereClause.state = filters.state;

    // Apply coordinate bounds if saved
    if (filters.bounds) {
      const { southwest, northeast } = filters.bounds;
      whereClause.latitude = {
        gte: southwest.lat,
        lte: northeast.lat
      };
      whereClause.longitude = {
        gte: southwest.lng,
        lte: northeast.lng
      };
    }

    const properties = await this.prisma.property.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to 10 properties per notification
    });

    return properties;
  }

  /**
   * Manually trigger notifications for a specific search
   */
  async triggerSearchNotification(searchId) {
    try {
      const savedSearch = await this.prisma.savedSearch.findUnique({
        where: { id: searchId },
        include: { user: true }
      });

      if (!savedSearch) {
        throw new Error('Saved search not found');
      }

      if (!savedSearch.emailAlerts || !savedSearch.isActive) {
        throw new Error('Email alerts are disabled for this search');
      }

      await this.processSearchNotification(savedSearch);
      return { success: true, message: 'Notification sent successfully' };

    } catch (error) {
      console.error('Manual notification trigger error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get start of current day
   */
  getStartOfDay() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Get start of current week (Monday)
   */
  getStartOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(now.setDate(diff));
  }

  /**
   * Get notification service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }
}

module.exports = new NotificationService();