# Leads Page - Core Functionality Explained

## What is the Leads Page?

The Leads page (`http://localhost:3001/command/leads`) is your **Contact Pipeline Management System**. It's where you manage all inquiries from potential buyers who contacted you through property listings.

## Core Functionality:

### 1. **Lead Display & Management**
- Shows all leads/inquiries sent to you as an agent
- Displays contact information (name, email, phone)
- Shows which property they're interested in (with clickable link)
- Shows when the inquiry was received

### 2. **Pipeline Status Tracking**
Each lead has a status that you can update by clicking the dropdown:
- **New** (Red) - Fresh inquiry, not yet contacted
- **Contacted** (Blue) - You've reached out to them
- **Qualified** (Orange) - They're a serious buyer
- **Closed** (Green) - Deal completed successfully
- **Lost** (Gray) - They went with another agent or lost interest

This helps you track where each potential client is in your sales process.

### 3. **Quick Actions**
- **Call Button** - Opens your phone dialer with their number
- **Message Button** - Opens your email client to send them an email
- **Export CSV** - Download all leads as a spreadsheet for external CRM or backup

### 4. **Search & Filter**
- Search leads by name
- Filter by status (New, Contacted, etc.)
- Sort by name or date received

## How Leads Are Created:

Leads are automatically created when:
1. A public user visits a property detail page (e.g., `http://localhost:3001/properties/[property-id]`)
2. They fill out the "Inquire About Residence" contact form
3. They submit the form
4. The system creates a lead record linked to:
   - The agent (you)
   - The property they're interested in
   - Their contact information

## Real-World Workflow Example:

1. **Monday Morning**: You check the Leads page and see 3 new inquiries (Status: "New")
2. **You call them**: After calling, you change their status to "Contacted"
3. **They're interested**: If they want to schedule a showing, change to "Qualified"
4. **They buy the house**: Change status to "Closed"
5. **They ghost you**: Change status to "Lost"

## Why This Matters:

This is your **lead generation and tracking system**. In real estate, converting leads to clients is critical. This page helps you:
- Never lose track of a potential buyer
- See your pipeline at a glance
- Follow up with interested buyers
- Track your conversion rate (New → Closed)

## Current Status:

✅ **Fully Functional** - All features work with real database data:
- Lead creation from public property pages
- Status updates
- Search and filtering
- Export to CSV
- Contact information display
- Property linking

## Test It:

Follow the steps in `TESTING_NEXT_STEPS.md` to:
1. Create a test property
2. Submit a contact form as a public user (incognito browser)
3. See the lead appear on this page
4. Update its status
5. Test the call/message buttons
