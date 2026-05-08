-- Phase 4: Communication Enhancements
-- Add file attachments, read receipts, SMS, and email integration

-- Update Message table
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachments" JSONB;

-- SMS Messages table
CREATE TABLE IF NOT EXISTS "SMSMessage" (
  "id" TEXT PRIMARY KEY,
  "to" TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "sid" TEXT,
  "leadId" TEXT,
  "agentId" TEXT,
  "direction" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Messages table
CREATE TABLE IF NOT EXISTS "EmailMessage" (
  "id" TEXT PRIMARY KEY,
  "to" TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "messageId" TEXT,
  "leadId" TEXT,
  "agentId" TEXT,
  "attachments" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "SMSMessage_leadId_idx" ON "SMSMessage"("leadId");
CREATE INDEX IF NOT EXISTS "SMSMessage_agentId_idx" ON "SMSMessage"("agentId");
CREATE INDEX IF NOT EXISTS "SMSMessage_status_idx" ON "SMSMessage"("status");
CREATE INDEX IF NOT EXISTS "EmailMessage_leadId_idx" ON "EmailMessage"("leadId");
CREATE INDEX IF NOT EXISTS "EmailMessage_agentId_idx" ON "EmailMessage"("agentId");
CREATE INDEX IF NOT EXISTS "EmailMessage_status_idx" ON "EmailMessage"("status");

-- Comments
COMMENT ON COLUMN "Message"."readAt" IS 'Timestamp when message was read';
COMMENT ON COLUMN "Message"."attachments" IS 'JSON array of file attachments';
COMMENT ON TABLE "SMSMessage" IS 'SMS messages sent via Twilio';
COMMENT ON TABLE "EmailMessage" IS 'Email messages sent via email service';
