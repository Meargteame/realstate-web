import React, { useState } from "react";
import { Card, Form, InputNumber, Button, Typography, Row, Col, Divider, Space, Statistic, Input, notification } from "antd";
import { DollarOutlined, HomeOutlined, CalculatorOutlined, UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text, Paragraph } = Typography;
const AntCard = Card as any;

export default function AffordabilityCalculator() {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const [leadForm] = Form.useForm();
  const [result, setResult] = useState<any>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = async (values: any) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || '',
          message: `Affordability inquiry — Max home price: $${result?.homePrice?.toLocaleString()}, Monthly: $${result?.monthlyPayment?.toLocaleString()}/mo, DTI: ${result?.dtiRatio}%`,
          type: 'affordability_inquiry',
          source: 'affordability_calculator'
        })
      });
      if (!res.ok) throw new Error('failed');
      setLeadSubmitted(true);
      leadForm.resetFields();
      notification.success({
        message: 'Request Sent',
        description: 'A TORRA agent will reach out to help you find homes in your budget.',
        duration: 6
      });
    } catch {
      notification.error({ message: 'Submission failed', description: 'Please try again.' });
    }
  };

  const calculateAffordability = (values: any) => {
    const { annualIncome, monthlyDebts, downPayment, interestRate, loanTerm } = values;

    // Calculate monthly income
    const monthlyIncome = annualIncome / 12;

    // Calculate maximum monthly payment (28% front-end ratio)
    const maxMonthlyPayment = monthlyIncome * 0.28;

    // Calculate maximum total debt (36% back-end ratio)
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxHousingPayment = maxTotalDebt - monthlyDebts;

    // Use the lower of the two
    const affordableMonthlyPayment = Math.min(maxMonthlyPayment, maxHousingPayment);

    // Calculate loan amount based on monthly payment
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = loanTerm * 12;
    const loanAmount = affordableMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);

    // Calculate total home price
    const homePrice = loanAmount + downPayment;

    // Calculate debt-to-income ratio
    const dtiRatio = ((affordableMonthlyPayment + monthlyDebts) / monthlyIncome) * 100;

    setResult({
      homePrice: Math.round(homePrice),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(affordableMonthlyPayment),
      downPayment,
      dtiRatio: dtiRatio.toFixed(1),
      monthlyIncome: Math.round(monthlyIncome)
    });
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '32px 16px' : '64px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
          <Title level={1} style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900 }}>
            <CalculatorOutlined /> AFFORDABILITY CALCULATOR
          </Title>
          <Paragraph style={{ fontSize: isMobile ? 15 : 18, color: '#666' }}>
            Find out how much home you can afford based on your income and debts
          </Paragraph>
        </div>

        <Row gutter={32}>
          {/* Calculator Form */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '16px' }}>
              <Title level={3}>Your Financial Information</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={calculateAffordability}
                initialValues={{
                  annualIncome: 75000,
                  monthlyDebts: 500,
                  downPayment: 50000,
                  interestRate: 6.5,
                  loanTerm: 30
                }}
              >
                <Form.Item
                  label="Annual Gross Income"
                  name="annualIncome"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    prefix="$"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Monthly Debt Payments"
                  name="monthlyDebts"
                  rules={[{ required: true, message: 'Required' }]}
                  tooltip="Include car loans, credit cards, student loans, etc."
                >
                  <InputNumber
                    prefix="$"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Down Payment"
                  name="downPayment"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    prefix="$"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Interest Rate (%)"
                  name="interestRate"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    suffix="%"
                    size="large"
                    style={{ width: '100%' }}
                    step={0.1}
                    precision={2}
                  />
                </Form.Item>

                <Form.Item
                  label="Loan Term (years)"
                  name="loanTerm"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    min={10}
                    max={30}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<CalculatorOutlined />}
                  style={{
                    height: isMobile ? 48 : 56,
                    fontSize: 16,
                    fontWeight: 600,
                    background: '#b40101',
                    borderColor: '#b40101'
                  }}
                >
                  Calculate Affordability
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Results */}
          <Col xs={24} lg={12}>
            {result ? (
              <Card style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #b40101 0%, #8b0000 100%)', border: 'none' }}>
                <Title level={3} style={{ color: 'white', marginBottom: 32 }}>
                  You Can Afford
                </Title>

                <Card style={{ borderRadius: '12px', marginBottom: 16 }}>
                  <Statistic
                    title="Maximum Home Price"
                    value={result.homePrice}
                    prefix={<HomeOutlined />}
                    valueStyle={{ color: '#b40101', fontSize: isMobile ? 24 : 36, fontWeight: 900 }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </Card>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: '12px' }}>
                      <Statistic
                        title="Loan Amount"
                        value={result.loanAmount}
                        prefix="$"
                        valueStyle={{ fontSize: isMobile ? 18 : 24, fontWeight: 700 }}
                        formatter={(value) => value.toLocaleString()}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: '12px' }}>
                      <Statistic
                        title="Down Payment"
                        value={result.downPayment}
                        prefix="$"
                        valueStyle={{ fontSize: isMobile ? 18 : 24, fontWeight: 700 }}
                        formatter={(value) => value.toLocaleString()}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '24px 0' }} />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <Text style={{ color: 'white' }}>Monthly Payment:</Text>
                    <Text strong style={{ color: 'white', fontSize: 18 }}>
                      ${result.monthlyPayment.toLocaleString()}/mo
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <Text style={{ color: 'white' }}>Monthly Income:</Text>
                    <Text strong style={{ color: 'white', fontSize: 18 }}>
                      ${result.monthlyIncome.toLocaleString()}/mo
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <Text style={{ color: 'white' }}>Debt-to-Income Ratio:</Text>
                    <Text strong style={{ color: 'white', fontSize: 18 }}>
                      {result.dtiRatio}%
                    </Text>
                  </div>
                </Space>

                <Card style={{ marginTop: 24, background: 'rgba(255,255,255,0.1)', border: 'none' }}>
                  <Text style={{ color: 'white', fontSize: 12 }}>
                    <strong>Note:</strong> This is an estimate based on standard lending guidelines (28/36 rule).
                    Actual loan approval depends on credit score, employment history, and lender requirements.
                  </Text>
                </Card>
              </Card>
            ) : null}

            {/* Lead capture — only after results are calculated */}
            {result && (
              leadSubmitted ? (
                <AntCard style={{ borderRadius: 16, marginTop: 16, textAlign: 'center', borderColor: '#b7eb8f', background: '#f6ffed' }}>
                  <Title level={4} style={{ color: '#389e0d', marginBottom: 4 }}>You're all set! ✅</Title>
                  <Text type="secondary">A TORRA agent will contact you shortly to find homes in your budget.</Text>
                </AntCard>
              ) : (
                <AntCard style={{ borderRadius: 16, marginTop: 16 }}>
                  <Title level={4} style={{ marginTop: 0 }}>Ready to find homes in your budget?</Title>
                  <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                    Connect with a TORRA agent who can show you properties up to ${result.homePrice.toLocaleString()}.
                  </Paragraph>
                  <Form form={leadForm} layout="vertical" onFinish={handleLeadSubmit}>
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="name" rules={[{ required: true, message: 'Name required' }]} style={{ marginBottom: 12 }}>
                          <Input size="large" prefix={<UserOutlined />} placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]} style={{ marginBottom: 12 }}>
                          <Input size="large" prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="phone" style={{ marginBottom: 12 }}>
                      <Input size="large" prefix={<PhoneOutlined />} placeholder="Phone (optional)" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block style={{ height: 52, fontWeight: 600, background: '#b40101', borderColor: '#b40101' }}>
                      Connect with an Agent
                    </Button>
                  </Form>
                </AntCard>
              )
            )}

            {!result && (
              <Card style={{ borderRadius: '16px', textAlign: 'center', padding: isMobile ? '40px 16px' : '80px 20px' }}>
                <DollarOutlined style={{ fontSize: isMobile ? 40 : 64, color: '#d9d9d9', marginBottom: 16 }} />
                <Title level={4} type="secondary">
                  Enter your information to see results
                </Title>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
