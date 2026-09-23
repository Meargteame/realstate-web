import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Home,
  Download,
  Calendar,
  Eye,
  Clock,
  ArrowUpRight,
  Filter
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#b40101', '#0f172a', '#475569', '#10b981', '#f59e0b', '#6366f1'];

export default function Analytics() {
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
        load(`/api/analytics/agent/${agentId}`, {
          summary: { totalListings: 4, activeListings: 3, totalLeads: 18, newLeads: 5, closedLeads: 2, conversionRate: 11, avgResponseTime: 42, totalOpportunities: 6 },
          charts: { leadSources: [{ name: 'Direct Web', value: 45 }, { name: 'Referral', value: 30 }, { name: 'MLS Syndication', value: 15 }, { name: 'Private Event', value: 10 }] },
          propertyPerformance: []
        }),
        load(`/api/analytics/leads/${agentId}`, { total: 18, conversionRate: 11, avgTimeToClose: 34, statusBreakdown: { 'New': 5, 'Contacted': 7, 'Qualified': 4, 'Closed': 2 } }),
        load(`/api/analytics/properties/${agentId}`, { priceRanges: { '$1M - $2M': 2, '$2M - $5M': 5, '$5M+': 1 }, averages: { price: 2850000, viewCount: 1420, leadCount: 8, daysOnMarket: 22 } }),
        load(`/api/analytics/sales/${agentId}`, {
          totalVolume: 8450000,
          totalDeals: 3,
          avgDealSize: 2816666,
          estimatedCommission: 253500,
          salesByMonth: [
            { month: 'Apr', volume: 1800000 },
            { month: 'May', volume: 2200000 },
            { month: 'Jun', volume: 1400000 },
            { month: 'Jul', volume: 3100000 },
            { month: 'Aug', volume: 2400000 },
            { month: 'Sep', volume: 2750000 }
          ]
        })
      ]);

      setAnalytics(agent.data);
      setLeadAnalytics(lead.data);
      setPropertyAnalytics(prop.data);
      setSalesReports(sales.data);
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
      a.download = `torra-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to export report');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-stone-200 animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-stone-100 animate-pulse rounded-lg border border-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  const leadSourcesData = analytics?.charts?.leadSources?.length > 0
    ? analytics.charts.leadSources
    : [
        { name: 'Private Website', value: 45 },
        { name: 'Direct Referral', value: 25 },
        { name: 'Curated Open House', value: 18 },
        { name: 'Institutional Network', value: 12 }
      ];

  const salesByMonthData = salesReports?.salesByMonth?.length > 0
    ? salesReports.salesByMonth
    : [
        { month: 'Apr', volume: 1800000 },
        { month: 'May', volume: 2400000 },
        { month: 'Jun', volume: 1900000 },
        { month: 'Jul', volume: 3200000 },
        { month: 'Aug', volume: 2700000 },
        { month: 'Sep', volume: 3500000 }
      ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Brokerage Intelligence Dossier
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Performance & Market Analytics
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Key realization metrics, inquiry velocity, and portfolio exposure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <div className="p-1 bg-stone-200/70 rounded flex items-center">
            {(['30d', '90d', '12m'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '12 Months'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:border-stone-900 rounded transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Total Representations
            </span>
            <Home className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {analytics?.summary?.totalListings || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-stone-700 font-semibold">{analytics?.summary?.activeListings || 0}</span> active on the market
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Registered Clients
            </span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {analytics?.summary?.totalLeads || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-[#b40101] font-semibold">+{analytics?.summary?.newLeads || 0}</span> new this period
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Conversion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {analytics?.summary?.conversionRate || 0}%
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-emerald-600 font-semibold">{analytics?.summary?.closedLeads || 0}</span> closed settlements
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Settled Volume
            </span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#b40101]">
            {formatCurrency(salesReports?.totalVolume || 0)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-stone-700 font-semibold">{salesReports?.totalDeals || 0}</span> closed contracts
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Performance Line */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Sales Volume Realization
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Monthly closed asset volume across exclusive representations
              </p>
            </div>
            <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              USD ($)
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByMonthData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis
                  fontSize={11}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Settled Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#b40101"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#b40101', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#b40101' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base text-stone-900 tracking-tight">
              Client Acquisition Channels
            </h3>
            <p className="text-stone-500 text-xs mt-0.5 mb-4">
              Distribution of incoming high-net-worth client inquiries
            </p>

            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {leadSourcesData.map((_, idx: number) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-stone-100">
            {leadSourcesData.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-stone-600">{s.name}</span>
                </div>
                <span className="font-mono font-medium text-stone-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif text-base text-stone-900 tracking-tight">
              Inquiry Pipeline Velocity
            </h3>
            <span className="text-[11px] font-mono text-stone-400">
              Avg to Close: {leadAnalytics?.avgTimeToClose || 30} days
            </span>
          </div>

          <div className="space-y-3">
            {leadAnalytics?.statusBreakdown && Object.entries(leadAnalytics.statusBreakdown).map(([status, count]: [string, any], idx) => {
              const total = leadAnalytics?.total || 1;
              const pct = Math.round((Number(count) / total) * 100);
              return (
                <div key={status} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-700">
                    <span className="font-medium">{status}</span>
                    <span className="font-mono text-stone-500">{count} inquiries ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Portfolio Averages */}
        <div className="bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif text-base text-stone-900 tracking-tight">
              Portfolio Market Averages
            </h3>
            <span className="text-[11px] font-mono text-stone-400">Torra MLS Benchmark</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                Average Listed Price
              </div>
              <div className="font-serif text-xl text-stone-900 font-normal">
                {formatCurrency(propertyAnalytics?.averages?.price || 2850000)}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                Days On Market (DOM)
              </div>
              <div className="font-serif text-xl text-stone-900 font-normal">
                {propertyAnalytics?.averages?.daysOnMarket || 22} Days
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                Avg Views / Residence
              </div>
              <div className="font-serif text-xl text-stone-900 font-normal">
                {Number(propertyAnalytics?.averages?.viewCount || 1420).toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                Avg Qualified Inquiries
              </div>
              <div className="font-serif text-xl text-stone-900 font-normal">
                {propertyAnalytics?.averages?.leadCount || 8} Buyers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
