import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Typography, Avatar, Tabs, Empty, Spin, Tag, notification, Row, Col, Statistic } from 'antd';
import {
  UserOutlined, EditOutlined, HeartOutlined, CalendarOutlined,
  MessageOutlined, SaveOutlined, MailOutlined,
  HomeOutlined, ClockCircleOutlined, SafetyCertificateOutlined,
  DashboardOutlined, LogoutOutlined, RightOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useBreakpoint';

const { Title, Text } = Typography;
const AntCard = Card as any;

const BRAND = '#b40101';
const DARK = '#373a4b';

const roleLabel = (role?: string) =>
  role === 'agent' ? 'Real Estate Agent' : role === 'admin' ? 'Administrator' : 'Member';
const roleColor = (role?: string) =>
  role === 'agent' ? 'red' : role === 'admin' ? 'purple' : 'blue';

export default function UserAccount() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const stored = localStorage.getItem('torra_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setFormData({ name: parsed.name || '', email: parsed.email || '' });
    fetchUserData(parsed);
  }, [navigate]);

  const fetchUserData = async (userData: any) => {
    try {
      const headers = { 'Authorization': `Bearer ${userData.token}` };

      // Enrich from the API (member-since, canonical role) where available.
      const meRes = await fetch(`/api/users/${userData.id}`, { headers }).catch(() => null);
      if (meRes?.ok) {
        const me = await meRes.json();
        setUser((prev: any) => ({ ...prev, ...me }));
      }

      const propsRes = await fetch(`/api/properties/saved?userId=${userData.id}`, { headers }).catch(() => null);
      if (propsRes?.ok) {
        const propsData = await propsRes.json();
        setSavedProperties(Array.isArray(propsData) ? propsData : []);
      }

      const apptRes = await fetch(`/api/bookings/user/${userData.id}`, { headers }).catch(() => null);
      if (apptRes?.ok) {
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('torra_user');
    navigate('/');
    window.location.reload();
  };

  const handleSaveProfile = async () => {
    if (!user?.token) {
      notification.warning({ message: 'Your session has expired. Please log in again.' });
      handleLogout();
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: formData.name, email: formData.email })
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedUser = { ...user, ...updated };
        localStorage.setItem('torra_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        notification.success({ message: 'Profile updated successfully' });
        return;
      }

      // Token expired/invalid → force a clean re-login instead of a vague error.
      if (res.status === 401 || res.status === 403) {
        notification.warning({ message: 'Your session has expired. Please log in again to update your profile.' });
        handleLogout();
        return;
      }

      const data = await res.json().catch(() => ({}));
      notification.error({ message: data.error || 'Failed to update profile' });
    } catch (err) {
      notification.error({ message: 'Network error — could not update profile. Please try again.' });
    }
  };


  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const isAgent = user?.role === 'agent' || user?.agentId;

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ---- Reusable bits -------------------------------------------------------
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
        {label}
      </Text>
      {children}
    </div>
  );

  const QuickAction = ({ icon, label, onClick, danger }: any) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
        transition: 'background 0.15s', color: danger ? BRAND : '#374151'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 18, color: danger ? BRAND : DARK }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{label}</span>
      <RightOutlined style={{ fontSize: 11, color: '#bbb' }} />
    </div>
  );

  const statCardStyle: React.CSSProperties = {
    borderRadius: 14, border: '1px solid #f0f0f0', textAlign: 'center'
  };

  return (
    <div style={{ background: '#f5f6f8', minHeight: 'calc(100vh - 160px)' }}>
      {/* ---- Hero banner ---- */}
      <div style={{
        background: `linear-gradient(120deg, ${DARK} 0%, #2a2d3a 60%, ${BRAND} 160%)`,
        padding: isMobile ? '32px 16px 80px' : '48px 24px 96px',
        color: 'white'
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
          <Avatar
            size={isMobile ? 88 : 104}
            src={user?.imageUrl}
            style={{ backgroundColor: BRAND, flexShrink: 0, border: '4px solid rgba(255,255,255,0.25)', fontSize: 36, fontWeight: 700 }}
          >
            {initials}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800 }}>{user?.name || 'User'}</Title>
            <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              <MailOutlined style={{ marginRight: 8 }} />{user?.email}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: isMobile ? 'center' : 'flex-start', marginTop: 14, flexWrap: 'wrap' }}>
              <Tag color={roleColor(user?.role)} style={{ fontSize: 12, padding: '4px 14px', borderRadius: 20, fontWeight: 600, border: 'none' }}>
                {roleLabel(user?.role)}
              </Tag>
              <Tag icon={<ClockCircleOutlined />} style={{ fontSize: 12, padding: '4px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>
                Member since {memberSince}
              </Tag>
            </div>
          </div>
          {!editing && (
            <Button
              icon={<EditOutlined />}
              size="large"
              onClick={() => { setActiveTab('profile'); setEditing(true); }}
              style={{ background: 'white', color: BRAND, borderColor: 'white', fontWeight: 700, borderRadius: 10 }}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* ---- Body (pulled up over the hero) ---- */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '0 16px 48px' : '0 24px 64px', marginTop: isMobile ? -56 : -64 }}>
        {/* Stats strip */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <AntCard style={statCardStyle} styles={{ body: { padding: isMobile ? 16 : 20 } }}>
              <Statistic title="Saved Properties" value={savedProperties.length} prefix={<HeartOutlined style={{ color: BRAND }} />} valueStyle={{ fontWeight: 800 }} />
            </AntCard>
          </Col>
          <Col xs={12} md={6}>
            <AntCard style={statCardStyle} styles={{ body: { padding: isMobile ? 16 : 20 } }}>
              <Statistic title="Appointments" value={appointments.length} prefix={<CalendarOutlined style={{ color: BRAND }} />} valueStyle={{ fontWeight: 800 }} />
            </AntCard>
          </Col>
          <Col xs={12} md={6}>
            <AntCard style={statCardStyle} styles={{ body: { padding: isMobile ? 16 : 20 } }}>
              <Statistic title="Messages" value={0} prefix={<MessageOutlined style={{ color: BRAND }} />} valueStyle={{ fontWeight: 800 }} />
            </AntCard>
          </Col>
          <Col xs={12} md={6}>
            <AntCard style={statCardStyle} styles={{ body: { padding: isMobile ? 16 : 20 } }}>
              <Statistic
                title="Account Type"
                value={isAgent ? 'Agent' : 'Member'}
                prefix={<SafetyCertificateOutlined style={{ color: BRAND }} />}
                valueStyle={{ fontWeight: 800, fontSize: 22 }}
              />
            </AntCard>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Sidebar */}
          <Col xs={24} lg={7}>
            <AntCard style={{ borderRadius: 16, border: '1px solid #f0f0f0', marginBottom: 24 }} styles={{ body: { padding: 12 } }}>
              <Text style={{ display: 'block', padding: '8px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#9ca3af' }}>
                QUICK ACTIONS
              </Text>
              <QuickAction icon={<HomeOutlined />} label="Browse Properties" onClick={() => navigate('/properties')} />
              <QuickAction icon={<HeartOutlined />} label="Saved Searches" onClick={() => navigate('/saved-searches')} />
              <QuickAction icon={<UserOutlined />} label="Find an Agent" onClick={() => navigate('/agents')} />
              {isAgent && (
                <QuickAction icon={<DashboardOutlined />} label="Agent Dashboard" onClick={() => navigate('/command')} />
              )}
              {user?.role === 'admin' && (
                <QuickAction icon={<DashboardOutlined />} label="Admin Panel" onClick={() => navigate('/admin')} />
              )}
              {!isAgent && user?.role !== 'admin' && (
                <QuickAction icon={<SafetyCertificateOutlined />} label="Become an Agent" onClick={() => navigate('/become-agent')} />
              )}
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '6px 0' }} />
              <QuickAction icon={<LogoutOutlined />} label="Log Out" onClick={handleLogout} danger />
            </AntCard>

            <AntCard style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}>
              <Title level={5} style={{ marginTop: 0 }}>Account Summary</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="MEMBER SINCE"><Text style={{ fontSize: 15 }}>{memberSince}</Text></Field>
                <Field label="ACCOUNT ID"><Text code style={{ fontSize: 12 }}>{user?.id?.slice(0, 8) || '—'}</Text></Field>
                <Field label="STATUS"><Tag color="green" style={{ borderRadius: 20 }}>Active</Tag></Field>
              </div>
            </AntCard>
          </Col>

          {/* Main content */}
          <Col xs={24} lg={17}>
            <AntCard style={{ borderRadius: 16, border: '1px solid #f0f0f0' }} styles={{ body: { padding: isMobile ? 16 : 24 } }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size={isMobile ? 'small' : 'middle'}
                items={[
                  {
                    key: 'profile',
                    label: <span><UserOutlined /> Profile</span>,
                    children: (
                      <div>
                        <Title level={5} style={{ marginTop: 0 }}>Personal Information</Title>
                        <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                          <Col xs={24} md={12}>
                            <Field label="FULL NAME">
                              {editing ? (
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} size="large" prefix={<UserOutlined />} />
                              ) : (
                                <Text style={{ fontSize: 16 }}>{user?.name || 'Not set'}</Text>
                              )}
                            </Field>
                          </Col>
                          <Col xs={24} md={12}>
                            <Field label="EMAIL ADDRESS">
                              {editing ? (
                                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} size="large" prefix={<MailOutlined />} />
                              ) : (
                                <Text style={{ fontSize: 16 }}>{user?.email || 'Not set'}</Text>
                              )}
                            </Field>
                          </Col>
                          <Col xs={24} md={12}>
                            <Field label="ROLE">
                              <Tag color={roleColor(user?.role)} style={{ fontSize: 14, padding: '4px 14px', borderRadius: 20 }}>
                                {roleLabel(user?.role)}
                              </Tag>
                            </Field>
                          </Col>
                          <Col xs={24} md={12}>
                            <Field label="MEMBER SINCE">
                              <Text style={{ fontSize: 16 }}>{memberSince}</Text>
                            </Field>
                          </Col>
                        </Row>

                        {editing && (
                          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveProfile} style={{ background: BRAND, borderColor: BRAND }}>
                              Save Changes
                            </Button>
                            <Button onClick={() => { setEditing(false); setFormData({ name: user?.name || '', email: user?.email || '' }); }}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'saved',
                    label: <span><HomeOutlined /> Saved ({savedProperties.length})</span>,
                    children: savedProperties.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {savedProperties.map((prop: any) => (
                          <Col xs={24} sm={12} key={prop.id}>
                            <AntCard
                              hoverable
                              styles={{ body: { padding: 12 } }}
                              cover={<img alt={prop.address} src={prop.imageUrl} style={{ height: 160, objectFit: 'cover' }} />}
                              onClick={() => navigate(`/properties/${prop.id}`)}
                              style={{ borderRadius: 12, overflow: 'hidden' }}
                            >
                              <div style={{ fontWeight: 800, color: BRAND, fontSize: 18 }}>
                                {prop.price ? `$${prop.price.toLocaleString()}` : ''}
                              </div>
                              <div style={{ fontWeight: 600, marginTop: 2 }}>{prop.address}</div>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                <EnvironmentOutlined style={{ marginRight: 4 }} />{prop.city}{prop.state ? `, ${prop.state}` : ''}
                              </Text>
                            </AntCard>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="No saved properties yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '32px 0' }}>
                        <Button type="primary" onClick={() => navigate('/properties')} style={{ background: BRAND, borderColor: BRAND }}>
                          Browse Properties
                        </Button>
                      </Empty>
                    )
                  },
                  {
                    key: 'appointments',
                    label: <span><CalendarOutlined /> Appointments ({appointments.length})</span>,
                    children: appointments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {appointments.map((appt: any) => (
                          <div key={appt.id} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CalendarOutlined style={{ fontSize: 20, color: BRAND }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text strong>{appt.serviceType ? `${appt.serviceType[0].toUpperCase()}${appt.serviceType.slice(1)}` : (appt.title || 'Appointment')}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {appt.requestedDate ? new Date(appt.requestedDate).toLocaleDateString() : (appt.date ? new Date(appt.date).toLocaleDateString() : 'Date TBD')}
                                {appt.requestedTime ? ` · ${appt.requestedTime}` : ''}
                              </Text>
                            </div>
                            <Tag color={appt.status === 'confirmed' ? 'green' : appt.status === 'rejected' ? 'red' : 'orange'}>
                              {(appt.status || 'pending').toUpperCase()}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="No appointments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '32px 0' }}>
                        <Button type="primary" onClick={() => navigate('/agents')} style={{ background: BRAND, borderColor: BRAND }}>
                          Find an Agent
                        </Button>
                      </Empty>
                    )
                  },
                  {
                    key: 'messages',
                    label: <span><MessageOutlined /> Messages</span>,
                    children: (
                      <Empty description="No messages yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '32px 0' }}>
                        <Button type="primary" onClick={() => navigate('/agents')} style={{ background: BRAND, borderColor: BRAND }}>
                          Contact an Agent
                        </Button>
                      </Empty>
                    )
                  }
                ]}
              />
            </AntCard>
          </Col>
        </Row>
      </div>
    </div>
  );
}
