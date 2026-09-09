import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Space, Drawer, Typography, Dropdown, Avatar, Badge } from "antd";
import { 
  MenuOutlined, 
  UserOutlined, 
  SearchOutlined, 
  HeartOutlined, 
  CalendarOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  CompassOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint";
import TorraLogo from "./TorraLogo";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
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

    try {
      const saved = JSON.parse(localStorage.getItem('torra_saved_properties') || '[]');
      if (Array.isArray(saved)) setSavedCount(saved.length);
    } catch {}
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('torra_user');
    setCurrentUser(null);
    navigate('/');
    window.location.reload();
  };

  const getUserMenuItems = () => {
    const items: any[] = [
      { key: 'account', icon: <UserOutlined />, label: 'My Account', onClick: () => navigate('/account') },
      { key: 'saved', icon: <HeartOutlined />, label: 'Saved Homes', onClick: () => navigate('/saved-searches') },
      { key: 'appointments', icon: <CalendarOutlined />, label: 'Tours & Appointments', onClick: () => navigate('/account') },
    ];
    if (currentUser?.role === 'agent' || currentUser?.agentId) {
      items.push({ key: 'dashboard', icon: <DashboardOutlined />, label: 'Agent Command Center', onClick: () => navigate('/command') });
    }
    if (currentUser?.role === 'admin') {
      items.push({ key: 'admin', icon: <DashboardOutlined />, label: 'Admin Portal', onClick: () => navigate('/admin') });
    }
    items.push({ type: 'divider' });
    items.push({ key: 'logout', icon: <LogoutOutlined />, label: 'Log Out', onClick: handleLogout, danger: true });
    return items;
  };

  const navItems = [
    { key: '/properties', label: <Link to="/properties">Buy</Link> },
    { key: '/properties?status=For+Rent', label: <Link to="/properties?status=For+Rent">Rent</Link> },
    { key: '/home-value', label: <Link to="/home-value">Sell / Home Value</Link> },
    { key: '/mortgage-calculator', label: <Link to="/mortgage-calculator">Mortgage</Link> },
    { key: '/agents', label: <Link to="/agents">Find an Agent</Link> },
  ];

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Utility Announcement Bar */}
      {!isMobile && (
        <div style={{ 
          background: '#090d16', 
          color: '#cbd5e1', 
          padding: '7px 48px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '12px', 
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <Text style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
              TORRA COMMERCIAL & LUXURY RESIDENTIAL BROKERAGE
            </Text>
          </div>
          <Space size="large">
            <Link to="/properties?type=Commercial" style={{ color: '#cbd5e1', fontSize: '12px', textDecoration: 'none' }}>Commercial</Link>
            <Link to="/properties?type=Land" style={{ color: '#cbd5e1', fontSize: '12px', textDecoration: 'none' }}>Land & Lots</Link>
            <Link to="/open-houses" style={{ color: '#cbd5e1', fontSize: '12px', textDecoration: 'none' }}>Open Houses</Link>
            <span style={{ color: '#ffffff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneOutlined style={{ color: '#ef4444' }} /> (469) 345-6868
            </span>
          </Space>
        </div>
      )}

      {/* Main Glassmorphic Header */}
      <AntHeader style={{ 
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        height: isMobile ? '64px' : '76px', 
        padding: isMobile ? '0 16px' : '0 48px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: isScrolled ? '0 10px 25px -5px rgba(15, 23, 42, 0.08)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        borderBottom: isScrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid #e2e8f0',
        lineHeight: isMobile ? '64px' : '76px',
        transition: 'all 0.25s ease'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <TorraLogo size={isMobile ? 36 : 42} color="#b40101" compact showText />
        </Link>

        {/* Navigation Tabs - Desktop */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={navItems}
              disabledOverflow
              style={{
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                background: 'transparent',
                letterSpacing: '0.01em'
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <Space size="middle" align="center">
          {!isMobile && (
            <Button 
              type="text"
              icon={<SearchOutlined style={{ fontSize: '18px', color: '#334155' }} />}
              onClick={() => navigate('/properties')}
              style={{ height: '42px', width: '42px', borderRadius: '50%' }}
              title="Search Properties"
            />
          )}

          {!isMobile && (
            <Badge count={savedCount} size="small" offset={[-2, 4]} color="#b40101">
              <Button 
                type="text"
                icon={<HeartOutlined style={{ fontSize: '18px', color: '#334155' }} />}
                onClick={() => navigate('/saved-searches')}
                style={{ height: '42px', width: '42px', borderRadius: '50%' }}
                title="Saved Homes"
              />
            </Badge>
          )}

          {currentUser ? (
            <Dropdown menu={{ items: getUserMenuItems() }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 8px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Avatar 
                  size={isMobile ? 32 : 36}
                  src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=b40101&color=fff&size=128`}
                  style={{ backgroundColor: '#b40101', flexShrink: 0 }}
                >
                  {(currentUser.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2, paddingRight: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {currentUser.name?.split(' ')[0] || 'User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize', fontWeight: 600 }}>
                      {currentUser.role === 'agent' ? 'Realtor' : currentUser.role === 'admin' ? 'Admin' : 'Account'}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              onClick={() => navigate('/login')}
              style={{ 
                background: '#b40101', 
                borderColor: '#b40101', 
                fontWeight: 700,
                height: isMobile ? '38px' : '44px',
                padding: isMobile ? '0 18px' : '0 24px',
                borderRadius: '10px',
                fontSize: '14px',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 12px rgba(180,1,1,0.25)'
              }}
            >
              Sign In
            </Button>
          )}

          {isMobile && (
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
              onClick={() => setVisible(true)}
              style={{ height: '44px', width: '44px' }}
            />
          )}
        </Space>

        <Drawer
          title={<TorraLogo size={32} color="#b40101" compact showText />}
          placement="right"
          onClose={() => setVisible(false)}
          open={visible}
          width={300}
        >
          <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]} 
            items={[...navItems, { key: '/saved-searches', label: <Link to="/saved-searches">Saved Homes ({savedCount})</Link> }, { key: '/login', label: <Link to="/login">Sign In / Register</Link> }]}
            style={{ border: 'none', fontSize: '16px', fontWeight: 600 }}
            onClick={() => setVisible(false)}
          />
        </Drawer>
      </AntHeader>
    </div>
  );
}
