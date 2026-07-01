import React, { useState } from "react";
import { Input, Button, Card, Typography, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/properties?q=${encodeURIComponent(searchValue)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <section style={{ 
      position: 'relative', 
      height: isMobile ? '100vh' : '85vh', 
      minHeight: isMobile ? '600px' : '700px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a1d2e 0%, #2a2d3a 100%)'
    }}>
      {/* Background Image with Overlay */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4
        }} 
      />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
      }} />

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1100px', 
        width: '100%', 
        padding: '0 16px',
        textAlign: 'center', 
        color: 'white' 
      }}>
        {/* Main Headline */}
        <Title 
          style={{ 
            color: 'white', 
            fontSize: isMobile ? '36px' : '72px', 
            fontWeight: 900, 
            marginBottom: isMobile ? '12px' : '24px', 
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          Find Your Dream Home
        </Title>
        
        {/* Subheadline */}
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: isMobile ? '16px' : '22px', 
            display: 'block', 
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 32px'
          }}
        >
          Discover exceptional properties with TORRA Commercial Real Estate Group
        </Text>

        {/* Enhanced Search Card */}
        <Card 
          style={{ 
            borderRadius: '12px', 
            boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
            border: 'none',
            padding: isMobile ? '4px' : '12px',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease'
          }}
          styles={{ body: { padding: isMobile ? '12px' : '20px' } }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              size="large" 
              placeholder="Search by city, ZIP, or address" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#b40101', fontSize: '16px' }} />}
              style={{ 
                height: '48px', 
                borderRadius: '12px 0 0 12px',
                fontSize: isMobile ? '14px' : '18px',
                border: '2px solid #f0f0f0',
                fontWeight: 500
              }} 
            />
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              style={{ 
                height: '48px', 
                borderRadius: '0 12px 12px 0',
                background: '#b40101',
                borderColor: '#b40101',
                width: isMobile ? '80px' : '140px',
                fontWeight: 700,
                fontSize: isMobile ? '12px' : '16px',
                letterSpacing: '0.05em'
              }}
            >
              SEARCH
            </Button>
          </Space.Compact>
        </Card>

        {/* Trending Searches */}
        <div style={{ marginTop: '24px' }}>
           <Space size="small" wrap>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: isMobile ? '11px' : '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Trending:
              </Text>
              {['Austin, TX', 'Charlotte, NC', 'Miami, FL', 'Denver, CO'].map(city => (
                <Text 
                  key={city}
                  style={{ 
                    color: 'white', 
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '15px',
                    fontWeight: 500,
                    padding: isMobile ? '4px 10px' : '8px 16px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.background = 'rgba(180,1,1,0.9)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
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
