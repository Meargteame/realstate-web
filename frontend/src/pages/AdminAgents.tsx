import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Avatar, message as antMessage, Popconfirm, Select } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchAgents = async () => {
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
        search: searchText
      });

      const res = await fetch(`/api/admin/agents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      antMessage.error('Failed to fetch agents');
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

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const userData = localStorage.getItem('kw_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const res = await fetch(`/api/admin/agents/${agentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        antMessage.success('Agent status updated successfully');
        fetchAgents();
      } else {
        const data = await res.json();
        antMessage.error(data.error || 'Failed to update agent status');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      antMessage.error('Failed to update agent status');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const userData = localStorage.getItem('kw_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        antMessage.success('Agent deleted successfully');
        fetchAgents();
      } else {
        const data = await res.json();
        antMessage.error(data.error || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      antMessage.error('Failed to delete agent');
    }
  };

  const columns = [
    {
      title: 'Agent',
      key: 'agent',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.imageUrl} size={40} style={{ backgroundColor: '#b40101' }}>
            {record.name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Listings',
      key: 'listings',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.stats?.totalListings || 0}</span>
          <span style={{ fontSize: 11, color: '#10b981' }}>
            {record.stats?.activeListings || 0} active
          </span>
        </Space>
      ),
      sorter: (a: any, b: any) => (a.stats?.totalListings || 0) - (b.stats?.totalListings || 0),
    },
    {
      title: 'Leads',
      key: 'leads',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.stats?.totalLeads || 0}</span>
          <span style={{ fontSize: 11, color: '#3b82f6' }}>
            {record.stats?.activeLeads || 0} active
          </span>
        </Space>
      ),
      sorter: (a: any, b: any) => (a.stats?.totalLeads || 0) - (b.stats?.totalLeads || 0),
    },
    {
      title: 'Opportunities',
      key: 'opportunities',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.stats?.totalOpportunities || 0}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            ${((record.stats?.totalValue || 0) / 1000).toFixed(0)}K value
          </span>
        </Space>
      ),
      sorter: (a: any, b: any) => (a.stats?.totalValue || 0) - (b.stats?.totalValue || 0),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Select
          value={record.status || 'active'}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="active">
            <Tag color="green">ACTIVE</Tag>
          </Option>
          <Option value="inactive">
            <Tag color="red">INACTIVE</Tag>
          </Option>
          <Option value="pending">
            <Tag color="orange">PENDING</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Joined',
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
            onClick={() => navigate(`/agents/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            description="This will also delete all associated data."
            onConfirm={() => handleDeleteAgent(record.id)}
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
    <div style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 900 }}>
          Agents Management
        </Title>
      </div>

      <Card 
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Input
          placeholder="Search agents by name or email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, width: 300, borderRadius: 8 }}
        />
        <Table
          dataSource={agents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
}
