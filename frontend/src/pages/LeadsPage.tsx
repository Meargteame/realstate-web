import React, { useState, useEffect } from "react";
import { Table, Typography, Tag, Input, Button, Space, Breadcrumb, Avatar, Select, message, Drawer } from "antd";
import { SearchOutlined, MailOutlined, PhoneOutlined, FilterOutlined } from "@ant-design/icons";
import { Link, useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;

export default function LeadsPage() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/agents/${parentAgent.id}`)
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parentAgent]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
      message.success(`Lead moved to ${status}`);
    } catch {
      message.error('Failed to update lead status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/leads/export?agentId=${parentAgent.id}`);
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

  const columns = [
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
          <a href={`mailto:${record.email}`}><Button type="primary" size="small" style={{ background: '#111827' }} icon={<MailOutlined />}>Message</Button></a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: '24px' }}>
        <Breadcrumb items={[{ title: <Link to="/command">Dashboard</Link> }, { title: 'Contacts / Leads' }]} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#111827' }}>
              Contact Pipeline
            </Title>
            <Text type="secondary">Manage and track your real estate inquiries. Click status to update pipeline stage.</Text>
          </div>
          <Space>
            <Input
              placeholder="Search leads..."
              prefix={<SearchOutlined />}
              style={{ width: 300, borderRadius: '8px' }}
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
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} leads` }}
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
