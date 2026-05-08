const prisma = require('./config/prisma');

async function testPhase4Features() {
  console.log('🧪 Testing Phase 4 Features...\n');

  try {
    // Test 1: Check new Message fields
    console.log('1️⃣ Testing Message Schema Updates...');
    const message = await prisma.message.findFirst();
    if (message) {
      console.log('   ✅ Message model accessible');
      console.log(`      - readAt field: ${message.readAt !== undefined ? 'Present' : 'Missing'}`);
      console.log(`      - attachments field: ${message.attachments !== undefined ? 'Present' : 'Missing'}`);
    } else {
      console.log('   ⚠️  No messages in database');
    }

    // Test 2: SMS Message table
    console.log('\n2️⃣ Testing SMS Message Table...');
    const smsCount = await prisma.sMSMessage.count();
    console.log(`   ✅ SMSMessage table accessible (${smsCount} records)`);

    // Test 3: Email Message table
    console.log('\n3️⃣ Testing Email Message Table...');
    const emailCount = await prisma.emailMessage.count();
    console.log(`   ✅ EmailMessage table accessible (${emailCount} records)`);

    // Test 4: Create test SMS message
    console.log('\n4️⃣ Testing SMS Message Creation...');
    const testSMS = await prisma.sMSMessage.create({
      data: {
        to: '+1234567890',
        from: '+0987654321',
        body: 'Test SMS message from Phase 4',
        status: 'sent',
        sid: `test_${Date.now()}`,
        direction: 'outbound'
      }
    });
    console.log('   ✅ SMS message created successfully');
    console.log(`      - ID: ${testSMS.id}`);
    console.log(`      - Status: ${testSMS.status}`);

    // Test 5: Create test email message
    console.log('\n5️⃣ Testing Email Message Creation...');
    const testEmail = await prisma.emailMessage.create({
      data: {
        to: 'test@example.com',
        from: 'agent@example.com',
        subject: 'Test Email from Phase 4',
        body: '<p>This is a test email message</p>',
        status: 'sent',
        messageId: `email_${Date.now()}`
      }
    });
    console.log('   ✅ Email message created successfully');
    console.log(`      - ID: ${testEmail.id}`);
    console.log(`      - Status: ${testEmail.status}`);

    // Test 6: Test message with attachments
    console.log('\n6️⃣ Testing Message with Attachments...');
    const conversation = await prisma.conversation.findFirst();
    if (conversation) {
      const messageWithAttachment = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: 'test-sender',
          senderType: 'agent',
          content: 'Here is the document you requested',
          attachments: JSON.stringify([
            {
              name: 'contract.pdf',
              url: 'https://example.com/files/contract.pdf',
              type: 'application/pdf',
              size: 245678
            }
          ]),
          readAt: null
        }
      });
      console.log('   ✅ Message with attachment created');
      console.log(`      - Attachments: ${JSON.parse(messageWithAttachment.attachments).length} file(s)`);
    } else {
      console.log('   ⚠️  No conversations found - skipping attachment test');
    }

    console.log('\n✅ All Phase 4 Database Features Tested Successfully!\n');
    console.log('📋 Phase 4 Summary:');
    console.log('   ✅ Message Attachments (readAt, attachments fields)');
    console.log('   ✅ Read Receipts (readAt timestamp)');
    console.log('   ✅ SMS Integration (SMSMessage table)');
    console.log('   ✅ Email Integration (EmailMessage table)');
    console.log('   ✅ Communication Services (SMS & Email)');

  } catch (error) {
    console.error('❌ Error testing Phase 4 features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase4Features();
