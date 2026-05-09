import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Modal, Form, Select, message as antMessage, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('kw_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        search: searchText
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      antMessage.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const userData = localStorage.getItem('kw_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        antMessage.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await res.json();
        antMessage.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      antMessage.error('Failed to delete user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const userData = localStorage.getItem('kw_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const token = user.token;

      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (res.ok) {
        antMessage.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        fetchUsers();
      } else {
        const data = await res.json();
        antMessage.error(data.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {record.agent && (
            <Tag color="blue" style={{ marginTop: 4, fontSize: 11 }}>
              Agent Profile
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'agent' ? 'blue' : 'default'}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_: any, record: any) => {
        if (!record.agent) return <span style={{ color: '#8c8c8c' }}>-</span>;
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontSize: 12 }}>
              {record.agent.properties?.length || 0} listings
            </span>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.agent.leads?.length || 0} leads
            </span>
          </Space>
        );
      }
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 900 }}>
          Users Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddUser}
          style={{ background: '#b40101', borderColor: '#b40101', height: '40px', fontWeight: 600 }}
        >
          Add User
        </Button>
      </div>

      <Card 
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Input
          placeholder="Search users by name or email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, width: 300, borderRadius: 8 }}
        />
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingUser ? 'Update' : 'Create'}
        okButtonProps={{ style: { background: '#b40101', borderColor: '#b40101' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email address" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="agent">Agent</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
