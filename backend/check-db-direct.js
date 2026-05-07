const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://meareg@localhost:5432/kw_realestate'
});

async function checkDatabase() {
  try {
    // Check users
    const usersResult = await pool.query('SELECT id, email, role, "agentId" FROM users');
    console.log('\n=== USERS TABLE ===');
    console.log(usersResult.rows);

    // Check agents
    const agentsResult = await pool.query('SELECT id, name, email FROM agents');
    console.log('\n=== AGENTS TABLE ===');
    console.log(agentsResult.rows);

    // Check specific user
    const specificUser = await pool.query('SELECT * FROM users WHERE email = $1', ['hello.meareg@gmail.com']);
    console.log('\n=== SPECIFIC USER (hello.meareg@gmail.com) ===');
    console.log(specificUser.rows);

    // Check specific agent
    const specificAgent = await pool.query('SELECT * FROM agents WHERE id = $1', ['f2d2c702-3702-4717-9f44-7e5a860f81bf']);
    console.log('\n=== SPECIFIC AGENT (f2d2c702-3702-4717-9f44-7e5a860f81bf) ===');
    console.log(specificAgent.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();
