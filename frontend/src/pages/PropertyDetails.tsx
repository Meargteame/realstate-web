import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Layout, Button, Typography, Row, Col, Space, Card, Tag, 
  Tabs, Form, Input, Avatar, Divider, Breadcrumb, notification, Result
} from "antd";
import { 
  ArrowLeftOutlined, ShareAltOutlined, HeartOutlined, 
  EnvironmentOutlined, CheckCircleOutlined, UserOutlined,
  DollarOutlined, HomeOutlined, AreaChartOutlined
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        if(data?.agent) setAgent(data.agent);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleLeadSubmit = async (values: any) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          agentId: property.agentId,
          propertyId: property.id,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      notification.success({ message: 'Request Sent', description: `Your inquiry for ${property.address} has been sent to ${agent?.name}.` });
    } catch (err) {
      notification.error({ message: 'Error', description: 'Something went wrong. Please try again.' });
    }
  };

  if (loading) return <div style={{ padding: '200px', textAlign: 'center' }}><Title level={3}>Loading Luxury Listing...</Title></div>;
  if (!property) return <div style={{ padding: '200px', textAlign: 'center' }}><Result status="404" title="Property Not Found" extra={<Link to="/properties"><Button type="primary">Back to Search</Button></Link>} /></div>;

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price);

  return (
    <div style={{ background: '#f4f4f4', paddingBottom: '96px', borderTop: '2px solid black' }}>
      
      {/* Top Navigation */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 64px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: '#8c8c8c', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <ArrowLeftOutlined /> BACK TO ALL LISTINGS
        </Link>
        <Space>
           <Button icon={<ShareAltOutlined />}>SHARE</Button>
           <Button type="primary" icon={<HeartOutlined />} style={{ background: '#111827', borderColor: '#111827' }}>SAVE</Button>
        </Space>
      </div>

      {/* Hero Image Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 64px 48px' }}>
        <Row gutter={24} style={{ height: '600px' }}>
          <Col span={16} style={{ height: '100%' }}>
            <div style={{ position: 'relative', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
               {property.status !== 'Active' && (
                 <Tag color="#b40101" style={{ position: 'absolute', top: 16, left: 16, padding: '8px 16px', fontWeight: 900, borderRadius: '4px' }}>{property.status.toUpperCase()}</Tag>
               )}
               <img src={property.imageUrl} alt={property.address} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </Col>
          <Col span={8} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
             <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1544984243-ec57ea16facd?auto=format&fit=crop&w=600&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                   <Title level={4} style={{ color: 'white', margin: 0 }}>VIEW ALL PHOTOS</Title>
                </div>
             </div>
          </Col>
        </Row>
      </div>

      {/* Content Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 64px' }}>
        <Row gutter={64}>
          {/* Left Column */}
          <Col span={15}>
            <div style={{ marginBottom: '48px', borderBottom: '4px solid black', paddingBottom: '32px' }}>
              <Row justify="space-between" align="bottom" style={{ marginBottom: '32px' }}>
                <Col><Title style={{ margin: 0, fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>{formattedPrice}</Title></Col>
                <Col>
                  <Card size="small" style={{ background: '#111827', color: 'white', borderRadius: '4px' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>Est. Payment: ${(property.price * 0.0055).toFixed(0)}/mo</Text>
                  </Card>
                </Col>
              </Row>

              <div style={{ display: 'flex', background: 'white', border: '1px solid #d9d9d9', borderRadius: '12px', height: '100px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0f0f0' }}>
                    <Title level={3} style={{ margin: 0 }}>{property.bedrooms}</Title>
                    <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Beds</Text>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0f0f0' }}>
                    <Title level={3} style={{ margin: 0 }}>{property.bathrooms}</Title>
                    <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Baths</Text>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Title level={3} style={{ margin: 0 }}>{property.sqft.toLocaleString()}</Title>
                    <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Sq Ft</Text>
                 </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                  <EnvironmentOutlined style={{ color: '#b40101', marginRight: '16px' }} />
                  {property.address}, {property.city}, {property.state} {property.zip}
                </Title>
              </div>
            </div>

            <Card bordered={false} style={{ borderRadius: '24px', padding: '16px', marginBottom: '48px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }}>
               <Title level={3} style={{ textTransform: 'uppercase', fontWeight: 900, marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>Property Overview</Title>
               <Paragraph style={{ fontSize: '18px', color: '#4b5563', lineHeight: 1.8 }}>
                 Beautifully maintained {property.propertyType?.toLowerCase() || 'home'} in the highly sought-after neighborhood of {property.city}. 
                 This home offers a spacious open floor plan, abundant natural light, and modern finishes throughout. 
                 The gourmet kitchen features quartz countertops and stainless appliances.
               </Paragraph>
            </Card>

            <div style={{ background: '#111827', borderRadius: '12px', padding: '40px', color: 'white' }}>
               <Title level={3} style={{ color: 'white', textTransform: 'uppercase', fontWeight: 900, marginBottom: '32px' }}>Key Features</Title>
               <Row gutter={[32, 24]}>
                  {['Hardwood Floors', 'Quartz Countertops', '2-Car Garage', 'Fenced Backyard', 'Central AC', 'Open Layout'].map((f, i) => (
                    <Col span={12} key={i}>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#b40101' }} />
                        <Text style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{f}</Text>
                      </Space>
                    </Col>
                  ))}
               </Row>
            </div>
          </Col>

          {/* Right Column - Sticky Form */}
          <Col span={9}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <Card style={{ borderRadius: '12px', padding: '8px', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
                {agent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                     <Avatar size={64} src={agent.imageUrl} icon={<UserOutlined />} />
                     <div>
                        <Link to={`/agents/${agent.id}`}>
                           <Title level={4} style={{ margin: 0, fontWeight: 900 }}>{agent.name}</Title>
                        </Link>
                        <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{agent.brokerage}</Text>
                     </div>
                  </div>
                )}

                <Title level={4} style={{ textAlign: 'center', textTransform: 'uppercase', fontWeight: 900, marginBottom: '24px' }}>Inquire About Residence</Title>
                
                {submitted ? (
                  <Result status="success" title="Inquiry Sent" subTitle="The agent will contact you shortly." />
                ) : (
                  <Form layout="vertical" form={form} onFinish={handleLeadSubmit}>
                    <Form.Item name="name" rules={[{ required: true }]}><Input size="large" placeholder="FULL NAME" style={{ borderRadius: '24px' }} /></Form.Item>
                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input size="large" placeholder="EMAIL ADDRESS" style={{ borderRadius: '24px' }} /></Form.Item>
                    <Form.Item name="phone" rules={[{ required: true }]}><Input size="large" placeholder="PHONE NUMBER" style={{ borderRadius: '24px' }} /></Form.Item>
                    <Form.Item name="message"><Input.TextArea rows={4} placeholder="ANY QUESTIONS?" style={{ borderRadius: '16px' }} /></Form.Item>
                    <Button type="primary" block size="large" htmlType="submit" style={{ background: '#b40101', borderColor: '#b40101', height: '56px', fontWeight: 900, borderRadius: '28px', marginTop: '8px' }}>
                      CONTACT AGENT
                    </Button>
                  </Form>
                )}
                <Divider style={{ margin: '16px 0' }} />
                <Text type="secondary" style={{ fontSize: '10px', textAlign: 'center', display: 'block', textTransform: 'uppercase' }}>
                  By submitting, you agree to our terms of service.
                </Text>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
