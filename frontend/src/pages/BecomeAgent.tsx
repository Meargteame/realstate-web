import React from "react";
import { Button, Row, Col, Typography, Input, Form, Card, Space, Divider } from "antd";
import { CheckCircleOutlined, RiseOutlined, HomeOutlined, BookOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function BecomeAgent() {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div style={{ background: '#f4f4f4' }}>
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        background: '#111827', 
        padding: '120px 64px',
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
              <Title style={{ color: 'white', fontSize: '72px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '24px' }}>
                Build Your Business With <span style={{ color: '#b40101' }}>Keller Williams</span>
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '24px', textTransform: 'uppercase', fontWeight: 'bold', borderLeft: '4px solid #b40101', paddingLeft: '24px', marginBottom: '48px' }}>
                Join the world's largest real estate technology franchise by agent count.
              </Paragraph>
              <Space size="large">
                <Button type="primary" size="large" style={{ background: '#b40101', borderColor: '#b40101', height: '64px', padding: '0 48px', fontWeight: 900, borderRadius: '32px' }}>
                  APPLY TODAY
                </Button>
                <Button size="large" ghost style={{ height: '64px', padding: '0 48px', fontWeight: 900, borderRadius: '32px', color: 'white', borderColor: 'white' }}>
                  LEARN MORE
                </Button>
              </Space>
            </Col>
            
            <Col xs={24} md={10}>
              <Card bordered={false} style={{ borderRadius: '24px', padding: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}>
                <Title level={3} style={{ textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Join Our Network</Title>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', marginBottom: '32px' }}>Take the first step toward a thriving career.</Text>
                
                <Form layout="vertical" onFinish={onFinish}>
                  <Row gutter={12}>
                    <Col span={12}><Form.Item name="firstName" rules={[{ required: true }]}><Input size="large" placeholder="FIRST NAME" style={{ borderRadius: '24px' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="lastName" rules={[{ required: true }]}><Input size="large" placeholder="LAST NAME" style={{ borderRadius: '24px' }} /></Form.Item></Col>
                  </Row>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input size="large" placeholder="EMAIL ADDRESS" style={{ borderRadius: '24px' }} /></Form.Item>
                  <Form.Item name="phone" rules={[{ required: true }]}><Input size="large" placeholder="PHONE NUMBER" style={{ borderRadius: '24px' }} /></Form.Item>
                  <Button type="primary" block size="large" style={{ background: '#111827', borderColor: '#111827', height: '64px', fontWeight: 900, borderRadius: '32px', marginTop: '16px' }}>
                    SUBMIT INQUIRY
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Value Prop Section */}
      <section style={{ padding: '128px 64px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <Title level={2} style={{ fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '24px' }}>Why Choose Us?</Title>
          <div style={{ width: '80px', height: '8px', background: '#b40101', margin: '0 auto 32px' }} />
          <Paragraph style={{ fontSize: '18px', color: '#8c8c8c', fontWeight: 'bold', textTransform: 'uppercase', maxWidth: '800px', margin: '0 auto' }}>
            We believe that real estate is a local business, driven by individual agents and their local image.
          </Paragraph>
        </div>

        <Row gutter={[48, 48]}>
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
      <section style={{ background: '#b40101', padding: '96px 64px', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', fontSize: '56px', fontWeight: 900, marginBottom: '48px', textTransform: 'uppercase' }}>Ready to Accelerate Your Career?</Title>
        <Button size="large" style={{ height: '64px', padding: '0 64px', fontWeight: 900, borderRadius: '32px', fontSize: '16px' }}>
          SCHEDULE A CONFIDENTIAL MEETING
        </Button>
      </section>

    </div>
  );
}
