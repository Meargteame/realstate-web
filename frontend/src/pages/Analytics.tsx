import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag, Progress } from "antd";
import {
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  LineChartOutlined
} from "@ant-design/icons";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [leadAnalytics, setLeadAnalytics] = useState<any>(null);
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null);
  const [salesReports, setSalesReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get agentId from localStorage or context
  const agentId = localStorage.getItem('agentId') || 'f2d2c702-3702-4717-9f44-7e5a860f81bf';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [agentRes, leadRes, propRes, salesRes] = await Promise.all([
        fetch(`/api/analytics/agent/${agentId}`),
        fetch(`/api/analytics/leads/${agentId}`),
        fetch(`/api/analytics/properties/${agentId}`),
        fetch(`/api/analytics/sales/${agentId}`)
      ]);

      const [agentData, leadData, propData, salesData] = await Promise.all([
        agentRes.json(),
        leadRes.json(),
        propRes.json(),
        salesRes.json()
      ]);

      setAnalytics(agentData);
      setLeadAnalytics(leadData);
      setPropertyAnalytics(propData);
      setSalesReports(salesData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '200px', textAlign: 'center' }}>
        <Text>Loading analytics...</Text>
      </div>
    );
  }

  const propertyColumns = [
    {
      title: 'Property',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toLocaleString()}`
    },
    {
      title: 'Views',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: (a: any, b: any) => a.viewCount - b.viewCount
    },
    {
      title: 'Leads',
      dataIndex: 'leadCount',
      key: 'leadCount',
      sorter: (a: any, b: any) => a.leadCount - b.leadCount
    },
    {
      title: 'Days on Market',
      dataIndex: 'daysOnMarket',
      key: 'daysOnMarket',
      sorter: (a: any, b: any) => a.daysOnMarket - b.daysOnMarket
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Pending' ? 'orange' : 'blue'}>
          {status}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>
            <LineChartOutlined /> Analytics Dashboard
          </Title>
          <Text type="secondary">Performance metrics and insights</Text>
        </div>

        {/* KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Listings"
                value={analytics?.summary.totalListings || 0}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#667eea' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.activeListings || 0} active
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Leads"
                value={analytics?.summary.totalLeads || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#764ba2' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.newLeads || 0} new this month
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Conversion Rate"
                value={analytics?.summary.conversionRate || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#43e97b' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.closedLeads || 0} closed deals
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Sales Volume"
                value={salesReports?.totalVolume || 0}
                prefix="$"
                valueStyle={{ color: '#f093fb' }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {salesReports?.totalDeals || 0} closed deals
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Sales Performance (Last 12 Months)" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesReports?.salesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="volume" stroke="#667eea" strokeWidth={2} name="Sales Volume" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Lead Sources" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.charts.leadSources || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(analytics?.charts.leadSources || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 2 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Lead Status Breakdown">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {leadAnalytics && Object.entries(leadAnalytics.statusBreakdown).map(([status, count]: [string, any]) => (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>{status}</Text>
                      <Text>{count} leads</Text>
                    </div>
                    <Progress
                      percent={leadAnalytics.total > 0 ? (count / leadAnalytics.total * 100) : 0}
                      strokeColor={COLORS[Object.keys(leadAnalytics.statusBreakdown).indexOf(status)]}
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Property Price Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyAnalytics?.priceRanges ? Object.entries(propertyAnalytics.priceRanges).map(([range, count]) => ({ range, count })) : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={8}>
            <Card title="Property Averages">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Average Price:</Text>
                  <Text strong>${propertyAnalytics?.averages.price.toLocaleString()}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Average Views:</Text>
                  <Text strong>{propertyAnalytics?.averages.viewCount}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Average Leads:</Text>
                  <Text strong>{propertyAnalytics?.averages.leadCount}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Days on Market:</Text>
                  <Text strong>{propertyAnalytics?.averages.daysOnMarket} days</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Sales Summary">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total Deals:</Text>
                  <Text strong>{salesReports?.totalDeals}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Avg Deal Size:</Text>
                  <Text strong>${salesReports?.avgDealSize.toLocaleString()}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Est. Commission:</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    ${salesReports?.estimatedCommission.toLocaleString()}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Avg Response Time:</Text>
                  <Text strong>{analytics?.summary.avgResponseTime} min</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Lead Performance">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total Leads:</Text>
                  <Text strong>{leadAnalytics?.total}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Conversion Rate:</Text>
                  <Text strong style={{ color: '#52c41a' }}>{leadAnalytics?.conversionRate}%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Avg Time to Close:</Text>
                  <Text strong>{leadAnalytics?.avgTimeToClose} days</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Active Opportunities:</Text>
                  <Text strong>{analytics?.summary.totalOpportunities}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Top Performing Properties Table */}
        <Card title={<><TrophyOutlined /> Top Performing Properties</>}>
          <Table
            dataSource={analytics?.propertyPerformance || []}
            columns={propertyColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  );
}
