import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Home,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Video,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useIsMobile } from "../hooks/useBreakpoint";

export default function CommandLayout() {
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
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
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
    
    // Only agents and admins can access the command center
    if (parsed.role === 'user' && !parsed.agentId) {
      navigate("/account");
      return;
    }
    
    const effectiveAgentId = parsed.agentId || parsed.id;
    
    setCurrentAgent({
      id: effectiveAgentId,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role || 'agent',
      token: parsed.token,
      imageUrl: parsed.imageUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      leads: [],
      properties: []
    });

    if (!effectiveAgentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/agents/${effectiveAgentId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            return 'CREATE_AGENT';
          }
          throw new Error("Agent fetch failed");
        }
        return res.json();
      })
      .then(async (result) => {
        if (result === 'CREATE_AGENT') {
          try {
            const createRes = await fetch('/api/agents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${parsed.token}`
              },
              body: JSON.stringify({
                name: parsed.name || parsed.email.split('@')[0],
                email: parsed.email,
                phone: 'Not provided',
                brokerage: 'TORRA Private Client Group',
                license: 'Pending',
                languages: ['English']
              })
            });
            if (createRes.ok) {
              const newAgent = await createRes.json();
              const updatedUser = { ...parsed, agentId: newAgent.id };
              localStorage.setItem('torra_user', JSON.stringify(updatedUser));
              const imageUrl = newAgent.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newAgent.name)}&background=111827&color=fff&size=128`;
              setCurrentAgent({
                ...newAgent,
                token: parsed.token,
                imageUrl
              });
              setNewLeadsCount((newAgent.leads || []).filter((l: any) => l.status === 'New').length);
              setListingsCount((newAgent.properties || []).length);
            }
          } catch (err) {
            console.error('Failed to auto-create agent:', err);
          }
          setLoading(false);
          return;
        }
        if (result) {
          const imageUrl = result.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&background=111827&color=fff&size=128`;
          setCurrentAgent({
            ...result,
            token: parsed.token,
            imageUrl
          });
          setNewLeadsCount((result.leads || []).filter((l: any) => l.status === 'New').length);
          setListingsCount((result.properties || []).length);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("torra_user");
    navigate("/login");
  };

  const navItems = [
    { path: '/command', label: 'Overview', icon: LayoutDashboard },
    { path: '/command/leads', label: 'Client CRM', icon: Users, badge: newLeadsCount },
    { path: '/command/inbox', label: 'Concierge Inbox', icon: Inbox },
    { path: '/command/listings', label: 'Residence Portfolio', icon: Home, badge: listingsCount },
    { path: '/command/opportunities', label: 'Pipeline & Deals', icon: TrendingUp },
    { path: '/command/calendar', label: 'Showings & Schedule', icon: Calendar },
    { path: '/command/analytics', label: 'Intelligence & GCI', icon: BarChart3 },
    { path: '/command/video/start', label: 'Virtual Showing', icon: Video },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-10 h-10 border-2 border-stone-800 border-t-[#b40101] rounded-full animate-spin mb-4" />
        <span className="font-serif tracking-widest text-xs uppercase text-stone-400">Authenticating Command Suite...</span>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0f12] text-stone-200 border-r border-stone-800/80">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-stone-800/70">
        <Link to="/command" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[#b40101] text-white flex items-center justify-center font-serif text-lg tracking-tight rounded-sm shadow-sm group-hover:bg-[#900101] transition-colors">
            T
          </div>
          <div>
            <div className="font-serif text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
              Torra<span className="text-[#b40101]">.</span>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">HQ</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium mt-1">
              Command Suite
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
          Brokerage Core
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/command' && location.pathname.startsWith(item.path));
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
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#b40101] text-white' : 'bg-stone-800 text-stone-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-stone-400 font-semibold">
          Public Gateway
        </div>
        <Link
          to={`/agents/${currentAgent?.id || ''}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-stone-400" />
            <span>Public Profile Page</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
        <Link
          to="/properties"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-stone-400" />
            <span>Market Listings Feed</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      {/* User Footer Profile & Settings */}
      <div className="p-3 border-t border-stone-800/80 bg-[#0a0c0e]">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/60 mb-2">
          <img
            src={currentAgent?.imageUrl}
            alt={currentAgent?.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-700 shrink-0"
            onError={(e: any) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentAgent?.name || 'Agent')}&background=b40101&color=fff&size=128`;
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate">
              {currentAgent?.name || 'Private Advisor'}
            </div>
            <div className="text-[11px] text-stone-400 truncate capitalize font-mono">
              {currentAgent?.role || 'Licensed Partner'}
            </div>
          </div>
          <Link
            to="/command/settings"
            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
            title="Account Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Command Suite</span>
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
                {currentAgent?.name ? `Portfolio of ${currentAgent.name}` : 'Command Suite'}
              </h1>
              <p className="text-[11px] text-stone-400 uppercase tracking-widest hidden sm:block">
                Torra Private Brokerage System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Contact Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchVal.trim()) {
                  navigate(`/command/leads?q=${encodeURIComponent(searchVal.trim())}`);
                }
              }}
              className="relative hidden md:block"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search CRM clients..."
                className="w-56 pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
              />
            </form>

            {/* Notification Bell */}
            <Link
              to="/command/inbox"
              className="relative p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              title="Inbox Alerts"
            >
              <Bell className="w-4 h-4" />
              {newLeadsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b40101] ring-2 ring-white" />
              )}
            </Link>

            {/* Create Listing Button */}
            <button
              onClick={() => navigate('/command/listings')}
              className="inline-flex items-center gap-2 bg-[#b40101] hover:bg-[#900101] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded text-xs font-medium tracking-wide shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Residence</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Child Page Content */}
        <main className="flex-1 bg-[#f8fafc]">
          <Outlet context={{ agent: currentAgent }} />
        </main>
      </div>
    </div>
  );
}
