import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Statistic, Tag, Space, Button, Progress, Avatar } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Line, Column } from '@ant-design/plots';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = localStorage.getItem('kw_user');
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
    <div style={{ padding: '40px 48px', minHeight: 'calc(100vh - 72px)', background: '#fafafa' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', fontWeight: 900 }}>
          Platform Overview
        </Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Monitor and manage your real estate platform
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
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
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            onClick={() => navigate('/admin/users')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Total Users</Text>}
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#b40101' }} />}
              valueStyle={{ color: '#b40101', fontSize: '36px', fontWeight: 900 }}
              suffix={
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginLeft: 8 }}>
                  <ArrowUpOutlined /> +{stats.newUsersThisMonth} this month
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
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            onClick={() => navigate('/admin/agents')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Active Agents</Text>}
              value={stats.totalAgents}
              prefix={<TeamOutlined style={{ color: '#373a4b' }} />}
              valueStyle={{ color: '#373a4b', fontSize: '36px', fontWeight: 900 }}
              suffix={
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginLeft: 8 }}>
                  <ArrowUpOutlined /> +{stats.newAgentsThisMonth} this month
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
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            onClick={() => navigate('/admin/properties')}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Total Properties</Text>}
              value={stats.totalProperties}
              prefix={<HomeOutlined style={{ color: '#373a4b' }} />}
              valueStyle={{ color: '#373a4b', fontSize: '36px', fontWeight: 900 }}
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
              valueStyle={{ color: '#10b981', fontSize: '36px', fontWeight: 900 }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Active Listings"
              value={stats.activeListings}
              valueStyle={{ color: '#10b981', fontSize: '28px', fontWeight: 700 }}
            />
            <Progress percent={Math.round((stats.activeListings / stats.totalProperties) * 100)} strokeColor="#10b981" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Pending Sales"
              value={stats.pendingListings}
              valueStyle={{ color: '#f59e0b', fontSize: '28px', fontWeight: 700 }}
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
              valueStyle={{ color: '#373a4b', fontSize: '28px', fontWeight: 700 }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity and Top Agents */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Recent Activity</span>}
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
                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>{item.action}</div>
                    <div style={{ fontSize: '13px', color: '#8c8c8c' }}>{item.user} • {item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>Top Performing Agents</span>}
            extra={
              <Button 
                type="link" 
                onClick={() => navigate("/admin/agents")}
                style={{ color: '#b40101', fontWeight: 700, fontSize: '13px' }}
              >
                View All →
              </Button>
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
                  <Avatar src={agent.imageUrl} size={48}>{agent.name?.charAt(0)}</Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{agent.name}</div>
                    <Space size="large">
                      <span style={{ fontSize: '13px', color: '#8c8c8c' }}><HomeOutlined /> {agent.listingsCount} listings</span>
                      <span style={{ fontSize: '13px', color: '#8c8c8c' }}><TeamOutlined /> {agent.leadsCount} leads</span>
                    </Space>
                  </div>
                  <Button type="link" onClick={() => navigate(`/agents/${agent.id}`)}>View</Button>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
