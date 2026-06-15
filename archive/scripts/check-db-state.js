const prisma = require('./backend/config/prisma');

async function checkDatabase() {
  try {
    console.log('\n=== CHECKING DATABASE STATE ===\n');

    // Check all users
    const users = await prisma.user.findMany();
    console.log('USERS TABLE (' + users.length + ' records):');
    users.forEach(u => {
      console.log(`  - ${u.email} | role: ${u.role} | agentId: ${u.agentId}`);
    });

    // Check all agents
    const agents = await prisma.agent.findMany();
    console.log('\nAGENTS TABLE (' + agents.length + ' records):');
    agents.forEach(a => {
      console.log(`  - ${a.id} | ${a.name} | ${a.email}`);
    });

    // Check specific user
    const specificUser = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    console.log('\nSPECIFIC USER (hello.meareg@gmail.com):');
    console.log(specificUser);

    // Check specific agent
    const specificAgent = await prisma.agent.findUnique({
      where: { id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf' }
    });
    console.log('\nSPECIFIC AGENT (f2d2c702-3702-4717-9f44-7e5a860f81bf):');
    console.log(specificAgent);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();
