-- Phase 2: Blog/Content System & Email Templates
-- Add blog posts, tags, categories, and email templates

-- Blog Posts table
CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "content" TEXT NOT NULL,
  "excerpt" TEXT,
  "coverImage" TEXT,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "status" TEXT DEFAULT 'draft',
  "featured" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("authorId") REFERENCES "agents"("id") ON DELETE CASCADE
);

-- Blog Tags table
CREATE TABLE IF NOT EXISTS "BlogTag" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Categories table
CREATE TABLE IF NOT EXISTS "BlogCategory" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Post to Tag junction table
CREATE TABLE IF NOT EXISTS "_BlogPostToBlogTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  FOREIGN KEY ("A") REFERENCES "BlogPost"("id") ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES "BlogTag"("id") ON DELETE CASCADE
);

-- Blog Post to Category junction table
CREATE TABLE IF NOT EXISTS "_BlogCategoryToBlogPost" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  FOREIGN KEY ("A") REFERENCES "BlogCategory"("id") ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES "BlogPost"("id") ON DELETE CASCADE
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "variables" TEXT[] DEFAULT '{}',
  "type" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_authorId_idx" ON "BlogPost"("authorId");
CREATE INDEX IF NOT EXISTS "EmailTemplate_type_isActive_idx" ON "EmailTemplate"("type", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogPostToBlogTag_AB_unique" ON "_BlogPostToBlogTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogPostToBlogTag_B_index" ON "_BlogPostToBlogTag"("B");
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogCategoryToBlogPost_AB_unique" ON "_BlogCategoryToBlogPost"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogCategoryToBlogPost_B_index" ON "_BlogCategoryToBlogPost"("B");

-- Insert default blog categories
INSERT INTO "BlogCategory" ("id", "name", "slug", "description") VALUES
  (gen_random_uuid()::text, 'Buying Tips', 'buying-tips', 'Expert advice for home buyers'),
  (gen_random_uuid()::text, 'Selling Tips', 'selling-tips', 'Strategies for selling your home'),
  (gen_random_uuid()::text, 'Market Updates', 'market-updates', 'Latest real estate market trends'),
  (gen_random_uuid()::text, 'Investment', 'investment', 'Real estate investment insights'),
  (gen_random_uuid()::text, 'Home Improvement', 'home-improvement', 'Tips to increase home value')
ON CONFLICT DO NOTHING;

-- Insert default blog tags
INSERT INTO "BlogTag" ("id", "name", "slug") VALUES
  (gen_random_uuid()::text, 'First Time Buyer', 'first-time-buyer'),
  (gen_random_uuid()::text, 'Luxury Homes', 'luxury-homes'),
  (gen_random_uuid()::text, 'Market Trends', 'market-trends'),
  (gen_random_uuid()::text, 'Home Staging', 'home-staging'),
  (gen_random_uuid()::text, 'Mortgage Tips', 'mortgage-tips')
ON CONFLICT DO NOTHING;

-- Insert default email templates
INSERT INTO "EmailTemplate" ("id", "name", "subject", "content", "variables", "type") VALUES
  (
    gen_random_uuid()::text,
    'Welcome Email',
    'Welcome to {{brokerage}}!',
    '<h1>Welcome {{name}}!</h1><p>Thank you for choosing {{brokerage}}. We''re excited to help you find your dream home.</p>',
    ARRAY['name', 'brokerage'],
    'welcome'
  ),
  (
    gen_random_uuid()::text,
    'New Listing Alert',
    'New Property Match: {{address}}',
    '<h2>New Listing Alert</h2><p>Hi {{name}},</p><p>A new property matching your criteria is now available:</p><p><strong>{{address}}</strong><br>Price: {{price}}<br>Beds: {{beds}} | Baths: {{baths}}</p>',
    ARRAY['name', 'address', 'price', 'beds', 'baths'],
    'listing_alert'
  ),
  (
    gen_random_uuid()::text,
    'Follow Up',
    'Following up on {{property}}',
    '<p>Hi {{name}},</p><p>I wanted to follow up regarding the property at {{property}}. Do you have any questions or would you like to schedule a viewing?</p><p>Best regards,<br>{{agentName}}</p>',
    ARRAY['name', 'property', 'agentName'],
    'follow_up'
  )
ON CONFLICT DO NOTHING;
