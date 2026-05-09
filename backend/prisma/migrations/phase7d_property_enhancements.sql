-- Phase 7D: Enhanced Property Features
-- Add price history tracking and property comparison

-- Property Price History table
CREATE TABLE IF NOT EXISTS "PropertyPriceHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "changeType" TEXT NOT NULL,
  "changedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE
);

-- Property Comparison table
CREATE TABLE IF NOT EXISTS "PropertyComparison" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "propertyIds" TEXT[] NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "PropertyPriceHistory_propertyId_idx" ON "PropertyPriceHistory"("propertyId");
CREATE INDEX IF NOT EXISTS "PropertyPriceHistory_changedAt_idx" ON "PropertyPriceHistory"("changedAt" DESC);
CREATE INDEX IF NOT EXISTS "PropertyComparison_userId_idx" ON "PropertyComparison"("userId");

-- Insert initial price history for existing properties
INSERT INTO "PropertyPriceHistory" ("id", "propertyId", "price", "changeType", "changedAt")
SELECT 
  gen_random_uuid()::text,
  "id",
  "price"::DOUBLE PRECISION,
  'listed',
  "listedAt"
FROM "properties"
WHERE NOT EXISTS (
  SELECT 1 FROM "PropertyPriceHistory" WHERE "propertyId" = "properties"."id"
);
