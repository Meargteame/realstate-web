import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Avatar, Upload, Space, message, Row, Col, Divider, Switch, TimePicker, Select, Tag } from "antd";
import { useOutletContext } from "react-router-dom";
import { UserOutlined, UploadOutlined, SaveOutlined, LockOutlined, BellOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const AntCard = Card as any;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;

export default function AgentSettings() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pwdForm] = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    emailLeads: true, emailInquiries: true, emailNews: false,
    smsLeads: true, smsAppointments: true,
    pushAll: true,
  });
  const [officeHours, setOfficeHours] = useState<any[]>([
    { day: 'Monday', open: '09:00', close: '17:00', enabled: true },
    { day: 'Tuesday', open: '09:00', close: '17:00', enabled: true },
    { day: 'Wednesday', open: '09:00', close: '17:00', enabled: true },
    { day: 'Thursday', open: '09:00', close: '17:00', enabled: true },
    { day: 'Friday', open: '09:00', close: '17:00', enabled: true },
    { day: 'Saturday', open: '10:00', close: '14:00', enabled: false },
    { day: 'Sunday', open: '10:00', close: '14:00', enabled: false },
  ]);

  useEffect(() => {
    if (parentAgent) {
      // Use imageUrl directly - proxy will handle routing to backend
      const imageUrl = parentAgent.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(parentAgent.name)}&background=111827&color=fff&size=256`;
      
      setImageUrl(imageUrl);
      form.setFieldsValue({
        name: parentAgent.name,
        email: parentAgent.email,
        phone: parentAgent.phone,
        bio: parentAgent.bio,
        location: parentAgent.location,
        specialties: parentAgent.specialties
      });
    }
  }, [parentAgent, form]);

  const handleAvatarUpload = async (info: any) => {
    const file = info.file;
    
    if (!file) return;

    // Validate file type
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return;
    }

    // Validate file size (5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`/api/upload/agent/${parentAgent.id}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      console.log('Upload response:', data);
      
      // Use imageUrl directly - proxy will handle routing
      const imageUrl = data.imageUrl;
      
      console.log('Setting image URL to:', imageUrl);
      setImageUrl(imageUrl);
      message.success('Profile picture updated successfully!');
      
      // Reload page to refresh agent data in sidebar
      setTimeout(() => window.location.reload(), 1500);

    } catch (error: any) {
      message.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch(`/api/agents/${parentAgent.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to change password');
      }
      message.success('Password changed successfully');
      pwdForm.resetFields();
    } catch (e: any) {
      message.error(e.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateOfficeHour = (index: number, field: string, value: any) => {
    setOfficeHours((prev: any[]) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const saveOfficeHours = async () => {
    try {
      await fetch(`/api/agents/${parentAgent.id}/office-hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officeHours })
      });
      message.success('Office hours saved');
    } catch { message.error('Failed to save office hours'); }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${parentAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      const updated = await res.json();
      message.success("Profile updated successfully.");
      
      // Update parent context if needed
      window.location.reload(); // Reload to refresh agent data
    } catch (error) {
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: 1000, margin: '0 auto', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ fontSize: '20px', fontWeight: 500, marginBottom: 16, color: '#111827' }}>Account Settings</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <AntCard bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <Avatar size={120} src={imageUrl} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <div style={{ marginBottom: 16 }}>
              <Upload 
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
              </Upload>
            </div>
            <Title level={4} style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{parentAgent?.name}</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>TORRA Commercial Real Estate Group</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
               <Text style={{ color: '#6b7280', fontSize: '13px' }}>Role:</Text> <Text style={{ fontSize: '13px' }}>Licensed Associate Broker</Text><br />
               <Text style={{ color: '#6b7280', fontSize: '13px' }}>Member Since:</Text> <Text style={{ fontSize: '13px' }}>Oct 2023</Text>
            </div>
          </AntCard>
        </Col>

        <Col xs={24} md={16}>
          <AntCard bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={4} style={{ marginBottom: 24, fontSize: '16px', fontWeight: 500 }}>Personal Information</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone Number">
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="location" label="Service Area">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="specialties" label="Specialties / Focus Areas">
                <Input size="large" placeholder="e.g. Luxury, New Construction, First-time Buyers" />
              </Form.Item>
              <Form.Item name="bio" label="Professional Biography">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ background: '#b40101', borderColor: '#b40101', height: 44, padding: '0 32px' }} icon={<SaveOutlined />}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </AntCard>
        </Col>
      </Row>
      {/* Password Change Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <AntCard bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={4} style={{ marginBottom: 16, fontSize: '16px', fontWeight: 500 }}><LockOutlined style={{ marginRight: 8 }} />Change Password</Title>
            <Form form={pwdForm} layout="vertical" onFinish={handlePasswordChange} style={{ maxWidth: 500 }}>
              <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true, message: 'Enter current password' }]}>
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}>
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirm New Password" rules={[{ required: true, message: 'Confirm new password' }]}>
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={pwdLoading} style={{ background: '#b40101', borderColor: '#b40101', height: 40 }} icon={<LockOutlined />}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </AntCard>
        </Col>
      </Row>

      {/* Notification Preferences */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <AntCard bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={4} style={{ marginBottom: 16, fontSize: '16px', fontWeight: 500 }}><BellOutlined style={{ marginRight: 8 }} />Notification Preferences</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>Email — New Lead Assigned</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Receive email when a new lead is assigned to you</Text></div>
                <Switch checked={notifications.emailLeads} onChange={() => toggleNotification('emailLeads')} style={{ backgroundColor: notifications.emailLeads ? '#b40101' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>Email — Client Inquiries</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Receive email for new client inquiries</Text></div>
                <Switch checked={notifications.emailInquiries} onChange={() => toggleNotification('emailInquiries')} style={{ backgroundColor: notifications.emailInquiries ? '#b40101' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>Email — Newsletter & Updates</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Platform news and marketing updates</Text></div>
                <Switch checked={notifications.emailNews} onChange={() => toggleNotification('emailNews')} style={{ backgroundColor: notifications.emailNews ? '#b40101' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>SMS — Lead Alerts</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Text message for urgent lead notifications</Text></div>
                <Switch checked={notifications.smsLeads} onChange={() => toggleNotification('smsLeads')} style={{ backgroundColor: notifications.smsLeads ? '#b40101' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>SMS — Appointment Reminders</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Text message before scheduled appointments</Text></div>
                <Switch checked={notifications.smsAppointments} onChange={() => toggleNotification('smsAppointments')} style={{ backgroundColor: notifications.smsAppointments ? '#b40101' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                <div><Text strong>Push Notifications — All Activity</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Browser push notifications for all activity</Text></div>
                <Switch checked={notifications.pushAll} onChange={() => toggleNotification('pushAll')} style={{ backgroundColor: notifications.pushAll ? '#b40101' : undefined }} />
              </div>
            </div>
          </AntCard>
        </Col>
      </Row>

      {/* Office Hours */}
      <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 32 }}>
        <Col xs={24}>
          <AntCard bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={4} style={{ marginBottom: 16, fontSize: '16px', fontWeight: 500 }}><ClockCircleOutlined style={{ marginRight: 8 }} />Office Hours</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {officeHours.map((h: any, idx: number) => (
                <div key={h.day} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: h.enabled ? '#fafafa' : '#f0f0f0', borderRadius: 8, opacity: h.enabled ? 1 : 0.6, flexWrap: 'wrap' }}>
                  <Text strong style={{ width: 90, fontSize: '13px' }}>{h.day}</Text>
                  <Switch size="small" checked={h.enabled} onChange={(v: boolean) => updateOfficeHour(idx, 'enabled', v)} style={{ backgroundColor: h.enabled ? '#b40101' : undefined }} />
                  <AntSelect size="small" value={h.open} disabled={!h.enabled} onChange={(v: string) => updateOfficeHour(idx, 'open', v)} style={{ width: 90 }}>
                    {['06:00','07:00','08:00','09:00','10:00','11:00','12:00'].map((t: string) => <AntOption key={t} value={t}>{t}</AntOption>)}
                  </AntSelect>
                  <Text type="secondary">to</Text>
                  <AntSelect size="small" value={h.close} disabled={!h.enabled} onChange={(v: string) => updateOfficeHour(idx, 'close', v)} style={{ width: 90 }}>
                    {['14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map((t: string) => <AntOption key={t} value={t}>{t}</AntOption>)}
                  </AntSelect>
                  {!h.enabled && <Tag>Closed</Tag>}
                </div>
              ))}
            </div>
            <Button type="primary" style={{ marginTop: 16, background: '#b40101', borderColor: '#b40101', height: 40 }} icon={<CheckCircleOutlined />} onClick={saveOfficeHours}>
              Save Office Hours
            </Button>
          </AntCard>
        </Col>
      </Row>
    </div>
  );
}
