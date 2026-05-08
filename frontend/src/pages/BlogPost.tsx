import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, Avatar, Space, Tag, Divider, Card, Row, Col, Button } from "antd";
import { ClockCircleOutlined, EyeOutlined, ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '200px', textAlign: 'center' }}>
        <Text>Loading article...</Text>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '200px', textAlign: 'center' }}>
        <Title level={2}>Article Not Found</Title>
        <Link to="/blog">
          <Button type="primary">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '16px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link to="/blog">
            <Button icon={<ArrowLeftOutlined />} type="text">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div style={{
          height: '400px',
          background: `url(${post.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      )}

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
        <Card style={{ borderRadius: '16px' }}>
          {/* Categories */}
          <Space wrap size="small" style={{ marginBottom: 16 }}>
            {post.categories?.map((cat: any) => (
              <Tag key={cat.id} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {cat.name}
              </Tag>
            ))}
          </Space>

          {/* Title */}
          <Title level={1} style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>
            {post.title}
          </Title>

          {/* Meta Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '2px solid #f0f0f0'
          }}>
            <Space size="large">
              <Space>
                <Avatar src={post.author?.imageUrl} icon={<UserOutlined />} size={40} />
                <div>
                  <Text strong style={{ display: 'block' }}>{post.authorName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {post.author?.brokerage}
                  </Text>
                </div>
              </Space>
            </Space>
            <Space size="large">
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">{formatDate(post.publishedAt)}</Text>
              </Space>
              <Space>
                <EyeOutlined />
                <Text type="secondary">{post.viewCount} views</Text>
              </Space>
            </Space>
          </div>

          {/* Content */}
          <div
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <>
              <Divider />
              <Space wrap size="middle">
                {post.tags.map((tag: any) => (
                  <Tag key={tag.id} style={{ fontSize: 14, padding: '6px 14px' }}>
                    #{tag.name}
                  </Tag>
                ))}
              </Space>
            </>
          )}

          {/* Author Bio */}
          {post.author?.bio && (
            <>
              <Divider />
              <Card style={{ background: '#f8f9fa', border: 'none' }}>
                <Row gutter={24} align="middle">
                  <Col>
                    <Avatar src={post.author.imageUrl} size={80} icon={<UserOutlined />} />
                  </Col>
                  <Col flex={1}>
                    <Title level={4} style={{ margin: 0 }}>About {post.authorName}</Title>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {post.author.bio}
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
