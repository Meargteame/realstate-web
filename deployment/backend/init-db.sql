-- Create tables for KW Real Estate Platform

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT DEFAULT 'user' NOT NULL,
  "agentId" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Agent table
CREATE TABLE IF NOT EXISTS "Agent" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "brokerage" TEXT NOT NULL,
  "rating" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
  "reviews" INTEGER DEFAULT 0 NOT NULL,
  "license" TEXT NOT NULL,
  "languages" TEXT[] NOT NULL,
  "isLuxury" BOOLEAN DEFAULT false NOT NULL
);

-- Property table
CREATE TABLE IF NOT EXISTS "Property" (
  "id" TEXT PRIMARY KEY,
  "price" INTEGER NOT NULL,
  "beds" DOUBLE PRECISION NOT NULL,
  "baths" DOUBLE PRECISION NOT NULL,
  "sqft" INTEGER NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip" TEXT NOT NULL,
  "imageUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' NOT NULL,
  "status" TEXT DEFAULT 'Active' NOT NULL,
  "propertyType" TEXT DEFAULT 'Single Family' NOT NULL,
  "agentId" TEXT NOT NULL,
  CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Lead table
CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT DEFAULT 'New' NOT NULL,
  "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "agentId" TEXT NOT NULL,
  "propertyId" TEXT,
  CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Property_agentId_idx" ON "Property"("agentId");
CREATE INDEX IF NOT EXISTS "Lead_agentId_idx" ON "Lead"("agentId");
CREATE INDEX IF NOT EXISTS "Lead_propertyId_idx" ON "Lead"("propertyId");
