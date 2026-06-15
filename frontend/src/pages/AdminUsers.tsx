import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Space, Typography, Modal, Form, Select, message as antMessage, Popconfirm, Avatar, Tabs, Drawer, Timeline, Empty } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, HistoryOutlined, TeamOutlined, SafetyOutlined, CrownOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";
import { useDebounce } from "../hooks/useDebounce";

const { Title } = Typography;
const AntSelect = Select as any;
const AntOption = (Select as any).Option;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 350);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [bulkRole, setBulkRole] = useState<string>('');
  const [showActivity, setShowActivity] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, debouncedSearch, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('torra_user');
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
        search: debouncedSearch,
        ...(activeTab !== 'all' ? { role: activeTab } : {})
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
      const userData = localStorage.getItem('torra_user');
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
      const userData = localStorage.getItem('torra_user');
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

  const handleBulkDelete = async () => {
    const userData = localStorage.getItem('torra_user');
    if (!userData) return;
    const token = JSON.parse(userData).token;
    try {
      await Promise.all(selectedRows.map((u: any) =>
        fetch(`/api/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      ));
      antMessage.success(`${selectedRows.length} users deleted`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      fetchUsers();
    } catch { antMessage.error('Failed to delete some users'); }
  };

  const handleBulkRoleChange = async () => {
    if (!bulkRole) return;
    const userData = localStorage.getItem('torra_user');
    if (!userData) return;
    const token = JSON.parse(userData).token;
    try {
      await Promise.all(selectedRows.map((u: any) =>
        fetch(`/api/admin/users/${u.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: bulkRole })
        })
      ));
      antMessage.success(`${selectedRows.length} users updated to ${bulkRole}`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setBulkRole('');
      fetchUsers();
    } catch { antMessage.error('Failed to update some users'); }
  };

  const fetchActivityLog = async () => {
    setShowActivity(true);
    // Mock activity log (replace with API when available)
    setActivityLog([
      { time: '2 min ago', user: 'John Doe', action: 'Logged in', type: 'auth' },
      { time: '15 min ago', user: 'Sarah Smith', action: 'Updated profile', type: 'profile' },
      { time: '1 hour ago', user: 'Mike Johnson', action: 'Created new listing', type: 'listing' },
      { time: '2 hours ago', user: 'Admin', action: 'Approved agent: Lisa Ray', type: 'admin' },
      { time: '3 hours ago', user: 'Emily Chen', action: 'Changed password', type: 'auth' },
      { time: '5 hours ago', user: 'Admin', action: 'Deleted user: spam_account', type: 'admin' },
    ]);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div style={{ fontWeight: 600 }}>{name}</div>
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
    <div style={{ padding: isMobile ? '24px 16px' : '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '24px' : '32px', flexWrap: 'wrap', gap: '16px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: isMobile ? '24px' : '32px' }}>
          Users Management
        </Title>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={fetchActivityLog}>Activity Log</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            style={{ background: '#b40101', borderColor: '#b40101', height: '40px', fontWeight: 600 }}
          >
            {isMobile ? "Add" : "Add User"}
          </Button>
        </Space>
      </div>

      {/* Role Filter Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setPagination(prev => ({ ...prev, current: 1 })); }}
        style={{ marginBottom: 16 }}
        items={[
          { key: 'all', label: <span><TeamOutlined /> All Users</span> },
          { key: 'user', label: <span><UserOutlined /> Users</span> },
          { key: 'agent', label: <span><TeamOutlined /> Agents</span> },
          { key: 'admin', label: <span><CrownOutlined /> Admins</span> },
        ]}
      />

      {/* Bulk Actions Toolbar */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, background: '#fff7ed', borderColor: '#f59e0b', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text strong>{selectedRowKeys.length} selected</Text>
            <AntSelect value={bulkRole || undefined} onChange={(v: string) => setBulkRole(v)} placeholder="Change role to..." style={{ width: 160 }} allowClear>
              <AntOption value="user">User</AntOption>
              <AntOption value="agent">Agent</AntOption>
              <AntOption value="admin">Admin</AntOption>
            </AntSelect>
            <Button size="small" type="primary" onClick={handleBulkRoleChange} disabled={!bulkRole}>Apply Role</Button>
            <Popconfirm title={`Delete ${selectedRowKeys.length} users?`} onConfirm={handleBulkDelete} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
              <Button size="small" danger icon={<DeleteOutlined />}>Delete Selected</Button>
            </Popconfirm>
            <Button size="small" onClick={() => { setSelectedRowKeys([]); setSelectedRows([]); }}>Clear</Button>
          </div>
        </Card>
      )}

      <Card 
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Input
            placeholder="Search users by name or email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 300, borderRadius: 8 }}
          />
          {!loading && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {pagination.total} {pagination.total === 1 ? 'user' : 'users'} found
            </Typography.Text>
          )}
        </div>

        {isMobile ? (
          // Mobile Card View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((user: any) => (
              <Card 
                key={user.id}
                size="small"
                style={{ borderRadius: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Avatar size={48} icon={<UserOutlined />} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
                    <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>{user.email}</div>
                    <Space size="small" wrap>
                      <Tag color={user.role === 'admin' ? 'red' : user.role === 'agent' ? 'blue' : 'default'}>
                        {user.role?.toUpperCase()}
                      </Tag>
                    </Space>
                    <div style={{ marginTop: '12px' }}>
                      <Space size="small">
                        <Button 
                          type="link" 
                          icon={<EditOutlined />} 
                          size="small"
                          onClick={() => handleEditUser(user)}
                          style={{ padding: 0 }}
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete this user?"
                          onConfirm={() => handleDeleteUser(user.id)}
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />} size="small" style={{ padding: 0 }}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={searchText ? `No users match "${searchText}"` : 'No users yet'}
                >
                  {!searchText && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser} style={{ background: '#b40101', borderColor: '#b40101' }}>
                      Add First User
                    </Button>
                  )}
                </Empty>
              )
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys: React.Key[], rows: any[]) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
            }}
          />
        )}
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
        width={isMobile ? '100%' : 520}
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
            <AntSelect placeholder="Select role">
              <AntOption value="user">User</AntOption>
              <AntOption value="agent">Agent</AntOption>
              <AntOption value="admin">Admin</AntOption>
            </AntSelect>
          </Form.Item>
        </Form>
      </Modal>

      {/* Activity Log Drawer */}
      <Drawer title="Recent User Activity" placement="right" width={420} onClose={() => setShowActivity(false)} open={showActivity}>
        <Timeline
          items={activityLog.map((a: any) => ({
            color: a.type === 'auth' ? '#b40101' : a.type === 'admin' ? '#373a4b' : a.type === 'listing' ? '#10b981' : '#6b7280',
            children: (
              <div>
                <div style={{ fontWeight: 600 }}>{a.user}</div>
                <div style={{ fontSize: 13 }}>{a.action}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.time}</div>
              </div>
            )
          }))}
        />
      </Drawer>
    </div>
  );
}
