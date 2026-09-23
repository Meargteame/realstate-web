import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Award,
  Home,
  FileText,
  FolderLock,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function AdminLayout() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const storedUser = localStorage.getItem("torra_user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(storedUser);
    } catch {
      navigate("/login");
      return;
    }
    
    // Check if user is admin
    if (parsed.role !== 'admin') {
      navigate("/");
      return;
    }

    setCurrentUser({
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      imageUrl: parsed.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name)}&background=b40101&color=fff&size=128`
    });
    
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("torra_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c0e] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-10 h-10 border-2 border-stone-800 border-t-[#b40101] rounded-full animate-spin mb-4" />
        <span className="font-serif tracking-widest text-xs uppercase text-stone-400">Authenticating Executive Governance Suite...</span>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Platform Executive' },
    { path: '/admin/properties', icon: Home, label: 'Global Residences' },
    { path: '/admin/agents', icon: Award, label: 'Broker Roster' },
    { path: '/admin/users', icon: Users, label: 'Client Accounts' },
    { path: '/admin/blog', icon: FileText, label: 'Journal Publishing' },
    { path: '/admin/documents', icon: FolderLock, label: 'Institutional Archive' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Platform Telemetry' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0c0e] text-stone-200 border-r border-stone-800/80">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-stone-800/70">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[#b40101] text-white flex items-center justify-center font-serif text-lg tracking-tight rounded-sm shadow-sm group-hover:bg-[#900101] transition-colors">
            T
          </div>
          <div>
            <div className="font-serif text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
              Torra<span className="text-[#b40101]">.</span>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 font-semibold border border-rose-900/60">Admin</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium mt-1">
              Governance Desk
            </div>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-stone-400 hover:text-white rounded-md hover:bg-stone-800/60"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-stone-400 font-semibold">
          Platform Governance
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium tracking-wide transition-all group ${
                isActive
                  ? 'bg-stone-800 text-white font-semibold shadow-sm border-l-2 border-[#b40101]'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#b40101]' : 'text-stone-400 group-hover:text-stone-200'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-stone-400 font-semibold">
          Quick Switches
        </div>
        <Link
          to="/command"
          className="flex items-center justify-between px-3.5 py-2 rounded text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-stone-400" />
            <span>Broker Command Suite</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-stone-400" />
            <span>Public Flagship Site</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      {/* User Footer Profile & Settings */}
      <div className="p-3 border-t border-stone-800/80 bg-[#08090b]">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/60 mb-2">
          <img
            src={currentUser?.imageUrl}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate">
              {currentUser?.name || 'Administrator'}
            </div>
            <div className="text-[11px] text-emerald-400 truncate capitalize font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Super Administrator</span>
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Administrative Suite</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-stone-900 flex font-sans antialiased">
      {/* Desktop Sider */}
      {!isMobile && (
        <aside className="w-64 fixed inset-y-0 left-0 z-40">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-950/70 z-50 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      {isMobile && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </aside>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobile ? 'ml-64' : ''}`}>
        {/* Top Executive Header */}
        <header className="h-18 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-stone-700 hover:text-stone-950 rounded-md hover:bg-stone-100"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-normal text-stone-900 tracking-tight leading-tight">
                Torra Executive Governance Console
              </h1>
              <p className="text-[11px] text-stone-400 uppercase tracking-widest hidden sm:block">
                Institutional Administration & Audit Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/analytics"
              className="relative p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              title="Telemetry Alerts"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link
              to="/properties"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </Link>
          </div>
        </header>

        {/* Child Page Content */}
        <main className="flex-1 bg-[#f8fafc]">
          <Outlet context={{ user: currentUser }} />
        </main>
      </div>
    </div>
  );
}
