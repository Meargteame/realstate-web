const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://meareg@localhost:5432/kw_realestate';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function makeMeAgent() {
  const email = 'hello.meareg@gmail.com'; // Your email
  
  console.log(`🔧 Converting ${email} to agent account...\n`);
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`Found user: ${user.name}`);
    
    // Create agent record
    const agent = await prisma.agent.create({
      data: {
        name: user.name,
        email: user.email,
        phone: '',
        imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        brokerage: 'Keller Williams Premier Realty',
        license: 'Licensed Associate Broker',
        languages: ['English']
      }
    });
    
    console.log(`✅ Created agent record: ${agent.id}`);
    
    // Update user to link to agent and change role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'agent',
        agentId: agent.id
      }
    });
    
    console.log(`✅ Updated user role to 'agent'`);
    console.log(`✅ Linked user to agent: ${agent.id}\n`);
    
    console.log('🎉 Done! Now:');
    console.log('   1. Logout from the dashboard');
    console.log('   2. Login again');
    console.log('   3. You will now have full agent access!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeMeAgent();
