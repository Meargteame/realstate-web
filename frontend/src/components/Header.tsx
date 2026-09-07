import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Space, Drawer, Typography, Dropdown, Avatar } from "antd";
import { MenuOutlined, UserOutlined, SearchOutlined, HeartOutlined, CalendarOutlined, LogoutOutlined, DashboardOutlined } from "@ant-design/icons";
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
      setIsScrolled(window.scrollY > 10);
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
          background: '#0f172a', 
          color: '#e2e8f0', 
          padding: '8px 48px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '12px', 
          fontWeight: 600
        }}>
          <Text style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            TORRA COMMERCIAL & RESIDENTIAL REAL ESTATE GROUP
          </Text>
          <Space size="large">
            <Link to="/properties?type=Commercial" style={{ color: '#e2e8f0', fontSize: '12px' }}>Commercial Listings</Link>
            <Link to="/properties?type=Land" style={{ color: '#e2e8f0', fontSize: '12px' }}>Land & Lots</Link>
            <Link to="/open-houses" style={{ color: '#e2e8f0', fontSize: '12px' }}>Open Houses</Link>
            <Text style={{ color: '#e2e8f0', fontSize: '12px' }}>📞 (469) 345-6868</Text>
          </Space>
        </div>
      )}

      {/* Main Clean White Header */}
      <AntHeader style={{ 
        background: '#ffffff',
        height: isMobile ? '64px' : '76px', 
        padding: isMobile ? '0 16px' : '0 48px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
        borderBottom: '1px solid #e5e7eb',
        lineHeight: isMobile ? '64px' : '76px',
        transition: 'box-shadow 0.2s ease'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <TorraLogo size={isMobile ? 36 : 44} color="#b40101" compact showText />
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
        <Space size="middle">
          {!isMobile && (
            <Button 
              type="text"
              icon={<SearchOutlined style={{ fontSize: '18px', color: '#374151' }} />}
              onClick={() => navigate('/properties')}
              style={{ height: '44px', width: '44px', borderRadius: '50%' }}
            />
          )}
          {currentUser ? (
            <Dropdown menu={{ items: getUserMenuItems() }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <Avatar 
                  size={isMobile ? 36 : 42}
                  src={currentUser.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=b40101&color=fff&size=128`}
                  style={{ backgroundColor: '#b40101', flexShrink: 0 }}
                >
                  {(currentUser.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {currentUser.name?.split(' ')[0] || 'User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
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
                padding: isMobile ? '0 16px' : '0 24px',
                borderRadius: '8px',
                fontSize: '14px',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 6px rgba(180,1,1,0.25)'
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
            items={[...navItems, { key: '/login', label: <Link to="/login">Sign In / Register</Link> }]}
            style={{ border: 'none', fontSize: '16px', fontWeight: 600 }}
            onClick={() => setVisible(false)}
          />
        </Drawer>
      </AntHeader>
    </div>
  );
}
