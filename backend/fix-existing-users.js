const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/torra_realestate';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixExistingUsers() {
  console.log('🔧 Fixing existing users without agentId...\n');
  
  try {
    // Find all users without an agentId
    const usersWithoutAgent = await prisma.user.findMany({
      where: {
        agentId: null,
        role: 'agent' // Only fix users who should be agents
      }
    });
    
    console.log(`Found ${usersWithoutAgent.length} users without agentId\n`);
    
    for (const user of usersWithoutAgent) {
      console.log(`Processing user: ${user.email}`);
      
      // Check if an agent with this email already exists
      let agent = await prisma.agent.findFirst({
        where: { email: user.email }
      });
      
      if (!agent) {
        // Create new agent record
        agent = await prisma.agent.create({
          data: {
            name: user.name,
            email: user.email,
            phone: '',
            imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            brokerage: 'Keller Williams Premier Realty',
            license: 'Pending',
            languages: ['English']
          }
        });
        console.log(`  ✅ Created agent record: ${agent.id}`);
      } else {
        console.log(`  ℹ️  Agent record already exists: ${agent.id}`);
      }
      
      // Link user to agent
      await prisma.user.update({
        where: { id: user.id },
        data: { agentId: agent.id }
      });
      
      console.log(`  ✅ Linked user to agent\n`);
    }
    
    console.log('✅ All users fixed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Logout from the dashboard');
    console.log('   2. Login again');
    console.log('   3. Your agentId will now be loaded correctly\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingUsers();
