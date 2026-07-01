import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag, Progress, Skeleton, message } from "antd";
import {
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  DownloadOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;
const AntCard = Card as any;

const COLORS = ['#b40101', '#373a4b', '#667eea', '#43e97b', '#f59e0b'];

export default function Analytics() {
  const isMobile = useIsMobile();
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [leadAnalytics, setLeadAnalytics] = useState<any>(null);
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null);
  const [salesReports, setSalesReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '12m'>('30d');

  const agentId = parentAgent?.id;
  const token = parentAgent?.token;

  useEffect(() => {
    if (agentId) fetchAnalytics();
    else setLoading(false);
  }, [agentId]);

  const fetchAnalytics = async () => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Each section loads independently — one failure (network or 500) falls
    // back to safe defaults instead of blanking the whole page.
    const load = async (url: string, fallback: any) => {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { data: await res.json(), ok: true };
      } catch {
        return { data: fallback, ok: false };
      }
    };

    try {
      const [agent, lead, prop, sales] = await Promise.all([
        load(`/api/analytics/agent/${agentId}`, { summary: { totalListings: 0, activeListings: 0, totalLeads: 0, newLeads: 0, closedLeads: 0, conversionRate: 0, avgResponseTime: 0, totalOpportunities: 0 }, charts: { leadSources: [] }, propertyPerformance: [] }),
        load(`/api/analytics/leads/${agentId}`, { total: 0, conversionRate: 0, avgTimeToClose: 0, statusBreakdown: {} }),
        load(`/api/analytics/properties/${agentId}`, { priceRanges: {}, averages: { price: 0, viewCount: 0, leadCount: 0, daysOnMarket: 0 } }),
        load(`/api/analytics/sales/${agentId}`, { totalVolume: 0, totalDeals: 0, avgDealSize: 0, estimatedCommission: 0, salesByMonth: [] })
      ]);

      setAnalytics(agent.data);
      setLeadAnalytics(lead.data);
      setPropertyAnalytics(prop.data);
      setSalesReports(sales.data);

      const failed = [agent, lead, prop, sales].filter(r => !r.ok).length;
      if (failed > 0) {
        message.warning(`${failed} of 4 analytics sections could not be loaded. Showing partial data.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/analytics/export/${agentId}?range=${dateRange}`, { headers });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col xs={12} md={6} key={i}>
              <AntCard><Skeleton active paragraph={{ rows: 1 }} /></AntCard>
            </Col>
          ))}
        </Row>
        <AntCard style={{ marginTop: 16 }}><Skeleton active paragraph={{ rows: 6 }} /></AntCard>
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
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '16px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <LineChartOutlined /> Analytics Dashboard
            </Title>
            <Text type="secondary">Performance metrics and insights</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <div style={{ background: '#f0f0f0', padding: '4px', borderRadius: '8px', display: 'flex' }}>
              {(['30d', '90d', '12m'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: dateRange === r ? '#b40101' : 'transparent',
                    color: dateRange === r ? 'white' : '#374151',
                  }}
                >
                  {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '12 Months'}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportReport}
              style={{
                padding: '8px 14px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                background: 'white',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <DownloadOutlined /> Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <Statistic
                title="Total Listings"
                value={analytics?.summary.totalListings || 0}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#b40101' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.activeListings || 0} active
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <Statistic
                title="Total Leads"
                value={analytics?.summary.totalLeads || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#373a4b' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.newLeads || 0} new this month
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <Statistic
                title="Conversion Rate"
                value={analytics?.summary.conversionRate || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {analytics?.summary.closedLeads || 0} closed deals
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <Statistic
                title="Sales Volume"
                value={salesReports?.totalVolume || 0}
                prefix="$"
                valueStyle={{ color: '#b40101' }}
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
            <Card title="Sales Performance (Last 12 Months)" style={{ height: 400, transition: 'box-shadow 0.3s ease' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesReports?.salesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="volume" stroke="#b40101" strokeWidth={3} name="Sales Volume" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Lead Sources" style={{ height: 400, transition: 'box-shadow 0.3s ease' }}>
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

        {/* Conversion Funnel (real lead-stage progression) */}
        {Array.isArray(leadAnalytics?.funnel) && leadAnalytics.funnel.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <AntCard title="Conversion Funnel">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {leadAnalytics.funnel.map((stage: any, i: number) => {
                    const top = leadAnalytics.funnel[0]?.count || 0;
                    const pct = top > 0 ? Math.round((stage.count / top) * 100) : 0;
                    const prev = i > 0 ? leadAnalytics.funnel[i - 1].count : stage.count;
                    const stepPct = prev > 0 ? Math.round((stage.count / prev) * 100) : 0;
                    return (
                      <div key={stage.stage}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text strong>{stage.stage}</Text>
                          <Text type="secondary">
                            {stage.count} {i > 0 && `(${stepPct}% from prev)`}
                          </Text>
                        </div>
                        <Progress percent={pct} strokeColor={COLORS[i % COLORS.length]} showInfo={false} />
                      </div>
                    );
                  })}
                </Space>
              </AntCard>
            </Col>
          </Row>
        )}

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
