-- =====================================================
-- CRITICAL PERFORMANCE INDEXES
-- Enterprise-grade database optimization
-- =====================================================

-- Properties Table Indexes
-- =====================================================

-- Composite index for property search (most common query)
CREATE INDEX IF NOT EXISTS idx_property_search 
ON properties(city, state, status, price, beds, baths);

-- Geospatial index for map-based searches
CREATE INDEX IF NOT EXISTS idx_property_geo 
ON properties(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Agent-property relationship with status filter
CREATE INDEX IF NOT EXISTS idx_property_agent_active 
ON properties(agent_id, status) 
WHERE status = 'Active';

-- Partial index for active properties (most queried)
CREATE INDEX IF NOT EXISTS idx_active_properties 
ON properties(listed_at DESC) 
WHERE status = 'Active';

-- Luxury properties index (high-value segment)
CREATE INDEX IF NOT EXISTS idx_luxury_properties 
ON properties(price DESC) 
WHERE price > 1000000;

-- Zip code search optimization
CREATE INDEX IF NOT EXISTS idx_property_zip_status 
ON properties(zip, status);

-- Property type filtering
CREATE INDEX IF NOT EXISTS idx_property_type_status 
ON properties(property_type, status);

-- Recently updated properties
CREATE INDEX IF NOT EXISTS idx_property_updated 
ON properties(updated_at DESC);

-- Property slug for SEO URLs
CREATE INDEX IF NOT EXISTS idx_property_slug 
ON properties(slug) 
WHERE slug IS NOT NULL;

-- Agents Table Indexes
-- =====================================================

-- Email lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_agent_email 
ON agents(email);

-- Location-based agent search
CREATE INDEX IF NOT EXISTS idx_agent_location_active 
ON agents(location, is_active) 
WHERE is_active = true;

-- Rating and reviews for sorting
CREATE INDEX IF NOT EXISTS idx_agent_rating_reviews 
ON agents(rating DESC, reviews DESC);

-- Agent slug for SEO URLs
CREATE INDEX IF NOT EXISTS idx_agent_slug 
ON agents(slug) 
WHERE slug IS NOT NULL;

-- Active verified agents
CREATE INDEX IF NOT EXISTS idx_agent_verified_active 
ON agents(is_verified, is_active) 
WHERE is_verified = true AND is_active = true;

-- Leads Table Indexes
-- =====================================================

-- Agent leads with status
CREATE INDEX IF NOT EXISTS idx_lead_agent_status 
ON leads(agent_id, status, date DESC);

-- Property leads
CREATE INDEX IF NOT EXISTS idx_lead_property 
ON leads(property_id, date DESC) 
WHERE property_id IS NOT NULL;

-- Recent leads
CREATE INDEX IF NOT EXISTS idx_lead_date 
ON leads(date DESC);

-- Lead email lookup
CREATE INDEX IF NOT EXISTS idx_lead_email 
ON leads(email);

-- Favorites Table Indexes
-- =====================================================

-- User favorites lookup
CREATE INDEX IF NOT EXISTS idx_favorite_user 
ON favorites(user_id, created_at DESC);

-- Property favorites count
CREATE INDEX IF NOT EXISTS idx_favorite_property 
ON favorites(property_id);

-- Saved Searches Table Indexes
-- =====================================================

-- User saved searches
CREATE INDEX IF NOT EXISTS idx_saved_search_user 
ON saved_searches(user_id, is_active);

-- Active searches for notification processing
CREATE INDEX IF NOT EXISTS idx_saved_search_active 
ON saved_searches(is_active, last_run) 
WHERE is_active = true;

-- Open Houses Table Indexes
-- =====================================================

-- Property open houses
CREATE INDEX IF NOT EXISTS idx_open_house_property 
ON open_houses(property_id, start_time);

-- Agent open houses
CREATE INDEX IF NOT EXISTS idx_open_house_agent 
ON open_houses(agent_id, start_time);

-- Upcoming open houses
CREATE INDEX IF NOT EXISTS idx_open_house_upcoming 
ON open_houses(start_time) 
WHERE status = 'scheduled' AND start_time > NOW();

-- Reviews Table Indexes
-- =====================================================

-- Agent reviews
CREATE INDEX IF NOT EXISTS idx_review_agent 
ON reviews(agent_id, created_at DESC);

-- Published reviews only
CREATE INDEX IF NOT EXISTS idx_review_published 
ON reviews(agent_id, rating DESC) 
WHERE status = 'published';

-- Virtual Tours Table Indexes
-- =====================================================

-- Property virtual tours
CREATE INDEX IF NOT EXISTS idx_virtual_tour_property 
ON virtual_tours(property_id, is_primary DESC);

-- Market Data Table Indexes
-- =====================================================

-- Zip code lookup (primary query)
CREATE INDEX IF NOT EXISTS idx_market_data_zip 
ON market_data(zip_code);

-- City and state lookup
CREATE INDEX IF NOT EXISTS idx_market_data_city_state 
ON market_data(city, state);

-- Users Table Indexes
-- =====================================================

-- Email lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_user_email 
ON users(email);

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_user_role 
ON users(role);

-- Opportunities Table Indexes
-- =====================================================

-- Agent opportunities
CREATE INDEX IF NOT EXISTS idx_opportunity_agent 
ON opportunities(agent_id, status, created_at DESC);

-- Status-based queries
CREATE INDEX IF NOT EXISTS idx_opportunity_status 
ON opportunities(status, probability DESC);

-- =====================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

ANALYZE properties;
ANALYZE agents;
ANALYZE leads;
ANALYZE favorites;
ANALYZE saved_searches;
ANALYZE open_houses;
ANALYZE reviews;
ANALYZE virtual_tours;
ANALYZE market_data;
ANALYZE users;
ANALYZE opportunities;

-- =====================================================
-- PERFORMANCE STATISTICS
-- =====================================================

-- Enable query statistics collection
-- Run this to see slow queries:
-- SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 20;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. These indexes significantly improve query performance
-- 2. Partial indexes reduce index size and improve write performance
-- 3. Composite indexes match common query patterns
-- 4. Run ANALYZE after creating indexes to update statistics
-- 5. Monitor index usage with: SELECT * FROM pg_stat_user_indexes;
-- 6. Remove unused indexes to improve write performance
-- =====================================================
