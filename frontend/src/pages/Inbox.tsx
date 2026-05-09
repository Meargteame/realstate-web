import React, { useState, useEffect, useRef } from "react";
import { Layout, Avatar, Typography, Input, Button, Space, Badge, Empty, Spin, message as antMessage } from "antd";
import { useOutletContext, useLocation } from "react-router-dom";
import { SearchOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'agent' | 'lead';
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  leadId: string;
  agentId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    property?: any;
  };
  messages: Message[];
}

export default function Inbox() {
  const { agent } = useOutletContext<{ agent: any }>();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!agent) return;
    fetchConversations();
  }, [agent]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messages/conversations/${agent.id}`);
      const data = await res.json();
      
      // Handle error responses (429, 500, etc.)
      if (!res.ok || !Array.isArray(data)) {
        console.error('Error fetching conversations:', data);
        setConversations([]);
        setLoading(false);
        return;
      }
      
      setConversations(data);
      
      // Check if we should auto-select a conversation based on leadId from navigation state
      const leadId = (location.state as any)?.leadId;
      if (leadId && data.length > 0) {
        const targetConversation = data.find((c: Conversation) => c.leadId === leadId);
        if (targetConversation) {
          selectConversation(targetConversation);
        } else if (data.length > 0 && !selectedConversation) {
          selectConversation(data[0]);
        }
      } else if (data.length > 0 && !selectedConversation) {
        selectConversation(data[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    try {
      const res = await fetch(`/api/messages/conversation/${conversation.id}`);
      const data = await res.json();
      setMessages(data);
      
      // Mark as read
      if (conversation.unreadCount > 0) {
        await fetch(`/api/messages/conversation/${conversation.id}/read`, {
          method: 'PATCH'
        });
        // Update local state
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: agent.id,
          senderType: 'agent',
          content: newMessage.trim()
        })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      const message = await res.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
          : c
      ));
      
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredConversations = conversations.filter(c =>
    c.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Layout style={{ height: 'calc(100vh - 80px)', background: 'white' }}>
      {/* Conversations List */}
      <Sider width={350} theme="light" style={{ borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0 }}>Messages</Title>
          <Input 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginTop: 16, borderRadius: 8 }}
          />
        </div>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <Empty 
            description="No conversations yet" 
            style={{ marginTop: 60 }}
          />
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                style={{ 
                  padding: '16px 20px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #f5f5f5',
                  background: selectedConversation?.id === conversation.id ? '#fff1f0' : 'white',
                  borderLeft: selectedConversation?.id === conversation.id ? '4px solid #b40101' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#111827', flexShrink: 0 }}>
                    {conversation.lead.name[0]}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>{conversation.lead.name}</Text>
                      {conversation.lastMessageAt && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatTime(conversation.lastMessageAt)}
                        </Text>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text 
                        ellipsis 
                        style={{ 
                          color: '#8c8c8c', 
                          fontSize: 13, 
                          flex: 1,
                          fontWeight: conversation.unreadCount > 0 ? 600 : 400
                        }}
                      >
                        {conversation.lastMessage || conversation.lead.message}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          count={conversation.unreadCount} 
                          style={{ backgroundColor: '#b40101', marginLeft: 8 }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Sider>

      {/* Chat Area */}
      <Content style={{ display: 'flex', flexDirection: 'column', background: 'white' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: '20px 32px', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#111827' }}>
                {selectedConversation.lead.name[0]}
              </Avatar>
              <div>
                <Title level={5} style={{ margin: 0 }}>{selectedConversation.lead.name}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {selectedConversation.lead.email} • {selectedConversation.lead.phone}
                </Text>
              </div>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '24px 32px',
              background: '#fafafa'
            }}>
              {messages.map((msg, index) => {
                const isAgent = msg.senderType === 'agent';
                const showDate = index === 0 || 
                  new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(msg.createdAt).toLocaleDateString([], { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </div>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: isAgent ? 'flex-end' : 'flex-start',
                      marginBottom: 12
                    }}>
                      <div style={{ 
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: isAgent ? '#b40101' : 'white',
                        color: isAgent ? 'white' : '#262626',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ marginBottom: 4 }}>{msg.content}</div>
                        <Text style={{ 
                          fontSize: 11, 
                          color: isAgent ? 'rgba(255,255,255,0.7)' : '#8c8c8c'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ 
              padding: '20px 32px', 
              borderTop: '1px solid #f0f0f0',
              background: 'white'
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ borderRadius: '8px 0 0 8px' }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={!newMessage.trim()}
                  style={{ 
                    background: '#b40101', 
                    borderColor: '#b40101',
                    height: 'auto',
                    borderRadius: '0 8px 8px 0'
                  }}
                >
                  Send
                </Button>
              </Space.Compact>
            </div>
          </>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Empty description="Select a conversation to start messaging" />
          </div>
        )}
      </Content>
    </Layout>
  );
}
