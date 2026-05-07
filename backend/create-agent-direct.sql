-- Create the agent if it doesn't exist
INSERT INTO agents (id, name, email, phone, "imageUrl", brokerage, license, languages, "createdAt", "updatedAt")
VALUES (
  'f2d2c702-3702-4717-9f44-7e5a860f81bf',
  'Meareg Agent',
  'hello.meareg@gmail.com',
  '+1234567890',
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  'Keller Williams Premier Realty',
  'KW-2024-001',
  ARRAY['English'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Update user to link to this agent
UPDATE users 
SET "agentId" = 'f2d2c702-3702-4717-9f44-7e5a860f81bf', 
    role = 'agent'
WHERE email = 'hello.meareg@gmail.com';

-- Show results
SELECT 'AGENT:' as type, id, name, email FROM agents WHERE id = 'f2d2c702-3702-4717-9f44-7e5a860f81bf'
UNION ALL
SELECT 'USER:' as type, id::text, name, email FROM users WHERE email = 'hello.meareg@gmail.com';
