-- Insert your agent
INSERT INTO agents (
  id, 
  name, 
  phone, 
  email, 
  "imageUrl", 
  brokerage, 
  rating, 
  reviews, 
  license, 
  languages, 
  "isLuxury", 
  bio, 
  location, 
  specialties,
  "createdAt",
  "updatedAt"
) VALUES (
  'f2d2c702-3702-4717-9f44-7e5a860f81bf',
  'Meareg',
  '(512) 555-9999',
  'hello.meareg@gmail.com',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'KW Real Estate',
  5.0,
  0,
  'DRE# 12345678',
  ARRAY['English'],
  false,
  'Real estate professional helping clients find their dream homes.',
  'Austin',
  'Residential, Commercial, Investment Properties',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "updatedAt" = NOW();

-- Insert or update user account
INSERT INTO users (
  id,
  name,
  email,
  password,
  role,
  "agentId",
  "createdAt",
  "updatedAt"
) VALUES (
  'u-f2d2c702-3702-4717-9f44-7e5a860f81bf',
  'Meareg',
  'hello.meareg@gmail.com',
  '$2a$10$YourHashedPasswordHere',
  'agent',
  'f2d2c702-3702-4717-9f44-7e5a860f81bf',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "agentId" = EXCLUDED."agentId",
  role = 'agent',
  "updatedAt" = NOW();

-- Verify the agent was created
SELECT id, name, email FROM agents WHERE id = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
