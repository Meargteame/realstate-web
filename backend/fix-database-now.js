const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function fixDatabase() {
  console.log('🔧 Starting database fix...\n');

  try {
    // Step 1: Create agent if doesn't exist
    console.log('Step 1: Checking/creating agent...');
    const existingAgent = await prisma.agent.findUnique({
      where: { id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf' }
    });

    if (!existingAgent) {
      console.log('Creating agent...');
      await prisma.agent.create({
        data: {
          id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
          name: 'Meareg Agent',
          email: 'hello.meareg@gmail.com',
          phone: '+1234567890',
          imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
          brokerage: 'Keller Williams Premier Realty',
          license: 'KW-2024-001',
          languages: ['English']
        }
      });
      console.log('✅ Agent created');
    } else {
      console.log('✅ Agent already exists');
    }

    // Step 2: Check/create user
    console.log('\nStep 2: Checking/creating user...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });

    if (!existingUser) {
      console.log('Creating user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          name: 'Meareg Agent',
          email: 'hello.meareg@gmail.com',
          password: hashedPassword,
          role: 'agent',
          agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf'
        }
      });
      console.log('✅ User created');
    } else if (existingUser.agentId !== 'f2d2c702-3702-4717-9f44-7e5a860f81bf') {
      console.log('Updating user agentId...');
      await prisma.user.update({
        where: { email: 'hello.meareg@gmail.com' },
        data: { 
          agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
          role: 'agent'
        }
      });
      console.log('✅ User updated');
    } else {
      console.log('✅ User already correct');
    }

    // Step 3: Verify
    console.log('\nStep 3: Verification...');
    const finalUser = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    const finalAgent = await prisma.agent.findUnique({
      where: { id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf' }
    });

    console.log('\n=== FINAL STATE ===');
    console.log('User:', {
      email: finalUser.email,
      role: finalUser.role,
      agentId: finalUser.agentId
    });
    console.log('Agent:', {
      id: finalAgent.id,
      name: finalAgent.name,
      email: finalAgent.email
    });

    console.log('\n✅ DATABASE FIX COMPLETE!');
    console.log('\nYou can now login with:');
    console.log('  Email: hello.meareg@gmail.com');
    console.log('  Password: password123');

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixDatabase();
