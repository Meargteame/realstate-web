import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Modal, Form, Select, message, Popconfirm, Switch, Row, Col, Statistic, Divider } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined, FileTextOutlined, CheckCircleOutlined, StarFilled } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Title, Text } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;
const AntCard = Card as any;
const { TextArea } = Input;

export default function AdminBlog() {
  const isMobile = useIsMobile();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form] = Form.useForm();
  const [coverPreview, setCoverPreview] = useState<string>('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const response = await fetch('/api/blog?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      message.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blog/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setCoverPreview('');
    setShowModal(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    form.setFieldsValue({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      featured: post.featured,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
      categories: post.categories?.map((c: any) => c.id) || [],
      tags: post.tags?.map((t: any) => t.id) || []
    });
    setCoverPreview(post.coverImage || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = JSON.parse(localStorage.getItem('torra_user') || '{}').token;
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        message.success('Blog post deleted successfully');
        fetchPosts();
      } else {
        message.error('Failed to delete blog post');
      }
    } catch (error) {
      message.error('Error deleting blog post');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const torraUser = JSON.parse(localStorage.getItem('torra_user') || '{}');
      const token = torraUser.token;
      
      const payload = {
        ...values,
        authorId: torraUser.agentId || torraUser.id
      };

      const url = editingPost ? `/api/blog/${editingPost.id}` : '/api/blog';
      const method = editingPost ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success(`Blog post ${editingPost ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        form.resetFields();
        fetchPosts();
      } else {
        const data = await response.json();
        message.error(data.error || 'Failed to save blog post');
      }
    } catch (error) {
      message.error('Error saving blog post');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>/{record.slug}</div>
        </div>
      )
    },
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' }
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean) => (
        <Tag color={featured ? 'gold' : 'default'}>
          {featured ? 'YES' : 'NO'}
        </Tag>
      )
    },
    {
      title: 'Views',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: (a: any, b: any) => a.viewCount - b.viewCount
    },
    {
      title: 'Published',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/blog/${record.slug}`, '_blank')}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this blog post?"
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
      {/* Post Status Summary */}
      <Row gutter={[8, 8]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Total Posts</Text>} value={posts.length} prefix={<FileTextOutlined style={{ color: '#b40101' }} />} valueStyle={{ color: '#b40101', fontWeight: 900, fontSize: isMobile ? 22 : 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Published</Text>} value={posts.filter((p: any) => p.status === 'published').length} prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />} valueStyle={{ color: '#10b981', fontWeight: 900, fontSize: isMobile ? 22 : 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Drafts</Text>} value={posts.filter((p: any) => p.status === 'draft').length} prefix={<EditOutlined style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: isMobile ? 22 : 28 }} />
          </AntCard>
        </Col>
        <Col xs={12} sm={6}>
          <AntCard variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={<Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Featured</Text>} value={posts.filter((p: any) => p.featured).length} prefix={<StarFilled style={{ color: '#f59e0b' }} />} valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: isMobile ? 22 : 28 }} />
          </AntCard>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: isMobile ? 16 : 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px' }}>
          <Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>Blog Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ background: '#b40101', borderColor: '#b40101' }}
          >
            Create Post
          </Button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search posts..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 300, borderRadius: 8 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: isMobile ? '100%' : 200 }}
          >
            <AntOption value="published">Published</AntOption>
            <AntOption value="draft">Draft</AntOption>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, size: isMobile ? 'small' : 'default' }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? '95%' : 900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter post title" size="large" />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Excerpt"
            rules={[{ required: true, message: 'Please enter excerpt' }]}
          >
            <TextArea
              placeholder="Brief summary (150-200 characters)"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content (HTML supported)"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea
              placeholder="Write your blog post content (HTML supported)..."
              rows={15}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="Cover Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" onChange={(e) => setCoverPreview(e.target.value)} />
          </Form.Item>

          {coverPreview && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Preview:</Text>
              <img src={coverPreview} alt="Cover preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
            </div>
          )}

          <Form.Item
            name="categories"
            label="Categories"
          >
            <Select
              mode="multiple"
              placeholder="Select categories"
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="multiple"
              placeholder="Select tags"
              options={tags.map(t => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>SEO Settings</Divider>

          <Form.Item name="metaTitle" label="Meta Title">
            <Input placeholder="SEO title (leave empty to use post title)" maxLength={70} showCount />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea placeholder="SEO description for search engines (150-160 characters recommended)" rows={3} maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="metaKeywords" label="Meta Keywords">
            <Input placeholder="keyword1, keyword2, keyword3" />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Publish Settings</Divider>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="status"
              label="Status"
              initialValue="draft"
            >
              <Select style={{ width: 150 }}>
                <AntOption value="draft">Draft</AntOption>
                <AntOption value="published">Published</AntOption>
              </Select>
            </Form.Item>

            <Form.Item
              name="featured"
              label="Featured"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </Space>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} style={{ background: '#b40101', borderColor: '#b40101' }}>
                {editingPost ? 'Update Post' : 'Publish Now'}
              </Button>
              <Button onClick={() => {
                form.setFieldsValue({ status: 'draft' });
                form.submit();
              }}>
                Save as Draft
              </Button>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
                setCoverPreview('');
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
