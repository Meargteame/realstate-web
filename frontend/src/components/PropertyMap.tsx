import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { Button, Card, Typography, Space, Tooltip } from 'antd';
import { 
  HomeOutlined, 
  EnvironmentOutlined, 
  BorderOutlined, 
  RadiusSettingOutlined,
  ClearOutlined,
  AimOutlined
} from '@ant-design/icons';
import PropertyMapFallback from './PropertyMapFallback';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const { Text } = Typography;

// Mapbox access token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidGVzdC1rdy1yZWFsZXN0YXRlIiwiYSI6ImNtNGZxeXg4ZGowMGNrMmpzN2V6YjBxbzJ5In0.demo-token-for-development';

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

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
  onDrawComplete?: (area: any) => void;
  height?: string;
  showControls?: boolean;
}

export default function PropertyMap({ 
  properties, 
  onPropertySelect, 
  onBoundsChange,
  onDrawComplete,
  height = '100%',
  showControls = true
}: PropertyMapProps) {
  // Check if Mapbox token is available
  const hasValidToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'pk.eyJ1IjoidGVzdC1rdy1yZWFsZXN0YXRlIiwiYSI6ImNtNGZxeXg4ZGowMGNrMmpzN2V6YjBxbzJ5In0.demo-token-for-development';

  // If no valid token, show fallback
  if (!hasValidToken) {
    return (
      <PropertyMapFallback
        properties={properties}
        onPropertySelect={onPropertySelect}
        height={height}
        showControls={showControls}
      />
    );
  }

  const mapRef = useRef<any>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewport, setViewport] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 12
  });
  const [drawMode, setDrawMode] = useState<'polygon' | 'circle' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Mapbox Draw
  useEffect(() => {
    if (mapRef.current && !drawRef.current) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles: [
          // Polygon fill
          {
            id: 'gl-draw-polygon-fill-inactive',
            type: 'fill',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'fill-color': '#b40101',
              'fill-outline-color': '#b40101',
              'fill-opacity': 0.1
            }
          },
          // Polygon stroke
          {
            id: 'gl-draw-polygon-stroke-inactive',
            type: 'line',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#b40101',
              'line-width': 3
            }
          },
          // Active polygon fill
          {
            id: 'gl-draw-polygon-fill-active',
            type: 'fill',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            paint: {
              'fill-color': '#b40101',
              'fill-outline-color': '#b40101',
              'fill-opacity': 0.2
            }
          },
          // Active polygon stroke
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#b40101',
              'line-width': 3
            }
          },
          // Vertices
          {
            id: 'gl-draw-polygon-and-line-vertex-active',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            paint: {
              'circle-radius': 6,
              'circle-color': '#b40101',
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 2
            }
          }
        ]
      });

      mapRef.current.addControl(draw);
      drawRef.current = draw;

      // Draw event listeners
      mapRef.current.on('draw.create', handleDrawCreate);
      mapRef.current.on('draw.update', handleDrawUpdate);
      mapRef.current.on('draw.delete', handleDrawDelete);
    }

    return () => {
      if (mapRef.current && drawRef.current) {
        mapRef.current.removeControl(drawRef.current);
        drawRef.current = null;
      }
    };
  }, []);

  // Handle draw events
  const handleDrawCreate = useCallback((e: any) => {
    const feature = e.features[0];
    if (feature && onDrawComplete) {
      onDrawComplete(feature);
    }
    setIsDrawing(false);
    setDrawMode(null);
  }, [onDrawComplete]);

  const handleDrawUpdate = useCallback((e: any) => {
    const feature = e.features[0];
    if (feature && onDrawComplete) {
      onDrawComplete(feature);
    }
  }, [onDrawComplete]);

  const handleDrawDelete = useCallback(() => {
    if (onDrawComplete) {
      onDrawComplete(null);
    }
  }, [onDrawComplete]);

  // Start drawing polygon
  const startPolygonDraw = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
      setDrawMode('polygon');
      setIsDrawing(true);
    }
  };

  // Start drawing circle (using polygon approximation)
  const startCircleDraw = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
      setDrawMode('circle');
      setIsDrawing(true);
    }
  };

  // Clear all drawings
  const clearDrawings = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setDrawMode(null);
      setIsDrawing(false);
      if (onDrawComplete) {
        onDrawComplete(null);
      }
    }
  };

  // Fit map to properties
  const fitToProperties = () => {
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    if (validProperties.length === 0) return;

    const bounds = validProperties.reduce(
      (bounds, property) => {
        return [
          [Math.min(bounds[0][0], property.longitude!), Math.min(bounds[0][1], property.latitude!)],
          [Math.max(bounds[1][0], property.longitude!), Math.max(bounds[1][1], property.latitude!)]
        ];
      },
      [[validProperties[0].longitude!, validProperties[0].latitude!], [validProperties[0].longitude!, validProperties[0].latitude!]]
    );

    mapRef.current?.fitBounds(bounds, { padding: 50 });
  };

  // Handle property marker click
  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

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

  // Filter properties with valid coordinates
  const validProperties = properties.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ height, position: 'relative' }}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={() => {
          // Fit to properties on load
          setTimeout(fitToProperties, 100);
        }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Property Markers */}
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.longitude!}
            latitude={property.latitude!}
            anchor="bottom"
          >
            <div
              onClick={() => handleMarkerClick(property)}
              style={{
                backgroundColor: getMarkerColor(property.price),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -100%)',
                whiteSpace: 'nowrap'
              }}
            >
              {formatPrice(property.price)}
            </div>
          </Marker>
        ))}

        {/* Property Popup */}
        {selectedProperty && (
          <Popup
            longitude={selectedProperty.longitude!}
            latitude={selectedProperty.latitude!}
            anchor="top"
            onClose={() => setSelectedProperty(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <Card
              size="small"
              style={{ width: 280, margin: 0 }}
              cover={
                <img
                  alt={selectedProperty.address}
                  src={selectedProperty.imageUrl}
                  style={{ height: 160, objectFit: 'cover' }}
                />
              }
            >
              <div style={{ padding: '8px 0' }}>
                <Text strong style={{ fontSize: '18px', color: '#b40101' }}>
                  {formatPrice(selectedProperty.price)}
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {selectedProperty.beds} bed • {selectedProperty.baths} bath • {selectedProperty.sqft.toLocaleString()} sqft
                  </Text>
                </div>
                <div style={{ marginTop: '8px' }}>
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
          </Popup>
        )}
      </Map>

      {/* Drawing Controls */}
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
                SEARCH TOOLS
              </Text>
              
              <Space wrap size="small">
                <Tooltip title="Draw search area">
                  <Button
                    size="small"
                    icon={<BorderOutlined />}
                    onClick={startPolygonDraw}
                    type={drawMode === 'polygon' ? 'primary' : 'default'}
                    style={drawMode === 'polygon' ? { backgroundColor: '#b40101', borderColor: '#b40101' } : {}}
                  >
                    Draw Area
                  </Button>
                </Tooltip>
                
                <Tooltip title="Fit to all properties">
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    onClick={fitToProperties}
                  >
                    Fit All
                  </Button>
                </Tooltip>
                
                <Tooltip title="Clear search area">
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={clearDrawings}
                    disabled={!drawMode && !isDrawing}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Space>

              {isDrawing && (
                <Text style={{ fontSize: '11px', color: '#b40101' }}>
                  Click to draw search boundary...
                </Text>
              )}

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
                <Text style={{ fontSize: '11px', color: '#666' }}>
                  {validProperties.length} properties shown
                </Text>
              </div>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
}