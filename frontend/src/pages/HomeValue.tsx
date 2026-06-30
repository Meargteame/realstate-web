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
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text, Paragraph } = Typography;

export default function HomeValue() {
  const isMobile = useIsMobile();
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
          type: 'valuation_request',
          source: 'home_value_tool'
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
        position: 'relative', height: isMobile ? 'auto' : '420px', minHeight: isMobile ? '350px' : '420px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        padding: isMobile ? '48px 0' : 0
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80")`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '0 16px', maxWidth: '900px' }}>
          <Title style={{ color: 'white', fontSize: isMobile ? '36px' : '64px', fontWeight: 900, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            What Is Your Home Worth?
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '16px' : '22px', marginTop: '16px' }}>
            Get a free, data-driven home valuation from a TORRA certified local expert. No strings attached.
          </Paragraph>
        </div>
      </section>

      {/* Value Props */}
      <div style={{ background: '#111827', padding: isMobile ? '24px 16px' : '40px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row justify="center" gutter={[isMobile ? 16 : 64, isMobile ? 16 : 0]}>
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
      <div style={{ maxWidth: '760px', margin: isMobile ? '40px auto' : '80px auto', padding: isMobile ? '0 16px' : '0 32px' }}>
        {submitted ? (
          <AntCard style={{ borderRadius: '16px', textAlign: 'center', padding: isMobile ? '24px 16px' : '48px 32px', boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
            <CheckCircleOutlined style={{ fontSize: isMobile ? '56px' : '80px', color: '#b40101', display: 'block', marginBottom: '24px' }} />
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

            <div style={{ padding: isMobile ? '24px 16px' : '48px' }}>
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
                    style={{ height: isMobile ? '48px' : '64px', borderRadius: isMobile ? '24px' : '32px', fontSize: isMobile ? '16px' : '18px', marginBottom: '16px' }}
                  />

                  <Button
                    type="primary" block size="large"
                    disabled={!address.trim()}
                    onClick={handleAddressSubmit}
                    style={{ background: '#b40101', borderColor: '#b40101', height: isMobile ? '48px' : '64px', fontWeight: 900, borderRadius: isMobile ? '24px' : '32px', fontSize: isMobile ? '16px' : '18px' }}
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
                        <Button block size="large" onClick={() => setStep(0)} style={{ height: isMobile ? '48px' : '56px', borderRadius: isMobile ? '24px' : '28px', fontWeight: 'bold' }}>
                          ← Back
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button type="primary" block size="large" htmlType="submit"
                          style={{ background: '#b40101', borderColor: '#b40101', height: isMobile ? '48px' : '56px', fontWeight: 900, borderRadius: isMobile ? '24px' : '28px' }}>
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
        <section style={{ background: '#111827', padding: isMobile ? '48px 16px' : '80px 64px', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', fontSize: isMobile ? '26px' : '38px' }}>
            Not Ready to Sell? We Can Still Help.
          </Title>
          <Paragraph style={{ color: '#9ca3af', fontSize: isMobile ? '15px' : '18px', marginBottom: isMobile ? '24px' : '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Explore local listings, find a TORRA agent, or calculate your mortgage payments.
          </Paragraph>
          <Row justify="center" gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
            <Col><Link to="/properties"><Button size={isMobile ? "middle" : "large"} style={{ height: isMobile ? '44px' : '56px', padding: isMobile ? '0 20px' : '0 40px', borderRadius: isMobile ? '22px' : '28px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>Browse Listings</Button></Link></Col>
            <Col><Link to="/agents"><Button size={isMobile ? "middle" : "large"} type="primary" style={{ height: isMobile ? '44px' : '56px', padding: isMobile ? '0 20px' : '0 40px', borderRadius: isMobile ? '22px' : '28px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px', background: '#b40101', borderColor: '#b40101' }}>Find an Agent</Button></Link></Col>
            <Col><Link to="/mortgage-calculator"><Button size={isMobile ? "middle" : "large"} ghost style={{ height: isMobile ? '44px' : '56px', padding: isMobile ? '0 20px' : '0 40px', borderRadius: isMobile ? '22px' : '28px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px', color: 'white', borderColor: 'white' }}>Mortgage Calculator</Button></Link></Col>
          </Row>
        </section>
      )}
    </div>
  );
}
