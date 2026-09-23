import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "published",
    featured: false,
    category: "Architecture & Design"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch('/api/blog?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleOpenAdd = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      status: "published",
      featured: false,
      category: "Architecture & Design"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImage: post.coverImage || "",
      status: post.status || "published",
      featured: post.featured || false,
      category: post.categories?.[0]?.name || "Architecture & Design"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;

    try {
      if (editingPost) {
        const res = await fetch(`/api/blog/${editingPost.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Create failed');
      }
      setShowModal(false);
      fetchPosts();
    } catch {
      alert('Failed to save article.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        setDeleteCandidate(null);
      }
    } catch {
      alert('Failed to delete post.');
    }
  };

  const handleToggleFeatured = async (post: any) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const res = await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ featured: !post.featured })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, featured: !p.featured } : p));
      }
    } catch {}
  };

  const filteredPosts = posts.filter(p => {
    if (statusFilter !== 'ALL' && p.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchText && !p.title?.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#b40101] font-semibold mb-1">
            Editorial Publications Desk
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            The Torra Journal Management
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Curate architectural viewpoints, quarterly market dispatches, and interior monographs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Compose Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'published', 'draft'].map(st => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'ALL' ? 'All Publications' : st.charAt(0).toUpperCase() + st.slice(1)}
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
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search article titles..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#b40101] rounded-full animate-spin mx-auto mb-3" />
            Loading editorial ledger...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium text-stone-700 mb-1">No articles found</p>
            <p className="text-xs text-stone-400">Compose and publish insightful market perspectives for your luxury clients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  <th className="py-3 px-5">Editorial Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Publication State</th>
                  <th className="py-3 px-4 text-center">Featured Lead</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&q=80'}
                          alt={post.title}
                          className="w-12 h-9 object-cover rounded border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-sm">
                          <div className="font-semibold text-stone-900 text-sm truncate">{post.title}</div>
                          <div className="text-[11px] text-stone-400 truncate">{post.excerpt || 'Editorial commentary'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      {post.categories?.[0]?.name || 'Architecture'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        post.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {post.status || 'Draft'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-1 rounded transition-colors ${
                          post.featured ? 'text-amber-500' : 'text-stone-300 hover:text-stone-600'
                        }`}
                        title={post.featured ? 'Featured on Journal Cover' : 'Standard Article'}
                      >
                        <Star className={`w-4 h-4 ${post.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/blog/${post.slug || post.id}`}
                          target="_blank"
                          className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          title="View Publication"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(post.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          title="Delete Article"
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
      </div>

      {/* Delete Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Unpublish Article</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you wish to delete this publication from The Torra Journal? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteCandidate(null)} className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
              <button onClick={() => handleDelete(deleteCandidate)} className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Compose / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl text-stone-900">
                {editingPost ? "Edit Publication" : "Compose Journal Article"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modernist Austin: The Architecture of Mid-Century Waterfronts"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Editorial Excerpt / Subhead</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A critical inspection of natural stone and floor-to-ceiling glass..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Subject Topic</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    <option value="Architecture & Design">Architecture & Design</option>
                    <option value="Market Reports">Market Intelligence</option>
                    <option value="Lifestyle & Neighborhoods">Luxury Lifestyle</option>
                    <option value="Private Wealth">Private Wealth Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Publication State</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Internal Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Article Body Content *</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Draft your editorial prose here..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded shadow-xs">
                  {submitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
