import React, { useState, useEffect } from "react";
import { Layout, List, Avatar, Typography, Badge, Button, Input, Space, Divider, Tag } from "antd";
import { useOutletContext, Link } from "react-router-dom";
import { SearchOutlined, MailOutlined, PhoneOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LeadInbox() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/agents/${parentAgent.id}`)
      .then(res => res.json())
      .then(data => {
        const sortedLeads = (data.leads || []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLeads(sortedLeads);
        if (sortedLeads.length > 0) setSelectedLead(sortedLeads[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parentAgent]);

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      <Sider width={350} theme="light" style={{ borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0 }}>Inbox</Title>
          <Input 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
            placeholder="Search leads..." 
            style={{ marginTop: 16, borderRadius: 8 }}
          />
        </div>
        <List
          loading={loading}
          dataSource={leads}
          renderItem={(item: any) => (
            <div 
              onClick={() => setSelectedLead(item)}
              style={{ 
                padding: '20px', 
                cursor: 'pointer', 
                borderBottom: '1px solid #f5f5f5',
                background: selectedLead?.id === item.id ? '#fff1f0' : 'white',
                borderLeft: selectedLead?.id === item.id ? '4px solid #b40101' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </div>
              <Paragraph ellipsis={{ rows: 1 }} style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
                {item.message}
              </Paragraph>
              {item.status === 'New' && <Badge status="error" text="New" style={{ marginTop: 4 }} />}
            </div>
          )}
        />
      </Sider>

      <Content style={{ padding: '0', background: 'white' }}>
        {selectedLead ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 40px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={64} style={{ backgroundColor: '#111827', fontSize: 24 }}>{selectedLead.name[0]}</Avatar>
                <div>
                  <Title level={3} style={{ margin: 0 }}>{selectedLead.name}</Title>
                  <Space split={<Divider type="vertical" />}>
                     <Text type="secondary"><MailOutlined /> {selectedLead.email}</Text>
                     <Text type="secondary"><PhoneOutlined /> {selectedLead.phone}</Text>
                  </Space>
                </div>
              </div>
              <Space>
                <Button icon={<StarOutlined />} />
                <Button icon={<DeleteOutlined />} danger />
              </Space>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ background: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Tag color="red">INQUIRY</Tag>
                  <Text type="secondary">{new Date(selectedLead.createdAt).toLocaleString()}</Text>
                </div>
                <Text style={{ fontSize: 16, lineHeight: 1.6 }}>{selectedLead.message}</Text>
              </div>

              {selectedLead.property && (
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: 20 }}>
                   <Text strong>Referenced Property:</Text>
                   <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      <img src={selectedLead.property.imageUrl} style={{ width: 120, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{selectedLead.property.address}</div>
                        <div style={{ color: '#b40101', fontWeight: 900 }}>${selectedLead.property.price.toLocaleString()}</div>
                        <Link to={`/properties/${selectedLead.property.id}`} style={{ fontSize: 12 }}>View Listing Details</Link>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div style={{ padding: '24px 40px', borderTop: '1px solid #f0f0f0' }}>
               <Button type="primary" size="large" style={{ background: '#b40101', borderColor: '#b40101', width: 200 }}>Reply to Lead</Button>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">Select a lead to view details.</Text>
          </div>
        )}
      </Content>
    </Layout>
  );
}
