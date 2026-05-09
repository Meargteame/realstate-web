import React, { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Card, Row, Col, Typography, Badge, Avatar, Button, Table, Tag, List, Space } from "antd";
import {
  InboxOutlined,
  HomeOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AgentDashboard() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  }, [parentAgent]);

  const totalVolume = activeListings.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
  const newLeads = leads.filter((l: any) => l.status === 'New').length;
  const pipeline = leads.filter((l: any) => l.status === 'Contacted').length;

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
    <div style={{ padding: '40px 48px', minHeight: 'calc(100vh - 64px)', background: '#fafafa' }}>
      {/* KPI Stat Cards */}
      <Row gutter={[32, 32]}>
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

      <Row gutter={[32, 32]} style={{ marginTop: '32px' }}>
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
        </Col>
      </Row>
    </div>
  );
}
