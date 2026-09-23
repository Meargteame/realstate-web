import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building,
  UserCheck,
  Shield,
  X
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  // New Agent Form
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    license: "",
    brokerage: "TORRA Private Client Group",
    specialties: "Waterfront Estates, Architectural Penthouses"
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [page, debouncedSearch]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        search: debouncedSearch
      });

      const res = await fetch(`/api/admin/agents?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: newStatus } : a));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        setDeleteCandidate(null);
      }
    } catch {
      alert('Failed to delete agent');
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newAgent,
          languages: ['English'],
          specialties: newAgent.specialties.split(',').map(s => s.trim())
        })
      });
      if (!res.ok) throw new Error('Create failed');
      setIsModalOpen(false);
      setNewAgent({ name: "", email: "", phone: "", license: "", brokerage: "TORRA Private Client Group", specialties: "" });
      fetchAgents();
    } catch {
      alert('Failed to add agent.');
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const activeCount = agents.filter(a => a.status === 'active').length;
  const pendingCount = agents.filter(a => a.status === 'pending').length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Broker Accreditation Registry
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Licensed Advisors & Partners
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Audit licensing credentials, approve advisor registrations, and review production volumes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Accredit New Advisor</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Active Verified Advisors
          </div>
          <div className="font-serif text-2xl text-stone-900 font-normal">
            {activeCount || total}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Authorized listing representatives</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-[#b40101] font-semibold mb-1">
            Pending Licensure Review
          </div>
          <div className="font-serif text-2xl text-[#b40101] font-normal">
            {pendingCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Awaiting compliance sign-off</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-xs">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Total Advisor Network
          </div>
          <div className="font-serif text-2xl text-stone-900 font-normal">
            {total}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Statewide brokerage footprint</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
            placeholder="Search advisor by name, email, or license..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Loading broker register...
          </div>
        ) : agents.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Award className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No advisors found</p>
            <p className="text-xs text-stone-400">Try adjusting search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-5">Advisor</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">License & Brokerage</th>
                  <th className="py-3 px-4">Portfolio Units</th>
                  <th className="py-3 px-4">Accreditation</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {agents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={ag.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ag.name)}&background=0f172a&color=fff&size=80`}
                          alt={ag.name}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 text-sm">{ag.name}</div>
                          <div className="text-[11px] text-stone-400">Joined {new Date(ag.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5 text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-stone-400" /><span>{ag.email}</span></div>
                      {ag.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-stone-400" /><span>{ag.phone}</span></div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900">{ag.brokerage || 'Torra Private Brokerage'}</div>
                      <div className="text-[11px] text-stone-400 font-mono">Lic #{ag.license || 'TREC-Pending'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-700">
                      {ag.stats?.totalListings || ag.properties?.length || 0} active
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ag.status || 'active'}
                        onChange={(e) => handleStatusChange(ag.id, e.target.value)}
                        className="px-2 py-1 text-xs font-semibold rounded border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer shadow-2xs"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/agents/${ag.id}`}
                          target="_blank"
                          className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          title="View Public Bio"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteCandidate(ag.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          title="Revoke Credentials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="p-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-stone-200 hover:bg-stone-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-stone-200 hover:bg-stone-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Revoke Advisor Accreditation</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to revoke this advisor's brokerage credentials? Their public representations and client links will be archived.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteCandidate(null)} className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
              <button onClick={() => handleDelete(deleteCandidate)} className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded">Confirm Revoke</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg text-stone-900">Accredit New Advisor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Harrison Sterling"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Direct Email *</label>
                <input
                  type="email"
                  required
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="advisor@torra.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    placeholder="+1 (512) 555-0144"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">License #</label>
                  <input
                    type="text"
                    value={newAgent.license}
                    onChange={(e) => setNewAgent({ ...newAgent, license: e.target.value })}
                    placeholder="TREC-784930"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Specialties</label>
                <input
                  type="text"
                  value={newAgent.specialties}
                  onChange={(e) => setNewAgent({ ...newAgent, specialties: e.target.value })}
                  placeholder="Waterfront Estates, Hill Country Compounds"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
                <button type="submit" disabled={creating} className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded shadow-xs">
                  {creating ? 'Saving...' : 'Add Advisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
