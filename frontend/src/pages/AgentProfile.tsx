import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Layout, Row, Col, Typography, Avatar, Button, Space, 
  Card, Tag, Divider, Breadcrumb, Form, Input, notification 
} from "antd";
import { 
  PhoneOutlined, MailOutlined, StarFilled, 
  GlobalOutlined, CheckCircleOutlined, ArrowRightOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import PropertyCard from "@/components/PropertyCard";

const { Title, Text, Paragraph } = Typography;

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then(res => res.json())
      .then(data => {
        setAgent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const onFinish = (values: any) => {
    notification.success({
      message: 'Message Sent',
      description: `Your message to ${agent.name} has been successfully sent.`,
    });
  };

  if (loading) return <div style={{ padding: '200px', textAlign: 'center' }}><Title level={3}>Loading Agent Summary...</Title></div>;
  if (!agent) return <div style={{ padding: '200px', textAlign: 'center' }}><Title level={2}>Agent Not Found</Title></div>;

  const agentListings = agent.properties || [];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '96px' }}>
      {/* Profile Header Block */}
      <div style={{ background: 'white', borderBottom: '1px solid #d9d9d9', padding: '64px 64px 48px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Breadcrumb items={[{ title: <a href="/">Home</a> }, { title: <a href="/agents">Agents</a> }, { title: agent.name }]} style={{ marginBottom: '32px' }} />
          
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={6}>
               <Avatar 
                size={220} 
                src={agent.imageUrl} 
                style={{ 
                  border: '8px solid white', 
                  boxShadow: '0 16px 32px rgba(0,0,0,0.1)',
                  backgroundColor: '#f0f2f5' 
                }} 
              />
            </Col>
            <Col xs={24} md={18}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <Title style={{ fontSize: '64px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
                      {agent.name}
                    </Title>
                    <Text strong style={{ fontSize: '20px', color: '#b40101', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '12px 0 24px' }}>
                      {agent.brokerage || "Keller Williams® Premier Realty"}
                    </Text>
                  </div>
                  <Space size="middle">
                     <Button icon={<StarFilled style={{ color: '#faad14' }} />} shape="round" style={{ fontWeight: 'bold' }}>4.9 Rating</Button>
                     <Button type="primary" shape="round" icon={<GlobalOutlined />} style={{ background: '#373a4b', borderColor: '#373a4b', fontWeight: 'bold' }}>Explore Listings</Button>
                  </Space>
               </div>

               <Divider style={{ margin: '24px 0' }} />

               <Row gutter={48}>
                  <Col>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <Text strong style={{ fontSize: '24px', fontWeight: 900 }}>{agentListings.length}</Text>
                       <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 900 }}>Active Listings</Text>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <Text strong style={{ fontSize: '24px', fontWeight: 900 }}>{agent.yearsExperience || 12}</Text>
                       <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 900 }}>Years Exp.</Text>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <Text strong style={{ fontSize: '24px', fontWeight: 900 }}>$45M+</Text>
                       <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 900 }}>Sales Volume</Text>
                    </div>
                  </Col>
               </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ maxWidth: '1400px', margin: '64px auto 0', padding: '0 64px' }}>
        <Row gutter={64}>
          <Col xs={24} lg={16}>
             <section style={{ marginBottom: '64px' }}>
                <Title level={2} style={{ textTransform: 'uppercase', fontWeight: 900, borderBottom: '4px solid black', paddingBottom: '16px', marginBottom: '32px' }}>
                  Biography
                </Title>
                <Paragraph style={{ fontSize: '18px', lineHeight: 1.8, color: '#4b5563' }}>
                  {agent.bio || `As a lead specialist at Keller Williams®, ${agent.name} is dedicated to providing an unparalleled real estate experience. With a deep understanding of market dynamics and a commitment to excellence, they ensure every client achieves their property goals with precision and care.`}
                </Paragraph>
             </section>

             <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '4px solid black', paddingBottom: '16px' }}>
                   <Title level={2} style={{ textTransform: 'uppercase', fontWeight: 900, margin: 0 }}>Active Listings</Title>
                   <Link to="/properties" style={{ fontWeight: 'bold', color: '#b40101' }}>VIEW ALL <ArrowRightOutlined /></Link>
                </div>
                
                <Row gutter={[24, 24]}>
                   {agentListings.map((prop: any) => (
                     <Col xs={24} md={12} key={prop.id}>
                        <PropertyCard property={prop} />
                     </Col>
                   ))}
                   {agentListings.length === 0 && (
                     <Col span={24}>
                        <Card style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                           <Text type="secondary" strong style={{ textTransform: 'uppercase' }}>Currently no active listings in this market.</Text>
                        </Card>
                     </Col>
                   )}
                </Row>
             </section>
          </Col>

          <Col xs={24} lg={8}>
             <Card 
               style={{ borderRadius: '16px', border: 'none', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', position: 'sticky', top: '100px' }}
               styles={{ body: { padding: '32px' } }}
             >
                <Title level={3} style={{ textAlign: 'center', textTransform: 'uppercase', fontWeight: 900, marginBottom: '32px' }}>
                  Inquire With {agent.name.split(' ')[0]}
                </Title>
                
                <Form layout="vertical" onFinish={onFinish}>
                   <Form.Item name="name" rules={[{ required: true }]}><Input size="large" placeholder="FULL NAME" style={{ borderRadius: '24px' }} /></Form.Item>
                   <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input size="large" placeholder="EMAIL ADDRESS" style={{ borderRadius: '24px' }} /></Form.Item>
                   <Form.Item name="phone" rules={[{ required: true }]}><Input size="large" placeholder="PHONE NUMBER" style={{ borderRadius: '24px' }} /></Form.Item>
                   <Form.Item name="message"><Input.TextArea rows={4} placeholder="HOW CAN I HELP?" style={{ borderRadius: '16px' }} /></Form.Item>
                   <Button type="primary" block size="large" htmlType="submit" style={{ background: '#b40101', borderColor: '#b40101', height: '56px', fontWeight: 900, borderRadius: '28px', marginTop: '16px' }}>
                     SEND MESSAGE
                   </Button>
                </Form>

                <Divider style={{ margin: '24px 0' }} />
                <div style={{ textAlign: 'center' }}>
                   <Space direction="vertical" size="small">
                      <Space><PhoneOutlined style={{ color: '#b40101' }} /> <Text strong>{agent.phone}</Text></Space>
                      <Space><MailOutlined style={{ color: '#b40101' }} /> <Text strong>{agent.email}</Text></Space>
                   </Space>
                </div>
             </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
