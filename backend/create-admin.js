const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@kw.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@kw.com');
      console.log('Password: password123');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@kw.com',
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@kw.com');
    console.log('Password: password123');
    console.log('User ID:', admin.id);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
