import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Avatar, message as antMessage, Popconfirm, Select, Row, Col, Statistic } from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined, HomeOutlined, StarFilled, StarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const { Title, Text } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;
const AntCard = Card as any;

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Status distribution data
  const statusDistribution = [
    { name: 'Active', value: properties.filter((p: any) => p.status === 'Active').length, color: '#10b981' },
    { name: 'Pending', value: properties.filter((p: any) => p.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Sold', value: properties.filter((p: any) => p.status === 'Sold').length, color: '#3b82f6' },
    { name: 'Inactive', value: properties.filter((p: any) => p.status === 'Inactive').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  useEffect(() => {
    fetchProperties();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        search: searchText,
        status: statusFilter
      });

      const res = await fetch(`/api/admin/properties?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      antMessage.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total
    });
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const res = await fetch(`/api/admin/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        antMessage.success('Property status updated successfully');
        fetchProperties();
      } else {
        const data = await res.json();
        antMessage.error(data.error || 'Failed to update property status');
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      antMessage.error('Failed to update property status');
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        antMessage.success('Property deleted successfully');
        fetchProperties();
      } else {
        const data = await res.json();
        antMessage.error(data.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      antMessage.error('Failed to delete property');
    }
  };

  const handleToggleFeatured = async (propertyId: string, featured: boolean) => {
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;
      const token = JSON.parse(userData).token;
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ featured: !featured })
      });
      if (res.ok) {
        antMessage.success(featured ? 'Removed from featured' : 'Marked as featured');
        fetchProperties();
      }
    } catch { antMessage.error('Failed to update featured status'); }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus) return;
    const userData = localStorage.getItem('torra_user');
    if (!userData) return;
    const token = JSON.parse(userData).token;
    try {
      await Promise.all(selectedRows.map((p: any) =>
        fetch(`/api/admin/properties/${p.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: bulkStatus })
        })
      ));
      antMessage.success(`${selectedRows.length} properties updated to ${bulkStatus}`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setBulkStatus('');
      fetchProperties();
    } catch { antMessage.error('Failed to update some properties'); }
  };

  const columns = [
    {
      title: 'Property',
      key: 'property',
      render: (_: any, record: any) => (
        <Space>
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: 8, 
            overflow: 'hidden',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {record.images?.[0] ? (
              <img 
                src={record.images[0]} 
                alt={record.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <HomeOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {record.address}, {record.city}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Agent',
      key: 'agent',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.agent?.imageUrl} size={32} style={{ backgroundColor: '#b40101' }}>
            {record.agent?.name?.charAt(0)}
          </Avatar>
          <span style={{ fontSize: 13 }}>{record.agent?.name || 'N/A'}</span>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span style={{ fontWeight: 600 }}>
          ${price?.toLocaleString() || 0}
        </span>
      ),
      sorter: (a: any, b: any) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag>{type}</Tag>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>
            {record.bedrooms} bed • {record.bathrooms} bath
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {record.sqft?.toLocaleString()} sqft
          </span>
        </Space>
      ),
    },
    {
      title: 'Featured',
      key: 'featured',
      width: 80,
      render: (_: any, record: any) => (
        <span
          style={{ cursor: 'pointer', fontSize: 18, color: record.featured ? '#f59e0b' : '#d1d5db' }}
          onClick={() => handleToggleFeatured(record.id, record.featured)}
        >
          {record.featured ? <StarFilled /> : <StarOutlined />}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Select
          value={record.status || 'Active'}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <AntOption value="Active">
            <Tag color="green">ACTIVE</Tag>
          </AntOption>
          <AntOption value="Pending">
            <Tag color="orange">PENDING</Tag>
          </AntOption>
          <AntOption value="Sold">
            <Tag color="blue">SOLD</Tag>
          </AntOption>
          <AntOption value="Inactive">
            <Tag color="red">INACTIVE</Tag>
          </AntOption>
        </Select>
      ),
    },
    {
      title: 'Listed',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/properties/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this property?"
            onConfirm={() => handleDeleteProperty(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: isMobile ? '24px' : '32px' }}>
          Properties Management
        </Title>
      </div>

      {/* Status Distribution */}
      {statusDistribution.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {statusDistribution.map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span>{s.name}: <strong>{s.value}</strong></span>
                  </div>
                ))}
              </div>
            </AntCard>
          </Col>
          <Col xs={24} sm={16}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Total Properties</Text>} value={properties.length} prefix={<HomeOutlined style={{ color: '#b40101' }} />} valueStyle={{ color: '#b40101', fontWeight: 900, fontSize: 28 }} />
                </AntCard>
              </Col>
              <Col span={12}>
                <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Featured</Text>} value={properties.filter((p: any) => p.featured).length} prefix={<StarFilled style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: 28 }} />
                </AntCard>
              </Col>
              <Col span={12}>
                <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Avg Price</Text>} value={properties.length ? Math.round(properties.reduce((s: number, p: any) => s + (p.price || 0), 0) / properties.length) : 0} prefix="$" valueStyle={{ color: '#373a4b', fontWeight: 900, fontSize: 28 }} precision={0} />
                </AntCard>
              </Col>
              <Col span={12}>
                <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Pending Review</Text>} value={properties.filter((p: any) => p.status === 'Pending').length} prefix={<CheckCircleOutlined style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: 28 }} />
                </AntCard>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedRowKeys.length > 0 && (
        <AntCard size="small" style={{ marginBottom: 16, background: '#fff7ed', borderColor: '#f59e0b', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text strong>{selectedRowKeys.length} selected</Text>
            <AntSelect value={bulkStatus || undefined} onChange={(v: string) => setBulkStatus(v)} placeholder="Set status to..." style={{ width: 160 }} allowClear>
              <AntOption value="Active">Active</AntOption>
              <AntOption value="Pending">Pending</AntOption>
              <AntOption value="Sold">Sold</AntOption>
              <AntOption value="Inactive">Inactive</AntOption>
            </AntSelect>
            <Button size="small" type="primary" onClick={handleBulkStatusChange} disabled={!bulkStatus} style={bulkStatus ? { background: '#b40101', borderColor: '#b40101' } : {}}>Apply</Button>
            <Popconfirm title={`Delete ${selectedRowKeys.length} properties?`} onConfirm={async () => {
              const userData = localStorage.getItem('torra_user');
              if (!userData) return;
              const token = JSON.parse(userData).token;
              await Promise.all(selectedRows.map((p: any) => fetch(`/api/admin/properties/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })));
              antMessage.success('Properties deleted');
              setSelectedRowKeys([]); setSelectedRows([]); fetchProperties();
            }} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
              <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
            <Button size="small" onClick={() => { setSelectedRowKeys([]); setSelectedRows([]); }}>Clear</Button>
          </div>
        </AntCard>
      )}

      <Card 
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Space style={{ marginBottom: 16, width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'}>
          <Input
            placeholder="Search properties..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 300, borderRadius: 8 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: isMobile ? '100%' : 150 }}
            allowClear
          >
            <AntOption value="Active">Active</AntOption>
            <AntOption value="Pending">Pending</AntOption>
            <AntOption value="Sold">Sold</AntOption>
            <AntOption value="Inactive">Inactive</AntOption>
          </Select>
        </Space>
        
        {isMobile ? (
          // Mobile Card View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {properties.map((property: any) => (
              <Card 
                key={property.id}
                size="small"
                style={{ borderRadius: 8 }}
                cover={
                  property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      style={{ height: 180, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      height: 180, 
                      background: '#f0f0f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <HomeOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                    </div>
                  )
                }
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '16px' }}>
                    ${property.price?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {property.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                    {property.address}, {property.city}
                  </div>
                  
                  <Space size="small" wrap style={{ marginBottom: '8px' }}>
                    <Tag>{property.type}</Tag>
                    <Tag color={
                      property.status === 'Active' ? 'green' : 
                      property.status === 'Pending' ? 'orange' : 
                      property.status === 'Sold' ? 'blue' : 'red'
                    }>
                      {property.status || 'ACTIVE'}
                    </Tag>
                  </Space>
                  
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft?.toLocaleString()} sqft
                  </div>
                  
                  {property.agent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px', background: '#f8f9fa', borderRadius: 6 }}>
                      <Avatar src={property.agent.imageUrl} size={32} style={{ backgroundColor: '#b40101' }}>
                        {property.agent.name?.charAt(0)}
                      </Avatar>
                      <span style={{ fontSize: '13px' }}>{property.agent.name}</span>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '12px' }}>
                    <Space size="small">
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        size="small"
                        onClick={() => navigate(`/properties/${property.id}`)}
                        style={{ padding: 0 }}
                      >
                        View
                      </Button>
                      <Popconfirm
                        title="Delete this property?"
                        onConfirm={() => handleDeleteProperty(property.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small" style={{ padding: 0 }}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <Table
            dataSource={properties}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys: React.Key[], rows: any[]) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
            }}
          />
        )}
      </Card>
    </div>
  );
}
