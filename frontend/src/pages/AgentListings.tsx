import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, Typography, Input, message, Modal, Form, Select, Row, Col, InputNumber } from "antd";
import { useOutletContext, Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AgentListings() {
  const { agent: parentAgent } = useOutletContext<{ agent: any }>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const AntSelect = Select as any;
  const AntOption = (Select as any).Option;

  useEffect(() => {
    if (!parentAgent) return;
    fetch(`/api/agents/${parentAgent.id}`)
      .then(res => res.json())
      .then(data => {
        setListings(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parentAgent]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this listing?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: () => {
        setListings(prev => prev.filter(p => p.id !== id));
        message.success("Listing removed.");
      }
    });
  };

  const handleCreateListing = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, agentId: parentAgent.id })
      });
      if (!res.ok) throw new Error('Failed to create listing');
      const newProperty = await res.json();
      setListings(prev => [newProperty, ...prev]);
      message.success("Listing published successfully!");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to publish listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const columns = [
    {
      title: 'PROPERTY', key: 'property',
      render: (record: any) => (
        <Space size="middle">
          <img src={record.imageUrl} alt={record.address} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: '4px' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.address}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{record.city}, {record.propertyType}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'PRICE', dataIndex: 'price', key: 'price',
      render: (price: number) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(price)}</span>,
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'STATUS', dataIndex: 'status', key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'success' : 'orange'} style={{ borderRadius: '4px' }}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'BED/BATH', key: 'stats',
      render: (record: any) => <Text style={{ fontSize: '13px' }}>{record.beds} bds | {record.baths} ba</Text>,
    },
    {
      title: 'ACTION', key: 'action',
      render: (record: any) => (
        <Space size="small">
          <Link to={`/properties/${record.id}`}><Button size="small">View</Button></Link>
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase' }}>My Listings</Title>
          <Text type="secondary">Manage your active and pending property inventory.</Text>
        </div>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Filter listings..." style={{ width: 250 }} onChange={e => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ background: '#b40101', borderColor: '#b40101' }}>
            Create New
          </Button>
        </Space>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={listings.filter(l => l.address?.toLowerCase().includes(searchText.toLowerCase()))}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} listings` }}
        />
      </div>

      <Modal title="Add New Listing" open={isModalOpen} onCancel={() => { setIsModalOpen(false); form.resetFields(); }} footer={null} width={680}>
        <Form layout="vertical" form={form} onFinish={handleCreateListing} style={{ marginTop: 20 }}>
          <Form.Item label="Property Address" name="address" rules={[{ required: true }]}>
            <Input placeholder="e.g. 123 Luxury Ave" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="City" name="city" rules={[{ required: true }]}><Input placeholder="Austin" /></Form.Item></Col>
            <Col span={8}><Form.Item label="State" name="state" rules={[{ required: true }]}><Input placeholder="TX" maxLength={2} /></Form.Item></Col>
            <Col span={8}><Form.Item label="ZIP" name="zip" rules={[{ required: true }]}><Input placeholder="78701" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Listing Price ($)" name="price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1000} placeholder="950000" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Property Type" name="propertyType">
                <AntSelect defaultValue="Single Family">
                  <AntOption value="Single Family">Single Family</AntOption>
                  <AntOption value="Condo">Condo</AntOption>
                  <AntOption value="Townhouse">Townhouse</AntOption>
                  <AntOption value="Land">Land</AntOption>
                  <AntOption value="Multi-Family">Multi-Family</AntOption>
                </AntSelect>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Bedrooms" name="bedrooms"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Bathrooms" name="bathrooms"><InputNumber style={{ width: '100%' }} min={0} step={0.5} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Sq. Footage" name="sqft"><InputNumber style={{ width: '100%' }} min={100} /></Form.Item></Col>
          </Row>
          <Form.Item label="Status" name="status">
            <AntSelect defaultValue="Active">
              <AntOption value="Active">Active</AntOption>
              <AntOption value="Pending">Pending</AntOption>
              <AntOption value="Sold">Sold</AntOption>
            </AntSelect>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#b40101', borderColor: '#b40101' }}>
              Publish Listing
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
