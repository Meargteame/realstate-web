import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, Button, Space, Typography, Tooltip } from 'antd';
import { AimOutlined, ClearOutlined, BorderOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface PropertyMapLeafletProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
  onDrawComplete?: (area: any) => void;
  height?: string;
  showControls?: boolean;
}

export default function PropertyMapLeaflet({
  properties,
  onPropertySelect,
  onBoundsChange,
  onDrawComplete,
  height = '100%',
  showControls = true
}: PropertyMapLeafletProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 12);

    // Add OpenStreetMap tiles (FREE!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter properties with valid coordinates
    const validProperties = properties.filter(p => p.latitude && p.longitude);

    if (validProperties.length === 0) return;

    // Add markers for each property
    validProperties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      // Create custom icon with price
      const priceLabel = formatPrice(property.price);
      const markerColor = getMarkerColor(property.price);

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            color: white;
            padding: 4px 8px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            text-align: center;
          ">
            ${priceLabel}
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30]
      });

      const marker = L.marker([property.latitude, property.longitude], {
        icon: customIcon
      }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div style="min-width: 250px;">
          <img src="${property.imageUrl}" alt="${property.address}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
          <div style="padding: 4px;">
            <div style="font-size: 18px; font-weight: bold; color: #b40101; margin-bottom: 4px;">
              $${property.price.toLocaleString()}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
              ${property.beds} bed • ${property.baths} bath • ${property.sqft.toLocaleString()} sqft
            </div>
            <div style="font-size: 14px; margin-bottom: 4px;">
              ${property.address}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${property.city}, ${property.state}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedProperty(property);
        if (onPropertySelect) {
          onPropertySelect(property);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (validProperties.length > 0) {
      const bounds = L.latLngBounds(
        validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, onPropertySelect]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const getMarkerColor = (price: number) => {
    if (price >= 2000000) return '#8B0000';
    if (price >= 1000000) return '#b40101';
    if (price >= 500000) return '#DC143C';
    return '#FF6B6B';
  };

  const fitToProperties = () => {
    if (!mapRef.current) return;

    const validProperties = properties.filter(p => p.latitude && p.longitude);
    if (validProperties.length === 0) return;

    const bounds = L.latLngBounds(
      validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
    );
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const validProperties = properties.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ height, position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Controls */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000
        }}>
          <Card size="small" style={{ minWidth: 200 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '12px', color: '#666' }}>
                MAP TOOLS
              </Text>

              <Space wrap size="small">
                <Tooltip title="Fit to all properties">
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    onClick={fitToProperties}
                  >
                    Fit All
                  </Button>
                </Tooltip>
              </Space>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
                <Text style={{ fontSize: '11px', color: '#666' }}>
                  {validProperties.length} properties shown
                </Text>
              </div>

              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                Powered by OpenStreetMap (Free & Open Source)
              </div>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
}
