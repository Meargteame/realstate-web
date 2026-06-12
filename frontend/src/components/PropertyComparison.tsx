import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Button, Space, Tag, Divider, message, Modal, Checkbox } from "antd";
import { CloseOutlined, SaveOutlined, ShareAltOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface PropertyComparisonProps {
  propertyIds: string[];
  onClose?: () => void;
}

export default function PropertyComparison({ propertyIds, onClose }: PropertyComparisonProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [comparisonName, setComparisonName] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [propertyIds]);

  const fetchProperties = async () => {
    try {
      const promises = propertyIds.map(id => 
        fetch(`/api/properties/${id}`).then(res => res.json())
      );
      const data = await Promise.all(promises);
      setProperties(data);
    } catch (error) {
      message.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const response = await fetch('/api/properties/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          propertyIds,
          name: comparisonName || `Comparison ${new Date().toLocaleDateString()}`
        })
      });

      if (response.ok) {
        message.success('Comparison saved successfully');
        setShowSaveModal(false);
      } else {
        message.error('Failed to save comparison');
      }
    } catch (error) {
      message.error('Error saving comparison');
    }
  };

  const features = [
    { key: 'price', label: 'Price', format: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'beds', label: 'Bedrooms' },
    { key: 'baths', label: 'Bathrooms' },
    { key: 'sqft', label: 'Square Feet', format: (v: number) => v?.toLocaleString() },
    { key: 'yearBuilt', label: 'Year Built' },
    { key: 'lotSize', label: 'Lot Size', format: (v: number) => v ? `${v.toLocaleString()} sq ft` : 'N/A' },
    { key: 'garageSpaces', label: 'Garage' },
    { key: 'hoaFees', label: 'HOA Fees', format: (v: number) => v ? `$${v}/mo` : 'None' },
    { key: 'propertyType', label: 'Type' },
    { key: 'condition', label: 'Condition' },
    { key: 'hasPool', label: 'Pool', format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'hasBasement', label: 'Basement', format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'hasFireplace', label: 'Fireplace', format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'isWaterfront', label: 'Waterfront', format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'isPetFriendly', label: 'Pet Friendly', format: (v: boolean) => v ? 'Yes' : 'No' }
  ];

  return (
    <div style={{ padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Property Comparison</Title>
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => setShowSaveModal(true)}>
              Save Comparison
            </Button>
            {onClose && (
              <Button icon={<CloseOutlined />} onClick={onClose}>
                Close
              </Button>
            )}
          </Space>
        </div>

        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #f0f0f0', minWidth: '150px' }}>
                    Feature
                  </th>
                  {properties.map((property, index) => (
                    <th key={index} style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid #f0f0f0', minWidth: '200px' }}>
                      <div>
                        <img 
                          src={property.imageUrl} 
                          alt={property.address}
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                        />
                        <Text strong style={{ display: 'block' }}>{property.address}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{property.city}, {property.state}</Text>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {feature.label}
                    </td>
                    {properties.map((property, pIdx) => {
                      const value = property[feature.key];
                      const displayValue = feature.format ? feature.format(value) : value || 'N/A';
                      return (
                        <td key={pIdx} style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal
          title="Save Comparison"
          open={showSaveModal}
          onOk={handleSave}
          onCancel={() => setShowSaveModal(false)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Give this comparison a name (optional):</Text>
            <input
              type="text"
              placeholder="My Comparison"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </Space>
        </Modal>
      </div>
    </div>
  );
}
