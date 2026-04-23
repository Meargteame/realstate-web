import React, { useState } from "react";
import { Row, Col, Card, Tag, Typography, Button, Space, Steps, Progress, Badge, Avatar } from "antd";
import { PlusOutlined, MoreOutlined, DollarOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Opportunities() {
  const [activeSegment, setActiveSegment] = useState<'listings' | 'buyers'>('listings');

  const pipeline = [
    { 
      status: 'Cultivate', 
      count: 12, 
      volume: '15.4M',
      deals: [
        { name: 'Sarah Miller', type: 'Luxury Listing', price: '2,450,000', probability: 20 },
        { name: 'James Wilson', type: 'Investment', price: '850,000', probability: 10 }
      ]
    },
    { 
      status: 'Appointment', 
      count: 4, 
      volume: '3.2M',
      deals: [
        { name: 'Michael Chen', type: 'Residence', price: '1,200,000', probability: 50 }
      ]
    },
    { 
      status: 'Active', 
      count: 2, 
      volume: '1.1M',
      deals: [
        { name: 'Emma Davis', type: 'Condo', price: '550,000', probability: 80 }
      ]
    },
    { 
      status: 'Under Contract', 
      count: 1, 
      volume: '650k',
      deals: [
        { name: 'Robert King', type: 'Townhouse', price: '650,000', probability: 95 }
      ]
    },
    { 
      status: 'Closed', 
      count: 45, 
      volume: '32M',
      deals: []
    }
  ];

  const AntCard = Card as any;

  return (
    <div style={{ padding: '32px', background: '#fcfcfc', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Opportunities</Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>Track your transaction pipeline from lead to close.</Text>
        </div>
        <Space>
          <div style={{ background: '#f0f0f0', padding: '4px', borderRadius: '8px' }}>
            <Button 
               type={activeSegment === 'listings' ? 'primary' : 'text'} 
               onClick={() => setActiveSegment('listings')}
               style={activeSegment === 'listings' ? { background: '#111827', borderColor: '#111827' } : {}}
            >
              Listings
            </Button>
            <Button 
               type={activeSegment === 'buyers' ? 'primary' : 'text'} 
               onClick={() => setActiveSegment('buyers')}
               style={activeSegment === 'buyers' ? { background: '#111827', borderColor: '#111827' } : {}}
            >
              Buyers
            </Button>
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#b40101', borderColor: '#b40101', height: '40px' }}>Create Opportunity</Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px' }}>
        {pipeline.map((phase, i) => (
          <div key={i} style={{ minWidth: '300px', flex: 1 }}>
            <div style={{ padding: '12px 16px', background: 'white', border: '1px solid #f0f0f0', borderRadius: '12px 12px 0 0', borderBottom: '3px solid #b40101' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ textTransform: 'uppercase', fontSize: '12px', color: '#555' }}>{phase.status}</Text>
                <Badge count={phase.count} style={{ backgroundColor: '#f0f0f0', color: '#111', boxShadow: 'none' }} />
              </div>
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '18px', fontWeight: 900 }}>${phase.volume}</Text>
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>VOL</Text>
              </div>
            </div>

            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '0 0 12px 12px', minHeight: '500px' }}>
               {phase.deals.map((deal, di) => (
                 <AntCard 
                   key={di} 
                   style={{ marginBottom: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                   styles={{ body: { padding: '16px' } }}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{deal.name}</div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{deal.type}</Text>
                      </div>
                      <Button type="text" size="small" icon={<MoreOutlined />} />
                   </div>
                   
                   <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ color: '#b40101', fontSize: '15px' }}>${deal.price}</Text>
                   </div>

                   <div style={{ background: '#fafafa', padding: '8px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text style={{ fontSize: '10px', color: '#8c8c8c' }}>PROBABILITY</Text>
                        <Text style={{ fontSize: '10px', fontWeight: 'bold' }}>{deal.probability}%</Text>
                      </div>
                      <Progress percent={deal.probability} size="small" showInfo={false} strokeColor="#b40101" />
                   </div>
                 </AntCard>
               ))}
               {phase.deals.length === 0 && phase.status !== 'Closed' && (
                 <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #d9d9d9', borderRadius: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>No active deals in this phase.</Text>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
