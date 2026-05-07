const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://meareg@localhost:5432/kw_realestate'
});

async function fixAgent() {
  const client = await pool.connect();
  
  try {
    const agentId = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
    const email = 'hello.meareg@gmail.com';
    const password = 'password123';
    const passwordHash = bcrypt.hashSync(password, 10);
    
    console.log('🔧 Fixing agent in database...\n');
    
    // Insert or update agent
    const agentResult = await client.query(`
      INSERT INTO agents (
        id, name, phone, email, "imageUrl", brokerage, rating, reviews, 
        license, languages, "isLuxury", bio, location, specialties, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        "updatedAt" = NOW()
      RETURNING id, name, email;
    `, [
      agentId,
      'Meareg',
      '(512) 555-9999',
      email,
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      'KW Real Estate',
      5.0,
      0,
      'DRE# 12345678',
      ['English'],
      false,
      'Real estate professional helping clients find their dream homes.',
      'Austin',
      'Residential, Commercial, Investment Properties'
    ]);
    
    console.log('✅ Agent created/updated:');
    console.log(`   ID: ${agentResult.rows[0].id}`);
    console.log(`   Name: ${agentResult.rows[0].name}`);
    console.log(`   Email: ${agentResult.rows[0].email}\n`);
    
    // Insert or update user
    const userResult = await client.query(`
      INSERT INTO users (
        id, name, email, password, role, "agentId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        "agentId" = EXCLUDED."agentId",
        role = 'agent',
        password = EXCLUDED.password,
        "updatedAt" = NOW()
      RETURNING id, email, role, "agentId";
    `, [
      `u-${agentId}`,
      'Meareg',
      email,
      passwordHash,
      'agent',
      agentId
    ]);
    
    console.log('✅ User account created/updated:');
    console.log(`   ID: ${userResult.rows[0].id}`);
    console.log(`   Email: ${userResult.rows[0].email}`);
    console.log(`   Role: ${userResult.rows[0].role}`);
    console.log(`   AgentId: ${userResult.rows[0].agentId}\n`);
    
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('📋 Your credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Agent ID: ${agentId}\n`);
    console.log('✅ Now refresh your browser at http://localhost:3001');
    console.log('✅ The 404 errors should be gone!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAgent();
