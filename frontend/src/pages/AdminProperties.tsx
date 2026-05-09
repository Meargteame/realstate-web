import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Avatar, message as antMessage, Popconfirm, Select } from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title } = Typography;
const { Option } = Select;

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchProperties();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('kw_user');
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
      const userData = localStorage.getItem('kw_user');
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
      const userData = localStorage.getItem('kw_user');
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
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Select
          value={record.status || 'Active'}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="Active">
            <Tag color="green">ACTIVE</Tag>
          </Option>
          <Option value="Pending">
            <Tag color="orange">PENDING</Tag>
          </Option>
          <Option value="Sold">
            <Tag color="blue">SOLD</Tag>
          </Option>
          <Option value="Inactive">
            <Tag color="red">INACTIVE</Tag>
          </Option>
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
            <Option value="Active">Active</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Sold">Sold</Option>
            <Option value="Inactive">Inactive</Option>
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
          />
        )}
      </Card>
    </div>
  );
}
