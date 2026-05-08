const prisma = require('../config/prisma');

// GET /api/blog - Get all published blog posts
exports.getBlogPosts = async (req, res) => {
  try {
    const { category, tag, search, featured } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      status: 'published',
      publishedAt: { lte: new Date() }
    };

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categories = {
        some: { slug: category }
      };
    }

    if (tag) {
      where.tags = {
        some: { slug: tag }
      };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              brokerage: true
            }
          },
          tags: true,
          categories: true
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/blog/:slug - Get single blog post by slug
exports.getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            brokerage: true,
            bio: true
          }
        },
        tags: true,
        categories: true
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/blog - Create new blog post (agent only)
exports.createBlogPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      coverImage,
      authorId,
      status,
      featured,
      tags,
      categories
    } = req.body;

    if (!title || !content || !authorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get author name
    const author = await prisma.agent.findUnique({
      where: { id: authorId },
      select: { name: true }
    });

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        authorId,
        authorName: author.name,
        status: status || 'draft',
        featured: featured || false,
        publishedAt: status === 'published' ? new Date() : null,
        tags: tags ? {
          connect: tags.map((tagId) => ({ id: tagId }))
        } : undefined,
        categories: categories ? {
          connect: categories.map((catId) => ({ id: catId }))
        } : undefined
      },
      include: {
        author: true,
        tags: true,
        categories: true
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/blog/:id - Update blog post
exports.updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      coverImage,
      status,
      featured,
      tags,
      categories
    } = req.body;

    const data = {};
    if (title) {
      data.title = title;
      data.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (status !== undefined) {
      data.status = status;
      if (status === 'published') {
        data.publishedAt = new Date();
      }
    }
    if (featured !== undefined) data.featured = featured;

    if (tags) {
      data.tags = {
        set: [],
        connect: tags.map((tagId) => ({ id: tagId }))
      };
    }

    if (categories) {
      data.categories = {
        set: [],
        connect: categories.map((catId) => ({ id: catId }))
      };
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: {
        author: true,
        tags: true,
        categories: true
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/blog/:id - Delete blog post
exports.deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/blog/categories - Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/blog/tags - Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
};
