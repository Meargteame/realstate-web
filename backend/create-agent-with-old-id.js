require('dotenv').config();
const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function createAgentWithOldId() {
  try {
    // Use the OLD agent ID that's already in localStorage
    const agentId = 'b4635613-0a48-49e5-b3c1-69f0fd47e41e';
    const email = 'hello.meareg@gmail.com';
    const password = 'password123';
    const passwordHash = bcrypt.hashSync(password, 10);
    
    console.log('🔧 Creating agent with the ID already in your localStorage...\n');
    
    // Check if agent exists
    let agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });
    
    if (agent) {
      console.log('✅ Agent already exists with this ID!');
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Email: ${agent.email}\n`);
    } else {
      console.log('Creating agent...\n');
      
      // Create the agent with the OLD ID
      agent = await prisma.agent.create({
        data: {
          id: agentId,
          name: 'Meareg',
          phone: '(512) 555-9999',
          email: email,
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          brokerage: 'KW Real Estate',
          rating: 5.0,
          reviews: 0,
          license: 'DRE# 12345678',
          languages: ['English'],
          isLuxury: false,
          bio: 'Real estate professional helping clients find their dream homes.',
          location: 'Austin',
          specialties: 'Residential, Commercial, Investment Properties'
        }
      });
      
      console.log('✅ Agent created successfully!');
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Email: ${agent.email}\n`);
    }
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (user) {
      console.log('✅ User account exists');
      
      // Update user to link to this agent
      if (user.agentId !== agentId) {
        user = await prisma.user.update({
          where: { email: email },
          data: { 
            agentId: agentId,
            role: 'agent'
          }
        });
        console.log('✅ Updated user account to link with agent\n');
      }
    } else {
      console.log('Creating user account...\n');
      
      // Create the user
      user = await prisma.user.create({
        data: {
          id: `u-${agentId}`,
          name: 'Meareg',
          email: email,
          password: passwordHash,
          role: 'agent',
          agentId: agentId
        }
      });
      
      console.log('✅ User account created successfully!\n');
    }
    
    console.log('🎉 DONE!\n');
    console.log('Your credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Agent ID: ${agentId}\n`);
    console.log('✅ This matches the ID in your localStorage!');
    console.log('✅ Just refresh your browser - NO need to clear localStorage!');
    console.log('✅ The 404 errors should be GONE!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAgentWithOldId();
