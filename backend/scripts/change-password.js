const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function changePassword() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.log('\n❌ Usage: node scripts/change-password.js <email> <new_password>');
    console.log('Example: node scripts/change-password.js admin@torra.com myNewSecurePassword123!\n');
    process.exit(1);
  }

  try {
    console.log(`🔍 Searching for user with email: ${email}...`);
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters long.');
      process.exit(1);
    }

    console.log('🔒 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('💾 Updating database...');
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ Success! Password for ${user.email} (${user.name}) has been updated.\n`);
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

changePassword();
