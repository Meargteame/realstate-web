import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Space, Drawer, Typography, Badge, Dropdown, Avatar } from "antd";
import { GlobalOutlined, MenuOutlined, UserOutlined, SearchOutlined, HeartOutlined, CalendarOutlined, LogoutOutlined, DashboardOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import TorraLogo from "./TorraLogo";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('torra_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch { setCurrentUser(null); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('torra_user');
    setCurrentUser(null);
    navigate('/');
    window.location.reload();
  };

  const getUserMenuItems = () => {
    const items: any[] = [
      { key: 'account', icon: <UserOutlined />, label: 'My Account', onClick: () => navigate('/account') },
      { key: 'saved', icon: <HeartOutlined />, label: 'Saved Properties', onClick: () => navigate('/saved-searches') },
      { key: 'appointments', icon: <CalendarOutlined />, label: 'My Appointments', onClick: () => navigate('/account') },
    ];
    // Show dashboard link for agents/admins
    if (currentUser?.role === 'agent' || currentUser?.agentId) {
      items.push({ key: 'dashboard', icon: <DashboardOutlined />, label: 'Agent Dashboard', onClick: () => navigate('/command') });
    }
    if (currentUser?.role === 'admin') {
      items.push({ key: 'admin', icon: <DashboardOutlined />, label: 'Admin Panel', onClick: () => navigate('/admin') });
    }
    items.push({ type: 'divider' });
    items.push({ key: 'logout', icon: <LogoutOutlined />, label: 'Log Out', onClick: handleLogout, danger: true });
    return items;
  };

  const navItems = [
    { key: '/properties', label: <Link to="/properties">Search</Link> },
    { key: '/saved-searches', label: <Link to="/saved-searches">Saved</Link> },
    { key: '/open-houses', label: <Link to="/open-houses">Open Houses</Link> },
    { key: '/agents', label: <Link to="/agents">Find Agent</Link> },
    { key: '/become-agent', label: <Link to="/become-agent">Become Agent</Link> }
  ];

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Utility Bar - Hide on mobile */}
      {!isMobile && (
        <div style={{ 
          background: '#373a4b', 
          color: 'white', 
          padding: '10px 64px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '11px', 
          fontWeight: 700,
          letterSpacing: '0.05em',
          transition: 'all 0.3s'
        }}>
          <Space size="large">
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 600 }}>
              TORRA COMMERCIAL REAL ESTATE GROUP
            </Text>
          </Space>
          <Space size="large">
            <Link 
              to="/properties?type=luxury" 
              style={{ 
                color: 'white', 
                fontSize: '11px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#b40101'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              LUXURY
            </Link>
            <Link 
              to="/properties?type=land" 
              style={{ 
                color: 'white', 
                fontSize: '11px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#b40101'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              LAND
            </Link>
            <Link 
              to="/properties?type=commercial" 
              style={{ 
                color: 'white', 
                fontSize: '11px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#b40101'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              COMMERCIAL
            </Link>
            <Space size="small" style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.9)' }}>
              <GlobalOutlined />
              <span>EN</span>
            </Space>
          </Space>
        </div>
      )}

      {/* Main Header */}
      <AntHeader style={{ 
        background: isScrolled ? 'rgba(255,255,255,0.95)' : 'white',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        height: isMobile ? '64px' : '88px', 
        padding: isMobile ? '0 16px' : '0 64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        lineHeight: isMobile ? '64px' : '88px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: isScrolled ? 'none' : '1px solid #f0f0f0'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <TorraLogo size={isMobile ? 36 : 48} color="#b40101" compact showText />
        </Link>

        {/* Navigation - Desktop only */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Menu 
              mode="horizontal" 
              selectedKeys={[location.pathname]} 
              items={navItems}
              style={{ 
                border: 'none', 
                fontSize: '14px', 
                fontWeight: 700, 
                minWidth: '500px',
                justifyContent: 'center',
                background: 'transparent',
                letterSpacing: '0.02em'
              }}
            />
          </div>
        )}

        {/* Actions */}
        <Space size={isMobile ? "small" : "middle"}>
          {!isMobile && (
            <Button 
              type="text"
              icon={<SearchOutlined style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/properties')}
              style={{ 
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          )}
          {currentUser ? (
            <Dropdown menu={{ items: getUserMenuItems() }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Avatar 
                  size={isMobile ? 36 : 44}
                  src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=b40101&color=fff&size=128`}
                  style={{ backgroundColor: '#b40101', flexShrink: 0 }}
                >
                  {(currentUser.firstName || currentUser.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      {currentUser.firstName || currentUser.name?.split(' ')[0] || 'User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>
                      {currentUser.role === 'agent' ? 'Agent' : currentUser.role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              size={isMobile ? "middle" : "large"}
              onClick={() => navigate('/login')}
              style={{ 
                background: '#373a4b', 
                borderColor: '#373a4b', 
                fontWeight: 700,
                height: isMobile ? '40px' : '52px',
                padding: isMobile ? '0 16px' : '0 32px',
                borderRadius: isMobile ? '20px' : '26px',
                fontSize: isMobile ? '12px' : '14px',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 8px rgba(55,58,75,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2d3a';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(55,58,75,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#373a4b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(55,58,75,0.2)';
              }}
            >
              LOG IN
            </Button>
          )}
          {isMobile && (
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
              onClick={() => setVisible(true)}
              style={{ 
                height: '44px',
                width: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          )}
        </Space>

        <Drawer
          title={<TorraLogo size={32} color="#b40101" compact showText />}
          placement="right"
          onClose={() => setVisible(false)}
          open={visible}
          width={isMobile ? '85%' : 320}
        >
          <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]} 
            items={[...navItems, { key: '/login', label: <Link to="/login">Log In / Sign Up</Link> }]}
            style={{ border: 'none', fontSize: '15px', fontWeight: 600 }}
            onClick={() => setVisible(false)}
          />
        </Drawer>
      </AntHeader>
    </div>
  );
}
