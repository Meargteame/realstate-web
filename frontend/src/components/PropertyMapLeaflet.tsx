import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import { Card, Button, Space, Typography, Tooltip } from 'antd';
import { AimOutlined, ClearOutlined, BorderOutlined } from '@ant-design/icons';
import { useIsMobile } from "../hooks/useBreakpoint";

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
  const isMobile = useIsMobile();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clusterIndexRef = useRef<Supercluster | null>(null);
  const renderRef = useRef<() => void>(() => {});
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

    // Re-render clusters whenever the view changes.
    const handleViewChange = () => {
      renderRef.current();
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          north: b.getNorth(), south: b.getSouth(),
          east: b.getEast(), west: b.getWest()
        });
      }
    };
    map.on('moveend zoomend', handleViewChange);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend zoomend', handleViewChange);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const validProperties = properties.filter(p => p.latitude && p.longitude);

    // Build a supercluster index from the property points. Clustering happens
    // at query time per zoom level, so we render a bounded number of markers
    // instead of one DOM node per property (critical for 1000+ listings).
    const index = new Supercluster({ radius: 60, maxZoom: 16 });
    index.load(
      validProperties.map(p => ({
        type: 'Feature' as const,
        properties: { cluster: false, property: p },
        geometry: { type: 'Point' as const, coordinates: [p.longitude!, p.latitude!] }
      }))
    );
    clusterIndexRef.current = index;

    const render = () => {
      const map = mapRef.current;
      const idx = clusterIndexRef.current;
      if (!map || !idx) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()
      ];
      const zoom = Math.round(map.getZoom());
      const clusters = idx.getClusters(bbox, zoom);

      clusters.forEach((c: any) => {
        const [lng, lat] = c.geometry.coordinates;

        if (c.properties.cluster) {
          // Cluster bubble
          const count = c.properties.point_count as number;
          const size = count < 10 ? 36 : count < 50 ? 46 : 56;
          const clusterIcon = L.divIcon({
            className: 'cluster-marker',
            html: `
              <div style="
                background: #b40101; color: white;
                width: ${size}px; height: ${size}px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-weight: 700; font-size: 13px;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.35);
              ">${count}</div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });
          const marker = L.marker([lat, lng], { icon: clusterIcon }).addTo(map);
          marker.on('click', () => {
            const expansionZoom = Math.min(idx.getClusterExpansionZoom(c.properties.cluster_id), 18);
            map.setView([lat, lng], expansionZoom, { animate: true });
          });
          markersRef.current.push(marker);
        } else {
          // Individual property marker
          const property = c.properties.property as Property;
          const priceLabel = formatPrice(property.price);
          const markerColor = getMarkerColor(property.price);

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${markerColor};
                color: white; padding: 4px 8px; border-radius: 16px;
                font-size: 12px; font-weight: bold; border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap; text-align: center;
              ">${priceLabel}</div>
            `,
            iconSize: [60, 30],
            iconAnchor: [30, 30]
          });

          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 250px;">
              <img src="${property.imageUrl}" alt="${property.address}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" loading="lazy" />
              <div style="padding: 4px;">
                <div style="font-size: 18px; font-weight: bold; color: #b40101; margin-bottom: 4px;">$${property.price.toLocaleString()}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${property.beds} bed • ${property.baths} bath • ${property.sqft.toLocaleString()} sqft</div>
                <div style="font-size: 14px; margin-bottom: 4px;">${property.address}</div>
                <div style="font-size: 12px; color: #666;">${property.city}, ${property.state}</div>
              </div>
            </div>
          `);
          marker.on('click', () => {
            setSelectedProperty(property);
            if (onPropertySelect) onPropertySelect(property);
          });
          markersRef.current.push(marker);
        }
      });
    };

    renderRef.current = render;

    // Fit to all properties, then render clusters for the resulting view.
    if (validProperties.length > 0) {
      const bounds = L.latLngBounds(
        validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Card size="small" style={{ minWidth: isMobile ? 160 : 200 }}>
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
