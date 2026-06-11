import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Typography, Avatar, Tabs, Empty, Spin, Tag, notification, Row, Col, Divider } from 'antd';
import { 
  UserOutlined, EditOutlined, HeartOutlined, CalendarOutlined, 
  MessageOutlined, SaveOutlined, MailOutlined,
  HomeOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useBreakpoint';

const { Title, Text, Paragraph } = Typography;
const AntCard = Card as any;
const { TabPane } = Tabs;

export default function UserAccount() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('torra_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setFormData({ name: parsed.name || '', email: parsed.email || '', phone: parsed.phone || '' });
    
    // Fetch user data
    fetchUserData(parsed);
  }, [navigate]);

  const fetchUserData = async (userData: any) => {
    try {
      const headers = { 'Authorization': `Bearer ${userData.token}` };
      
      // Fetch saved properties (if endpoint exists)
      const propsRes = await fetch(`/api/properties/saved?userId=${userData.id}`, { headers }).catch(() => null);
      if (propsRes?.ok) {
        const propsData = await propsRes.json();
        setSavedProperties(propsData || []);
      }

      // Fetch appointments (if endpoint exists)
      const apptRes = await fetch(`/api/bookings/user/${userData.id}`, { headers }).catch(() => null);
      if (apptRes?.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` 
      };
      
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedUser = { ...user, ...updated };
        localStorage.setItem('torra_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        notification.success({ message: 'Profile updated successfully' });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      notification.error({ message: 'Failed to update profile' });
    }
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1000, 
      margin: '0 auto', 
      padding: isMobile ? '24px 16px' : '40px 24px',
      minHeight: 'calc(100vh - 200px)'
    }}>
      {/* Profile Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: 24,
        marginBottom: 32,
        padding: 24,
        background: 'white',
        borderRadius: 16,
        border: '1px solid #f0f0f0'
      }}>
        <Avatar 
          size={isMobile ? 80 : 100}
          src={user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=b40101&color=fff&size=128`}
          style={{ backgroundColor: '#b40101', flexShrink: 0 }}
        >
          {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
        </Avatar>
        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <Title level={3} style={{ margin: 0 }}>{user?.name || 'User'}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            <MailOutlined style={{ marginRight: 6 }} />{user?.email}
          </Text>
          <div style={{ display: 'flex', gap: 8, justifyContent: isMobile ? 'center' : 'flex-start', marginTop: 12 }}>
            <Tag color="blue" style={{ fontSize: 12, padding: '4px 12px' }}>
              {user?.role === 'agent' ? 'Real Estate Agent' : user?.role === 'admin' ? 'Administrator' : 'Member'}
            </Tag>
            {user?.agentId && (
              <Tag color="red" style={{ fontSize: 12, padding: '4px 12px' }}>Agent</Tag>
            )}
          </div>
        </div>
        {!editing && (
          <Button 
            icon={<EditOutlined />} 
            onClick={() => setEditing(true)}
            style={{ borderColor: '#b40101', color: '#b40101' }}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="profile" size={isMobile ? 'small' : 'default'}>
        <TabPane 
          tab={<span><UserOutlined /> Profile</span>} 
          key="profile"
        >
          <AntCard style={{ borderRadius: 12 }}>
            <Title level={5}>Personal Information</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>FULL NAME</Text>
                {editing ? (
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    size="large"
                  />
                ) : (
                  <Text style={{ fontSize: 16 }}>{user?.name || 'Not set'}</Text>
                )}
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>EMAIL</Text>
                {editing ? (
                  <Input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    size="large"
                    prefix={<MailOutlined />}
                  />
                ) : (
                  <Text style={{ fontSize: 16 }}>{user?.email || 'Not set'}</Text>
                )}
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>ROLE</Text>
                <Tag color={user?.role === 'agent' ? 'red' : user?.role === 'admin' ? 'purple' : 'blue'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {user?.role === 'agent' ? 'Real Estate Agent' : user?.role === 'admin' ? 'Administrator' : 'Member'}
                </Tag>
              </Col>
            </Row>
            
            {editing && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveProfile}
                  style={{ background: '#b40101', borderColor: '#b40101' }}>
                  Save Changes
                </Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            )}
          </AntCard>
        </TabPane>

        <TabPane 
          tab={<span><HomeOutlined /> Saved Properties</span>} 
          key="saved"
        >
          <AntCard style={{ borderRadius: 12 }}>
            {savedProperties.length > 0 ? (
              <Row gutter={[16, 16]}>
                {savedProperties.map((prop: any) => (
                  <Col xs={24} sm={12} md={8} key={prop.id}>
                    <AntCard 
                      hoverable
                      cover={<img alt={prop.title} src={prop.imageUrl} style={{ height: 160, objectFit: 'cover' }} />}
                      onClick={() => navigate(`/properties/${prop.id}`)}
                    >
                      <AntCard.Meta title={prop.title} description={prop.price ? `$${prop.price.toLocaleString()}` : ''} />
                    </AntCard>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description="No saved properties yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/properties')}
                  style={{ background: '#b40101', borderColor: '#b40101' }}>
                  Browse Properties
                </Button>
              </Empty>
            )}
          </AntCard>
        </TabPane>

        <TabPane 
          tab={<span><CalendarOutlined /> Appointments</span>} 
          key="appointments"
        >
          <AntCard style={{ borderRadius: 12 }}>
            {appointments.length > 0 ? (
              <div>
                {appointments.map((appt: any) => (
                  <div key={appt.id} style={{ 
                    padding: 16, 
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center'
                  }}>
                    <CalendarOutlined style={{ fontSize: 24, color: '#b40101' }} />
                    <div>
                      <Text strong>{appt.title || 'Appointment'}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {appt.date ? new Date(appt.date).toLocaleDateString() : 'Date TBD'}
                      </Text>
                    </div>
                    <Tag color={appt.status === 'confirmed' ? 'green' : 'orange'} style={{ marginLeft: 'auto' }}>
                      {appt.status || 'pending'}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description="No appointments yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/agents')}
                  style={{ background: '#b40101', borderColor: '#b40101' }}>
                  Find an Agent
                </Button>
              </Empty>
            )}
          </AntCard>
        </TabPane>

        <TabPane 
          tab={<span><MessageOutlined /> Messages</span>} 
          key="messages"
        >
          <AntCard style={{ borderRadius: 12 }}>
            <Empty 
              description="No messages yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/agents')}
                style={{ background: '#b40101', borderColor: '#b40101' }}>
                Contact an Agent
              </Button>
            </Empty>
          </AntCard>
        </TabPane>
      </Tabs>
    </div>
  );
}
