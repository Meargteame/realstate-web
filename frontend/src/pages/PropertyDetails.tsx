import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Button, Typography, Row, Col, Space, Card, Tag, 
  Avatar, Divider, notification, Result, Modal, Image
} from "antd";
import { 
  ArrowLeftOutlined, ShareAltOutlined, HeartOutlined, HeartFilled,
  EnvironmentOutlined, CheckCircleOutlined, UserOutlined,
  MessageOutlined, PhoneOutlined, MailOutlined,
  ExpandOutlined, DollarOutlined, CalculatorOutlined
} from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import PropertyChatModal from "../components/PropertyChatModal";
import PropertyCard from "../components/PropertyCard";
import { useIsMobile } from "../hooks/useBreakpoint";

const formatPrice = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const { Title, Text, Paragraph } = Typography;

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [hasExistingChat, setHasExistingChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mortgageDown, setMortgageDown] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [mortgageYears, setMortgageYears] = useState(30);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const isMobile = useIsMobile();

  const calcMonthlyPayment = (price: number) => {
    const principal = price * (1 - mortgageDown / 100);
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = mortgageYears * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  // Mock gallery images
  const galleryImages = [
    property?.imageUrl,
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544984243-ec57ea16facd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80"
  ].filter(Boolean);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        if(data?.agent) setAgent(data.agent);
        
        // Check if there's an existing conversation
        if (data?.id && data?.agent?.id) {
          const storageKey = `conversation_${data.id}_${data.agent.id}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setHasExistingChat(true);
            // Check for unread messages
            try {
              const convData = JSON.parse(stored);
              checkUnreadMessages(convData.conversationId);
            } catch (error) {
              console.error('Error parsing stored conversation:', error);
            }
          }
        }
        
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });
    
    // Fetch similar properties
    fetch(`/api/properties/${id}/similar?limit=4`)
      .then(res => res.json())
      .then(data => {
        setSimilarProperties(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error fetching similar properties:', err));

    // Fetch price history (drives the price-trend chart)
    fetch(`/api/properties/${id}/price-history`)
      .then(res => res.json())
      .then(data => setPriceHistory(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching price history:', err));
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: property.address,
      text: `Check out this property: ${property.address}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      notification.success({
        message: 'Link Copied',
        description: 'Property link copied to clipboard!',
        duration: 3
      });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    notification.success({
      message: isSaved ? 'Removed from Favorites' : 'Saved to Favorites',
      description: isSaved ? 'Property removed from your saved list.' : 'Property saved! Sign in to sync across devices.',
      duration: 3
    });
  };

  const checkUnreadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversation/${conversationId}`);
      if (!res.ok) return;
      const messages = await res.json();
      
      // Get last read timestamp from localStorage
      const lastReadKey = `lastRead_${conversationId}`;
      const lastReadTime = localStorage.getItem(lastReadKey);
      
      if (lastReadTime) {
        const unread = messages.filter((msg: any) => 
          msg.senderType === 'agent' && new Date(msg.createdAt) > new Date(lastReadTime)
        ).length;
        setUnreadCount(unread);
      } else {
        // First time - count all agent messages
        const unread = messages.filter((msg: any) => msg.senderType === 'agent').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  // Poll for new messages periodically when there's an existing chat
  useEffect(() => {
    if (!hasExistingChat || !property?.id || !agent?.id) return;
    
    const storageKey = `conversation_${property.id}_${agent.id}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    
    try {
      const convData = JSON.parse(stored);
      
      // Check immediately
      checkUnreadMessages(convData.conversationId);
      
      // Then check every 10 seconds
      const interval = setInterval(() => {
        checkUnreadMessages(convData.conversationId);
      }, 10000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error setting up message polling:', error);
    }
  }, [hasExistingChat, property?.id, agent?.id]);

  if (loading) return (
    <div style={{ padding: '200px', textAlign: 'center', background: '#f8f9fa' }}>
      <Title level={3}>Loading Property...</Title>
    </div>
  );
  
  if (!property) return (
    <div style={{ padding: '200px', textAlign: 'center' }}>
      <Result 
        status="404" 
        title="Property Not Found" 
        extra={
          <Link to="/properties">
            <Button type="primary" size="large">Back to Search</Button>
          </Link>
        } 
      />
    </div>
  );

  const formattedPrice = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(property.price);

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px' : '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/properties">
            <Button icon={<ArrowLeftOutlined />} type="text" size={isMobile ? "middle" : "large"}>
              {isMobile ? "Back" : "Back to Listings"}
            </Button>
          </Link>
          <Space size={isMobile ? "small" : "middle"}>
            <Button 
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              size={isMobile ? "middle" : "large"}
            >
              {isMobile ? "" : "Share"}
            </Button>
            <Button 
              icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleSave}
              type={isSaved ? "primary" : "default"}
              danger={isSaved}
              size={isMobile ? "middle" : "large"}
            >
              {isMobile ? "" : (isSaved ? 'Saved' : 'Save')}
            </Button>
          </Space>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px' : '24px 32px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
          gridTemplateRows: isMobile ? '250px' : '300px 300px',
          gap: isMobile ? '8px' : '12px',
          borderRadius: isMobile ? '12px' : '16px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              gridRow: isMobile ? 'auto' : '1 / 3',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            onClick={() => setShowGallery(true)}
          >
            <img 
              src={property.imageUrl} 
              alt={property.address}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            {property.status && property.status !== 'Active' && (
              <Tag 
                color="red" 
                style={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              >
                {property.status.toUpperCase()}
              </Tag>
            )}
          </div>
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div 
              key={idx}
              style={{ 
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => setShowGallery(true)}
            >
              <img 
                src={img} 
                alt={`Property ${idx + 2}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              {idx === 3 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Space direction="vertical" align="center">
                    <ExpandOutlined style={{ fontSize: 32 }} />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                      View All Photos
                    </Text>
                  </Space>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 64px' }}>
        <Row gutter={32}>
          {/* Left Column - Property Details */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: '16px', marginBottom: '24px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Price and Address */}
                <div>
                  <Space align="center" wrap style={{ marginBottom: 4 }}>
                    {property.isVerified && (
                      <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
                        Verified Listing
                      </Tag>
                    )}
                    {typeof property.dataQuality === 'number' && property.dataQuality > 0 && (
                      <Tag color={property.dataQuality >= 80 ? 'blue' : 'default'}>
                        {property.dataQuality}% complete
                      </Tag>
                    )}
                  </Space>
                  <Title level={1} style={{ margin: 0, fontSize: 48, fontWeight: 700 }}>
                    {formattedPrice}
                  </Title>
                  <Title level={4} style={{ margin: '8px 0 0', fontWeight: 400, color: '#595959' }}>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {property.address}, {property.city}, {property.state} {property.zip}
                  </Title>
                </div>

                <Divider style={{ margin: 0 }} />

                {/* Property Stats */}
                <Row gutter={24}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8f9fa', borderRadius: 12 }}>
                      <Title level={2} style={{ margin: 0 }}>{property.beds || 0}</Title>
                      <Text type="secondary">Bedrooms</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8f9fa', borderRadius: 12 }}>
                      <Title level={2} style={{ margin: 0 }}>{property.baths || 0}</Title>
                      <Text type="secondary">Bathrooms</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8f9fa', borderRadius: 12 }}>
                      <Title level={2} style={{ margin: 0 }}>
                        {property.sqft ? property.sqft.toLocaleString() : 'N/A'}
                      </Title>
                      <Text type="secondary">Sq Ft</Text>
                    </div>
                  </Col>
                </Row>

                {/* Property Facts (surfaces previously-unused schema fields) */}
                {(() => {
                  const facts: { label: string; value: any }[] = [];
                  if (property.propertyType) facts.push({ label: 'Type', value: property.propertyType });
                  if (property.yearBuilt) facts.push({ label: 'Year Built', value: property.yearBuilt });
                  if (property.lotSize) facts.push({ label: 'Lot Size', value: `${property.lotSize.toLocaleString()} sqft` });
                  if (property.condition) facts.push({ label: 'Condition', value: property.condition });
                  if (typeof property.daysOnMarket === 'number') facts.push({ label: 'Days on Market', value: property.daysOnMarket });
                  if (property.stories) facts.push({ label: 'Stories', value: property.stories });
                  if (property.hoaFees) facts.push({ label: 'HOA', value: `${formatPrice(property.hoaFees)}/mo` });
                  if (typeof property.viewCount === 'number') facts.push({ label: 'Views', value: property.viewCount.toLocaleString() });
                  if (facts.length === 0) return null;
                  return (
                    <>
                      <Divider style={{ margin: 0 }} />
                      <Row gutter={[16, 16]}>
                        {facts.map((f) => (
                          <Col xs={12} sm={8} key={f.label}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>{f.label}</Text>
                            <Text strong style={{ fontSize: 15 }}>{f.value}</Text>
                          </Col>
                        ))}
                      </Row>
                    </>
                  );
                })()}

                <Divider style={{ margin: 0 }} />

                {/* Description */}
                <div>
                  <Title level={4}>About This Property</Title>
                  <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#595959' }}>
                    Beautifully maintained {property.propertyType?.toLowerCase() || 'home'} in the highly sought-after 
                    neighborhood of {property.city}. This home offers a spacious open floor plan, abundant natural light, 
                    and modern finishes throughout. The gourmet kitchen features quartz countertops and stainless appliances. 
                    Perfect for families or anyone looking for comfortable living in a prime location.
                  </Paragraph>
                </div>

                {/* Key Features (from real property data, with sensible fallback) */}
                <div>
                  <Title level={4}>Key Features</Title>
                  <Row gutter={[16, 16]}>
                    {(
                      (Array.isArray(property.features) && property.features.length > 0)
                        ? property.features
                        : ['Hardwood Floors', 'Central Air', 'Updated Kitchen', 'Walk-in Closets']
                    ).map((feature: string, idx: number) => (
                      <Col span={12} key={idx}>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                          <Text style={{ fontSize: 15 }}>{feature}</Text>
                        </Space>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Price History chart (real PropertyPriceHistory data) */}
                {priceHistory.length > 1 && (
                  <div>
                    <Title level={4}>Price History</Title>
                    <div style={{ width: '100%', height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistory.map((h: any) => ({
                          date: new Date(h.changedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                          price: h.price,
                          changeType: h.changeType
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} width={60} />
                          <RechartsTooltip formatter={(v: any) => formatPrice(Number(v))} />
                          <Line type="monotone" dataKey="price" stroke="#b40101" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            {/* Similar Properties Section */}
            {similarProperties.length > 0 && (
              <Card style={{ borderRadius: '16px', marginTop: '24px' }}>
                <Title level={4} style={{ marginBottom: 24 }}>
                  You Might Also Like
                </Title>
                <Row gutter={[16, 16]}>
                  {similarProperties.map((prop: any) => (
                    <Col xs={24} sm={12} key={prop.id}>
                      <PropertyCard property={prop} />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </Col>

          {/* Right Column - Agent Card (Sticky) */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 100 }}>
              <Card 
                style={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
                }}
              >
                {agent && (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Agent Info */}
                    <div style={{ textAlign: 'center' }}>
                      <Avatar 
                        size={80} 
                        src={agent.imageUrl} 
                        icon={<UserOutlined />}
                        style={{ marginBottom: 16 }}
                      />
                      <Title level={4} style={{ margin: 0 }}>{agent.name}</Title>
                      <Text type="secondary">{agent.brokerage}</Text>
                    </div>

                    <Divider style={{ margin: 0 }} />

                    {/* Contact Buttons */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<MessageOutlined />}
                        onClick={() => setShowChatModal(true)}
                        style={{
                          height: 50,
                          fontSize: 16,
                          fontWeight: 600,
                          borderRadius: 8,
                          background: hasExistingChat 
                            ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          position: 'relative'
                        }}
                      >
                        {hasExistingChat ? 'Continue Chat' : 'Message Agent'}
                        {unreadCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: '#ff4d4f',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </Button>

                      <Button
                        size="large"
                        block
                        icon={<PhoneOutlined />}
                        href={`tel:${agent.phone}`}
                        style={{
                          height: 50,
                          fontSize: 16,
                          borderRadius: 8
                        }}
                      >
                        Call Agent
                      </Button>

                      <Button
                        size="large"
                        block
                        icon={<MailOutlined />}
                        href={`mailto:${agent.email}`}
                        style={{
                          height: 50,
                          fontSize: 16,
                          borderRadius: 8
                        }}
                      >
                        Email Agent
                      </Button>
                    </Space>

                    <Divider style={{ margin: 0 }} />

                    {/* Agent Stats */}
                    <div>
                      <Row gutter={16}>
                        <Col span={12} style={{ textAlign: 'center' }}>
                          <Title level={3} style={{ margin: 0, color: '#667eea' }}>
                            {agent.totalSales || 0}
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12 }}>Sales</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'center' }}>
                          <Title level={3} style={{ margin: 0, color: '#667eea' }}>
                            {agent.rating || 5.0}★
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12 }}>Rating</Text>
                        </Col>
                      </Row>
                    </div>
                  </Space>
                )}
              </Card>

              {/* Mortgage Estimator */}
              <Card 
                style={{ 
                  borderRadius: '16px',
                  marginTop: '24px',
                  border: '2px solid #b40101'
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalculatorOutlined style={{ color: '#b40101', fontSize: 20 }} />
                    <Title level={5} style={{ margin: 0 }}>Est. Monthly Payment</Title>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #b40101 0%, #8a0000 100%)', 
                    borderRadius: 12, padding: '20px', textAlign: 'center' 
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Estimated Payment</Text>
                    <div style={{ color: 'white', fontSize: 36, fontWeight: 900 }}>
                      {property?.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(calcMonthlyPayment(property.price)) : 'N/A'}
                      <span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span>
                    </div>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 12 }}>Down Payment: {mortgageDown}%</Text>
                    <input 
                      type="range" min={5} max={50} value={mortgageDown}
                      onChange={(e) => setMortgageDown(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#b40101' }}
                    />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 12 }}>Interest Rate: {mortgageRate}%</Text>
                    <input 
                      type="range" min={1} max={12} step={0.1} value={mortgageRate}
                      onChange={(e) => setMortgageRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#b40101' }}
                    />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 12 }}>Loan Term: {mortgageYears} years</Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {[15, 20, 30].map(y => (
                        <Button 
                          key={y} size="small" 
                          type={mortgageYears === y ? 'primary' : 'default'}
                          onClick={() => setMortgageYears(y)}
                          style={mortgageYears === y ? { background: '#b40101', borderColor: '#b40101' } : {}}
                        >
                          {y}yr
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Link to="/mortgage-calculator">
                    <Button block icon={<DollarOutlined />} style={{ borderColor: '#b40101', color: '#b40101' }}>
                      Full Calculator
                    </Button>
                  </Link>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* Photo Gallery Modal */}
      <Modal
        open={showGallery}
        onCancel={() => setShowGallery(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>Property Photos</Title>
        <Image.PreviewGroup>
          <Row gutter={[16, 16]}>
            {galleryImages.map((img, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <Image
                  src={img}
                  alt={`Property photo ${idx + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }}
                />
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      </Modal>

      {/* Chat Modal */}
      <PropertyChatModal
        visible={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          // Mark messages as read
          const storageKey = `conversation_${property.id}_${agent.id}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const convData = JSON.parse(stored);
              const lastReadKey = `lastRead_${convData.conversationId}`;
              localStorage.setItem(lastReadKey, new Date().toISOString());
              setUnreadCount(0);
            } catch (error) {
              console.error('Error updating last read time:', error);
            }
          }
          setHasExistingChat(!!stored);
        }}
        property={property}
        agent={agent}
      />
    </div>
  );
}
