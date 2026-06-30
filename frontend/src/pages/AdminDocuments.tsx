import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Modal, Form, Select, Upload, message, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined, DeleteOutlined, ShareAltOutlined, UploadOutlined, FileOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AdminDocuments() {
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const response = await fetch(`/api/documents?userId=${user.id}`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/documents/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleUpload = async (values: any) => {
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      
      // In production, you would upload the file to a storage service first
      // For now, we'll use a placeholder URL
      const payload = {
        ...values,
        fileUrl: values.fileUrl || 'https://example.com/document.pdf',
        fileSize: values.fileSize || 1024,
        fileType: values.fileType || 'application/pdf',
        uploadedBy: user.id
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success('Document uploaded successfully');
        setShowModal(false);
        form.resetFields();
        fetchDocuments();
      } else {
        const data = await response.json();
        message.error(data.error || 'Failed to upload document');
      }
    } catch (error) {
      message.error('Error uploading document');
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const response = await fetch(`/api/documents/${id}/download?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        // Open file URL in new tab
        window.open(data.fileUrl, '_blank');
        message.success('Document downloaded');
      } else {
        message.error(data.error || 'Failed to download document');
      }
    } catch (error) {
      message.error('Error downloading document');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const response = await fetch(`/api/documents/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Document deleted successfully');
        fetchDocuments();
      } else {
        message.error('Failed to delete document');
      }
    } catch (error) {
      message.error('Error deleting document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text: string, record: any) => (
        <Space>
          <FileOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.fileName}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(c => ({ text: c.label, value: c.value })),
      filteredValue: categoryFilter ? [categoryFilter] : null,
      onFilter: (value: any, record: any) => record.category === value,
      render: (category: string) => {
        const cat = categories.find(c => c.value === category);
        return <Tag color="blue">{cat?.label || category}</Tag>;
      }
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: number) => `v${version}`
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id, record.fileName)}
          />
          <Popconfirm
            title="Delete this document?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '32px' }}>
      <Card>
        <div style={{ marginBottom: isMobile ? 16 : 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px' }}>
          <Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>Document Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
            style={{ background: '#b40101', borderColor: '#b40101' }}
          >
            Upload Document
          </Button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search documents..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 300, borderRadius: 8 }}
          />
          <Select
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
            style={{ width: isMobile ? '100%' : 200 }}
          >
            {categories.map(cat => (
              <Option key={cat.value} value={cat.value}>{cat.label}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, size: isMobile ? 'small' : 'default' }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Document"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? '95%' : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="name"
            label="Document Name"
            rules={[{ required: true, message: 'Please enter document name' }]}
          >
            <Input placeholder="Enter document name" />
          </Form.Item>

          <Form.Item
            name="fileName"
            label="File Name"
            rules={[{ required: true, message: 'Please enter file name' }]}
          >
            <Input placeholder="document.pdf" />
          </Form.Item>

          <Form.Item
            name="fileUrl"
            label="File URL"
            rules={[{ required: true, message: 'Please enter file URL' }]}
          >
            <Input placeholder="https://example.com/document.pdf" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: '#b40101', borderColor: '#b40101' }}>
                Upload
              </Button>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
