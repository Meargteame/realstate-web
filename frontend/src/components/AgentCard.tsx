import React from "react";
import { Card, Avatar, Typography, Space, Divider, Tag } from "antd";
import { GlobalOutlined, PhoneOutlined, MailOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Text, Title, Paragraph } = Typography;

export default function AgentCard({ agent }: { agent: any }) {
  const AntCard = Card as any;

  return (
    <AntCard
      hoverable
      style={{ 
        height: '100%', 
        borderRadius: '12px', 
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column'
      }}
      styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Avatar 
          size={120} 
          src={agent.imageUrl} 
          style={{ 
            backgroundColor: '#f0f2f5', 
            color: '#373a4b', 
            fontSize: '48px',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          {agent.name[0]}
        </Avatar>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
           <Link to={`/agents/${agent.id}`}>
             <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{agent.name}</Title>
           </Link>
           <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
             Licensed Agent • {agent.location || 'TORRA'}
           </Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ flex: 1 }}>
           <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <GlobalOutlined style={{ color: '#8c8c8c', marginTop: '4px' }} />
                 <Text style={{ fontSize: '13px' }}>{agent.languages?.join(', ') || 'English'}</Text>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <PhoneOutlined style={{ color: '#b40101', marginTop: '4px' }} />
                 <a href={`tel:${agent.phone}`} style={{ color: '#b40101', textDecoration: 'none' }}>
                   <Text style={{ fontSize: '13px', color: '#b40101' }}>{agent.phone}</Text>
                 </a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <MailOutlined style={{ color: '#b40101', marginTop: '4px' }} />
                 <a href={`mailto:${agent.email}`} style={{ color: '#b40101', textDecoration: 'none' }}>
                   <Text style={{ fontSize: '13px', color: '#b40101' }} ellipsis>{agent.email}</Text>
                 </a>
              </div>
           </Space>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f5f5f5' }}>
           <Space size={[0, 8]} wrap>
              {agent.specialties?.split(',').slice(0, 2).map((s: string, i: number) => (
                <Tag key={i} style={{ borderRadius: '12px', background: '#f5f5f5', border: 'none', color: '#555', fontSize: '10px' }}>
                  {s.trim()}
                </Tag>
              ))}
           </Space>
        </div>
      </div>
    </AntCard>
  );
}
