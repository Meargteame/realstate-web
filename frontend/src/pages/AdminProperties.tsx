import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Star,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchProperties();
  }, [page, debouncedSearch, statusFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('torra_user');
      if (!userData) return;
      const token = JSON.parse(userData).token;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        search: debouncedSearch,
        status: statusFilter
      });

      const res = await fetch(`/api/admin/properties?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
      }
    } catch {
      console.error('Failed to update status');
    }
  };

  const handleToggleFeatured = async (propertyId: string, featured: boolean) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ featured: !featured })
      });
      if (res.ok) {
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, featured: !featured } : p));
      }
    } catch {
      console.error('Failed to toggle featured');
    }
  };

  const handleDelete = async (propertyId: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setDeleteCandidate(null);
      }
    } catch {
      alert('Failed to delete property');
    }
  };

  const handleBulkStatusApply = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/admin/properties/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: bulkStatus })
          })
        )
      );
      setSelectedIds([]);
      setBulkStatus("");
      fetchProperties();
    } catch {
      alert('Failed to update bulk status');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Global Asset Repository
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Residences Governance
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Audit public listings, toggle featured placement, and verify broker representations.
          </p>
        </div>

        <div className="font-mono text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded">
          Total Inventory: <span className="font-semibold text-stone-900">{total} Residences</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: "", label: "All Residences" },
            { key: "Active", label: "Active" },
            { key: "Pending", label: "Pending" },
            { key: "Sold", label: "Sold" },
            { key: "Inactive", label: "Inactive" }
          ].map(st => {
            const isSelected = statusFilter === st.key;
            return (
              <button
                key={st.key}
                onClick={() => { setStatusFilter(st.key); setPage(1); }}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
            placeholder="Search address, city, or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-stone-900 text-white p-3 px-5 rounded-lg flex items-center justify-between shadow-md">
          <span className="text-xs font-medium">
            {selectedIds.length} residences selected
          </span>
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded border border-stone-700 focus:outline-none"
            >
              <option value="">Apply Status Change...</option>
              <option value="Active">Mark Active</option>
              <option value="Pending">Mark Pending</option>
              <option value="Sold">Mark Sold</option>
              <option value="Inactive">Mark Inactive</option>
            </select>
            <button
              onClick={handleBulkStatusApply}
              disabled={!bulkStatus}
              className="px-3 py-1.5 text-xs bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 text-white rounded font-medium"
            >
              Execute
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Auditing property repository...
          </div>
        ) : properties.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Home className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No residences matching query</p>
            <p className="text-xs text-stone-400">Try adjusting status or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === properties.length && properties.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? properties.map(p => p.id) : [])}
                      className="rounded text-[#b40101] focus:ring-[#b40101]"
                    />
                  </th>
                  <th className="py-3 px-4">Residence</th>
                  <th className="py-3 px-4">Licensed Broker</th>
                  <th className="py-3 px-4">Valuation</th>
                  <th className="py-3 px-4">Governance Status</th>
                  <th className="py-3 px-4 text-center">Curated Feature</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {properties.map((prop) => {
                  const isSelected = selectedIds.includes(prop.id);
                  return (
                    <tr key={prop.id} className={`hover:bg-stone-50/70 transition-colors ${isSelected ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedIds(prev =>
                              e.target.checked ? [...prev, prop.id] : prev.filter(id => id !== prop.id)
                            );
                          }}
                          className="rounded text-[#b40101] focus:ring-[#b40101]"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.images?.[0] || prop.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&q=80'}
                            alt={prop.address}
                            className="w-12 h-10 object-cover rounded border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 text-sm truncate max-w-xs">
                              {prop.title || prop.address}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate">
                              {prop.address}, {prop.city}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={prop.agent?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(prop.agent?.name || 'A')}&background=111827&color=fff&size=64`}
                            alt={prop.agent?.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <span className="text-stone-700 font-medium">{prop.agent?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-serif text-sm font-normal text-stone-900 whitespace-nowrap">
                        {formatCurrency(prop.price)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={prop.status || 'Active'}
                          onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer shadow-2xs"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Sold">Sold</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                          className={`p-1 rounded transition-colors ${
                            prop.featured ? 'text-amber-500' : 'text-stone-300 hover:text-stone-600'
                          }`}
                          title={prop.featured ? 'Featured on Homepage' : 'Standard Listing'}
                        >
                          <Star className={`w-4 h-4 ${prop.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/properties/${prop.id}`}
                            target="_blank"
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                            title="View Presentation"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteCandidate(prop.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                            title="Delete Residence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="p-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing page {page} of {totalPages} ({total} total)
            </span>
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

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Purge Residence Mandate</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you certain you wish to purge this property from the Torra database? All public inquiries and associated analytics will be unlinked.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteCandidate)}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded transition-colors"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
