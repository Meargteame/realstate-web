import React, { useState } from "react";
import { Card, Tag, Typography, Space } from "antd";
import { EnvironmentOutlined, HeartOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text, Paragraph } = Typography;

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <Link to={`/properties/${property.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div 
        style={{ 
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
      >
        {/* Photo Container */}
        <div style={{ position: 'relative', height: '220px', width: '100%', background: '#f1f5f9', overflow: 'hidden' }}>
          <img
            alt={property.address}
            src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />

          {/* Status Badge */}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{ 
              background: property.status === 'For Rent' ? '#1d4ed8' : '#b40101', 
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {property.status || 'FOR SALE'}
            </span>
          </div>

          {/* Property Type Badge */}
          {property.propertyType && (
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span style={{ 
                background: 'rgba(15, 23, 42, 0.8)', 
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {property.propertyType}
              </span>
            </div>
          )}

          {/* Save Heart Button */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 12, 
              right: 12,
              background: '#ffffff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <HeartOutlined style={{ fontSize: '16px', color: '#b40101' }} />
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 20px' }}>
          {/* Price */}
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {formatCurrency(property.price)}
          </div>

          {/* Specs */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            <span><strong>{property.beds}</strong> bds</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span><strong>{property.baths}</strong> ba</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span><strong>{property.sqft?.toLocaleString()}</strong> sqft</span>
          </div>

          {/* Full Address */}
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {property.address}, {property.city}, {property.state} {property.zip}
          </div>

          {/* Footer Line */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
              {property.agent?.name || 'TORRA Commercial Group'}
            </span>
            <ArrowRightOutlined style={{ color: '#b40101', fontSize: '14px' }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
