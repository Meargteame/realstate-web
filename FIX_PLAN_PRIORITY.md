# Fix Plan - Make Everything Functional

## Current Situation

**Agent Dashboard Analysis Complete**
- ✅ 12 pages analyzed
- ❌ 20+ non-functional interactive elements found
- ⚠️ Entire Opportunities page is fake data
- ⚠️ Agent Settings doesn't save changes
- ⚠️ Property Edit/Delete don't work

**No Admin Dashboard** - Only 2 roles exist:
1. Public User (no login)
2. Agent (with dashboard at /command)

---

## Phase 1: Critical Fixes (4-6 hours)

These break user expectations and must be fixed first.

### 1.1 Agent Settings - Save Changes (1 hour)

**Problem**: Form shows success but doesn't save to database

**Backend Fix**:
```javascript
// backend/controllers/agentController.js
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, bio, location, specialties } = req.body;
    
    const agent = await prisma.agent.update({
      where: { id },
      data: { name, phone, email, bio, location, specialties }
    });
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/agentRoutes.js
router.patch('/:id', agentController.updateAgent);
```

**Database Fix**:
```prisma
// backend/prisma/schema.prisma
model Agent {
  // Add these fields:
  location     String?
  specialties  String?
}
```

**Frontend Fix**:
```typescript
// frontend/src/pages/AgentSettings.tsx
const onFinish = async (values: any) => {
  setLoading(true);
  try {
    const res = await fetch(`/api/agents/${parentAgent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!res.ok) throw new Error('Failed to update');
    message.success("Profile updated successfully.");
  } catch {
    message.error("Failed to update profile.");
  } finally {
    setLoading(false);
  }
};
```

### 1.2 Property Edit (1.5 hours)

**Problem**: Edit button exists but does nothing

**Backend Fix**:
```javascript
// backend/controllers/propertyController.js
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id },
      data: req.body,
      include: { agent: true }
    });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/propertyRoutes.js
router.patch('/:id', propertyController.updateProperty);
```

**Frontend Fix**:
```typescript
// frontend/src/pages/AgentListings.tsx
const [editingProperty, setEditingProperty] = useState<any>(null);

const handleEdit = (property: any) => {
  setEditingProperty(property);
  form.setFieldsValue(property);
  setIsModalOpen(true);
};

