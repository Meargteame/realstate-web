import React, { useState } from "react";
import { Input, Button, Card, Typography, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

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
      height: '80vh', 
      minHeight: '600px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#111'
    }}>
      {/* Background Image */}
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6
        }} 
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%', padding: '0 24px', textAlign: 'center', color: 'white' }}>
        <Title style={{ color: 'white', fontSize: '64px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-2px' }}>
          Serve. Real estate. Refined.
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px', display: 'block', marginBottom: '48px' }}>
          Discover the difference of working with the world's largest real estate community.
        </Text>

        <Card 
          style={{ 
            borderRadius: '16px', 
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            border: 'none',
            padding: '8px'
          }}
          styles={{ body: { padding: '16px' } }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              size="large" 
              placeholder="Enter an address, neighborhood, city, or ZIP code" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ 
                height: '64px', 
                borderRadius: '8px 0 0 8px',
                fontSize: '18px',
                border: '1px solid #d9d9d9'
              }} 
            />
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              style={{ 
                height: '64px', 
                borderRadius: '0 8px 8px 0',
                background: '#b40101',
                borderColor: '#b40101',
                width: '120px',
                fontWeight: 'bold'
              }}
            >
              SEARCH
            </Button>
          </Space.Compact>
        </Card>

        <div style={{ marginTop: '32px' }}>
           <Space size="large">
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Trending:</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => navigate('/properties?q=Austin')}>Austin, TX</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => navigate('/properties?q=Charlotte')}>Charlotte, NC</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => navigate('/properties?q=Miami')}>Miami, FL</Text>
           </Space>
        </div>
      </div>
    </section>
  );
}
