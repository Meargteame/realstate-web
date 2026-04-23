import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Space, Drawer, Typography } from "antd";
import { GlobalOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { key: '/properties', label: <Link to="/properties">Search</Link> },
    { key: '/agents', label: <Link to="/agents">Find a KW® Agent</Link> },
    { key: '/become-agent', label: <Link to="/become-agent">Become a KW® Agent</Link> }
  ];

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Utility Bar */}
      <div style={{ background: '#373a4b', color: 'white', padding: '8px 64px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', fontSize: '11px', fontWeight: 'bold' }}>
        <Space size="large">
          <Link to="/properties?type=luxury" style={{ color: 'white', fontSize: '11px' }}>LUXURY</Link>
          <Link to="/properties?type=land" style={{ color: 'white', fontSize: '11px' }}>LAND</Link>
          <Link to="/properties?type=commercial" style={{ color: 'white', fontSize: '11px' }}>COMMERCIAL</Link>
          <Space size="small" style={{ cursor: 'pointer' }}>
            <GlobalOutlined />
            <span>EN</span>
          </Space>
        </Space>
      </div>

      <AntHeader style={{ 
        background: 'white', 
        height: '80px', 
        padding: '0 64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        lineHeight: '80px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#b40101', fontSize: '48px', fontWeight: 900, fontFamily: 'Arial Black' }}>kw</span>
          <span style={{ color: '#b40101', fontSize: '12px', marginTop: '10px' }}>®</span>
        </Link>

        {/* Navigation */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Menu 
            mode="horizontal" 
            selectedKeys={[location.pathname]} 
            items={navItems}
            style={{ 
              border: 'none', 
              fontSize: '13px', 
              fontWeight: 'bold', 
              minWidth: '400px',
              justifyContent: 'center'
            }}
          />
        </div>

        {/* Auth */}
        <Space size="middle">
          <Button 
            type="primary" 
            size="large" 
            shape="round" 
            onClick={() => navigate('/login')}
            style={{ 
              background: '#373a4b', 
              borderColor: '#373a4b', 
              fontWeight: 'bold',
              height: '48px',
              padding: '0 32px'
            }}
          >
            Log In / Sign Up
          </Button>
          <Button 
            className="lg-hidden" 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
            onClick={() => setVisible(true)}
            style={{ display: 'none' }} // Hidden on desktop
          />
        </Space>

        <Drawer
          title={<span style={{ color: '#b40101', fontWeight: 900 }}>kw®</span>}
          placement="right"
          onClose={() => setVisible(false)}
          open={visible}
        >
          <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]} 
            items={[...navItems, { key: '/login', label: <Link to="/login">Log In / Sign Up</Link> }]}
            style={{ border: 'none' }}
            onClick={() => setVisible(false)}
          />
        </Drawer>
      </AntHeader>
    </div>
  );
}
