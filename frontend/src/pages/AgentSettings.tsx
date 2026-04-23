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

  useEffect(() => {
    if (parentAgent) {
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

  const onFinish = (values: any) => {
    setLoading(true);
    // Mock save
    setTimeout(() => {
      setLoading(false);
      message.success("Profile updated successfully.");
    }, 1000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: 24 }}>Account Settings</Title>
      
      <Row gutter={24}>
        <Col span={8}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <Avatar size={120} src={parentAgent?.imageUrl} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <div style={{ marginBottom: 16 }}>
              <Upload showUploadList={false}>
                <Button icon={<UploadOutlined />}>Change Photo</Button>
              </Upload>
            </div>
            <Title level={4} style={{ margin: 0 }}>{parentAgent?.name}</Title>
            <Text type="secondary">Keller Williams Premier Realty</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
               <Text strong>Role:</Text> <Text>Licensed Associate Broker</Text><br />
               <Text strong>Member Since:</Text> <Text>Oct 2023</Text>
            </div>
          </AntCard>
        </Col>

        <Col span={16}>
          <AntCard bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Title level={4} style={{ marginBottom: 24 }}>Personal Information</Title>
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
                <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ background: '#b40101', borderColor: '#b40101', height: 48, padding: '0 40px' }} icon={<SaveOutlined />}>
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
