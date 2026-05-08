-- Phase 5: Calendar & Scheduling System
-- Add calendar events, availability, and booking requests

-- Calendar Events table
CREATE TABLE IF NOT EXISTS "CalendarEvent" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "location" TEXT,
  "eventType" TEXT NOT NULL,
  "status" TEXT DEFAULT 'scheduled',
  "allDay" BOOLEAN DEFAULT false,
  "agentId" TEXT NOT NULL,
  "leadId" TEXT,
  "propertyId" TEXT,
  "isRecurring" BOOLEAN DEFAULT false,
  "recurrenceRule" TEXT,
  "parentEventId" TEXT,
  "reminderMinutes" INTEGER[] DEFAULT ARRAY[15, 60],
  "googleEventId" TEXT,
  "outlookEventId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability table
CREATE TABLE IF NOT EXISTS "Availability" (
  "id" TEXT PRIMARY KEY,
  "agentId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isAvailable" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("agentId", "dayOfWeek", "startTime")
);

-- Booking Requests table
CREATE TABLE IF NOT EXISTS "BookingRequest" (
  "id" TEXT PRIMARY KEY,
  "agentId" TEXT NOT NULL,
  "leadName" TEXT NOT NULL,
  "leadEmail" TEXT NOT NULL,
  "leadPhone" TEXT,
  "propertyId" TEXT,
  "requestedDate" TIMESTAMP NOT NULL,
  "requestedTime" TEXT NOT NULL,
  "duration" INTEGER DEFAULT 60,
  "message" TEXT,
  "status" TEXT DEFAULT 'pending',
  "confirmedEventId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "CalendarEvent_agentId_startTime_idx" ON "CalendarEvent"("agentId", "startTime");
CREATE INDEX IF NOT EXISTS "CalendarEvent_leadId_idx" ON "CalendarEvent"("leadId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_propertyId_idx" ON "CalendarEvent"("propertyId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_status_idx" ON "CalendarEvent"("status");
CREATE INDEX IF NOT EXISTS "Availability_agentId_idx" ON "Availability"("agentId");
CREATE INDEX IF NOT EXISTS "BookingRequest_agentId_status_idx" ON "BookingRequest"("agentId", "status");
CREATE INDEX IF NOT EXISTS "BookingRequest_status_idx" ON "BookingRequest"("status");

-- Comments
COMMENT ON TABLE "CalendarEvent" IS 'Calendar events for agents (showings, appointments, meetings)';
COMMENT ON TABLE "Availability" IS 'Agent availability schedule by day of week';
COMMENT ON TABLE "BookingRequest" IS 'Public booking requests from leads';
COMMENT ON COLUMN "CalendarEvent"."eventType" IS 'showing, appointment, open_house, meeting, personal';
COMMENT ON COLUMN "CalendarEvent"."recurrenceRule" IS 'RRULE format for recurring events';
COMMENT ON COLUMN "Availability"."dayOfWeek" IS '0-6 where 0=Sunday, 6=Saturday';
