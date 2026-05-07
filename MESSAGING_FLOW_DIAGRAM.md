# Messaging System Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUYER/SELLER FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. Browse Properties
   ↓
   [Property Card] → Click → [Property Details Page]
   
2. First Time Contact
   ↓
   Click "Message Agent" Button (Purple Gradient)
   ↓
   [Contact Form Modal Opens]
   - Enter Name *
   - Enter Email *
   - Enter Phone (optional)
   ↓
   Click "Start Chat with [Agent Name]"
   ↓
   System Actions:
   ├─ Create Lead in database
   ├─ Create Conversation in database
   ├─ Send first message
   └─ Store conversation ID in browser localStorage
   ↓
   [Chat Interface Appears]
   - See your first message
   - Type and send more messages
   - Messages auto-refresh every 5 seconds
   
3. Closing and Reopening Chat
   ↓
   Close Modal → Return to Property Page
   ↓
   Button Changes:
   - Text: "Message Agent" → "Continue Chat"
   - Color: Purple → Green
   - Shows conversation exists
   
4. Receiving Agent Response
   ↓
   Agent responds in their Inbox
   ↓
   System checks for new messages every 10 seconds
   ↓
   [Red Badge Appears on Button]
   - Shows number of unread messages
   - Example: "Continue Chat" with red "2" badge
   ↓
   Click "Continue Chat"
   ↓
   [Chat Modal Opens]
   - All previous messages loaded
   - New agent messages visible
   - Badge disappears when modal closes
   
5. Ongoing Conversation
   ↓
   Can return anytime to same property page
   ↓
   Conversation persists in browser
   ↓
   Continue chatting with agent


┌─────────────────────────────────────────────────────────────────────┐
│                           AGENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

1. Receive Lead
   ↓
   Buyer starts conversation
   ↓
   Lead appears in Agent Dashboard
   
2. Access Inbox
   ↓
   Navigate to /command/inbox
   ↓
   [Conversation List]
   - See all conversations
   - Unread count badges (red)
   - Sorted by most recent
   
3. View Conversation
   ↓
   Click on conversation
   ↓
   [Chat Interface]
   - See buyer contact info
   - See property details
   - View message history
   - Conversation marked as read
   
4. Respond to Buyer
   ↓
   Type message and click Send
   ↓
   Message saved to database
   ↓
   Buyer will see response when they check back


┌─────────────────────────────────────────────────────────────────────┐
│                      TECHNICAL DATA FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

Browser (Buyer)                 Backend API              Database
─────────────────              ─────────────            ──────────

[Property Page]
      │
      │ Click "Message Agent"
      ↓
[Contact Form]
      │
      │ Submit form
      ├──────────────────→ POST /api/leads ────────→ [Lead Table]
      │                                                    │
      │                                                    ↓
      ├──────────────────→ POST /api/messages/send ──→ [Conversation]
      │                         (with leadId)              │
      │                                                    ↓
      │                                                [Message Table]
      │                                                    │
      ←──────────────────── Response ←───────────────────┘
      │                    (conversationId)
      ↓
[localStorage]
  - conversation_{propertyId}_{agentId}
  - conversationId
  - userInfo
      │
      │ Every 10 seconds
      ├──────────────────→ GET /api/messages/
      │                        conversation/{id} ──→ [Message Table]
      │                                                    │
      ←──────────────────── Messages ←───────────────────┘
      │
      ↓
[Update Badge]
  - Count unread messages
  - Show red badge


┌─────────────────────────────────────────────────────────────────────┐
│                         KEY FEATURES                                 │
└─────────────────────────────────────────────────────────────────────┘

✅ No Login Required
   - Buyers don't need accounts
   - Just enter name, email, phone

✅ Persistent Conversations
   - Stored in browser localStorage
   - Survives page refreshes
   - Can return anytime

✅ Real-time Feel
   - Auto-polling every 5-10 seconds
   - Messages appear automatically
   - No manual refresh needed

✅ Visual Indicators
   - Button changes color when chat exists
   - Red badge shows unread count
   - Clear visual feedback

✅ Mobile Friendly
   - Responsive design
   - Works on all devices
   - Touch-friendly interface

✅ Privacy Focused
   - Data stored locally
   - Only shared with listing agent
   - Clear privacy message


┌─────────────────────────────────────────────────────────────────────┐
│                    STORAGE STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────┘

localStorage Keys:
──────────────────

1. conversation_{propertyId}_{agentId}
   {
     "conversationId": "uuid-here",
     "userInfo": {
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "555-1234"
     },
     "propertyId": "property-uuid",
     "agentId": "agent-uuid"
   }

2. lastRead_{conversationId}
   "2024-01-15T10:30:00.000Z"


Database Tables:
────────────────

Lead
├─ id (UUID)
├─ name
├─ email
├─ phone
├─ message
├─ agentId → Agent
└─ propertyId → Property

Conversation
├─ id (UUID)
├─ leadId → Lead (unique)
├─ agentId
├─ lastMessage
├─ lastMessageAt
└─ unreadCount

Message
├─ id (UUID)
├─ conversationId → Conversation
├─ senderId (email or agent ID)
├─ senderType ('agent' | 'lead')
├─ content
├─ isRead
└─ createdAt
