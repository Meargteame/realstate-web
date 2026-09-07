import React, { useState, useEffect, useMemo } from "react";
import { Table, Typography, Tag, Input, Button, Space, Breadcrumb, Avatar, Select, message, Drawer, Empty } from "antd";
import { SearchOutlined, MailOutlined, PhoneOutlined, FilterOutlined, StarFilled, MessageOutlined } from "@ant-design/icons";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;

export default function LeadsPage() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/leads?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        setLeads(Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : []));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        message.error('Could not load leads. Please refresh to try again.');
      });
  }, [parentAgent]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    // Optimistic: apply immediately, remember previous so we can revert on failure.
    const previous = leads.find(l => l.id === leadId)?.status;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Request failed');
      message.success(`Lead moved to ${status}`);
    } catch {
      // Revert
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: previous } : l));
      message.error('Failed to update lead status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/leads/export?agentId=${parentAgent.id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('Leads exported successfully!');
    } catch {
      message.error('Failed to export leads');
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (searchText && !l.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const STATUS_COLORS: Record<string, string> = {
    New: 'error', Contacted: 'processing', Qualified: 'warning', Closed: 'success', Lost: 'default'
  };

  // Lead scoring based on status and recency.
  const computeLeadScore = (lead: any) => {
    let score = 0;
    if (lead.status === 'Qualified') score += 40;
    else if (lead.status === 'Contacted') score += 25;
    else if (lead.status === 'New') score += 15;
    else if (lead.status === 'Closed') score += 50;
    if (lead.property) score += 20;
    if (lead.phone) score += 10;
    const daysSince = Math.floor((Date.now() - new Date(lead.date || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 3) score += 20;
    else if (daysSince <= 7) score += 10;
    return Math.min(100, score);
  };

  // Precompute scores once per leads change instead of on every render/row/sort.
  const leadScores = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach(l => m.set(l.id, computeLeadScore(l)));
    return m;
  }, [leads]);
  const getLeadScore = (lead: any) => leadScores.get(lead.id) ?? computeLeadScore(lead);

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const quickResponses: Record<string, string> = {
    'welcome': 'Hi {name}! Thank you for your interest. I\'d love to help you find your perfect property. When would be a good time to chat?',
    'showing': 'Hi {name}! I\'d like to schedule a showing for the property you\'re interested in. Are you available this week?',
    'followup': 'Hi {name}! Just following up on your recent inquiry. Have you had a chance to review the listings I sent?',
    'preapproval': 'Hi {name}! Getting pre-approved will help us move quickly when we find the right property. I can connect you with a trusted lender.',
  };

  const columns = [
    {
      title: 'SCORE', key: 'score', width: 80,
      sorter: (a: any, b: any) => getLeadScore(a) - getLeadScore(b),
      render: (record: any) => {
        const score = getLeadScore(record);
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: '50%', 
              background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #e5e7eb 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900, color: getScoreColor(score)
              }}>{score}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'NAME', dataIndex: 'name', key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: '#111827' }}>{text[0]}</Avatar>
          <div>
            <div style={{ fontWeight: 'bold', color: '#111827' }}>{text}</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>ID: {record.id.substring(0, 8)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'STATUS', dataIndex: 'status', key: 'status',
      render: (status: string, record: any) => (
        <AntSelect
          value={status}
          size="small"
          style={{ width: 130 }}
          onChange={(val: string) => updateLeadStatus(record.id, val)}
        >
          {Object.keys(STATUS_COLORS).map(s => (
            <AntOption key={s} value={s}>
              <Tag color={STATUS_COLORS[s]} style={{ margin: 0, fontWeight: 'bold' }}>{s.toUpperCase()}</Tag>
            </AntOption>
          ))}
        </AntSelect>
      ),
    },
    {
      title: 'PROPERTY INTEREST', key: 'property',
      render: (record: any) => record.property ? (
        <Link to={`/properties/${record.property.id}`} style={{ color: '#b40101', fontWeight: 'bold' }}>
          {record.property.address}
        </Link>
      ) : <Text type="secondary">General Inquiry</Text>,
    },
    {
      title: 'CONTACT INFO', key: 'contact',
      render: (record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
            <Text style={{ fontSize: '13px' }}>{record.email}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
            <Text style={{ fontSize: '13px' }}>{record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'RECEIVED', dataIndex: 'date', key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'ACTION', key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <a href={`tel:${record.phone}`}><Button type="default" size="small" icon={<PhoneOutlined />}>Call</Button></a>
          <Button 
            type="primary" 
            size="small" 
            style={{ background: '#b40101' }} 
            icon={<MailOutlined />}
            onClick={() => navigate('/command/inbox', { state: { leadId: record.id } })}
          >
            Message
          </Button>
        </Space>
      ),
    },
  ];

  // Expandable row with notes and quick responses
  const expandedRowRender = (record: any) => (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Quick Response Templates</Title>
        <Space wrap>
          {Object.entries(quickResponses).map(([key, template]) => (
            <Button
              key={key}
              size="small"
              icon={<MessageOutlined />}
              onClick={() => {
                const msg = template.replace('{name}', record.name.split(' ')[0]);
                navigator.clipboard.writeText(msg);
                message.success('Response copied to clipboard!');
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </Space>
      </div>
      {record.message && (
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Original Inquiry</Title>
          <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
            {record.message}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '12px' : '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <Breadcrumb items={[{ title: <Link to="/command">Dashboard</Link> }, { title: 'Contacts / Leads' }]} />
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-end', marginTop: '16px', gap: '12px' }}>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 500, color: '#111827' }}>
              Contact Pipeline
            </Title>
            {!isMobile && <Text type="secondary">Manage and track your real estate inquiries. Click status to update pipeline stage.</Text>}
          </div>
          <Space wrap style={{ justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <Input
              placeholder="Search leads..."
              prefix={<SearchOutlined />}
              style={{ width: isMobile ? '100%' : 300, borderRadius: '8px', transition: 'all 0.2s ease' }}
              onChange={e => setSearchText(e.target.value)}
            />
            <Button icon={<FilterOutlined />} onClick={() => setShowFilterDrawer(true)}>Filters</Button>
            <Button type="primary" onClick={handleExport} style={{ background: '#b40101', borderColor: '#b40101' }}>Export CSV</Button>
          </Space>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={filteredLeads}
          loading={loading}
          rowKey="id"
          onRow={() => ({
            style: { transition: 'background 0.2s ease', cursor: 'pointer' },
            onMouseEnter: (e) => { e.currentTarget.style.background = '#fef2f2'; },
            onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; }
          })}
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button 
                type="text" size="small" 
                onClick={(e) => onExpand(record, e)}
                style={{ color: '#b40101' }}
              >
                {expanded ? '−' : '+'}
              </Button>
            ),
          }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} leads` }}
          locale={{ emptyText: <div style={{padding:'40px 0'}}><Empty description={<div><Text strong style={{fontSize:15}}>No leads yet</Text><div style={{marginTop:4,color:'#6b7280',fontSize:13}}>When leads contact you through your listings, they will appear here.</div></div>}><Button type='primary' style={{background:'#b40101',borderColor:'#b40101',marginTop:16}}>View Your Listings</Button></Empty></div> }}
        />
      </div>

      <Drawer
        title="Filter Leads"
        placement="right"
        onClose={() => setShowFilterDrawer(false)}
        open={showFilterDrawer}
        width={320}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Status</Text>
            <AntSelect
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              allowClear
            >
              <AntOption value="New">New</AntOption>
              <AntOption value="Contacted">Contacted</AntOption>
              <AntOption value="Qualified">Qualified</AntOption>
              <AntOption value="Closed">Closed</AntOption>
              <AntOption value="Lost">Lost</AntOption>
            </AntSelect>
          </div>
          <Button 
            block 
            onClick={() => { setFilterStatus(null); setShowFilterDrawer(false); }}
          >
            Clear Filters
          </Button>
        </Space>
      </Drawer>
    </div>
  );
}
