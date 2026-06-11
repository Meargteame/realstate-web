/**
 * TEMPLATE: Home Valuation Lead Funnel
 * Route: /home-value
 * PURPOSE: Seller acquisition engine. Converts seller intent into agent leads.
 * This is the single most important seller-side conversion funnel.
 */
import React, { useState } from "react";
import { Typography, Card, Form, Input, Button, Steps, Row, Col, notification } from "antd";
import type { FormProps } from "antd";
import { 
  HomeOutlined, UserOutlined, MailOutlined, 
  PhoneOutlined, CheckCircleOutlined, RiseOutlined, EnvironmentOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

export default function HomeValue() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  const handleAddressSubmit = () => {
    if (address.trim()) setStep(1);
  };

  const handleContactSubmit = async (values: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          phone: values.phone || '',
          message: `Home Valuation Request for: ${address}${values.timeline ? ` - Timeline: ${values.timeline}` : ''}`,
          type: 'valuation_request'
        })
      });

      if (!response.ok) throw new Error('Submission failed');
      
      setSubmitted(true);
    } catch (error) {
      notification.error({
        message: 'Submission Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  const AntCard = Card as any;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        position: 'relative', height: '420px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80")`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '0 32px', maxWidth: '900px' }}>
          <Title style={{ color: 'white', fontSize: '64px', fontWeight: 900, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            What Is Your Home Worth?
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22px', marginTop: '16px' }}>
            Get a free, data-driven home valuation from a TORRA certified local expert. No strings attached.
          </Paragraph>
        </div>
      </section>

      {/* Value Props */}
      <div style={{ background: '#111827', padding: '40px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row justify="center" gutter={[64, 0]}>
            {[
              { icon: <CheckCircleOutlined />, text: 'Free with No Obligation' },
              { icon: <RiseOutlined />, text: 'Powered by Real Market Data' },
              { icon: <UserOutlined />, text: 'Verified TORRA Agent Contact' },
            ].map((item, i) => (
              <Col key={i} style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '24px', color: '#b40101', marginBottom: '8px' }}>{item.icon}</div>
                <Text style={{ color: '#d1d5db', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}>{item.text}</Text>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Main Form Funnel */}
      <div style={{ maxWidth: '760px', margin: '80px auto', padding: '0 32px' }}>
        {submitted ? (
          <AntCard style={{ borderRadius: '16px', textAlign: 'center', padding: '48px 32px', boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
            <CheckCircleOutlined style={{ fontSize: '80px', color: '#b40101', display: 'block', marginBottom: '24px' }} />
            <Title level={2} style={{ fontWeight: 900 }}>Valuation Request Received!</Title>
            <Paragraph style={{ fontSize: '18px', color: '#555', maxWidth: '480px', margin: '0 auto 40px' }}>
              A local TORRA expert for <strong>{address}</strong> will contact you within 24 hours with your property's estimated market value.
            </Paragraph>
            <Row justify="center" gutter={16}>
              <Col><Link to="/properties"><Button type="primary" size="large" style={{ background: '#b40101', borderColor: '#b40101', borderRadius: '24px', height: '48px', fontWeight: 'bold' }}>Browse Listings</Button></Link></Col>
              <Col><Link to="/agents"><Button size="large" style={{ borderRadius: '24px', height: '48px', fontWeight: 'bold' }}>Find an Agent</Button></Link></Col>
            </Row>
          </AntCard>
        ) : (
          <AntCard style={{ borderRadius: '24px', border: 'none', boxShadow: '0 24px 64px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {/* Progress Steps */}
            <div style={{ background: '#111827', padding: '24px 32px' }}>
              <Steps
                current={step}
                items={[
                  { title: <span style={{ color: step >= 0 ? 'white' : '#6b7280' }}>Your Address</span>, icon: <HomeOutlined /> },
                  { title: <span style={{ color: step >= 1 ? 'white' : '#6b7280' }}>Contact Info</span>, icon: <UserOutlined /> },
                ]}
                style={{ '--ant-steps-finish-color': '#b40101' } as any}
              />
            </div>

            <div style={{ padding: '48px' }}>
              {step === 0 && (
                <div>
                  <Title level={3} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Step 1: Enter Your Property Address
                  </Title>
                  <Text type="secondary" style={{ display: 'block', fontSize: '16px', marginBottom: '40px' }}>
                    We'll analyze recent sales and market trends in your neighborhood.
                  </Text>

                  <Input
                    size="large"
                    placeholder="123 Main Street, Austin, TX 78701"
                    prefix={<EnvironmentOutlined style={{ color: '#b40101' }} />}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onPressEnter={handleAddressSubmit}
                    style={{ height: '64px', borderRadius: '32px', fontSize: '18px', marginBottom: '24px' }}
                  />

                  <Button
                    type="primary" block size="large"
                    disabled={!address.trim()}
                    onClick={handleAddressSubmit}
                    style={{ background: '#b40101', borderColor: '#b40101', height: '64px', fontWeight: 900, borderRadius: '32px', fontSize: '18px' }}
                  >
                    CONTINUE →
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <Title level={3} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Step 2: Where Should We Send Your Report?
                  </Title>
                  <Text type="secondary" style={{ display: 'block', fontSize: '16px', marginBottom: '32px' }}>
                    A TORRA local specialist will review <strong>{address}</strong> and deliver your free valuation.
                  </Text>

                  <Form layout="vertical" form={form} onFinish={handleContactSubmit}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="name" rules={[{ required: true }]}>
                          <Input size="large" placeholder="Full Name" prefix={<UserOutlined />} style={{ borderRadius: '24px' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="phone">
                          <Input size="large" placeholder="Phone (optional)" prefix={<PhoneOutlined />} style={{ borderRadius: '24px' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                      <Input size="large" placeholder="Email Address" prefix={<MailOutlined />} style={{ borderRadius: '24px' }} />
                    </Form.Item>
                    <Form.Item name="timeline">
                      <Input size="large" placeholder="When are you thinking of selling? (optional)" style={{ borderRadius: '24px' }} />
                    </Form.Item>
                    <Row gutter={16} style={{ marginTop: '16px' }}>
                      <Col span={12}>
                        <Button block size="large" onClick={() => setStep(0)} style={{ height: '56px', borderRadius: '28px', fontWeight: 'bold' }}>
                          ← Back
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button type="primary" block size="large" htmlType="submit"
                          style={{ background: '#b40101', borderColor: '#b40101', height: '56px', fontWeight: 900, borderRadius: '28px' }}>
                          GET FREE VALUATION
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}
            </div>
          </AntCard>
        )}

        {/* Trust Indicators */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              🔒 Your information is 100% private. TORRA never shares your data with third parties.
            </Text>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!submitted && (
        <section style={{ background: '#111827', padding: '80px 64px', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px' }}>
            Not Ready to Sell? We Can Still Help.
          </Title>
          <Paragraph style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Explore local listings, find a TORRA agent, or calculate your mortgage payments.
          </Paragraph>
          <Row justify="center" gutter={24}>
            <Col><Link to="/properties"><Button size="large" style={{ height: '56px', padding: '0 40px', borderRadius: '28px', fontWeight: 'bold' }}>Browse Listings</Button></Link></Col>
            <Col><Link to="/agents"><Button size="large" type="primary" style={{ height: '56px', padding: '0 40px', borderRadius: '28px', fontWeight: 'bold', background: '#b40101', borderColor: '#b40101' }}>Find an Agent</Button></Link></Col>
            <Col><Link to="/mortgage-calculator"><Button size="large" ghost style={{ height: '56px', padding: '0 40px', borderRadius: '28px', fontWeight: 'bold', color: 'white', borderColor: 'white' }}>Mortgage Calculator</Button></Link></Col>
          </Row>
        </section>
      )}
    </div>
  );
}
