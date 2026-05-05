import React, { useState } from 'react';
import { Card, Typography, Space, Button, Tooltip, Alert } from 'antd';
import { 
  EnvironmentOutlined, 
  BorderOutlined, 
  ClearOutlined,
  AimOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface Property {
  id: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  propertyType: string;
}

interface PropertyMapFallbackProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  height?: string;
  showControls?: boolean;
}

export default function PropertyMapFallback({ 
  properties, 
  onPropertySelect,
  height = '100%',
  showControls = true
}: PropertyMapFallbackProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  // Get marker color based on price
  const getMarkerColor = (price: number) => {
    if (price >= 2000000) return '#8B0000'; // Dark red for luxury
    if (price >= 1000000) return '#b40101'; // KW red for high-end
    if (price >= 500000) return '#DC143C'; // Crimson for mid-range
    return '#FF6B6B'; // Light red for affordable
  };

  // Handle property marker click
  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  // Filter properties with valid coordinates
  const validProperties = properties.filter(p => p.latitude && p.longitude);
  const propertiesWithoutCoords = properties.filter(p => !p.latitude || !p.longitude);

  return (
    <div style={{ height, position: 'relative', background: '#f0f2f5' }}>
      {/* Map Configuration Alert */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        right: '16px', 
        left: '16px',
        zIndex: 1000 
      }}>
        <Alert
          message="Map Configuration Required"
          description={
            <div>
              <Text style={{ fontSize: '12px' }}>
                To enable interactive maps, configure your Mapbox access token in the environment variables.
              </Text>
              <br />
              <Text code style={{ fontSize: '11px' }}>
                VITE_MAPBOX_ACCESS_TOKEN=your_token_here
              </Text>
            </div>
          }
          type="info"
          showIcon
          icon={<SettingOutlined />}
          closable
          style={{ fontSize: '12px' }}
        />
      </div>

      {/* Mock Map Background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'grayscale(100%) opacity(0.2)'
      }} />

      {/* Property Markers */}
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {validProperties.map((property, i) => (
          <div 
            key={property.id}
            onClick={() => handleMarkerClick(property)}
            style={{ 
              position: 'absolute',
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 12) % 60}%`,
              padding: '6px 10px',
              background: getMarkerColor(property.price),
              color: 'white',
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              zIndex: 2,
              borderRadius: '16px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -100%)'
            }}
          >
            {formatPrice(property.price)}
          </div>
        ))}
      </div>

      {/* Property Details Popup */}
      {selectedProperty && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001
        }}>
          <Card
            size="small"
            style={{ width: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            cover={
              <img
                alt={selectedProperty.address}
                src={selectedProperty.imageUrl}
                style={{ height: 180, objectFit: 'cover' }}
              />
            }
            actions={[
              <Button 
                type="text" 
                onClick={() => setSelectedProperty(null)}
                style={{ color: '#b40101' }}
              >
                Close
              </Button>
            ]}
          >
            <div style={{ padding: '8px 0' }}>
              <Text strong style={{ fontSize: '20px', color: '#b40101' }}>
                {formatPrice(selectedProperty.price)}
              </Text>
              <div style={{ marginTop: '6px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {selectedProperty.beds} bed • {selectedProperty.baths} bath • {selectedProperty.sqft.toLocaleString()} sqft
                </Text>
              </div>
              <div style={{ marginTop: '10px' }}>
                <Text style={{ fontSize: '14px' }}>
                  {selectedProperty.address}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedProperty.city}, {selectedProperty.state}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Drawing Controls */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 1000
        }}>
          <Card size="small" style={{ minWidth: 220 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '12px', color: '#666' }}>
                MAP TOOLS (DEMO MODE)
              </Text>
              
              <Space wrap size="small">
                <Tooltip title="Draw search area (requires Mapbox)">
                  <Button
                    size="small"
                    icon={<BorderOutlined />}
                    disabled
                  >
                    Draw Area
                  </Button>
                </Tooltip>
                
                <Tooltip title="Fit to all properties">
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    disabled
                  >
                    Fit All
                  </Button>
                </Tooltip>
                
                <Tooltip title="Clear search area">
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    disabled
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Space>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
                <Text style={{ fontSize: '11px', color: '#666' }}>
                  {validProperties.length} properties with coordinates
                </Text>
                {propertiesWithoutCoords.length > 0 && (
                  <>
                    <br />
                    <Text style={{ fontSize: '11px', color: '#ff6b6b' }}>
                      {propertiesWithoutCoords.length} properties need geocoding
                    </Text>
                  </>
                )}
              </div>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
}