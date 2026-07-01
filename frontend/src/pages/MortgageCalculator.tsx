/**
 * TEMPLATE: Mortgage / Affordability Calculator
 * Route: /mortgage-calculator
 * Purpose: User engagement + lead capture funnel.
 * Every calculation ends with a "Match me with an agent" CTA.
 */
import React, { useState, useCallback } from "react";
import { Row, Col, Typography, Card, Slider, Form, Input, Button, Divider, Statistic, notification } from "antd";
import { DollarOutlined, BankOutlined, HomeOutlined, CalculatorOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text, Paragraph } = Typography;

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(7.2);
  const [loanTerm, setLoanTerm] = useState(30);

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount > 0 && monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - loanAmount;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const fmtMo = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const onLeadSubmit = async (values: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          phone: values.phone || '',
          message: `Mortgage Calculator Inquiry - Home Price: ${fmt(homePrice)}, Down Payment: ${fmt(downPayment)}, Monthly Payment: ${fmtMo(monthlyPayment)}`,
          type: 'mortgage_inquiry',
          source: 'mortgage_calculator'
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      notification.success({
        message: 'Agent Match Requested',
        description: "A TORRA certified mortgage specialist will contact you within 24 hours.",
        duration: 6
      });
    } catch (error) {
      notification.error({
        message: 'Submission Error',
        description: 'Something went wrong. Please try again.',
        duration: 4
      });
    }
  };

  const AntCard = Card as any;
  const isMobile = useIsMobile();
  const piPct = loanAmount / totalPaid * 100 || 0;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: '#111827', padding: isMobile ? '48px 16px' : '96px 64px', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <CalculatorOutlined style={{ fontSize: isMobile ? '36px' : '48px', color: '#b40101', marginBottom: '24px', display: 'block' }} />
          <Title style={{ color: 'white', fontSize: isMobile ? '32px' : '56px', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>
            Mortgage Calculator
          </Title>
          <Paragraph style={{ color: '#9ca3af', fontSize: isMobile ? '16px' : '20px', marginTop: '16px' }}>
            Estimate your monthly payment and connect with a TORRA certified home loan specialist.
          </Paragraph>
        </div>
      </section>

      {/* Calculator Body */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '32px 16px' : '80px 64px' }}>
        <Row gutter={[64, 64]}>
          {/* Controls Column */}
          <Col xs={24} lg={13}>
            <AntCard style={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }} styles={{ body: { padding: isMobile ? '24px' : '48px' } }}>
              <Title level={3} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '40px' }}>
                <HomeOutlined style={{ color: '#b40101', marginRight: '12px' }} /> Loan Details
              </Title>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Home Price</Text>
                  <Text strong style={{ fontSize: '18px', color: '#b40101' }}>{fmt(homePrice)}</Text>
                </div>
                <Slider
                  min={100000} max={5000000} step={25000}
                  value={homePrice} onChange={setHomePrice}
                  tooltip={{ formatter: (v) => fmt(v!) }}
                  trackStyle={{ backgroundColor: '#b40101' }}
                  handleStyle={{ borderColor: '#b40101' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>$100K</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>$5M</Text>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Down Payment ({downPaymentPct}%)</Text>
                  <Text strong style={{ fontSize: '18px', color: '#111827' }}>{fmt(downPayment)}</Text>
                </div>
                <Slider
                  min={3} max={50}
                  value={downPaymentPct} onChange={setDownPaymentPct}
                  tooltip={{ formatter: (v) => `${v}%` }}
                  trackStyle={{ backgroundColor: '#373a4b' }}
                  handleStyle={{ borderColor: '#373a4b' }}
                />
              </div>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Interest Rate</Text>
                  <Text strong style={{ fontSize: '18px', color: '#111827' }}>{interestRate.toFixed(1)}%</Text>
                </div>
                <Slider
                  min={2} max={12} step={0.1}
                  value={interestRate} onChange={setInterestRate}
                  tooltip={{ formatter: (v) => `${v?.toFixed(1)}%` }}
                  trackStyle={{ backgroundColor: '#373a4b' }}
                  handleStyle={{ borderColor: '#373a4b' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Loan Term</Text>
                  <Text strong style={{ fontSize: '18px', color: '#111827' }}>{loanTerm} years</Text>
                </div>
                <Slider
                  min={10} max={30} step={5}
                  value={loanTerm} onChange={setLoanTerm}
                  marks={{ 10: '10yr', 15: '15yr', 20: '20yr', 30: '30yr' }}
                  tooltip={{ formatter: (v) => `${v} years` }}
                  trackStyle={{ backgroundColor: '#373a4b' }}
                  handleStyle={{ borderColor: '#373a4b' }}
                />
              </div>
            </AntCard>
          </Col>

          {/* Results Column */}
          <Col xs={24} lg={11}>
            <div style={{ position: 'sticky', top: '100px' }}>
              {/* Main Payment Card */}
              <AntCard
                style={{ borderRadius: '16px', border: 'none', background: '#111827', marginBottom: '24px' }}
                styles={{ body: { padding: isMobile ? '24px' : '40px', textAlign: 'center' } }}
              >
                <Text style={{ color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
                  Estimated Monthly Payment
                </Text>
                <div style={{ color: 'white', fontSize: isMobile ? '40px' : '72px', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1 }}>
                  {fmtMo(monthlyPayment)}
                </div>
                <Text style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginTop: '8px' }}>
                  Principal & Interest · {loanTerm}-year fixed
                </Text>

                <Divider style={{ borderColor: '#1f2937', margin: '32px 0' }} />

                <Row gutter={24}>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: isMobile ? '18px' : '24px', fontWeight: 900 }}>{fmt(loanAmount)}</div>
                    <Text style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Loan Amount</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: isMobile ? '18px' : '24px', fontWeight: 900 }}>{fmt(totalInterest)}</div>
                    <Text style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Total Interest</Text>
                  </Col>
                </Row>
              </AntCard>

              {/* Lead Capture Card */}
              <AntCard style={{ borderRadius: '16px', border: '2px solid #b40101' }} styles={{ body: { padding: isMobile ? '24px' : '32px' } }}>
                <Title level={4} style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Ready to Get Pre-Approved?
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                  A TORRA certified loan specialist will find the best rate for you.
                </Text>
                <Form layout="vertical" onFinish={onLeadSubmit}>
                  <Form.Item name="name" rules={[{ required: true }]}>
                    <Input size="large" placeholder="Full Name" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" placeholder="Email Address" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Form.Item name="phone">
                    <Input size="large" placeholder="Phone Number" style={{ borderRadius: '24px' }} />
                  </Form.Item>
                  <Button type="primary" block size="large" htmlType="submit"
                    style={{ background: '#b40101', borderColor: '#b40101', height: isMobile ? '48px' : '56px', fontWeight: 900, borderRadius: '28px' }}>
                    MATCH ME WITH A LOAN SPECIALIST
                  </Button>
                </Form>
              </AntCard>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
