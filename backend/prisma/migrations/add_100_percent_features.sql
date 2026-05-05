-- Migration: Add 100% KW.com Feature Parity
-- Date: May 5, 2026
-- Description: Add Open Houses, Reviews, Virtual Tours, and Market Data tables

-- Create OpenHouse table
CREATE TABLE IF NOT EXISTS "OpenHouse" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OpenHouse_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE,
  CONSTRAINT "OpenHouse_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Create RSVP table
CREATE TABLE IF NOT EXISTS "RSVP" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "openHouseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "guests" INTEGER NOT NULL DEFAULT 1,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'confirmed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RSVP_openHouseId_fkey" FOREIGN KEY ("openHouseId") REFERENCES "OpenHouse" ("id") ON DELETE CASCADE,
  UNIQUE("openHouseId", "email")
);

-- Create Review table
CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "agentId" TEXT NOT NULL,
  "reviewerName" TEXT NOT NULL,
  "reviewerEmail" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "transactionType" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "agentResponse" TEXT,
  "status" TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE
);

-- Create VirtualTour table
CREATE TABLE IF NOT EXISTS "VirtualTour" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VirtualTour_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE
);

-- Create MarketData table
CREATE TABLE IF NOT EXISTS "MarketData" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "zipCode" TEXT NOT NULL UNIQUE,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "avgPrice" INTEGER,
  "medianPrice" INTEGER,
  "avgDaysOnMarket" INTEGER,
  "pricePerSqft" INTEGER,
  "inventoryCount" INTEGER,
  "salesVolume" INTEGER,
  "priceChange" DOUBLE PRECISION,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to Property table
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "geocoded" BOOLEAN NOT NULL DEFAULT false;

-- Add new columns to Agent table
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "reviews" INTEGER NOT NULL DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "OpenHouse_propertyId_idx" ON "OpenHouse"("propertyId");
CREATE INDEX IF NOT EXISTS "OpenHouse_agentId_idx" ON "OpenHouse"("agentId");
CREATE INDEX IF NOT EXISTS "OpenHouse_startTime_idx" ON "OpenHouse"("startTime");
CREATE INDEX IF NOT EXISTS "RSVP_openHouseId_idx" ON "RSVP"("openHouseId");
CREATE INDEX IF NOT EXISTS "Review_agentId_idx" ON "Review"("agentId");
CREATE INDEX IF NOT EXISTS "Review_status_idx" ON "Review"("status");
CREATE INDEX IF NOT EXISTS "VirtualTour_propertyId_idx" ON "VirtualTour"("propertyId");
CREATE INDEX IF NOT EXISTS "MarketData_zipCode_idx" ON "MarketData"("zipCode");
CREATE INDEX IF NOT EXISTS "Property_latitude_longitude_idx" ON "Property"("latitude", "longitude");