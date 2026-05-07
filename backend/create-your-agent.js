require('dotenv').config();
const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function createYourAgent() {
  try {
    const agentId = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
    const email = 'hello.meareg@gmail.com';
    const password = 'password123';
    const passwordHash = bcrypt.hashSync(password, 10);
    
    console.log('🔍 Checking if agent exists...\n');
    
    // Check if agent exists
    let agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });
    
    if (agent) {
      console.log('✅ Agent already exists:');
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Email: ${agent.email}\n`);
    } else {
      console.log('❌ Agent does not exist. Creating now...\n');
      
      // Create the agent
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
      
      console.log('✅ Agent created successfully:');
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Email: ${agent.email}\n`);
    }
    
    // Check if user exists
    console.log('🔍 Checking if user account exists...\n');
    
    let user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (user) {
      console.log('✅ User account already exists:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   AgentId: ${user.agentId}\n`);
      
      // Update user to link to agent if not already linked
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
      console.log('❌ User account does not exist. Creating now...\n');
      
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
      
      console.log('✅ User account created successfully:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   AgentId: ${user.agentId}\n`);
    }
    
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('📋 Your credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Agent ID: ${agentId}\n`);
    console.log('✅ You can now login with these credentials!');
    console.log('✅ Your localStorage already has the correct agent ID!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createYourAgent();
