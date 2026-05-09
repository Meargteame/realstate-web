import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Input, Badge, Space, Spin } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  FileTextOutlined,
  FolderOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("kw_user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);
    
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
    localStorage.removeItem("kw_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Users Management' },
    { key: '/admin/agents', icon: <TeamOutlined />, label: 'Agents Management' },
    { key: '/admin/properties', icon: <HomeOutlined />, label: 'Properties Management' },
    { key: '/admin/blog', icon: <FileTextOutlined />, label: 'Blog Management' },
    { key: '/admin/documents', icon: <FolderOutlined />, label: 'Document Management' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Platform Analytics' },
  ];

  const bottomMenuItems = [
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={260} 
        theme="light" 
        style={{ 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          zIndex: 100, 
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: 'none'
        }}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: '20px 20px 16px', 
          borderBottom: '1px solid #e5e7eb',
          height: '72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: '#b40101',
            letterSpacing: '-0.5px',
            marginBottom: '2px'
          }}>
            ESTATE
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#6b7280',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Admin Panel
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ 
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 72px)',
          justifyContent: 'space-between'
        }}>
          <Menu 
            mode="inline" 
            selectedKeys={[location.pathname]} 
            items={menuItems} 
            onClick={({ key }) => {
              if (key.startsWith('/')) {
                navigate(key);
              }
            }}
            style={{ 
              background: 'transparent', 
              border: 'none',
              fontSize: '14px'
            }}
            className="clean-sidebar-menu"
          />
          
          {/* Bottom Section - Account + Actions */}
          <div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
              <Menu 
                mode="inline" 
                selectedKeys={[location.pathname]} 
                items={bottomMenuItems} 
                onClick={({ key }) => {
                  if (key === 'logout') {
                    handleLogout();
                  } else if (key.startsWith('/')) {
                    navigate(key);
                  }
                }}
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  fontSize: '14px'
                }}
                className="clean-sidebar-menu"
              />
            </div>
            
            {/* Admin Profile at Bottom */}
            <div style={{ 
              padding: '12px', 
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              borderRadius: '8px',
              margin: '0 -4px',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
            onClick={() => navigate('/admin/settings')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar 
                  src={currentUser?.imageUrl} 
                  size={40}
                  style={{ 
                    backgroundColor: '#b40101',
                    flexShrink: 0
                  }}
                >
                  {!currentUser?.imageUrl && currentUser?.name?.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    color: '#111827', 
                    fontSize: '13px', 
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {currentUser?.name}
                  </div>
                  <div style={{ 
                    color: '#b40101', 
                    fontSize: '11px', 
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    Administrator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 260, background: '#f9fafb' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #e5e7eb', 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          height: '72px',
          lineHeight: '72px',
          margin: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '20px', fontWeight: 400, color: '#111827', lineHeight: 1.2 }}>
              Welcome back, {currentUser?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              Administrator Dashboard
            </div>
          </div>
          <Space size="middle">
            <Input 
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="Search users, agents, properties..." 
              style={{ borderRadius: '8px', width: 280, height: '40px' }}
            />
            <Badge count={0}>
               <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6b7280' }} />
            </Badge>
          </Space>
        </Header>

        <Content style={{ background: '#f9fafb', minHeight: 'calc(100vh - 72px)', padding: 0 }}>
            <Outlet context={{ user: currentUser }} />
        </Content>
      </Layout>
    </Layout>
  );
}
