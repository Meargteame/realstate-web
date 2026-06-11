import React, { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Card, Row, Col, Typography, Badge, Avatar, Button, Table, Tag, List, Space, Progress } from "antd";
import {
  InboxOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

export default function AgentDashboard() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!parentAgent) return;
    
    fetch(`/api/agents/${parentAgent.id}`)
      .then(res => res.json())
      .then(fullAgent => {
        setActiveListings(fullAgent.properties || []);
        setLeads(fullAgent.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch upcoming appointments
    const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
    fetch(`/api/calendar/bookings/agent/${parentAgent.id}?status=confirmed`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data.filter((a: any) => a.status === 'confirmed' || a.status === 'pending').slice(0, 5) : []);
      })
      .catch(() => {});
  }, [parentAgent]);

  const totalVolume = activeListings.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
  const newLeads = leads.filter((l: any) => l.status === 'New').length;
  const pipeline = leads.filter((l: any) => l.status === 'Contacted').length;
  const closedLeads = leads.filter((l: any) => l.status === 'Closed').length;
  const conversionRate = leads.length > 0 ? Math.round((closedLeads / leads.length) * 100) : 0;

  // Chart data
  const leadsChartData = (() => {
    const months: Record<string, number> = {};
    leads.forEach((l: any) => {
      const d = new Date(l.createdAt || Date.now());
      const key = `${d.toLocaleString('default', { month: 'short' })}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([name, count]) => ({ name, leads: count }));
  })();

  const statusData = [
    { name: 'New', value: leads.filter((l: any) => l.status === 'New').length, color: '#b40101' },
    { name: 'Contacted', value: leads.filter((l: any) => l.status === 'Contacted').length, color: '#373a4b' },
    { name: 'Qualified', value: leads.filter((l: any) => l.status === 'Qualified').length, color: '#667eea' },
    { name: 'Closed', value: leads.filter((l: any) => l.status === 'Closed').length, color: '#10b981' },
    { name: 'Lost', value: leads.filter((l: any) => l.status === 'Lost').length, color: '#9ca3af' },
  ].filter(d => d.value > 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const AntCard = Card as any;

  const columns = [
    {
      title: 'Contact',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'New' ? 'red' : status === 'Contacted' ? 'blue' : 'green';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Inquiry',
      key: 'inquiry',
      render: (_: any, record: any) => (
        <Typography.Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, maxWidth: 200 }}>
          {record.message}
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => new Date(date || Date.now()).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <a href={`mailto:${record.email}`}>
          <Button type="primary" size="small" style={{ background: '#111827' }}>Reply</Button>
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 16px', minHeight: 'calc(100vh - 64px)', background: '#fafafa' }}>
      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <AntCard 
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '1px' }}>Active Listings</Text>
            <Title level={2} style={{ margin: '16px 0 8px', fontSize: '36px', fontWeight: 900, color: '#b40101' }}>{activeListings.length}</Title>
            <div style={{ height: '24px' }}><Badge status="processing" text={`${activeListings.length} total units`} style={{ fontWeight: 600 }} /></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard 
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '1px' }}>Total Active Volume</Text>
            <Title level={2} style={{ margin: '16px 0 8px', fontSize: '36px', fontWeight: 900, color: '#373a4b' }}>{formatCurrency(totalVolume)}</Title>
            <div style={{ height: '24px' }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Current Portfolio Value</Text></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard 
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '1px' }}>New Leads</Text>
              {newLeads > 0 && <Badge count={newLeads} offset={[4, -4]} style={{ backgroundColor: '#b40101' }} />}
            </Space>
            <Title level={2} style={{ margin: '16px 0 8px', fontSize: '36px', fontWeight: 900, color: newLeads > 0 ? '#b40101' : '#373a4b' }}>{newLeads}</Title>
            <div style={{ height: '24px' }}><Text type={newLeads > 0 ? "danger" : "secondary"} style={{ fontSize: 12, fontWeight: 600 }}>{newLeads > 0 ? "Needs attention" : "Everything current"}</Text></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard 
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '1px' }}>Sales Pipeline</Text>
            <Title level={2} style={{ margin: '16px 0 8px', fontSize: '36px', fontWeight: 900, color: '#373a4b' }}>{pipeline}</Title>
            <div style={{ height: '24px' }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Pending Transactions</Text></div>
          </AntCard>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={14}>
          <AntCard
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Lead Trend</span>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={leadsChartData.length > 0 ? leadsChartData : [{ name: 'No Data', leads: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="leads" stroke="#b40101" strokeWidth={3} dot={{ r: 5, fill: '#b40101' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AntCard>
        </Col>
        <Col xs={24} lg={10}>
          <AntCard
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Lead Distribution</span>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 180, height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                {statusData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color }} />
                    <Text style={{ fontSize: 13, flex: 1 }}>{s.name}</Text>
                    <Text strong style={{ fontSize: 14 }}>{s.value}</Text>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Conversion Rate: </Text>
                  <Text strong style={{ color: conversionRate >= 20 ? '#10b981' : '#b40101', fontSize: 14 }}>{conversionRate}%</Text>
                </div>
              </div>
            </div>
          </AntCard>
        </Col>
      </Row>

      {/* Performance Goals */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={8}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: 32, color: '#b40101', marginBottom: 12 }} />
            <Title level={5} style={{ marginBottom: 16 }}>Monthly Listings Goal</Title>
            <Progress 
              percent={Math.min(100, Math.round((activeListings.length / 10) * 100))} 
              strokeColor="#b40101" 
              format={(pct) => `${activeListings.length}/10`}
            />
          </AntCard>
        </Col>
        <Col xs={24} md={8}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <InboxOutlined style={{ fontSize: 32, color: '#373a4b', marginBottom: 12 }} />
            <Title level={5} style={{ marginBottom: 16 }}>Monthly Leads Goal</Title>
            <Progress 
              percent={Math.min(100, Math.round((leads.length / 25) * 100))} 
              strokeColor="#373a4b" 
              format={(pct) => `${leads.length}/25`}
            />
          </AntCard>
        </Col>
        <Col xs={24} md={8}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <ClockCircleOutlined style={{ fontSize: 32, color: '#667eea', marginBottom: 12 }} />
            <Title level={5} style={{ marginBottom: 16 }}>Response Rate</Title>
            <Progress 
              percent={leads.length > 0 ? Math.round(((leads.length - newLeads) / leads.length) * 100) : 0}
              strokeColor="#667eea"
              format={(pct) => `${pct}%`}
            />
          </AntCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <AntCard 
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Recent Lead Activity</span>}
            extra={
              <Button 
                type="link" 
                onClick={() => navigate("/command/leads")}
                style={{ color: '#b40101', fontWeight: 700, fontSize: '13px' }}
              >
                View All →
              </Button>
            }
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
              height: '100%',
              overflow: 'hidden'
            }}
            styles={{ body: { padding: 0 } }}
          >
            <Table 
              dataSource={leads} 
              columns={columns} 
              rowKey="id" 
              pagination={false}
              locale={{ emptyText: "No leads yet." }}
              style={{ fontSize: '14px' }}
            />
          </AntCard>
        </Col>

        <Col xs={24} lg={8}>
          <AntCard 
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Your Active Listings</span>}
            bordered={false} 
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
              height: '100%'
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={activeListings}
              locale={{ emptyText: "No active listings." }}
              renderItem={(item: any) => (
                <List.Item
                  actions={[<Link to={`/properties/${item.id}`}><Button type="text" icon={<ArrowRightOutlined />} /></Link>]}
                  style={{ padding: '12px 0' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.imageUrl} shape="square" size={60} />}
                    title={<span style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(item.price)}</span>}
                    description={
                      <div>
                        <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 140 }}>
                          {item.address}
                        </div>
                        <Tag color="green" style={{ marginTop: 4, marginInlineEnd: 0 }}>{item.status.toUpperCase()}</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </AntCard>

          {/* Upcoming Appointments */}
          <AntCard
            title={
              <span style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                <CalendarOutlined /> Upcoming
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 24 }}
            styles={{ body: { padding: appointments.length === 0 ? '24px' : '8px 24px' } }}
          >
            {appointments.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>No upcoming appointments</Text>
            ) : (
              appointments.map((apt: any, i: number) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < appointments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>{apt.title || apt.clientName || 'Appointment'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(apt.date || apt.createdAt).toLocaleDateString()} at {new Date(apt.date || apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
              ))
            )}
            <Button 
              type="link" block style={{ color: '#b40101', fontWeight: 700, marginTop: 8 }}
              onClick={() => navigate('/command/calendar')}
            >
              View Calendar
            </Button>
          </AntCard>
        </Col>
      </Row>
    </div>
  );
}
