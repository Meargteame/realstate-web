import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Statistic, Tag, Space, Button, Progress, Avatar } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlusOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Line, Column } from '@ant-design/plots';
import { LineChart, Line as RLine, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalProperties: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    newAgentsThisMonth: 0,
    activeListings: 0,
    pendingListings: 0,
    totalLeads: 0,
    totalBlogPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mock revenue & user growth data (replace with API when available)
  const revenueData = [
    { month: 'Jan', revenue: 42000 }, { month: 'Feb', revenue: 53000 },
    { month: 'Mar', revenue: 61000 }, { month: 'Apr', revenue: 58000 },
    { month: 'May', revenue: 72000 }, { month: 'Jun', revenue: 85000 },
    { month: 'Jul', revenue: 91000 }, { month: 'Aug', revenue: 78000 },
    { month: 'Sep', revenue: 96000 }, { month: 'Oct', revenue: 105000 },
    { month: 'Nov', revenue: 112000 }, { month: 'Dec', revenue: 128000 },
  ];
  const userGrowthData = [
    { month: 'Jan', users: 120 }, { month: 'Feb', users: 165 },
    { month: 'Mar', users: 210 }, { month: 'Apr', users: 280 },
    { month: 'May', users: 345 }, { month: 'Jun', users: 420 },
    { month: 'Jul', users: 510 }, { month: 'Aug', users: 580 },
    { month: 'Sep', users: 670 }, { month: 'Oct', users: 745 },
    { month: 'Nov', users: 830 }, { month: 'Dec', users: 940 },
  ];
  const systemHealth = [
    { name: 'Database', status: 'healthy', uptime: '99.98%', icon: <DatabaseOutlined />, latency: '12ms' },
    { name: 'API Server', status: 'healthy', uptime: '99.95%', icon: <ApiOutlined />, latency: '45ms' },
    { name: 'File Storage', status: 'healthy', uptime: '99.99%', icon: <CloudOutlined />, latency: '8ms' },
    { name: 'Email Service', status: 'warning', uptime: '98.20%', icon: <FileTextOutlined />, latency: '120ms' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      if (!token) {
        console.error('No token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch platform stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = statsRes.ok ? await statsRes.json() : null;

      if (statsData) {
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalAgents: statsData.totalAgents || 0,
          totalProperties: statsData.totalProperties || 0,
          totalRevenue: statsData.totalRevenue || 0,
          newUsersThisMonth: statsData.newUsersThisMonth || 0,
          newAgentsThisMonth: statsData.newAgentsThisMonth || 0,
          activeListings: statsData.activeListings || 0,
          pendingListings: statsData.pendingListings || 0,
          totalLeads: statsData.totalLeads || 0,
          totalBlogPosts: 0
        });

        // Build recent activity from recent data
        const activity = [];
        if (statsData.recentActivity?.users) {
          statsData.recentActivity.users.forEach((user: any) => {
            activity.push({
              type: 'user',
              action: 'New user registered',
              user: user.name,
              time: formatTimeAgo(user.createdAt)
            });
          });
        }
        if (statsData.recentActivity?.agents) {
          statsData.recentActivity.agents.forEach((agent: any) => {
            activity.push({
              type: 'agent',
              action: 'Agent approved',
              user: agent.name,
              time: formatTimeAgo(agent.createdAt)
            });
          });
        }
        if (statsData.recentActivity?.properties) {
          statsData.recentActivity.properties.forEach((property: any) => {
            activity.push({
              type: 'property',
              action: 'New property listed',
              user: property.agent?.name || 'Unknown',
              time: formatTimeAgo(property.createdAt)
            });
          });
        }
        
        // Sort by time and take top 5
        setRecentActivity(activity.slice(0, 5));
      }

      // Fetch top agents
      const agentsRes = await fetch('/api/admin/top-agents?limit=5', { headers });
      const agentsData = agentsRes.ok ? await agentsRes.json() : [];
      
      if (Array.isArray(agentsData)) {
        setTopAgents(agentsData.map((a: any) => ({
          ...a,
          listingsCount: a.stats?.listingsCount || 0,
          leadsCount: a.stats?.leadsCount || 0
        })));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '40px 48px', minHeight: 'calc(100vh - 72px)', background: '#fafafa' }}>
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', fontWeight: 900, fontSize: isMobile ? '24px' : '32px' }}>
          Platform Overview
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
          Monitor and manage your real estate platform
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }
            }}
            onClick={() => navigate('/admin/users')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Total Users</Text>}
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#b40101' }} />}
              valueStyle={{ color: '#b40101', fontSize: isMobile ? '28px' : '36px', fontWeight: 900 }}
              suffix={
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginLeft: 8 }}>
                  <ArrowUpOutlined /> +{stats.newUsersThisMonth}
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }
            }}
            onClick={() => navigate('/admin/agents')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Active Agents</Text>}
              value={stats.totalAgents}
              prefix={<TeamOutlined style={{ color: '#373a4b' }} />}
              valueStyle={{ color: '#373a4b', fontSize: isMobile ? '28px' : '36px', fontWeight: 900 }}
              suffix={
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginLeft: 8 }}>
                  <ArrowUpOutlined /> +{stats.newAgentsThisMonth}
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e: any) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }
            }}
            onClick={() => navigate('/admin/properties')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Total Properties</Text>}
              value={stats.totalProperties}
              prefix={<HomeOutlined style={{ color: '#373a4b' }} />}
              valueStyle={{ color: '#373a4b', fontSize: isMobile ? '28px' : '36px', fontWeight: 900 }}
              suffix={
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginLeft: 8 }}>
                  {stats.activeListings} active
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Platform Value</Text>}
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontSize: isMobile ? '28px' : '36px', fontWeight: 900 }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Active Listings"
              value={stats.activeListings}
              valueStyle={{ color: '#10b981', fontSize: isMobile ? '24px' : '28px', fontWeight: 700 }}
            />
            <Progress percent={Math.round((stats.activeListings / stats.totalProperties) * 100)} strokeColor="#10b981" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Pending Sales"
              value={stats.pendingListings}
              valueStyle={{ color: '#f59e0b', fontSize: isMobile ? '24px' : '28px', fontWeight: 700 }}
            />
            <Progress percent={Math.round((stats.pendingListings / stats.totalProperties) * 100)} strokeColor="#f59e0b" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Avg Property Value"
              value={stats.totalProperties > 0 ? Math.round(stats.totalRevenue / stats.totalProperties) : 0}
              prefix="$"
              valueStyle={{ color: '#373a4b', fontSize: isMobile ? '24px' : '28px', fontWeight: 700 }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue & User Growth Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Revenue Trend</span>}
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b40101" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#b40101" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#b40101" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>User Growth</span>}
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [v, 'Users']} />
                <RLine type="monotone" dataKey="users" stroke="#373a4b" strokeWidth={3} dot={{ fill: '#373a4b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* System Health & Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>System Health</span>}
            extra={<Button type="link" icon={<ReloadOutlined />} style={{ color: '#b40101', fontWeight: 700, fontSize: 13 }}>Refresh</Button>}
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {systemHealth.map((s) => (
                <div key={s.name} style={{ padding: '16px', background: '#fafafa', borderRadius: 10, border: `1px solid ${s.status === 'healthy' ? '#d1fae5' : '#fde68a'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, color: s.status === 'healthy' ? '#10b981' : '#f59e0b' }}>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    <Tag color={s.status === 'healthy' ? 'green' : 'orange'} style={{ marginLeft: 'auto' }}>{s.status.toUpperCase()}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                    <span>Uptime: <strong style={{ color: '#111827' }}>{s.uptime}</strong></span>
                    <span>Latency: <strong style={{ color: '#111827' }}>{s.latency}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Quick Actions</span>}
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Button icon={<PlusOutlined />} onClick={() => navigate('/admin/users')} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start' }}>Add User</Button>
              <Button icon={<TeamOutlined />} onClick={() => navigate('/admin/agents')} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start' }}>Add Agent</Button>
              <Button icon={<HomeOutlined />} onClick={() => navigate('/admin/properties')} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start' }}>Add Property</Button>
              <Button icon={<BarChartOutlined />} onClick={() => navigate('/admin/analytics')} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start' }}>Analytics</Button>
              <Button icon={<FileTextOutlined />} onClick={() => navigate('/admin/blog')} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start' }}>New Post</Button>
              <Button icon={<ThunderboltOutlined />} style={{ height: 64, borderRadius: 8, fontWeight: 600, justifyContent: 'flex-start', background: '#b40101', color: 'white', borderColor: '#b40101' }}>Broadcast</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activity and Top Agents */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Recent Activity</span>}
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '100%'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((item: any, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <Avatar 
                    style={{ 
                      backgroundColor: item.type === 'user' ? '#b40101' : item.type === 'agent' ? '#373a4b' : '#10b981' 
                    }}
                    icon={item.type === 'user' ? <UserOutlined /> : item.type === 'agent' ? <TeamOutlined /> : <HomeOutlined />}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '2px', fontSize: isMobile ? '13px' : '14px' }}>{item.action}</div>
                    <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#8c8c8c' }}>{item.user} • {item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Top Performing Agents</span>}
            extra={
              !isMobile && (
                <Button 
                  type="link" 
                  onClick={() => navigate("/admin/agents")}
                  style={{ color: '#b40101', fontWeight: 700, fontSize: '13px' }}
                >
                  View All →
                </Button>
              )
            }
            variant="borderless"
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '100%'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topAgents.map((agent: any) => (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Avatar src={agent.imageUrl} size={isMobile ? 40 : 48}>{agent.name?.charAt(0)}</Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: isMobile ? '13px' : '14px' }}>{agent.name}</div>
                    <Space size={isMobile ? "small" : "large"}>
                      <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#8c8c8c' }}><HomeOutlined /> {agent.listingsCount}</span>
                      <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#8c8c8c' }}><TeamOutlined /> {agent.leadsCount}</span>
                    </Space>
                  </div>
                  {!isMobile && <Button type="link" onClick={() => navigate(`/agents/${agent.id}`)}>View</Button>}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
