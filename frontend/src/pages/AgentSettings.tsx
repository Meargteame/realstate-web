import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Avatar, Upload, Space, message, Row, Col, Divider } from "antd";
import { useOutletContext } from "react-router-dom";
import { UserOutlined, UploadOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const AntCard = Card as any;

export default function AgentSettings() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

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
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ fontSize: '24px', fontWeight: 500, marginBottom: 24, color: '#111827' }}>Account Settings</Title>
      
      <Row gutter={24}>
        <Col span={8}>
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
            <Text type="secondary" style={{ fontSize: '13px' }}>Keller Williams Premier Realty</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
               <Text style={{ color: '#6b7280', fontSize: '13px' }}>Role:</Text> <Text style={{ fontSize: '13px' }}>Licensed Associate Broker</Text><br />
               <Text style={{ color: '#6b7280', fontSize: '13px' }}>Member Since:</Text> <Text style={{ fontSize: '13px' }}>Oct 2023</Text>
            </div>
          </AntCard>
        </Col>

        <Col span={16}>
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
    </div>
  );
}
