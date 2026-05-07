const prisma = require('./config/prisma');

async function checkUser() {
  try {
    console.log('Checking user: hello.meareg@gmail.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  AgentId:', user.agentId);
    } else {
      console.log('❌ User NOT found');
    }
    
    console.log('\n--- All Users ---');
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`  - ${u.email} (role: ${u.role}, agentId: ${u.agentId})`));
    
    console.log('\n--- All Agents ---');
    const agents = await prisma.agent.findMany();
    console.log('Total agents:', agents.length);
    agents.forEach(a => console.log(`  - ${a.name} (${a.email}) id:${a.id}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
