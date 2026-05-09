-- Phase 7A: Advanced Search Filters Migration
-- Add new fields to properties table for enhanced search

-- Add new property feature fields
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "hoaFees" INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "hasBasement" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "hasFireplace" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "isWaterfront" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "isPetFriendly" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "stories" INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "condition" VARCHAR(50) DEFAULT 'Good';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "daysOnMarket" INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "parkingSpaces" INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "heating" VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "cooling" VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "roofType" VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "flooring" TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "appliances" TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "exteriorFeatures" TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "interiorFeatures" TEXT[];

-- Add indexes for new search fields
CREATE INDEX IF NOT EXISTS "idx_properties_yearBuilt" ON properties("yearBuilt");
CREATE INDEX IF NOT EXISTS "idx_properties_lotSize" ON properties("lotSize");
CREATE INDEX IF NOT EXISTS "idx_properties_hoaFees" ON properties("hoaFees");
CREATE INDEX IF NOT EXISTS "idx_properties_hasPool" ON properties("hasPool");
CREATE INDEX IF NOT EXISTS "idx_properties_isWaterfront" ON properties("isWaterfront");
CREATE INDEX IF NOT EXISTS "idx_properties_garageSpaces" ON properties("garageSpaces");
CREATE INDEX IF NOT EXISTS "idx_properties_condition" ON properties("condition");
CREATE INDEX IF NOT EXISTS "idx_properties_daysOnMarket" ON properties("daysOnMarket");

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS "idx_properties_price_yearBuilt" ON properties("price", "yearBuilt");
CREATE INDEX IF NOT EXISTS "idx_properties_city_yearBuilt" ON properties("city", "yearBuilt");
CREATE INDEX IF NOT EXISTS "idx_properties_status_daysOnMarket" ON properties("status", "daysOnMarket");

-- Update existing properties with default values
UPDATE properties SET "daysOnMarket" = EXTRACT(DAY FROM (NOW() - "listedAt")) WHERE "daysOnMarket" = 0;
UPDATE properties SET "parkingSpaces" = "garageSpaces" WHERE "parkingSpaces" = 0 AND "garageSpaces" IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties."hoaFees" IS 'Monthly HOA fees in dollars';
COMMENT ON COLUMN properties."daysOnMarket" IS 'Number of days property has been listed';
COMMENT ON COLUMN properties."condition" IS 'Property condition: New, Excellent, Good, Fair, Needs Work';
COMMENT ON COLUMN properties."stories" IS 'Number of stories/floors in the property';