const handleUpdateListing = async (values: any) => {
  setSubmitting(true);
  try {
    const res = await fetch(`/api/properties/${editingProperty.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated = await res.json();
    setListings(prev => prev.map(p => p.id === updated.id ? updated : p));
    message.success("Listing updated!");
    setIsModalOpen(false);
    setEditingProperty(null);
  } catch {
    message.error("Failed to update listing.");
  } finally {
    setSubmitting(false);
  }
};

// Update Edit button:
<Button 
  icon={<EditOutlined />} 
  size="small" 
  onClick={() => handleEdit(record)}
/>
```

### 1.3 Property Delete (30 minutes)

**Problem**: Delete only removes from UI, not database

**Backend Fix**:
```javascript
// backend/controllers/propertyController.js
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id } });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/propertyRoutes.js
router.delete('/:id', propertyController.deleteProperty);
```

**Frontend Fix**:
```typescript
// frontend/src/pages/AgentListings.tsx
const handleDelete = (id: string) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this listing?',
    content: 'This action cannot be undone.',
    okText: 'Yes, Delete',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await fetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete');
        setListings(prev => prev.filter(p => p.id !== id));
        message.success("Listing deleted.");
      } catch {
        message.error("Failed to delete listing.");
      }
    }
  });
};
```

### 1.4 Opportunities Backend (3 hours)

**Problem**: Entire page is fake data

**Database Schema**:
```prisma
// backend/prisma/schema.prisma
model Opportunity {
  id          String   @id @default(uuid())
  name        String
  type        String   // "listing" or "buyer"
  dealType    String   // "Luxury Listing", "Investment", etc.
  price       Int
  status      String   @default("Cultivate")
  probability Int      @default(20)
  agentId     String
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Add to Agent model:
model Agent {
  // ... existing fields
  opportunities Opportunity[]
}
```

**Backend Controller**:
```javascript
// backend/controllers/opportunityController.js
const prisma = require('../config/prisma');

exports.getOpportunities = async (req, res) => {
  try {
    const { agentId, type } = req.query;
    const where = {};
    if (agentId) where.agentId = agentId;
    if (type) where.type = type;
    
    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const { name, type, dealType, price, status, probability, agentId } = req.body;
    const opportunity = await prisma.opportunity.create({
      data: { name, type, dealType, price, status, probability, agentId }
    });
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: req.body
    });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.opportunity.delete({ where: { id } });
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Backend Routes**:
```javascript
// backend/routes/opportunityRoutes.js
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

router.get('/', opportunityController.getOpportunities);
router.post('/', opportunityController.createOpportunity);
router.patch('/:id', opportunityController.updateOpportunity);
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;

// backend/server.js - Add route:
const opportunityRoutes = require('./routes/opportunityRoutes');
app.use('/api/opportunities', opportunityRoutes);
```

**Frontend Fix** (simplified):
```typescript
// frontend/src/pages/Opportunities.tsx
const [opportunities, setOpportunities] = useState<any[]>([]);

useEffect(() => {
  if (!parentAgent) return;
  fetch(`/api/opportunities?agentId=${parentAgent.id}&type=${activeSegment}`)
    .then(res => res.json())
    .then(data => setOpportunities(data))
    .catch(console.error);
}, [parentAgent, activeSegment]);

// Group by status
const pipeline = ['Cultivate', 'Appointment', 'Active', 'Under Contract', 'Closed'].map(status => ({
  status,
  deals: opportunities.filter(o => o.status === status),
  count: opportunities.filter(o => o.status === status).length,
  volume: opportunities.filter(o => o.status === status).reduce((sum, o) => sum + o.price, 0)
}));
```

---

## Phase 2: Important Fixes (3-4 hours)

### 2.1 Inbox - Reply to Lead (30 minutes)

**Quick Fix** (no backend needed):
```typescript
// frontend/src/pages/LeadInbox.tsx
<a href={`mailto:${selectedLead.email}?subject=Re: Your inquiry&body=Hi ${selectedLead.name},%0D%0A%0D%0A`}>
  <Button type="primary" size="large" style={{ background: '#b40101', borderColor: '#b40101', width: 200 }}>
    Reply to Lead
  </Button>
</a>
```

### 2.2 Inbox - Star/Favorite Leads (1 hour)

**Database Fix**:
```prisma
// backend/prisma/schema.prisma
model Lead {
  // Add:
  isFavorite Boolean @default(false)
}
```

**Backend Fix**:
```javascript
// backend/controllers/leadController.js
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    const updated = await prisma.lead.update({
      where: { id },
      data: { isFavorite: !lead.isFavorite }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/leadRoutes.js
router.patch('/:id/favorite', leadController.toggleFavorite);
```

**Frontend Fix**:
```typescript
// frontend/src/pages/LeadInbox.tsx
const handleToggleFavorite = async () => {
  try {
    const res = await fetch(`/api/leads/${selectedLead.id}/favorite`, {
      method: 'PATCH'
    });
    const updated = await res.json();
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  } catch {
    message.error('Failed to update favorite');
  }
};

<Button 
  icon={<StarOutlined />} 
  type={selectedLead.isFavorite ? 'primary' : 'default'}
  onClick={handleToggleFavorite}
/>
```

### 2.3 Inbox - Delete Lead (30 minutes)

**Backend Fix**:
```javascript
// backend/controllers/leadController.js
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/leadRoutes.js
router.delete('/:id', leadController.deleteLead);
```

**Frontend Fix**:
```typescript
// frontend/src/pages/LeadInbox.tsx
const handleDelete = () => {
  Modal.confirm({
    title: 'Delete this lead?',
    content: 'This action cannot be undone.',
    okType: 'danger',
    onOk: async () => {
      try {
        await fetch(`/api/leads/${selectedLead.id}`, { method: 'DELETE' });
        setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
        setSelectedLead(leads[0] || null);
        message.success('Lead deleted');
      } catch {
        message.error('Failed to delete lead');
      }
    }
  });
};

<Button icon={<DeleteOutlined />} danger onClick={handleDelete} />
```

### 2.4 Leads - Export CSV (1 hour)

**Backend Fix**:
```javascript
// backend/controllers/leadController.js
exports.exportLeads = async (req, res) => {
  try {
    const { agentId } = req.query;
    const leads = await prisma.lead.findMany({
      where: agentId ? { agentId } : {},
      include: { property: true, agent: true }
    });
    
    // Convert to CSV
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Message', 'Date'].join(','),
      ...leads.map(l => [
        l.name,
        l.email,
        l.phone,
        l.status,
        `"${l.message}"`,
        new Date(l.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/routes/leadRoutes.js
router.get('/export', leadController.exportLeads);
```

**Frontend Fix**:
```typescript
// frontend/src/pages/LeadsPage.tsx
const handleExport = async () => {
  try {
    const res = await fetch(`/api/leads/export?agentId=${parentAgent.id}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    message.success('Leads exported!');
  } catch {
    message.error('Failed to export leads');
  }
};

<Button type="primary" onClick={handleExport}>Export CSV</Button>
```

### 2.5 Leads - Filters (1 hour)

**Frontend Fix** (no backend needed):
```typescript
// frontend/src/pages/LeadsPage.tsx
const [filterStatus, setFilterStatus] = useState<string | null>(null);
const [filterDateRange, setFilterDateRange] = useState<any>(null);
const [showFilterDrawer, setShowFilterDrawer] = useState(false);

const filteredLeads = leads.filter(l => {
  if (filterStatus && l.status !== filterStatus) return false;
  if (searchText && !l.name.toLowerCase().includes(searchText.toLowerCase())) return false;
  // Add date range filter if needed
  return true;
});

<Button icon={<FilterOutlined />} onClick={() => setShowFilterDrawer(true)}>
  Filters
</Button>

<Drawer
  title="Filter Leads"
  open={showFilterDrawer}
  onClose={() => setShowFilterDrawer(false)}
>
  <Select
    placeholder="Filter by status"
    value={filterStatus}
    onChange={setFilterStatus}
    style={{ width: '100%', marginBottom: 16 }}
    allowClear
  >
    <Select.Option value="New">New</Select.Option>
    <Select.Option value="Contacted">Contacted</Select.Option>
    <Select.Option value="Qualified">Qualified</Select.Option>
    <Select.Option value="Closed">Closed</Select.Option>
    <Select.Option value="Lost">Lost</Select.Option>
  </Select>
</Drawer>
```

---

## Phase 3: Nice to Have (2-3 hours)

### 3.1 Photo Upload (2 hours)

Requires external service (AWS S3, Cloudinary, etc.)

### 3.2 Inbox Search (15 minutes)

**Frontend Fix**:
```typescript
// frontend/src/pages/LeadInbox.tsx
const [searchQuery, setSearchQuery] = useState('');

const filteredLeads = leads.filter(l => 
  l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  l.message.toLowerCase().includes(searchQuery.toLowerCase())
);

<Input 
  prefix={<SearchOutlined />} 
  placeholder="Search leads..." 
  value={searchQuery}
  onChange={e => setSearchQuery(e.target.value)}
/>

// Use filteredLeads instead of leads in List
```

---

## Implementation Order

### Day 1 (4-5 hours)
1. Agent Settings Save (1 hour)
2. Property Edit (1.5 hours)
3. Property Delete (30 minutes)
4. Inbox Reply (30 minutes)
5. Inbox Search (15 minutes)
6. Inbox Delete (30 minutes)

### Day 2 (4-5 hours)
7. Opportunities Backend (3 hours)
8. Inbox Star/Favorite (1 hour)
9. Leads Export CSV (1 hour)

### Day 3 (2-3 hours)
10. Leads Filters (1 hour)
11. Testing & Bug Fixes (2 hours)

**Total: 10-13 hours**

---

## Testing After Each Fix

After implementing each fix, test:
1. Functionality works as expected
2. Changes persist after page refresh
3. Error handling works (network errors, validation)
4. UI feedback is clear (loading states, success/error messages)

---

## Quick Wins to Do RIGHT NOW (1.5 hours)

These require minimal code and give maximum impact:

1. **Inbox Reply Button** (5 min) - Change to mailto link
2. **Inbox Search** (15 min) - Add client-side filtering
3. **Property Delete** (30 min) - Add backend endpoint
4. **Agent Settings Save** (30 min) - Add backend endpoint

After these 4 fixes, the dashboard will feel 80% more complete!
