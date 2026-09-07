import React, { useRef, useState } from "react";
import { Button, Row, Col, Typography, Input, Form, Card, Space, Divider, notification } from "antd";
import { CheckCircleOutlined, RiseOutlined, HomeOutlined, BookOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text, Paragraph } = Typography;

export default function BecomeAgent() {
  const formRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Combine firstName and lastName
      const fullName = `${values.firstName} ${values.lastName}`;
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: values.email,
          phone: values.phone || '',
          message: `Agent Recruitment Inquiry: ${fullName} is interested in becoming a TORRA agent. Phone: ${values.phone}`,
          type: 'agent_inquiry'
          // Note: Backend will auto-assign to first available agent if no agentId provided
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      notification.success({
        message: 'Application Received!',
        description: 'Thank you for your interest in joining TORRA Commercial Real Estate Group. A recruiter will contact you within 24 hours.',
        duration: 6
      });
      
      // Reset form after successful submission
      form.resetFields();
      
    } catch (error) {
      notification.error({
        message: 'Submission Error',
        description: 'Something went wrong. Please try again or call us directly at (469) 345-6868.',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f4f4f4' }}>
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        background: '#111827', 
        padding: isMobile ? '60px 16px' : '120px 64px',
        color: 'white',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'url("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          filter: 'grayscale(100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[64, 64]} align="middle">
            <Col xs={24} md={14}>
              <Title style={{ color: 'white', fontSize: isMobile ? '36px' : '72px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '24px' }}>
                Build Your Business With <span style={{ color: '#b40101' }}>TORRA</span>
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '16px' : '24px', textTransform: 'uppercase', fontWeight: 'bold', borderLeft: '4px solid #b40101', paddingLeft: '24px', marginBottom: isMobile ? '32px' : '48px' }}>
                Join a premier commercial real estate group driven by innovation and excellence.
              </Paragraph>
              <Space size="large">
                <Button type="primary" size="large" onClick={scrollToForm} style={{ background: '#b40101', borderColor: '#b40101', height: isMobile ? '48px' : '64px', padding: isMobile ? '0 24px' : '0 48px', fontWeight: 900, borderRadius: isMobile ? '24px' : '32px' }}>
                  APPLY TODAY
                </Button>
                <Button size="large" ghost onClick={scrollToForm} style={{ height: isMobile ? '48px' : '64px', padding: isMobile ? '0 24px' : '0 48px', fontWeight: 900, borderRadius: isMobile ? '24px' : '32px', color: 'white', borderColor: 'white' }}>
                  LEARN MORE
                </Button>
              </Space>
            </Col>
            
            <Col xs={24} md={10}>
              <div ref={formRef}>
                <Card bordered={false} style={{ borderRadius: '24px', padding: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}>
                  <Title level={3} style={{ textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Join Our Network</Title>
                  <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', marginBottom: '32px' }}>Take the first step toward a thriving career.</Text>
                  
                  <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Row gutter={12}>
                      <Col span={12}><Form.Item name="firstName" rules={[{ required: true, message: 'Required' }]}><Input size="large" placeholder="FIRST NAME" style={{ borderRadius: '24px' }} /></Form.Item></Col>
                      <Col span={12}><Form.Item name="lastName" rules={[{ required: true, message: 'Required' }]}><Input size="large" placeholder="LAST NAME" style={{ borderRadius: '24px' }} /></Form.Item></Col>
                    </Row>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}><Input size="large" placeholder="EMAIL ADDRESS" style={{ borderRadius: '24px' }} /></Form.Item>
                    <Form.Item name="phone" rules={[{ required: true, message: 'Phone required' }]}><Input size="large" placeholder="PHONE NUMBER" style={{ borderRadius: '24px' }} /></Form.Item>
                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      htmlType="submit" 
                      loading={loading}
                      disabled={loading}
                      style={{ background: '#b40101', borderColor: '#b40101', height: isMobile ? '48px' : '64px', fontWeight: 900, borderRadius: '32px', marginTop: '16px' }}
                    >
                      {loading ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
                    </Button>
                  </Form>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Value Prop Section */}
      <section style={{ padding: isMobile ? '48px 16px' : '128px 64px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <Title level={2} style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: 900, textTransform: 'uppercase', marginBottom: isMobile ? '16px' : '24px' }}>Why Choose Us?</Title>
          <div style={{ width: '80px', height: '8px', background: '#b40101', margin: '0 auto 32px' }} />
          <Paragraph style={{ fontSize: isMobile ? '15px' : '18px', color: '#8c8c8c', fontWeight: 'bold', textTransform: 'uppercase', maxWidth: '800px', margin: '0 auto' }}>
            We believe that real estate is a local business, driven by individual agents and their local image.
          </Paragraph>
        </div>

        <Row gutter={isMobile ? [16, 24] : [48, 48]}>
          {[
            { icon: <BookOutlined />, title: "Industry-Leading Training", color: '#b40101', desc: "Ranked the #1 training organization across all industries worldwide. Continuous education for agents at every level." },
            { icon: <RiseOutlined />, title: "Uncapped Earning", color: '#111827', desc: "Our unique commission structure and profit-sharing model means there's no limit to what you can achieve." },
            { icon: <HomeOutlined />, title: "Advanced Technology", color: 'white', textColor: 'black', desc: "Your own personalized CRM, mobile app, and marketing platform powered by Command." }
          ].map((item, i) => (
            <Col xs={24} md={8} key={i}>
              <Card hoverable style={{ height: '100%', borderRadius: '0', border: '1px solid #f0f0f0', padding: '24px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: item.color, 
                  color: item.textColor || 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '32px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                  {item.icon}
                </div>
                <Title level={3} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px' }}>{item.title}</Title>
                <Paragraph style={{ color: '#555', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', lineHeight: 1.8 }}>
                  {item.desc}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Footer CTA */}
      <section style={{ background: '#b40101', padding: isMobile ? '48px 16px' : '96px 64px', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', fontSize: isMobile ? '28px' : '56px', fontWeight: 900, marginBottom: '48px', textTransform: 'uppercase' }}>Ready to Accelerate Your Career?</Title>
        <Button size="large" onClick={scrollToForm} style={{ height: isMobile ? '48px' : '64px', padding: isMobile ? '0 32px' : '0 64px', fontWeight: 900, borderRadius: isMobile ? '24px' : '32px', fontSize: isMobile ? '14px' : '16px' }}>
          SCHEDULE A CONFIDENTIAL MEETING
        </Button>
      </section>

    </div>
  );
}
