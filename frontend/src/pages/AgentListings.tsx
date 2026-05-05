import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, Typography, Input, message, Modal, Form, Select, Row, Col, InputNumber, Upload } from "antd";
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
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [imageFileList, setImageFileList] = useState<any[]>([]);
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
      onOk: async () => {
        try {
          const res = await fetch(`/api/properties/${id}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete');
          setListings(prev => prev.filter(p => p.id !== id));
          message.success("Listing deleted successfully.");
        } catch {
          message.error("Failed to delete listing. Please try again.");
        }
      }
    });
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setImageFileList([]); // Reset image list for editing
    form.setFieldsValue({
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.beds,
      bathrooms: property.baths,
      sqft: property.sqft,
      status: property.status
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (info: any) => {
    let fileList = [...info.fileList];
    // Limit to 10 images
    fileList = fileList.slice(-10);
    setImageFileList(fileList);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      let propertyId = editingProperty?.id;
      
      if (editingProperty) {
        // Update existing property
        const res = await fetch(`/api/properties/${editingProperty.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error('Failed to update listing');
        const updated = await res.json();
        propertyId = updated.id;
        setListings(prev => prev.map(p => p.id === updated.id ? updated : p));
        message.success("Listing updated successfully!");
      } else {
        // Create new property
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, agentId: parentAgent.id })
        });
        if (!res.ok) throw new Error('Failed to create listing');
        const newProperty = await res.json();
        propertyId = newProperty.id;
        setListings(prev => [newProperty, ...prev]);
        message.success("Listing published successfully!");
      }

      // Upload images if any
      if (imageFileList.length > 0 && propertyId) {
        const formData = new FormData();
        imageFileList.forEach(file => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });

        const uploadRes = await fetch(`/api/upload/property/${propertyId}/images`, {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          message.success('Images uploaded successfully!');
          // Refresh listings to show new images
          const refreshRes = await fetch(`/api/agents/${parentAgent.id}`);
          const data = await refreshRes.json();
          setListings(data.properties || []);
        }
      }

      setIsModalOpen(false);
      setEditingProperty(null);
      setImageFileList([]);
      form.resetFields();
    } catch {
      message.error(`Failed to ${editingProperty ? 'update' : 'publish'} listing. Please try again.`);
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
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#111827' }}>My Listings</Title>
          <Text type="secondary">Manage your active and pending property inventory.</Text>
        </div>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Filter listings..." style={{ width: 250 }} onChange={e => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProperty(null); setImageFileList([]); form.resetFields(); setIsModalOpen(true); }} style={{ background: '#b40101', borderColor: '#b40101' }}>
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

      <Modal title={editingProperty ? "Edit Listing" : "Add New Listing"} open={isModalOpen} onCancel={() => { setIsModalOpen(false); setEditingProperty(null); setImageFileList([]); form.resetFields(); }} footer={null} width={680}>
        <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ marginTop: 20 }}>
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
          <Form.Item label="Property Images" help="Upload up to 10 images (max 5MB each)">
            <Upload
              listType="picture-card"
              fileList={imageFileList}
              onChange={handleImageChange}
              beforeUpload={() => false}
              accept="image/*"
              multiple
            >
              {imageFileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="Status" name="status">
            <AntSelect defaultValue="Active">
              <AntOption value="Active">Active</AntOption>
              <AntOption value="Pending">Pending</AntOption>
              <AntOption value="Sold">Sold</AntOption>
            </AntSelect>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button onClick={() => { setIsModalOpen(false); setEditingProperty(null); setImageFileList([]); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#b40101', borderColor: '#b40101' }}>
              {editingProperty ? 'Update Listing' : 'Publish Listing'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
