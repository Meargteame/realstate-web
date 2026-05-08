-- Phase 6: Video Chat & WebRTC System
-- Add video call tracking and virtual tour sessions

-- Video Call Sessions table
CREATE TABLE IF NOT EXISTS "VideoCall" (
  "id" TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL UNIQUE,
  "agentId" TEXT NOT NULL,
  "leadId" TEXT,
  "leadName" TEXT,
  "leadEmail" TEXT,
  "propertyId" TEXT,
  "status" TEXT DEFAULT 'scheduled',
  "startTime" TIMESTAMP,
  "endTime" TIMESTAMP,
  "duration" INTEGER,
  "recordingUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Virtual Tour Sessions table
CREATE TABLE IF NOT EXISTS "VirtualTourSession" (
  "id" TEXT PRIMARY KEY,
  "videoCallId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "viewerCount" INTEGER DEFAULT 0,
  "chatEnabled" BOOLEAN DEFAULT true,
  "screenSharing" BOOLEAN DEFAULT false,
  "recordingEnabled" BOOLEAN DEFAULT false,
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Call Participants table
CREATE TABLE IF NOT EXISTS "VideoCallParticipant" (
  "id" TEXT PRIMARY KEY,
  "videoCallId" TEXT NOT NULL,
  "participantName" TEXT NOT NULL,
  "participantEmail" TEXT,
  "role" TEXT DEFAULT 'viewer',
  "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP,
  "duration" INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "VideoCall_agentId_idx" ON "VideoCall"("agentId");
CREATE INDEX IF NOT EXISTS "VideoCall_roomId_idx" ON "VideoCall"("roomId");
CREATE INDEX IF NOT EXISTS "VideoCall_status_idx" ON "VideoCall"("status");
CREATE INDEX IF NOT EXISTS "VirtualTourSession_propertyId_idx" ON "VirtualTourSession"("propertyId");
CREATE INDEX IF NOT EXISTS "VirtualTourSession_agentId_idx" ON "VirtualTourSession"("agentId");
CREATE INDEX IF NOT EXISTS "VideoCallParticipant_videoCallId_idx" ON "VideoCallParticipant"("videoCallId");

-- Comments
COMMENT ON TABLE "VideoCall" IS 'Video call sessions between agents and leads';
COMMENT ON TABLE "VirtualTourSession" IS 'Live virtual property tour sessions';
COMMENT ON TABLE "VideoCallParticipant" IS 'Participants in video calls';
COMMENT ON COLUMN "VideoCall"."status" IS 'scheduled, active, completed, cancelled';
COMMENT ON COLUMN "VideoCallParticipant"."role" IS 'host, viewer, guest';
