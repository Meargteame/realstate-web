import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Avatar, message as antMessage, Popconfirm, Select, Row, Col, Statistic, Badge, Empty } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, HomeOutlined, TeamOutlined, TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, RiseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Text } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;
const AntCard = Card as any;

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 350);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const pendingAgents = agents.filter((a: any) => a.status === 'pending');
  const activeAgents = agents.filter((a: any) => a.status === 'active');
  const totalListings = agents.reduce((sum: number, a: any) => sum + (a.stats?.totalListings || 0), 0);
  const totalLeads = agents.reduce((sum: number, a: any) => sum + (a.stats?.totalLeads || 0), 0);
  const leaderboard = [...agents].sort((a: any, b: any) => (b.stats?.totalListings || 0) + (b.stats?.totalLeads || 0) - (a.stats?.totalListings || 0) - (a.stats?.totalLeads || 0)).slice(0, 5);

  useEffect(() => {
    fetchAgents();
  }, [pagination.current, pagination.pageSize, debouncedSearch]);

  const fetchAgents = async () => {
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
        search: debouncedSearch
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
      const userData = localStorage.getItem('torra_user');
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
      const userData = localStorage.getItem('torra_user');
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
          <AntOption value="active">
            <Tag color="green">ACTIVE</Tag>
          </AntOption>
          <AntOption value="inactive">
            <Tag color="red">INACTIVE</Tag>
          </AntOption>
          <AntOption value="pending">
            <Tag color="orange">PENDING</Tag>
          </AntOption>
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
    <div style={{ padding: isMobile ? '24px 16px' : '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: isMobile ? '24px' : '32px' }}>
          Agents Management
        </Title>
      </div>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Total Agents</Text>} value={agents.length} prefix={<TeamOutlined style={{ color: '#b40101' }} />} valueStyle={{ color: '#b40101', fontWeight: 900, fontSize: 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Active</Text>} value={activeAgents.length} prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />} valueStyle={{ color: '#10b981', fontWeight: 900, fontSize: 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Total Listings</Text>} value={totalListings} prefix={<HomeOutlined style={{ color: '#373a4b' }} />} valueStyle={{ color: '#373a4b', fontWeight: 900, fontSize: 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Total Leads</Text>} value={totalLeads} prefix={<RiseOutlined style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: 28 }} />
          </AntCard>
        </Col>
      </Row>

      {/* Pending Approvals Banner */}
      {pendingAgents.length > 0 && (
        <AntCard size="small" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)', borderColor: '#f59e0b', borderRadius: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <Badge count={pendingAgents.length} style={{ backgroundColor: '#f59e0b' }}>
              <Text strong style={{ fontSize: 16 }}> Pending Approvals</Text>
            </Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingAgents.map((agent: any) => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'white', borderRadius: 8 }}>
                <Avatar src={agent.imageUrl} size={40} style={{ backgroundColor: '#b40101' }}>{agent.name?.charAt(0)}</Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{agent.email}</div>
                </div>
                <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(agent.id, 'active')} style={{ background: '#10b981', borderColor: '#10b981' }}>Approve</Button>
                <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(agent.id, 'inactive')}>Reject</Button>
              </div>
            ))}
          </div>
        </AntCard>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <AntCard title={<span><TrophyOutlined style={{ color: '#f59e0b', marginRight: 8 }} />Top Performers</span>} variant="borderless" style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {leaderboard.map((agent: any, idx: number) => (
              <div key={agent.id} style={{ minWidth: 180, padding: 16, background: idx === 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : '#fafafa', borderRadius: 10, textAlign: 'center', border: idx === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => navigate(`/agents/${agent.id}`)}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</div>
                <Avatar src={agent.imageUrl} size={48} style={{ backgroundColor: '#b40101', marginBottom: 8 }}>{agent.name?.charAt(0)}</Avatar>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{agent.stats?.totalListings || 0} listings</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{agent.stats?.totalLeads || 0} leads</div>
              </div>
            ))}
          </div>
        </AntCard>
      )}

      <Card 
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Input
            placeholder="Search agents by name or email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 300, borderRadius: 8 }}
          />
          {!loading && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {pagination.total} {pagination.total === 1 ? 'agent' : 'agents'} found
            </Typography.Text>
          )}
        </div>

        {isMobile ? (
          // Mobile Card View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agents.map((agent: any) => (
              <Card 
                key={agent.id}
                size="small"
                style={{ borderRadius: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Avatar src={agent.imageUrl} size={56} style={{ backgroundColor: '#b40101' }}>
                    {agent.name?.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{agent.name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>{agent.email}</div>
                    
                    <Space size="small" wrap style={{ marginBottom: '8px' }}>
                      <Tag color={agent.status === 'active' ? 'green' : agent.status === 'inactive' ? 'red' : 'orange'}>
                        {(agent.status || 'active').toUpperCase()}
                      </Tag>
                    </Space>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: 6 }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#b40101' }}>
                          {agent.stats?.totalListings || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Listings</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: 6 }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>
                          {agent.stats?.totalLeads || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Leads</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: 6 }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                          {agent.stats?.totalOpportunities || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Opps</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '12px' }}>
                      <Space size="small">
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />} 
                          size="small"
                          onClick={() => navigate(`/agents/${agent.id}`)}
                          style={{ padding: 0 }}
                        >
                          View
                        </Button>
                        <Popconfirm
                          title="Delete this agent?"
                          description="This will also delete all associated data."
                          onConfirm={() => handleDeleteAgent(agent.id)}
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
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <Table
            dataSource={agents}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={searchText ? `No agents match "${searchText}"` : 'No agents yet'}
                />
              )
            }}
          />
        )}
      </Card>
    </div>
  );
}
