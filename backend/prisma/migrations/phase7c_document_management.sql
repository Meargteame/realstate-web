-- Phase 7C: Document Management System
-- Add document upload, organization, and sharing capabilities

-- Documents table
CREATE TABLE IF NOT EXISTS "Document" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "fileType" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "propertyId" TEXT,
  "leadId" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "sharedWith" TEXT[] DEFAULT '{}',
  "version" INTEGER DEFAULT 1,
  "status" TEXT DEFAULT 'active',
  "description" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL,
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL,
  FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Document versions table (for version control)
CREATE TABLE IF NOT EXISTS "DocumentVersion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "changeNote" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Document access log (track who accessed what)
CREATE TABLE IF NOT EXISTS "DocumentAccess" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Document_uploadedBy_idx" ON "Document"("uploadedBy");
CREATE INDEX IF NOT EXISTS "Document_propertyId_idx" ON "Document"("propertyId");
CREATE INDEX IF NOT EXISTS "Document_leadId_idx" ON "Document"("leadId");
CREATE INDEX IF NOT EXISTS "Document_category_status_idx" ON "Document"("category", "status");
CREATE INDEX IF NOT EXISTS "Document_createdAt_idx" ON "Document"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentAccess_documentId_idx" ON "DocumentAccess"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentAccess_userId_idx" ON "DocumentAccess"("userId");

-- Insert default document categories
INSERT INTO "Document" ("id", "name", "fileName", "fileUrl", "fileSize", "fileType", "category", "uploadedBy", "description")
SELECT 
  gen_random_uuid()::text,
  'Sample Document',
  'sample.pdf',
  'https://example.com/sample.pdf',
  0,
  'application/pdf',
  'sample',
  (SELECT "id" FROM "User" WHERE "role" = 'admin' LIMIT 1),
  'This is a sample document entry'
WHERE NOT EXISTS (SELECT 1 FROM "Document" LIMIT 1)
AND EXISTS (SELECT 1 FROM "User" WHERE "role" = 'admin' LIMIT 1);

-- Clean up sample document (optional)
DELETE FROM "Document" WHERE "category" = 'sample';
