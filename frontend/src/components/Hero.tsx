import React, { useState } from "react";
import { Input, Button, Card, Typography, Space, Tabs } from "antd";
import { SearchOutlined, HomeOutlined, BankOutlined, ShopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const query = searchValue.trim();
    let url = `/properties?status=${activeTab === 'rent' ? 'For Rent' : activeTab === 'sold' ? 'Sold' : 'Active'}`;
    if (activeTab === 'commercial') {
      url += '&type=Commercial';
    }
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    navigate(url);
  };

  const tabs = [
    { key: "buy", label: "Buy", icon: <HomeOutlined /> },
    { key: "rent", label: "Rent", icon: <BankOutlined /> },
    { key: "commercial", label: "Commercial", icon: <ShopOutlined /> },
    { key: "sold", label: "Recently Sold", icon: <CheckCircleOutlined /> },
  ];

  return (
    <section style={{ 
      position: 'relative', 
      height: isMobile ? '90vh' : '85vh', 
      minHeight: isMobile ? '580px' : '720px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e222d 0%, #373a4b 100%)'
    }}>
      {/* High-res Background Image with Subtle Animation */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.38,
          transform: 'scale(1.02)',
          transition: 'transform 10s ease-out'
        }} 
      />
      
      {/* Multi-layered Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(30, 34, 45, 0.4) 0%, rgba(17, 24, 39, 0.85) 100%)'
      }} />

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1100px', 
        width: '100%', 
        padding: '0 20px',
        textAlign: 'center', 
        color: 'white' 
      }}>
        {/* Luxury Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            background: 'rgba(180, 1, 1, 0.2)',
            border: '1px solid rgba(180, 1, 1, 0.5)',
            color: '#ff6b6b',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: isMobile ? '11px' : '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)'
          }}>
            Torra Commercial & Residential Platform
          </span>
        </div>

        {/* Main Headline */}
        <Title 
          style={{ 
            color: 'white', 
            fontSize: isMobile ? '36px' : '68px', 
            fontWeight: 900, 
            marginBottom: isMobile ? '12px' : '20px', 
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          Discover Extraordinary Real Estate
        </Title>
        
        {/* Subheadline */}
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: isMobile ? '15px' : '20px', 
            display: 'block', 
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}
        >
          Explore premier residential estates, commercial investments, and market insights tailored by top agents.
        </Text>

        {/* Clean Light Search Card */}
        <Card 
          style={{ 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: isMobile ? '4px' : '8px',
            background: '#ffffff',
          }}
          styles={{ body: { padding: isMobile ? '12px' : '20px' } }}
        >
          {/* Category Tabs */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              gap: '4px', 
              background: '#f1f3f5', 
              padding: '4px', 
              borderRadius: '10px' 
            }}>
              {tabs.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: isMobile ? '6px 12px' : '8px 20px',
                      borderRadius: '8px',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? '#b40101' : 'transparent',
                      color: isActive ? '#ffffff' : '#4b5563',
                      boxShadow: isActive ? '0 4px 12px rgba(180, 1, 1, 0.3)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Space.Compact style={{ width: '100%' }}>
            <Input 
              size="large" 
              placeholder={activeTab === 'rent' ? "Search rentals by city, ZIP, or keyword..." : "Search properties by address, city, or neighborhood..."} 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#b40101', fontSize: '18px' }} />}
              style={{ 
                height: isMobile ? '46px' : '56px', 
                borderRadius: '12px 0 0 12px',
                fontSize: isMobile ? '14px' : '17px',
                border: '2px solid #e5e7eb',
                fontWeight: 500
              }} 
            />
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              style={{ 
                height: isMobile ? '46px' : '56px', 
                borderRadius: '0 12px 12px 0',
                background: '#b40101',
                borderColor: '#b40101',
                width: isMobile ? '90px' : '150px',
                fontWeight: 700,
                fontSize: isMobile ? '13px' : '16px',
                letterSpacing: '0.05em'
              }}
            >
              SEARCH
            </Button>
          </Space.Compact>
        </Card>

        {/* Trending Searches */}
        <div style={{ marginTop: '28px' }}>
           <Space size="small" wrap justify="center">
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: isMobile ? '11px' : '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Popular Locations:
              </Text>
              {['Austin, TX', 'Charlotte, NC', 'Miami, FL', 'Denver, CO'].map(city => (
                <Text 
                  key={city}
                  style={{ 
                    color: 'white', 
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 600,
                    padding: isMobile ? '4px 10px' : '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.background = '#b40101';
                    e.currentTarget.style.borderColor = '#b40101';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => navigate(`/properties?q=${city.split(',')[0]}`)}
                >
                  {city}
                </Text>
              ))}
           </Space>
        </div>
      </div>
    </section>
  );
}

