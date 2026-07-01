import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Badge, 
  Empty, 
  Switch, 
  Dropdown, 
  Modal, 
  notification,
  Spin,
  Tag,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  PlayCircleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useBreakpoint';

const { Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  emailAlerts: boolean;
  frequency: string;
  isActive: boolean;
  lastRun?: string;
  lastNotified?: string;
  unreadAlerts: number;
  totalAlerts: number;
  createdAt: string;
  updatedAt: string;
}

export default function SavedSearches() {
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSearch, setRunningSearch] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-searches');
      const data = await response.json();
      
      if (response.ok) {
        setSavedSearches(data.savedSearches || []);
      } else {
        notification.error({
          message: 'Error',
          description: data.error || 'Failed to fetch saved searches'
        });
      }
    } catch (error) {
      console.error('Fetch saved searches error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch saved searches'
      });
    } finally {
      setLoading(false);
    }
  };

  const runSavedSearch = async (searchId: string, searchName: string) => {
    try {
      setRunningSearch(searchId);
      const response = await fetch(`/api/saved-searches/${searchId}/run`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        notification.success({
          message: 'Search Complete',
          description: `Found ${data.count} properties matching "${searchName}"`
        });
        
        // Navigate to properties page with results
        // You could pass the results or trigger a new search
        navigate('/properties');
      } else {
        notification.error({
          message: 'Search Failed',
          description: data.error || 'Failed to run saved search'
        });
      }
    } catch (error) {
      console.error('Run saved search error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to run saved search'
      });
    } finally {
      setRunningSearch(null);
    }
  };

  const toggleEmailAlerts = async (searchId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailAlerts: !currentValue
        })
      });

      if (response.ok) {
        setSavedSearches(prev => 
          prev.map(search => 
            search.id === searchId 
              ? { ...search, emailAlerts: !currentValue }
              : search
          )
        );
        
        notification.success({
          message: 'Updated',
          description: `Email alerts ${!currentValue ? 'enabled' : 'disabled'}`
        });
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: data.error || 'Failed to update email alerts'
        });
      }
    } catch (error) {
      console.error('Toggle email alerts error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update email alerts'
      });
    }
  };

  const deleteSavedSearch = (searchId: string, searchName: string) => {
    confirm({
      title: 'Delete Saved Search',
      content: `Are you sure you want to delete "${searchName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/saved-searches/${searchId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setSavedSearches(prev => prev.filter(search => search.id !== searchId));
            notification.success({
              message: 'Deleted',
              description: `"${searchName}" has been deleted`
            });
          } else {
            const data = await response.json();
            notification.error({
              message: 'Error',
              description: data.error || 'Failed to delete saved search'
            });
          }
        } catch (error) {
          console.error('Delete saved search error:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete saved search'
          });
        }
      }
    });
  };

  const getFilterSummary = (filters: any) => {
    const summary = [];
    
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}K` : 'Any';
      const max = filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}K` : 'Any';
      summary.push(`${min} - ${max}`);
    }
    
    if (filters.beds) summary.push(`${filters.beds}+ beds`);
    if (filters.baths) summary.push(`${filters.baths}+ baths`);
    if (filters.propertyType) summary.push(filters.propertyType);
    if (filters.mapArea) summary.push('Custom area');
    
    return summary.length > 0 ? summary.join(' • ') : 'No filters';
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'instant': return 'red';
      case 'daily': return 'blue';
      case 'weekly': return 'green';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMenuItems = (search: SavedSearch) => [
    {
      key: 'run',
      label: runningSearch === search.id ? 'Running...' : 'Run Search',
      icon: runningSearch === search.id ? <Spin size="small" /> : <PlayCircleOutlined />,
      disabled: runningSearch === search.id,
      onClick: () => runSavedSearch(search.id, search.name)
    },
    {
      key: 'edit',
      label: 'Edit Search',
      icon: <EditOutlined />,
      onClick: () => {
        // Navigate to properties page with this search loaded for editing
        navigate('/properties', { state: { editSearch: search } });
      }
    },
    {
      key: 'view-alerts',
      label: `View Alerts (${search.totalAlerts})`,
      icon: <EyeOutlined />,
      disabled: search.totalAlerts === 0,
      onClick: () => {
        // Navigate to alerts view
        navigate(`/saved-searches/${search.id}/alerts`);
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Delete Search',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => deleteSavedSearch(search.id, search.name)
    }
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f8f8f8' }}>
        <Content style={{ padding: isMobile ? '24px 16px' : '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      <Content style={{ padding: isMobile ? '24px 16px' : '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '24px' : '32px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: isMobile ? '24px' : '32px' }}>
                SAVED SEARCHES
              </Title>
              <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                Manage your saved property searches and email alerts
              </Text>
            </div>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/properties')}
              style={{ backgroundColor: '#b40101', borderColor: '#b40101', width: isMobile ? '100%' : 'auto' }}
            >
              {isMobile ? "New Search" : "Create New Search"}
            </Button>
          </div>

          {/* Saved Searches Grid */}
          {savedSearches.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px 20px' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text style={{ fontSize: isMobile ? '15px' : '16px', color: '#666' }}>
                      No saved searches yet
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                      Create your first saved search to get notified about new properties
                    </Text>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => navigate('/properties')}
                  style={{ backgroundColor: '#b40101', borderColor: '#b40101', marginTop: '16px' }}
                >
                  Start Searching Properties
                </Button>
              </Empty>
            </Card>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: isMobile ? '16px' : '24px' 
            }}>
              {savedSearches.map((search) => (
                <Card
                  key={search.id}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<PlayCircleOutlined />}
                      onClick={() => runSavedSearch(search.id, search.name)}
                      loading={runningSearch === search.id}
                      style={{ color: '#b40101', fontSize: isMobile ? '13px' : '14px', transition: 'all 0.2s ease' }}
                    >
                      {isMobile ? "Run" : "Run Search"}
                    </Button>,
                    <Tooltip title={search.emailAlerts ? 'Disable alerts' : 'Enable alerts'}>
                      <Switch
                        size="small"
                        checked={search.emailAlerts}
                        onChange={() => toggleEmailAlerts(search.id, search.emailAlerts)}
                        checkedChildren={<BellOutlined />}
                        unCheckedChildren="Off"
                      />
                    </Tooltip>,
                    <Dropdown
                      menu={{ items: getMenuItems(search) }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined />} style={{ transition: 'all 0.2s ease' }} />
                    </Dropdown>
                  ]}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title level={4} style={{ margin: 0, fontSize: isMobile ? '16px' : '18px' }}>
                        {search.name}
                      </Title>
                      {search.unreadAlerts > 0 && (
                        <Badge count={search.unreadAlerts} style={{ backgroundColor: '#b40101' }} />
                      )}
                    </div>
                    
                    <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '13px', display: 'block', marginTop: '4px' }}>
                      Created {formatDate(search.createdAt)}
                    </Text>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <Text style={{ fontSize: isMobile ? '13px' : '14px', color: '#666' }}>
                      {getFilterSummary(search.filters)}
                    </Text>
                  </div>

                  <Space wrap style={{ marginBottom: '16px' }}>
                    <Tag color={getFrequencyColor(search.frequency)}>
                      {search.frequency.charAt(0).toUpperCase() + search.frequency.slice(1)} alerts
                    </Tag>
                    
                    {search.totalAlerts > 0 && (
                      <Tag>
                        {search.totalAlerts} alert{search.totalAlerts !== 1 ? 's' : ''}
                      </Tag>
                    )}
                    
                    {!search.isActive && (
                      <Tag color="red">Inactive</Tag>
                    )}
                  </Space>

                  {search.lastRun && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Last run: {formatDate(search.lastRun)}
                      </Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}