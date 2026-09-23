import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  Award,
  ChevronLeft,
  ChevronRight,
  Mail,
  X
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const [activeRole, setActiveRole] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const PAGE_SIZE = 12;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, activeRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        search: debouncedSearch,
        ...(activeRole !== 'all' ? { role: activeRole } : {})
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "user" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;

    try {
      if (editingUser) {
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Create failed');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      alert('Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeleteCandidate(null);
      }
    } catch {
      alert('Failed to delete user.');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const roleBadges: Record<string, string> = {
    admin: 'bg-rose-50 text-[#b40101] border-rose-200',
    agent: 'bg-stone-900 text-white border-stone-800',
    user: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Client Authentication Ledger
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            User Accounts & Permissions
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Audit registered luxury buyers, licensed advisors, and governance administrators.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: "all", label: "All Accounts" },
            { key: "user", label: "Private Clients" },
            { key: "agent", label: "Brokers" },
            { key: "admin", label: "Administrators" }
          ].map(r => {
            const isSelected = activeRole === r.key;
            return (
              <button
                key={r.key}
                onClick={() => { setActiveRole(r.key); setPage(1); }}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r.label}
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
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Loading accounts ledger...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No user accounts found</p>
            <p className="text-xs text-stone-400">Try adjusting search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-5">Account Name</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Security Role</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-xs shrink-0">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-stone-900 text-sm">{user.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                      {user.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${roleBadges[user.role] || roleBadges.user}`}>
                        {user.role === 'admin' ? 'Administrator' : user.role === 'agent' ? 'Licensed Broker' : 'Client Account'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(user.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          title="Delete Account"
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
            <h3 className="font-serif text-lg text-stone-900">Delete Account</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to delete this user profile? All saved searches and appointments will be revoked.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteCandidate(null)} className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
              <button onClick={() => handleDelete(deleteCandidate)} className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg text-stone-900">
                {editingUser ? "Edit User Permissions" : "Register User Profile"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alistair Drake"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Direct Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@austin.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Security Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                >
                  <option value="user">Private Client (User)</option>
                  <option value="agent">Licensed Broker (Agent)</option>
                  <option value="admin">System Administrator (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded shadow-xs">
                  {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
