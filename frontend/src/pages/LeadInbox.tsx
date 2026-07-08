import React, { useState, useEffect } from "react";
import { Layout, List, Avatar, Typography, Badge, Button, Input, Space, Divider, Tag, Modal, message } from "antd";
import { useOutletContext, Link } from "react-router-dom";
import { SearchOutlined, MailOutlined, PhoneOutlined, StarOutlined, DeleteOutlined, StarFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LeadInbox() {
  const isMobile = useIsMobile();
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const authHeaders = () => ({
    'Authorization': `Bearer ${parentAgent?.token || ''}`
  });

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/leads?agentId=${parentAgent.id}&limit=100`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        const allLeads = data.leads || data || [];
        const sorted = (Array.isArray(allLeads) ? allLeads : []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLeads(sorted);
        if (sorted.length > 0) setSelectedLead(sorted[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parentAgent]);

  const handleToggleFavorite = async () => {
    if (!selectedLead) return;
    const target = selectedLead;
    const optimistic = { ...target, isFavorite: !target.isFavorite };
    // Optimistic: flip immediately.
    setLeads(prev => prev.map(l => l.id === target.id ? optimistic : l));
    setSelectedLead(optimistic);
    try {
      const res = await fetch(`/api/leads/${target.id}/favorite`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      const updated = await res.json();
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      setSelectedLead(prev => (prev && prev.id === updated.id ? updated : prev));
    } catch {
      // Revert
      setLeads(prev => prev.map(l => l.id === target.id ? target : l));
      setSelectedLead(prev => (prev && prev.id === target.id ? target : prev));
      message.error('Failed to update favorite');
    }
  };

  const handleSetFollowUp = async (value: string) => {
    if (!selectedLead) return;
    const nextFollowUpDate = value || null;
    const previous = selectedLead.nextFollowUpDate;
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, nextFollowUpDate } : l));
    setSelectedLead((prev: any) => prev ? { ...prev, nextFollowUpDate } : prev);
    try {
        const res = await fetch(`/api/leads/${selectedLead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ nextFollowUpDate })
      });
      if (!res.ok) throw new Error('failed');
      message.success(nextFollowUpDate ? 'Follow-up date set' : 'Follow-up cleared');
    } catch {
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, nextFollowUpDate: previous } : l));
      setSelectedLead((prev: any) => prev ? { ...prev, nextFollowUpDate: previous } : prev);
      message.error('Failed to update follow-up date');
    }
  };

  const handleDelete = () => {
    if (!selectedLead) return;
    Modal.confirm({
      title: 'Delete this lead?',
      content: 'This action cannot be undone.',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`/api/leads/${selectedLead.id}`, { 
            method: 'DELETE',
            headers: authHeaders()
          });
          if (!res.ok) throw new Error('Failed to delete');
          const remainingLeads = leads.filter(l => l.id !== selectedLead.id);
          setLeads(remainingLeads);
          setSelectedLead(remainingLeads[0] || null);
          message.success('Lead deleted');
        } catch {
          message.error('Failed to delete lead');
        }
      }
    });
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      {(!isMobile || !selectedLead) && (
        <Sider width={isMobile ? '100%' : 350} theme="light" style={{ borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
          <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0 }}>Inbox</Title>
            <Input 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ marginTop: 16, borderRadius: 8 }}
            />
          </div>
          <List
            loading={loading}
            dataSource={filteredLeads}
            renderItem={(item: any) => (
              <div 
                onClick={() => setSelectedLead(item)}
                style={{ 
                  padding: isMobile ? '14px' : '20px', 
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
      )}

      <Content style={{ padding: '0', background: 'white' }}>
        {selectedLead ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: isMobile ? '16px' : '24px 40px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {isMobile && (
                  <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedLead(null)} style={{ marginRight: 4 }} />
                )}
                <Avatar size={isMobile ? 48 : 64} style={{ backgroundColor: '#111827', fontSize: isMobile ? 18 : 24 }}>{selectedLead.name[0]}</Avatar>
                <div>
                  <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>{selectedLead.name}</Title>
                  {!isMobile && (
                    <Space split={<Divider type="vertical" />}>
                      <Text type="secondary"><MailOutlined /> {selectedLead.email}</Text>
                      <Text type="secondary"><PhoneOutlined /> {selectedLead.phone}</Text>
                    </Space>
                  )}
                </div>
              </div>
              <Space>
                <Button 
                  icon={selectedLead.isFavorite ? <StarFilled /> : <StarOutlined />} 
                  type={selectedLead.isFavorite ? 'primary' : 'default'}
                  style={selectedLead.isFavorite ? { background: '#faad14', borderColor: '#faad14' } : {}}
                  onClick={handleToggleFavorite}
                />
                <Button icon={<DeleteOutlined />} danger onClick={handleDelete} />
              </Space>
            </div>

            {isMobile && selectedLead && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 12, fontSize: 12 }}>
                <Text type="secondary"><MailOutlined /> {selectedLead.email}</Text>
                <Text type="secondary"><PhoneOutlined /> {selectedLead.phone}</Text>
              </div>
            )}

            <div style={{ flex: 1, padding: isMobile ? '16px' : '40px', overflowY: 'auto' }}>
              <div style={{ background: '#f9f9f9', padding: isMobile ? '16px' : '24px', borderRadius: '12px', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Tag color="red">INQUIRY</Tag>
                  <Text type="secondary">{new Date(selectedLead.createdAt).toLocaleString()}</Text>
                </div>
                <Text style={{ fontSize: isMobile ? 14 : 16, lineHeight: 1.6 }}>{selectedLead.message}</Text>
                {(selectedLead.source || (Array.isArray(selectedLead.tags) && selectedLead.tags.length > 0)) && (
                  <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {selectedLead.source && (
                      <Tag color="blue">Source: {selectedLead.source}</Tag>
                    )}
                    {Array.isArray(selectedLead.tags) && selectedLead.tags.map((t: string) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}
              </div>

              {selectedLead.property && (
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: isMobile ? 16 : 20 }}>
                   <Text strong>Referenced Property:</Text>
                   <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      <img src={selectedLead.property.imageUrl} style={{ width: isMobile ? 80 : 120, height: isMobile ? 60 : 80, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: isMobile ? 13 : 14 }}>{selectedLead.property.address}</div>
                        <div style={{ color: '#b40101', fontWeight: 900, fontSize: isMobile ? 13 : 14 }}>${selectedLead.property.price.toLocaleString()}</div>
                        <Link to={`/properties/${selectedLead.property.id}`} style={{ fontSize: 12 }}>View Listing Details</Link>
                      </div>
                   </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text strong>Next follow-up:</Text>
                <input
                  type="date"
                  value={selectedLead.nextFollowUpDate ? new Date(selectedLead.nextFollowUpDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleSetFollowUp(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
                {selectedLead.nextFollowUpDate && (
                  <Button size="small" onClick={() => handleSetFollowUp('')}>Clear</Button>
                )}
              </div>
            </div>

            <div style={{ padding: isMobile ? '16px' : '24px 40px', borderTop: '1px solid #f0f0f0' }}>
               <a href={`mailto:${selectedLead.email}?subject=Re: Your inquiry&body=Hi ${selectedLead.name},%0D%0A%0D%0AThank you for reaching out!%0D%0A%0D%0A`}>
                 <Button type="primary" size={isMobile ? 'middle' : 'large'} style={{ background: '#b40101', borderColor: '#b40101', width: isMobile ? '100%' : 200 }}>
                   Reply to Lead
                 </Button>
               </a>
            </div>
          </div>
        ) : (
          !isMobile && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text type="secondary">Select a lead to view details.</Text>
            </div>
          )
        )}
      </Content>
    </Layout>
  );
}
