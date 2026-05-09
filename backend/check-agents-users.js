const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking Users vs Agents...\n');

    // Check Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agentId: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: 5
    });

    console.log('📊 USERS (first 5):');
    users.forEach(u => {
      console.log(`  - ${u.name} (${u.email})`);
      console.log(`    Role: ${u.role}, AgentId: ${u.agentId || 'null'}`);
      if (u.agent) {
        console.log(`    ✅ Has Agent Profile: ${u.agent.name}`);
      }
    });

    // Check Agents
    console.log('\n📊 AGENTS (first 5):');
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: 5
    });

    if (agents.length === 0) {
      console.log('  ❌ NO AGENTS FOUND IN DATABASE!');
      console.log('  This is why the Agents Management page is empty.');
    } else {
      agents.forEach(a => {
        console.log(`  - ${a.name} (${a.email})`);
        console.log(`    Phone: ${a.phone}`);
        if (a.user) {
          console.log(`    ✅ Linked to User: ${a.user.email}`);
        } else {
          console.log(`    ⚠️  No linked User account`);
        }
      });
    }

    console.log('\n📈 SUMMARY:');
    const userCount = await prisma.user.count();
    const agentCount = await prisma.agent.count();
    const usersWithAgentRole = await prisma.user.count({ where: { role: 'agent' } });
    const usersWithAgentProfile = await prisma.user.count({ where: { agentId: { not: null } } });

    console.log(`  Total Users: ${userCount}`);
    console.log(`  Total Agents: ${agentCount}`);
    console.log(`  Users with role='agent': ${usersWithAgentRole}`);
    console.log(`  Users with agentId (linked to Agent): ${usersWithAgentProfile}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
