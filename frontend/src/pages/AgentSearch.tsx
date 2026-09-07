import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Space, Typography, Select, Breadcrumb, Empty, notification } from "antd";
import { SearchOutlined, GlobalOutlined, StarOutlined } from "@ant-design/icons";
import AgentCard from "@/components/AgentCard";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;

export default function AgentSearch() {
  const isMobile = useIsMobile();
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLuxuryOnly, setShowLuxuryOnly] = useState(false);

  const fetchAgents = (q?: string) => {
    setLoading(true);
    const url = q ? `/api/agents?q=${encodeURIComponent(q)}` : "/api/agents";
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAgents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        notification.error({ message: 'Error', description: 'Could not fetch agents.' });
      });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearch = () => {
    fetchAgents(searchQuery);
  };

  // Filter agents based on language and luxury
  const filteredAgents = agents.filter(agent => {
    // Language filter
    if (selectedLanguage && !agent.languages?.includes(selectedLanguage)) {
      return false;
    }
    // Luxury filter
    if (showLuxuryOnly && !agent.isLuxury) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 80px)' }}>
      {/* Top Filter Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #d9d9d9', padding: isMobile ? '16px' : '24px 64px', position: 'sticky', top: isMobile ? '64px' : '80px', zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobile ? '12px' : '24px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: isMobile ? 'auto' : '300px' }}>
            <Input 
              placeholder={isMobile ? "Search agents..." : "Find an agent by name, email or bio"} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ height: '44px', borderRadius: '22px', flex: 1, maxWidth: '500px', fontSize: isMobile ? '14px' : '15px' }}
              aria-label="Search agents"
            />
            <Button 
               type="primary" 
               shape="round" 
               size="large" 
               onClick={handleSearch}
               loading={loading}
               style={{ background: '#b40101', borderColor: '#b40101', fontWeight: 'bold' }}
            >
              Search
            </Button>
          </div>

          <Space size={isMobile ? "small" : "middle"}>
            <Select 
               placeholder="Languages" 
               style={{ width: isMobile ? 120 : 150 }} 
               suffixIcon={<GlobalOutlined />}
               value={selectedLanguage}
               onChange={setSelectedLanguage}
               allowClear
               aria-label="Filter by language"
               options={[
                 { value: 'English', label: 'English' }, 
                 { value: 'Spanish', label: 'Spanish' },
                 { value: 'Mandarin', label: 'Mandarin' },
                 { value: 'French', label: 'French' }
               ]} 
            />
            <Button 
              icon={<StarOutlined />} 
              shape="round"
              type={showLuxuryOnly ? 'primary' : 'default'}
              style={showLuxuryOnly ? { background: '#faad14', borderColor: '#faad14' } : {}}
              onClick={() => setShowLuxuryOnly(!showLuxuryOnly)}
              aria-label="Toggle luxury expert filter"
            >
              Luxury Expert
            </Button>
          </Space>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '24px 16px' : '64px' }}>
        <div style={{ marginBottom: isMobile ? '24px' : '40px' }}>
          <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: 'Agents' }]} />
          <Title level={1} style={{ margin: '12px 0 8px', fontWeight: 900, fontSize: isMobile ? 24 : 38 }}>All Agents</Title>
          <Text type="secondary" strong>
            {filteredAgents.length} Result{filteredAgents.length !== 1 ? 's' : ''}
            {(selectedLanguage || showLuxuryOnly) && ` (filtered from ${agents.length} total)`}
          </Text>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', 
          gap: isMobile ? '16px' : '32px' 
        }}>
          {filteredAgents.map((agent) => (
            <div key={agent.id}>
              <AgentCard agent={agent} />
            </div>
          ))}

          {!loading && filteredAgents.length === 0 && agents.length > 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: isMobile ? '40px 16px' : '80px' }}>
              <Empty description="No agents found matching your filters. Try adjusting your search criteria." />
            </div>
          )}

          {!loading && agents.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: isMobile ? '40px 16px' : '80px' }}>
              <Empty description="No agents found matching your query." />
            </div>
          )}
        </div>

        {loading && <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', 
          gap: isMobile ? '16px' : '32px' 
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ 
              background: 'white', borderRadius: 16, padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div className="animate-pulse">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e5e7eb', margin: '0 auto 16px' }} />
                <div style={{ height: 16, background: '#e5e7eb', borderRadius: 8, width: '60%', margin: '0 auto 8px' }} />
                <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, width: '40%', margin: '0 auto 16px' }} />
                <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, width: '70%' }} />
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
