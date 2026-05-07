import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
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
  LogoutOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function CommandLayout() {
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("kw_user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);
    
    // Set a basic fallback agent context from user data so UI renders even if network fails or no agent exists
    setCurrentAgent({
      id: parsed.agentId,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role || 'agent', // Add role from localStorage
      imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      leads: [],
      properties: []
    });

    if (!parsed.agentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/agents/${parsed.agentId}`)
      .then(res => {
        if (!res.ok) {
          // Agent not found - clear localStorage and redirect to login
          if (res.status === 404) {
            console.error('Agent not found in database. Clearing localStorage and redirecting to login.');
            localStorage.removeItem("kw_user");
            navigate("/login");
            return null;
          }
          throw new Error("Agent fetch failed");
        }
        return res.json();
      })
      .then(fullAgent => {
        if (fullAgent) {
          // Use imageUrl directly - proxy will handle routing to backend
          const imageUrl = fullAgent.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullAgent.name)}&background=111827&color=fff&size=128`;
          
          setCurrentAgent({
            ...fullAgent,
            imageUrl
          });
          setNewLeadsCount((fullAgent.leads || []).filter((l: any) => l.status === 'New').length);
          setListingsCount((fullAgent.properties || []).length);
        }
        setLoading(false);
      })
      .catch(() => {
        // If network fails, do NOT redirect. Stay on the dashboard with fallback data.
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("kw_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading Command Center..." />
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
    { type: 'divider' } as any,
    { key: '/command/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={260} 
        theme="dark" 
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, background: '#111827' }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1f2937' }}>
          <Avatar 
            src={currentAgent?.imageUrl} 
            size="large"
            style={{ backgroundColor: '#374151' }}
          >
            {!currentAgent?.imageUrl && currentAgent?.name?.charAt(0)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: '14px', lineHeight: 1.2 }}>{currentAgent?.name}</div>
            <div style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'capitalize', letterSpacing: '0.3px' }}>
              {currentAgent?.role || 'Agent'}
            </div>
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
            } else if (key.startsWith('/')) {
              navigate(key);
            }
          }}
          style={{ background: '#111827', marginTop: '16px', borderRight: 'none' }}
        />
      </Sider>

      <Layout style={{ marginLeft: 260 }}>
        <Header style={{ 
          background: '#fff', 
          padding: '16px 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #e5e7eb', 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          height: 'auto',
          minHeight: '72px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '20px', fontWeight: 400, color: '#111827', lineHeight: 1.2 }}>
              Welcome back, {currentAgent?.name.split(' ')[0]}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {currentAgent?.role?.charAt(0).toUpperCase() + currentAgent?.role?.slice(1) || 'Agent'} Dashboard
            </div>
          </div>
          <Space size="middle">
            <Input 
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="Search contacts..." 
              onPressEnter={(e) => navigate(`/command/leads?q=${e.currentTarget.value}`)}
              style={{ borderRadius: '8px', width: 240, height: '40px' }}
            />
            <Badge dot={newLeadsCount > 0}>
               <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6b7280' }} />
            </Badge>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/command/listings')}
              style={{ background: '#b40101', borderColor: '#b40101', height: '40px', borderRadius: '6px', fontWeight: 400 }}
            >
              Create Listing
            </Button>
          </Space>
        </Header>

        <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 72px)', padding: 0 }}>
            <Outlet context={{ agent: currentAgent }} />
        </Content>
      </Layout>
    </Layout>
  );
}
