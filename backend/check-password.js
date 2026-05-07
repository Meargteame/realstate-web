const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    
    if (user) {
      console.log('User found');
      console.log('Password hash:', user.password);
      console.log('Password length:', user.password ? user.password.length : 'null');
      
      // Test with password123
      const testPassword = 'password123';
      const valid = await bcrypt.compare(testPassword, user.password);
      console.log('password123 matches:', valid);
      
      // Test with password1234
      const testPassword2 = 'password1234';
      const valid2 = await bcrypt.compare(testPassword2, user.password);
      console.log('password1234 matches:', valid2);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
