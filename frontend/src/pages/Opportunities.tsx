import React, { useState, useEffect } from "react";
import { Row, Col, Card, Tag, Typography, Button, Space, Progress, Badge, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { PlusOutlined, MoreOutlined, DollarOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;
const AntCard = Card as any;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;

export default function Opportunities() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [activeSegment, setActiveSegment] = useState<'listing' | 'buyer'>('listing');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [form] = Form.useForm();
  const [draggedDeal, setDraggedDeal] = useState<any>(null);

  useEffect(() => {
    if (!parentAgent) return;
    fetchOpportunities();
  }, [parentAgent, activeSegment]);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/opportunities?agentId=${parentAgent.id}&type=${activeSegment}`);
      const data = await res.json();
      
      // Check if response is an error
      if (data.error || !Array.isArray(data)) {
        console.error('Error fetching opportunities:', data.error || 'Invalid response');
        setOpportunities([]);
        setLoading(false);
        return;
      }
      
      setOpportunities(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOpp(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (opp: any) => {
    setEditingOpp(opp);
    form.setFieldsValue(opp);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingOpp) {
        const res = await fetch(`/api/opportunities/${editingOpp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error('Failed to update');
        message.success('Opportunity updated!');
      } else {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, agentId: parentAgent.id, type: activeSegment })
        });
        if (!res.ok) throw new Error('Failed to create');
        message.success('Opportunity created!');
      }
      setIsModalOpen(false);
      setEditingOpp(null);
      form.resetFields();
      fetchOpportunities();
    } catch {
      message.error('Failed to save opportunity');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete this opportunity?',
      content: 'This action cannot be undone.',
      okType: 'danger',
      onOk: async () => {
        try {
          await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
          message.success('Opportunity deleted');
          fetchOpportunities();
        } catch {
          message.error('Failed to delete opportunity');
        }
      }
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOpportunities();
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDragStart = (deal: any) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.background = '#fef2f2';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.background = '#f9fafb';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.currentTarget.style.background = '#f9fafb';
    if (draggedDeal && draggedDeal.status !== targetStatus) {
      handleStatusChange(draggedDeal.id, targetStatus);
    }
    setDraggedDeal(null);
  };

  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.price * (o.probability || 0) / 100), 0);
  const expectedCommission = totalPipeline * 0.03;

  const statuses = ['Cultivate', 'Appointment', 'Active', 'Under Contract', 'Closed'];
  
  const pipeline = statuses.map(status => {
    const deals = opportunities.filter(o => o.status === status);
    const volume = deals.reduce((sum, o) => sum + o.price, 0);
    return { status, deals, count: deals.length, volume };
  });

  return (
    <div style={{ padding: '16px', background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#111827' }}>Opportunities</Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Track your transaction pipeline from lead to close.
            {opportunities.length > 0 && (
              <span style={{ marginLeft: 16, color: '#b40101', fontWeight: 600 }}>
                Pipeline Value: ${totalPipeline >= 1000000 ? (totalPipeline / 1000000).toFixed(1) + 'M' : (totalPipeline / 1000).toFixed(0) + 'K'}
                {' · '}Est. Commission: ${expectedCommission >= 1000000 ? (expectedCommission / 1000000).toFixed(1) + 'M' : (expectedCommission / 1000).toFixed(0) + 'K'}
              </span>
            )}
          </Text>
        </div>
        <Space>
          <div style={{ background: '#f0f0f0', padding: '4px', borderRadius: '8px' }}>
            <Button 
               type={activeSegment === 'listing' ? 'primary' : 'text'} 
               onClick={() => setActiveSegment('listing')}
               style={activeSegment === 'listing' ? { background: '#111827', borderColor: '#111827' } : {}}
            >
              Listings
            </Button>
            <Button 
               type={activeSegment === 'buyer' ? 'primary' : 'text'} 
               onClick={() => setActiveSegment('buyer')}
               style={activeSegment === 'buyer' ? { background: '#111827', borderColor: '#111827' } : {}}
            >
              Buyers
            </Button>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ background: '#b40101', borderColor: '#b40101', height: '40px' }}>
            Create Opportunity
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px' }}>
        {pipeline.map((phase, i) => (
          <div key={i} style={{ minWidth: '300px', flex: 1 }}>
            <div style={{ padding: '12px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px 8px 0 0', borderBottom: '2px solid #b40101' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{phase.status}</Text>
                <Badge count={phase.count} style={{ backgroundColor: '#f3f4f6', color: '#374151', boxShadow: 'none' }} />
              </div>
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '18px', fontWeight: 600 }}>
                  ${phase.volume >= 1000000 ? (phase.volume / 1000000).toFixed(1) + 'M' : (phase.volume / 1000).toFixed(0) + 'K'}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>VOL</Text>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '0 0 8px 8px', minHeight: '500px' }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, phase.status)}
            >
               {phase.deals.map((deal, di) => (
                 <AntCard 
                   key={di} 
                   draggable
                   onDragStart={() => handleDragStart(deal)}
                   style={{ marginBottom: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'grab' }}
                   styles={{ body: { padding: '16px' } }}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{deal.name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{deal.dealType}</Text>
                      </div>
                      <Space>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(deal)} />
                        <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(deal.id)} />
                      </Space>
                   </div>
                   
                   <div style={{ marginBottom: '16px' }}>
                      <Text style={{ color: '#b40101', fontSize: '15px', fontWeight: 500 }}>
                        ${deal.price.toLocaleString()}
                      </Text>
                      {deal.expectedCloseDate && (
                        <div style={{ marginTop: 4 }}>
                          <CalendarOutlined style={{ fontSize: 11, color: '#6b7280' }} />
                          <Text type="secondary" style={{ fontSize: '11px', marginLeft: 4 }}>
                            Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                      {deal.probability && (
                        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 2 }}>
                          Est. Commission: ${Math.round(deal.price * (deal.probability || 0) / 100 * 0.03).toLocaleString()}
                        </Text>
                      )}
                   </div>

                   <div style={{ background: '#f9fafb', padding: '8px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text style={{ fontSize: '10px', color: '#6b7280' }}>PROBABILITY</Text>
                        <Text style={{ fontSize: '10px', fontWeight: 500 }}>{deal.probability}%</Text>
                      </div>
                      <Progress percent={deal.probability} size="small" showInfo={false} strokeColor="#b40101" />
                   </div>

                   <AntSelect
                     value={deal.status}
                     size="small"
                     style={{ width: '100%', marginTop: 8 }}
                     onChange={(val: string) => handleStatusChange(deal.id, val)}
                   >
                     {statuses.map(s => <AntOption key={s} value={s}>{s}</AntOption>)}
                   </AntSelect>
                 </AntCard>
               ))}
               {phase.deals.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #e5e7eb', borderRadius: '6px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>No active deals in this phase.</Text>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        title={editingOpp ? "Edit Opportunity" : "Create Opportunity"} 
        open={isModalOpen} 
        onCancel={() => { setIsModalOpen(false); setEditingOpp(null); form.resetFields(); }} 
        footer={null}
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item label="Client Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sarah Miller" />
          </Form.Item>
          <Form.Item label="Deal Type" name="dealType" rules={[{ required: true }]}>
            <Input placeholder="e.g. Luxury Listing, Investment Property" />
          </Form.Item>
          <Form.Item label="Price ($)" name="price" rules={[{ required: true }]}>
            <InputNumber 
              style={{ width: '100%' }} 
              min={1000} 
              placeholder="950000" 
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
            />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="Cultivate">
            <AntSelect>
              {statuses.map(s => <AntOption key={s} value={s}>{s}</AntOption>)}
            </AntSelect>
          </Form.Item>
          <Form.Item label="Probability (%)" name="probability" initialValue={20}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item label="Expected Close Date" name="expectedCloseDate">
            <Input type="date" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => { setIsModalOpen(false); setEditingOpp(null); form.resetFields(); }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#b40101', borderColor: '#b40101' }}>
              {editingOpp ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
