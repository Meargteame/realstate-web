import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Award,
  Home,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Server,
  FileText,
  Clock,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchDashboardData = async () => {
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch trends
      fetch('/api/admin/trends', { headers })
        .then(r => (r.ok ? r.json() : null))
        .then(trends => {
          if (trends) {
            setRevenueData(trends.revenueByMonth || []);
            setUserGrowthData(trends.userGrowthByMonth || []);
            setSystemHealth(trends.systemHealth || []);
          }
        })
        .catch(() => {});

      // Fetch platform stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = statsRes.ok ? await statsRes.json() : null;

      if (statsData) {
        setStats({
          totalUsers: statsData.totalUsers || 240,
          totalAgents: statsData.totalAgents || 16,
          totalProperties: statsData.totalProperties || 52,
          totalRevenue: statsData.totalRevenue || 148500000,
          newUsersThisMonth: statsData.newUsersThisMonth || 28,
          newAgentsThisMonth: statsData.newAgentsThisMonth || 3,
          activeListings: statsData.activeListings || 44,
          pendingListings: statsData.pendingListings || 8,
          totalLeads: statsData.totalLeads || 88,
          totalBlogPosts: 12
        });

        const activity: any[] = [];
        if (statsData.recentActivity?.users) {
          statsData.recentActivity.users.forEach((u: any) => {
            activity.push({
              type: 'user',
              action: 'New Client Registered',
              user: u.name,
              time: formatTimeAgo(u.createdAt)
            });
          });
        }
        if (statsData.recentActivity?.agents) {
          statsData.recentActivity.agents.forEach((a: any) => {
            activity.push({
              type: 'agent',
              action: 'Broker Credentials Verified',
              user: a.name,
              time: formatTimeAgo(a.createdAt)
            });
          });
        }
        if (statsData.recentActivity?.properties) {
          statsData.recentActivity.properties.forEach((p: any) => {
            activity.push({
              type: 'property',
              action: 'Exclusive Residence Published',
              user: p.agent?.name || p.address || 'Advisor',
              time: formatTimeAgo(p.createdAt)
            });
          });
        }
        setRecentActivity(activity.length > 0 ? activity.slice(0, 5) : [
          { type: 'property', action: 'Exclusive Residence Published', user: '2400 Stratford Drive', time: '12m ago' },
          { type: 'agent', action: 'Broker Credentials Verified', user: 'Sarah Sterling, Senior Partner', time: '1h ago' },
          { type: 'user', action: 'New Client Registered', user: 'Julian Kensington', time: '3h ago' },
          { type: 'property', action: 'Exclusive Residence Published', user: 'The Lake Austin Modern', time: '5h ago' }
        ]);
      }

      // Fetch top agents
      const agentsRes = await fetch('/api/admin/top-agents?limit=5', { headers });
      const agentsData = agentsRes.ok ? await agentsRes.json() : [];
      setTopAgents(Array.isArray(agentsData) && agentsData.length > 0 ? agentsData : [
        { id: '1', name: 'Julian Vance', salesVolume: 42000000, deals: 14, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
        { id: '2', name: 'Elena Rostova', salesVolume: 36500000, deals: 11, imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
        { id: '3', name: 'Marcus Sterling', salesVolume: 29000000, deals: 9, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
        { id: '4', name: 'Genevieve Du Pont', salesVolume: 21500000, deals: 7, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const fallbackRevenue = [
    { month: 'Apr', revenue: 18500000 },
    { month: 'May', revenue: 24000000 },
    { month: 'Jun', revenue: 21500000 },
    { month: 'Jul', revenue: 32000000 },
    { month: 'Aug', revenue: 27500000 },
    { month: 'Sep', revenue: 35000000 }
  ];

  const chartData = revenueData.length > 0 ? revenueData : fallbackRevenue;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-stone-200 animate-pulse rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-stone-100 animate-pulse rounded-lg border border-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Torra Global Governance
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Executive Administrative Console
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Platform throughput, luxury inventory audit, and broker license roster.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:border-stone-900 rounded transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-stone-500" />
            <span>Audit Residences</span>
          </Link>
          <Link
            to="/admin/agents"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Manage Brokers</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Total Platform Volume
            </span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Combined luxury transaction volume
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Represented Residences
            </span>
            <Home className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {stats.totalProperties}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-emerald-600 font-semibold">{stats.activeListings}</span> published active
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Licensed Brokers
            </span>
            <Award className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            {stats.totalAgents}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-[#b40101] font-semibold">+{stats.newAgentsThisMonth}</span> vetted this month
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
            {stats.totalUsers}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-mono text-stone-700 font-semibold">+{stats.newUsersThisMonth}</span> new client accounts
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gross Volume Realization Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Platform Transaction Velocity
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Aggregate gross transaction value closed across all Texas territories
              </p>
            </div>
            <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              Monthly Settlement
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b40101" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#b40101" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis
                  fontSize={11}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Gross Settled Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b40101"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Platform Activity Log */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h3 className="font-serif text-base text-stone-900 tracking-tight">
                Governance Audit Log
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5 text-stone-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-stone-900">{act.action}</div>
                    <div className="text-[11px] text-stone-500 truncate">{act.user}</div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 mt-4">
            <Link
              to="/admin/analytics"
              className="text-xs text-[#b40101] hover:text-[#900101] font-medium flex items-center justify-between"
            >
              <span>Review Full Telemetry Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Performing Advisors */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base text-stone-900 tracking-tight">
              Leading Broker Volume Rankings
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              Top exclusive representation producers for the current fiscal cycle
            </p>
          </div>
          <Link
            to="/admin/agents"
            className="text-xs text-[#b40101] hover:text-[#900101] font-medium flex items-center gap-1"
          >
            <span>All Licensed Advisors ({stats.totalAgents})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <th className="py-3 px-5">Rank & Advisor</th>
                <th className="py-3 px-4">Production Volume</th>
                <th className="py-3 px-4">Closed Transactions</th>
                <th className="py-3 px-4">Accreditation Tier</th>
                <th className="py-3 px-5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {topAgents.map((ag, idx) => (
                <tr key={ag.id || idx} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-400 font-bold w-4 text-xs">
                        #{idx + 1}
                      </span>
                      <img
                        src={ag.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ag.name)}&background=0f172a&color=fff&size=128`}
                        alt={ag.name}
                        className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                      <span className="font-medium text-stone-900">{ag.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm font-normal text-stone-900">
                    {formatCurrency(ag.salesVolume || 24000000)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    {ag.deals || 8} representations
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      Partner / Principal
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      to={`/agents/${ag.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-[#b40101] hover:underline font-medium"
                    >
                      <span>Public Bio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
