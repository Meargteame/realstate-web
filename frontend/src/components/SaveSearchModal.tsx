import React, { useState } from 'react';
import { Modal, Form, Input, Switch, Select, Button, Typography, Space, Alert } from 'antd';
import { SaveOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons';
import { useIsMobile } from "../hooks/useBreakpoint";

const { Text } = Typography;
const { Option } = Select;

interface SaveSearchModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (searchData: SaveSearchData) => void;
  currentFilters: any;
  currentMapArea?: any;
  loading?: boolean;
}

interface SaveSearchData {
  name: string;
  emailAlerts: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  filters: any;
}

export default function SaveSearchModal({
  visible,
  onCancel,
  onSave,
  currentFilters,
  currentMapArea,
  loading = false
}: SaveSearchModalProps) {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Combine current filters with map area if available
      const searchFilters = {
        ...currentFilters,
        mapArea: currentMapArea || null,
        savedAt: new Date().toISOString()
      };

      const searchData: SaveSearchData = {
        name: values.name,
        emailAlerts: values.emailAlerts,
        frequency: values.frequency,
        filters: searchFilters
      };

      onSave(searchData);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (currentFilters.minPrice || currentFilters.maxPrice) {
      const min = currentFilters.minPrice ? `$${(currentFilters.minPrice / 1000).toFixed(0)}K` : 'Any';
      const max = currentFilters.maxPrice ? `$${(currentFilters.maxPrice / 1000).toFixed(0)}K` : 'Any';
      summary.push(`Price: ${min} - ${max}`);
    }
    
    if (currentFilters.beds) {
      summary.push(`${currentFilters.beds}+ beds`);
    }
    
    if (currentFilters.baths) {
      summary.push(`${currentFilters.baths}+ baths`);
    }
    
    if (currentFilters.propertyType) {
      summary.push(`Type: ${currentFilters.propertyType}`);
    }
    
    if (currentMapArea) {
      summary.push('Custom map area');
    }
    
    return summary.length > 0 ? summary.join(' • ') : 'No filters applied';
  };

  return (
    <Modal
      title={
        <Space>
          <SaveOutlined style={{ color: '#b40101' }} />
          <span>Save Your Search</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={loading}
          style={{ backgroundColor: '#b40101', borderColor: '#b40101' }}
        >
          Save Search
        </Button>
      ]}
      width={isMobile ? '95%' : 500}
    >
      <div style={{ marginBottom: '24px' }}>
        <Alert
          message="Current Search Criteria"
          description={getFilterSummary()}
          type="info"
          showIcon
          icon={<SearchOutlined />}
          style={{ marginBottom: '20px' }}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          emailAlerts: true,
          frequency: 'daily'
        }}
      >
        <Form.Item
          name="name"
          label="Search Name"
          rules={[
            { required: true, message: 'Please enter a name for this search' },
            { min: 3, message: 'Name must be at least 3 characters' },
            { max: 50, message: 'Name must be less than 50 characters' }
          ]}
        >
          <Input
            placeholder="e.g., Downtown Condos Under $500K"
            maxLength={50}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="emailAlerts"
          label="Email Notifications"
          valuePropName="checked"
        >
          <Switch
            checkedChildren={<BellOutlined />}
            unCheckedChildren="Off"
            onChange={setEmailAlerts}
          />
        </Form.Item>

        {emailAlerts && (
          <Form.Item
            name="frequency"
            label="Notification Frequency"
            rules={[{ required: true, message: 'Please select notification frequency' }]}
          >
            <Select placeholder="How often would you like to be notified?">
              <Option value="instant">
                <Space>
                  <BellOutlined />
                  <div>
                    <div>Instant</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Get notified immediately when new properties match
                    </Text>
                  </div>
                </Space>
              </Option>
              <Option value="daily">
                <Space>
                  <BellOutlined />
                  <div>
                    <div>Daily Digest</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Receive a daily summary of new matches
                    </Text>
                  </div>
                </Space>
              </Option>
              <Option value="weekly">
                <Space>
                  <BellOutlined />
                  <div>
                    <div>Weekly Summary</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Get a weekly roundup of new properties
                    </Text>
                  </div>
                </Space>
              </Option>
            </Select>
          </Form.Item>
        )}

        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <Text strong style={{ fontSize: '14px', color: '#495057' }}>
            What happens next?
          </Text>
          <ul style={{ 
            margin: '8px 0 0 0', 
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#6c757d'
          }}>
            <li>Your search criteria and map area will be saved</li>
            <li>You'll be notified when new properties match your criteria</li>
            <li>You can manage your saved searches from your dashboard</li>
            <li>You can modify or delete this search anytime</li>
          </ul>
        </div>
      </Form>
    </Modal>
  );
}