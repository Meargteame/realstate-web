import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout, Card, Row, Col, Typography, Tag, Space, Input, Select, Pagination, Avatar, Empty } from "antd";
import { SearchOutlined, ClockCircleOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

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
  const isMobile = useIsMobile();

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
        background: 'linear-gradient(135deg, #b40101 0%, #8a0000 100%)',
        padding: isMobile ? '48px 16px' : '80px 32px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: isMobile ? 32 : 56, fontWeight: 900, margin: 0 }}>
          REAL ESTATE INSIGHTS
        </Title>
        <Text style={{ color: 'white', fontSize: isMobile ? 16 : 20, opacity: 0.9 }}>
          Expert advice, market trends, and tips from our agents
        </Text>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: '1400px', margin: isMobile ? '-32px auto 0' : '-40px auto 0', padding: isMobile ? '0 16px' : '0 32px' }}>
        <Card style={{ borderRadius: isMobile ? '12px' : '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Search
                placeholder="Search articles..."
                allowClear
                size={isMobile ? "middle" : "large"}
                onSearch={setSearch}
                prefix={<SearchOutlined />}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="All Categories"
                size={isMobile ? "middle" : "large"}
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
                size={isMobile ? "middle" : "large"}
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
      <div style={{ maxWidth: '1400px', margin: isMobile ? '32px auto 0' : '48px auto 0', padding: isMobile ? '0 16px' : '0 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '60px 0' : '100px 0' }}>
            <Text type="secondary">Loading articles...</Text>
          </div>
        ) : posts.length > 0 ? (
          <>
            <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]}>
              {posts.map(post => (
                <Col xs={24} sm={12} lg={8} key={post.id}>
                  <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      cover={
                        <div style={{
                          height: isMobile ? '200px' : '240px',
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
                        <Title level={4} style={{ margin: '8px 0', minHeight: isMobile ? '48px' : '60px', fontSize: isMobile ? '16px' : '18px' }}>
                          {post.title}
                        </Title>

                        {/* Excerpt */}
                        <Paragraph
                          ellipsis={{ rows: isMobile ? 2 : 3 }}
                          type="secondary"
                          style={{ marginBottom: 16, fontSize: isMobile ? '13px' : '14px' }}
                        >
                          {post.excerpt || post.content.substring(0, 150)}
                        </Paragraph>

                        {/* Author & Meta */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 16,
                          borderTop: '1px solid #f0f0f0',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <Space size="small">
                            <Avatar
                              size="small"
                              src={post.author?.imageUrl}
                              icon={<UserOutlined />}
                            />
                            <Text strong style={{ fontSize: isMobile ? 11 : 12 }}>
                              {post.authorName}
                            </Text>
                          </Space>
                          <Space size="small">
                            <ClockCircleOutlined style={{ fontSize: isMobile ? 11 : 12 }} />
                            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                              {formatDate(post.publishedAt)}
                            </Text>
                          </Space>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <Space wrap size="small" style={{ marginTop: 8 }}>
                            {post.tags.slice(0, isMobile ? 2 : 3).map((tag: any) => (
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
            <div style={{ textAlign: 'center', marginTop: isMobile ? 32 : 48 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={9}
                onChange={setPage}
                showSizeChanger={false}
                size={isMobile ? "small" : "default"}
              />
            </div>
          </>
        ) : (
          <Empty
            description="No articles found"
            style={{ padding: isMobile ? '60px 0' : '100px 0' }}
          />
        )}
      </div>
    </div>
  );
}
