import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Space, Typography, Select, Breadcrumb, Empty, notification } from "antd";
import { SearchOutlined, GlobalOutlined, StarOutlined } from "@ant-design/icons";
import AgentCard from "@/components/AgentCard";

const { Title, Text } = Typography;

export default function AgentSearch() {
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
      <div style={{ background: 'white', borderBottom: '1px solid #d9d9d9', padding: '24px 64px', position: 'sticky', top: '80px', zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <Input 
              placeholder="Find an agent by name, email or bio" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ height: '48px', borderRadius: '24px', flex: 1, maxWidth: '500px' }}
            />
            <Button 
               type="primary" 
               shape="round" 
               size="large" 
               onClick={handleSearch}
               style={{ background: '#373a4b', borderColor: '#373a4b', fontWeight: 'bold' }}
            >
              Search
            </Button>
          </div>

          <Space size="middle">
            <Select 
               placeholder="Languages" 
               style={{ width: 150 }} 
               suffixIcon={<GlobalOutlined />}
               value={selectedLanguage}
               onChange={setSelectedLanguage}
               allowClear
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
            >
              Luxury Expert
            </Button>
          </Space>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px' }}>
        <div style={{ marginBottom: '40px' }}>
          <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: 'Agents' }]} />
          <Title level={1} style={{ margin: '16px 0 8px', fontWeight: 900 }}>All Agents</Title>
          <Text type="secondary" strong>
            {filteredAgents.length} Result{filteredAgents.length !== 1 ? 's' : ''}
            {(selectedLanguage || showLuxuryOnly) && ` (filtered from ${agents.length} total)`}
          </Text>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '32px' 
        }}>
          {filteredAgents.map((agent) => (
            <div key={agent.id}>
              <AgentCard agent={agent} />
            </div>
          ))}

          {!loading && filteredAgents.length === 0 && agents.length > 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px' }}>
              <Empty description="No agents found matching your filters. Try adjusting your search criteria." />
            </div>
          )}

          {!loading && agents.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px' }}>
              <Empty description="No agents found matching your query." />
            </div>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '80px' }}><Text type="secondary">Searching for agents...</Text></div>}
      </div>
    </div>
  );
}
