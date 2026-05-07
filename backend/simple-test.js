console.log('Starting test...');

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://meareg@localhost:5432/kw_realestate'
});

async function test() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  console.log('Connected!');
  
  const agentId = 'b4635613-0a48-49e5-b3c1-69f0fd47e41e';
  
  console.log('Inserting agent...');
  const result = await client.query(`
    INSERT INTO agents (
      id, name, phone, email, "imageUrl", brokerage, rating, reviews, 
      license, languages, "isLuxury", bio, location, specialties, "createdAt", "updatedAt"
    ) VALUES (
      $1, 'Meareg', '(512) 555-9999', 'hello.meareg@gmail.com',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      'KW Real Estate', 5.0, 0, 'DRE# 12345678', ARRAY['English'], false,
      'Real estate professional', 'Austin', 'Residential', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name, email;
  `, [agentId]);
  
  console.log('Result:', result.rows[0]);
  
  client.release();
  await pool.end();
  console.log('Done!');
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
