import React from "react";
import { Card, Tag, Typography, Space, Button } from "antd";
import { HomeOutlined, EnvironmentOutlined, ArrowRightOutlined, HeartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const AntCard = Card as any;

  return (
    <Link to={`/properties/${property.id}`} style={{ display: 'block' }}>
      <AntCard
        hoverable
        style={{ 
          width: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid #f0f0f0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          background: 'white'
        }}
        styles={{ body: { padding: 0 } }}
        onMouseEnter={(e: any) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
          e.currentTarget.style.borderColor = '#b40101';
        }}
        onMouseLeave={(e: any) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}
        cover={
          <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
            <img
              alt={property.address}
              src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            
            {/* Favorite Button */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b40101';
                e.currentTarget.querySelector('svg')!.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                e.currentTarget.querySelector('svg')!.style.color = '#b40101';
              }}
            >
              <HeartOutlined style={{ fontSize: '18px', color: '#b40101', transition: 'color 0.2s' }} />
            </div>
            
            {/* Status Badge */}
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <Tag 
                color="#b40101" 
                style={{ 
                  fontWeight: 700, 
                  borderRadius: '6px', 
                  border: 'none',
                  padding: '6px 12px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 8px rgba(180,1,1,0.3)'
                }}
              >
                {property.status || 'ACTIVE'}
              </Tag>
            </div>
            
            {/* Property Type Badge */}
            {property.propertyType && (
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                <Tag 
                  style={{ 
                    background: 'rgba(0,0,0,0.7)', 
                    color: 'white', 
                    border: 'none', 
                    fontWeight: 600,
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {property.propertyType}
                </Tag>
              </div>
            )}
          </div>
        }
      >
        <div style={{ padding: '24px' }}>
          {/* Price */}
          <Title 
            level={3} 
            style={{ 
              margin: '0 0 12px', 
              fontSize: '32px', 
              fontWeight: 900,
              color: '#b40101',
              letterSpacing: '-0.01em'
            }}
          >
            {formatCurrency(property.price)}
          </Title>
          
          {/* Address */}
          <Paragraph 
            style={{ 
              color: '#374151', 
              fontSize: '16px', 
              marginBottom: '20px', 
              fontWeight: 500,
              lineHeight: 1.5
            }} 
            ellipsis={{ rows: 1 }}
          >
            <EnvironmentOutlined style={{ marginRight: '8px', color: '#6b7280' }} />
            {property.address}, {property.city}
          </Paragraph>

          {/* Property Stats */}
          <Space 
            split={<div style={{ width: '1px', height: '16px', background: '#e5e7eb' }} />} 
            size="large" 
            style={{ marginBottom: '24px' }}
          >
            <Text style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
              {property.beds} <span style={{ fontWeight: 400, color: '#6b7280' }}>beds</span>
            </Text>
            <Text style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
              {property.baths} <span style={{ fontWeight: 400, color: '#6b7280' }}>baths</span>
            </Text>
            <Text style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
              {property.sqft?.toLocaleString()} <span style={{ fontWeight: 400, color: '#6b7280' }}>sqft</span>
            </Text>
          </Space>

          {/* Agent Info */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: '1px solid #f3f4f6', 
              paddingTop: '20px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {property.agent?.imageUrl && (
                <img 
                  src={property.agent.imageUrl} 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid #f3f4f6'
                  }} 
                />
              )}
              <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
                {property.agent?.name || 'TORRA Expert'}
              </Text>
            </div>
            <ArrowRightOutlined 
              style={{ 
                color: '#b40101', 
                fontSize: 18,
                transition: 'transform 0.2s'
              }} 
            />
          </div>
        </div>
      </AntCard>
    </Link>
  );
}
