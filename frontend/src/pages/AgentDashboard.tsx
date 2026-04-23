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
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.phone}</div>
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
    <div style={{ padding: '32px' }}>
      {/* KPI Stat Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Text type="secondary" strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Active Listings</Text>
            <Title level={2} style={{ margin: '12px 0 4px' }}>{activeListings.length}</Title>
            <div style={{ height: '24px' }}><Badge status="processing" text={`${activeListings.length} total units`} /></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Text type="secondary" strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Total Active Volume</Text>
            <Title level={2} style={{ margin: '12px 0 4px' }}>{formatCurrency(totalVolume)}</Title>
            <div style={{ height: '24px' }}><Text type="secondary" style={{ fontSize: 12 }}>Current Portfolio Value</Text></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary" strong style={{ fontSize: 12, textTransform: 'uppercase' }}>New Leads</Text>
              {newLeads > 0 && <Badge count={newLeads} offset={[4, -4]} />}
            </Space>
            <Title level={2} style={{ margin: '12px 0 4px' }}>{newLeads}</Title>
            <div style={{ height: '24px' }}><Text type={newLeads > 0 ? "danger" : "secondary"} style={{ fontSize: 12 }}>{newLeads > 0 ? "Needs attention" : "Everything current"}</Text></div>
          </AntCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Text type="secondary" strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Sales Pipeline</Text>
            <Title level={2} style={{ margin: '12px 0 4px' }}>{pipeline}</Title>
            <div style={{ height: '24px' }}><Text type="secondary" style={{ fontSize: 12 }}>Pending Transactions</Text></div>
          </AntCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <AntCard 
            title="Recent Lead Activity" 
            extra={<Button type="link" onClick={() => navigate("/command/leads")}>View All</Button>}
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: '100%' }}
            styles={{ body: { padding: 0 } }}
          >
            <Table 
              dataSource={leads} 
              columns={columns} 
              rowKey="id" 
              pagination={false}
              locale={{ emptyText: "No leads yet." }}
            />
          </AntCard>
        </Col>

        <Col xs={24} lg={8}>
          <AntCard 
            title="Your Active Listings" 
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: '100%' }}
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
                    title={<span style={{ fontWeight: 'bold' }}>{formatCurrency(item.price)}</span>}
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
