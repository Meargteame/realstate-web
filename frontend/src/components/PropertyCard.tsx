import React from "react";
import { Card, Tag, Typography, Space, Button } from "antd";
import { HomeOutlined, EnvironmentOutlined, ArrowRightOutlined } from "@ant-design/icons";
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
    <AntCard
      hoverable
      style={{ 
        width: '100%', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #f0f0f0',
        transition: 'transform 0.3s ease'
      }}
      cover={
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img
            alt={property.address}
            src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <Tag color="#b40101" style={{ fontWeight: 'bold', borderRadius: '4px', border: 'none' }}>
              {property.status || 'ACTIVE'}
            </Tag>
          </div>
          {property.type && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <Tag style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', fontWeight: 'bold' }}>
                {property.type.toUpperCase()}
              </Tag>
            </div>
          )}
        </div>
      }
    >
      <div style={{ padding: '4px' }}>
        <Title level={4} style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>
          {formatCurrency(property.price)}
        </Title>
        <Paragraph style={{ color: '#555', fontSize: '15px', marginBottom: '16px', fontWeight: 500 }} ellipsis={{ rows: 1 }}>
          <EnvironmentOutlined style={{ marginRight: '8px', color: '#b40101' }} />
          {property.address}, {property.city}
        </Paragraph>

        <Space split={<div style={{ width: '1px', height: '12px', background: '#d9d9d9' }} />} size="middle" style={{ marginBottom: '20px' }}>
          <Text style={{ fontSize: '14px' }} strong>{property.bedrooms} <span style={{ fontWeight: 'normal', color: '#8c8c8c' }}>bds</span></Text>
          <Text style={{ fontSize: '14px' }} strong>{property.bathrooms} <span style={{ fontWeight: 'normal', color: '#8c8c8c' }}>ba</span></Text>
          <Text style={{ fontSize: '14px' }} strong>{property.sqft?.toLocaleString()} <span style={{ fontWeight: 'normal', color: '#8c8c8c' }}>sqft</span></Text>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {property.agent?.imageUrl && (
              <img src={property.agent.imageUrl} style={{ width: 24, height: 24, borderRadius: '50%' }} />
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>Listed by KW® {property.agent?.name || 'Expert'}</Text>
          </div>
          <Link to={`/properties/${property.id}`}>
            <Button type="text" icon={<ArrowRightOutlined />} style={{ color: '#b40101' }} />
          </Link>
        </div>
      </div>
    </AntCard>
  );
}
