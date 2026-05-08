-- Phase 1: Quick Wins & Polish Features
-- Add new fields to agents and properties tables

-- Agent enhancements
ALTER TABLE agents ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS "certifications" TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS "socialMedia" JSONB;

-- Property advanced filters
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "lotSize" INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "yearBuilt" INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "hasGarage" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "garageSpaces" INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "hasPool" BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN agents."videoUrl" IS 'YouTube or Vimeo video introduction URL';
COMMENT ON COLUMN agents."certifications" IS 'Array of professional certifications';
COMMENT ON COLUMN agents."socialMedia" IS 'JSON object with social media links: {facebook, instagram, linkedin, twitter}';
COMMENT ON COLUMN properties."lotSize" IS 'Lot size in square feet';
COMMENT ON COLUMN properties."yearBuilt" IS 'Year the property was built';
COMMENT ON COLUMN properties."features" IS 'Array of property features like hardwood floors, granite counters, etc.';
