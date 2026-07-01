import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Input, Badge, Button, Space, Typography, Spin } from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  TeamOutlined,
  HomeOutlined,
  LineChartOutlined,
  SettingOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  LogoutOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MenuOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Header, Sider, Content } = Layout;

export default function CommandLayout() {
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change or when switching to desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
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

    const parsed = JSON.parse(storedUser);
    
    // Only agents and admins can access the command center
    if (parsed.role === 'user' && !parsed.agentId) {
      navigate("/account");
      return;
    }
    
    // Use agentId if available, otherwise fallback to user id
    const effectiveAgentId = parsed.agentId || parsed.id;
    
    setCurrentAgent({
      id: effectiveAgentId,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role || 'agent',
      token: parsed.token,
      imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
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
            // Agent not found - auto-create one
            console.warn('Agent profile not found, creating one...');
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
                brokerage: 'TORRA Commercial Real Estate Group',
                license: 'Pending',
                languages: ['English']
              })
            });
            if (createRes.ok) {
              const newAgent = await createRes.json();
              // Update localStorage with new agentId
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

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large">
          <div style={{ marginTop: 16 }}>Loading Command Center...</div>
        </Spin>
      </div>
    );
  }

  const menuItems = [
    { key: '/command', icon: <DashboardOutlined />, label: 'Dashboard' },
    { 
      key: '/command/inbox', 
      icon: <InboxOutlined style={{ fontSize: '18px' }} />, 
      label: <Space size="small">Inbox {0 > 0 && <Badge count={0} size="small" />}</Space> 
    },
    { 
      key: '/command/leads', 
      icon: <TeamOutlined />, 
      label: <Space size="small">Contacts / Leads {newLeadsCount > 0 && <Badge count={newLeadsCount} size="small" />}</Space> 
    },
    { 
      key: '/command/listings', 
      icon: <HomeOutlined style={{ fontSize: '18px' }} />, 
      label: <Space size="small">My Listings {listingsCount > 0 && <Badge count={listingsCount} color="#b40101" size="small" />}</Space> 
    },
    { key: '/command/opportunities', icon: <LineChartOutlined />, label: 'Opportunities' },
    { key: '/command/calendar', icon: <CalendarOutlined />, label: 'Calendar' },
    { key: '/command/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
  ];

  const bottomMenuItems = [
    { key: '/command/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div style={{ 
        padding: '20px 20px 16px', 
        borderBottom: '1px solid #e5e7eb',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', height: '36px', background: '#b40101', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '16px', fontWeight: 900, letterSpacing: '-0.5px'
          }}>TR</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#b40101', letterSpacing: '-0.5px', lineHeight: 1 }}>TORRA</div>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Command Center</div>
          </div>
        </div>
        {isMobile && (
          <Button type="text" icon={<CloseOutlined />} onClick={() => setMobileMenuOpen(false)} style={{ color: '#6b7280' }} />
        )}
      </div>

      {/* Navigation Menu */}
      <div style={{ 
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 72px)', justifyContent: 'space-between'
      }}>
        <Menu 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => { if (key.startsWith('/')) navigate(key); }}
          style={{ background: 'transparent', border: 'none', fontSize: '14px' }}
          className="clean-sidebar-menu"
        />
        
        <div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
            <Menu 
              mode="inline" 
              selectedKeys={[location.pathname]} 
              items={bottomMenuItems} 
              onClick={({ key }) => {
                if (key === 'logout') handleLogout();
                else if (key.startsWith('/')) navigate(key);
              }}
              style={{ background: 'transparent', border: 'none', fontSize: '14px' }}
              className="clean-sidebar-menu"
            />
          </div>
          
          {/* Agent Profile at Bottom */}
          <div style={{ 
            padding: '12px', borderTop: '1px solid #e5e7eb', background: '#f9fafb',
            borderRadius: '8px', margin: '0 -4px', cursor: 'pointer', transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => { if (isMobile) return; e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseLeave={(e) => { if (isMobile) return; e.currentTarget.style.background = '#f9fafb'; }}
          onClick={() => navigate('/command/settings')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar src={currentAgent?.imageUrl} size={40} style={{ backgroundColor: '#b40101', flexShrink: 0 }}>
                {!currentAgent?.imageUrl && currentAgent?.name?.charAt(0)}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#111827', fontSize: '13px', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentAgent?.name}
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'capitalize', fontWeight: 500 }}>
                  {currentAgent?.role || 'Agent'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          width={260} 
          theme="light" 
          style={{ 
            position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, 
            background: '#ffffff', borderRight: '1px solid #e5e7eb', boxShadow: 'none'
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Mobile Sidebar Panel */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '280px', maxWidth: '80vw',
          background: '#fff', zIndex: 999,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
          overflowY: 'auto', overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}>
          {sidebarContent}
        </div>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 260, background: '#f9fafb' }}>
        <Header style={{ 
          background: '#fff', 
          padding: isMobile ? '0 12px' : '0 24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          borderBottom: '1px solid #e5e7eb', 
          position: 'sticky', top: 0, zIndex: 10, 
          height: isMobile ? '56px' : '72px',
          lineHeight: isMobile ? '56px' : '72px',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <Button type="text" icon={<MenuOutlined style={{ fontSize: 20 }} />} onClick={() => setMobileMenuOpen(true)} style={{ color: '#111827', padding: 4 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 400, color: '#111827', lineHeight: 1.2 }}>
                {isMobile ? currentAgent?.name?.split(' ')[0] : `Welcome back, ${currentAgent?.name?.split(' ')[0]}`}
              </div>
              {!isMobile && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {currentAgent?.role?.charAt(0).toUpperCase() + currentAgent?.role?.slice(1) || 'Agent'} Dashboard
                </div>
              )}
            </div>
          </div>
          <Space size={isMobile ? 'small' : 'middle'}>
            {!isMobile && (
              <Input 
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />} 
                placeholder="Search contacts..." 
                onPressEnter={(e) => navigate(`/command/leads?q=${e.currentTarget.value}`)}
                style={{ borderRadius: '8px', width: 200, height: '40px' }}
              />
            )}
            <Badge dot={newLeadsCount > 0}>
              <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6b7280' }} />
            </Badge>
            {!isMobile && (
              <Button 
                type="primary" icon={<PlusOutlined />} onClick={() => navigate('/command/listings')}
                style={{ background: '#b40101', borderColor: '#b40101', height: '40px', borderRadius: '6px', fontWeight: 400 }}
              >
                Create Listing
              </Button>
            )}
          </Space>
        </Header>

        <Content style={{ background: '#f9fafb', minHeight: 'calc(100vh - 72px)', padding: 0 }}>
          <Outlet context={{ agent: currentAgent }} />
        </Content>
      </Layout>
    </Layout>
  );
}
