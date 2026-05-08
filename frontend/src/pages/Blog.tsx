import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout, Card, Row, Col, Typography, Tag, Space, Input, Select, Pagination, Avatar, Empty } from "antd";
import { SearchOutlined, ClockCircleOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [page, search, selectedCategory, selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      });
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);

      const response = await fetch(`/api/blog?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '64px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 32px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: 56, fontWeight: 900, margin: 0 }}>
          REAL ESTATE INSIGHTS
        </Title>
        <Text style={{ color: 'white', fontSize: 20, opacity: 0.9 }}>
          Expert advice, market trends, and tips from our agents
        </Text>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: '1400px', margin: '-40px auto 0', padding: '0 32px' }}>
        <Card style={{ borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Search
                placeholder="Search articles..."
                allowClear
                size="large"
                onSearch={setSearch}
                prefix={<SearchOutlined />}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="All Categories"
                size="large"
                style={{ width: '100%' }}
                allowClear
                onChange={setSelectedCategory}
                value={selectedCategory}
              >
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat._count?.posts || 0})
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="All Tags"
                size="large"
                style={{ width: '100%' }}
                allowClear
                onChange={setSelectedTag}
                value={selectedTag}
              >
                {tags.map(tag => (
                  <Select.Option key={tag.id} value={tag.slug}>
                    {tag.name} ({tag._count?.posts || 0})
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Blog Posts Grid */}
      <div style={{ maxWidth: '1400px', margin: '48px auto 0', padding: '0 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Text type="secondary">Loading articles...</Text>
          </div>
        ) : posts.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {posts.map(post => (
                <Col xs={24} sm={12} lg={8} key={post.id}>
                  <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      cover={
                        <div style={{
                          height: '240px',
                          background: `url(${post.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}>
                          {post.featured && (
                            <Tag color="gold" style={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              fontWeight: 'bold'
                            }}>
                              FEATURED
                            </Tag>
                          )}
                        </div>
                      }
                      style={{ borderRadius: '12px', overflow: 'hidden' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* Categories */}
                        <Space wrap size="small">
                          {post.categories?.map((cat: any) => (
                            <Tag key={cat.id} color="blue">{cat.name}</Tag>
                          ))}
                        </Space>

                        {/* Title */}
                        <Title level={4} style={{ margin: '8px 0', minHeight: '60px' }}>
                          {post.title}
                        </Title>

                        {/* Excerpt */}
                        <Paragraph
                          ellipsis={{ rows: 3 }}
                          type="secondary"
                          style={{ marginBottom: 16 }}
                        >
                          {post.excerpt || post.content.substring(0, 150)}
                        </Paragraph>

                        {/* Author & Meta */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 16,
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          <Space>
                            <Avatar
                              size="small"
                              src={post.author?.imageUrl}
                              icon={<UserOutlined />}
                            />
                            <Text strong style={{ fontSize: 12 }}>
                              {post.authorName}
                            </Text>
                          </Space>
                          <Space size="small">
                            <ClockCircleOutlined style={{ fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDate(post.publishedAt)}
                            </Text>
                          </Space>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <Space wrap size="small" style={{ marginTop: 8 }}>
                            {post.tags.map((tag: any) => (
                              <Tag key={tag.id} style={{ fontSize: 11 }}>
                                #{tag.name}
                              </Tag>
                            ))}
                          </Space>
                        )}
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={9}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty
            description="No articles found"
            style={{ padding: '100px 0' }}
          />
        )}
      </div>
    </div>
  );
}
