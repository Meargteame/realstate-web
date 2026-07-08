import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Avatar, Typography, Space, message as antMessage } from "antd";
import { SendOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { useIsMobile } from "../hooks/useBreakpoint";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  senderId: string;
  senderType: 'agent' | 'lead';
  content: string;
  createdAt: string;
}

interface PropertyChatModalProps {
  visible: boolean;
  onClose: () => void;
  property: any;
  agent: any;
}

export default function PropertyChatModal({ visible, onClose, property, agent }: PropertyChatModalProps) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);

  const authHeaders = () => ({
    'Authorization': `Bearer ${agent?.token || ''}`
  });
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [showForm, setShowForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for a conversation
  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/conversation/${convId}`);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Poll for new messages when chat is open
  useEffect(() => {
    if (!visible || !conversationId) return;
    
    const interval = setInterval(() => {
      loadMessages(conversationId);
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [visible, conversationId]);

  // Check if user has existing conversation
  useEffect(() => {
    if (visible && property?.id) {
      // Try to load existing conversation from localStorage
      const storageKey = `conversation_${property.id}_${agent.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setUserInfo(data.userInfo);
          setConversationId(data.conversationId);
          setShowForm(false);
          loadMessages(data.conversationId);
        } catch (error) {
          console.error('Error loading stored conversation:', error);
        }
      }
    }
  }, [visible, property?.id, agent?.id]);

  const handleStartChat = async () => {
    if (!userInfo.name || !userInfo.email) {
      antMessage.error('Please enter your name and email');
      return;
    }

    try {
      // Create lead first
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone || 'Not provided',
          message: `Interested in ${property.address}`,
          agentId: agent.id,
          propertyId: property.id,
        }),
      });

      if (!leadRes.ok) throw new Error('Failed to create lead');
      const lead = await leadRes.json();

      // Create conversation
      const convRes = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          agentId: agent.id,
          senderId: userInfo.email,
          senderType: 'lead',
          content: `Hi! I'm interested in the property at ${property.address}. Can you provide more information?`
        })
      });

      if (!convRes.ok) throw new Error('Failed to start conversation');
      const message = await convRes.json();
      
      // Store conversation info in localStorage
      const storageKey = `conversation_${property.id}_${agent.id}`;
      const conversationData = {
        conversationId: message.conversationId,
        userInfo,
        propertyId: property.id,
        agentId: agent.id
      };
      localStorage.setItem(storageKey, JSON.stringify(conversationData));
      
      setConversationId(message.conversationId);
      setMessages([message]);
      setShowForm(false);
      antMessage.success('Chat started! The agent will respond soon. You can reopen this chat anytime from this property page.');
    } catch (error) {
      console.error('Error starting chat:', error);
      antMessage.error('Failed to start chat. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: userInfo.email,
          senderType: 'lead',
          content: newMessage.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const message = await res.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '95%' : 600}
      closeIcon={<CloseOutlined style={{ fontSize: 20 }} />}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div style={{ 
        padding: isMobile ? '16px' : '24px', 
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={56} src={agent.imageUrl} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0, color: 'white' }}>{agent.name}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
              {agent.brokerage}
            </Text>
          </div>
        </div>
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: 8,
          backdropFilter: 'blur(10px)'
        }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>
            📍 {property.address}, {property.city}
          </Text>
        </div>
      </div>

      {showForm ? (
        /* Contact Form */
        <div style={{ padding: isMobile ? '20px' : '32px' }}>
          <Title level={4} style={{ marginBottom: 8 }}>Start a Conversation</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Enter your details to chat with {agent.name} about this property
          </Text>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Full Name *</Text>
              <Input
                size="large"
                placeholder="John Doe"
                value={userInfo.name}
                onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                style={{ borderRadius: 8 }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Email Address *</Text>
              <Input
                size="large"
                type="email"
                placeholder="john@example.com"
                value={userInfo.email}
                onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                style={{ borderRadius: 8 }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Phone Number (Optional)</Text>
              <Input
                size="large"
                placeholder="(555) 123-4567"
                value={userInfo.phone}
                onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                style={{ borderRadius: 8 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleStartChat}
              style={{
                height: 50,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                marginTop: 8
              }}
            >
              Start Chat with {agent.name}
            </Button>
          </Space>

          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            Your information will only be shared with the listing agent
          </Text>
        </div>
      ) : (
        /* Chat Interface */
        <>
          <div style={{ 
            height: isMobile ? 300 : 400, 
            overflowY: 'auto', 
            padding: isMobile ? '16px' : '24px',
            background: '#f8f9fa'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Text type="secondary">No messages yet. Start the conversation!</Text>
              </div>
            ) : (
              messages.map((msg) => {
                const isLead = msg.senderType === 'lead';
                return (
                  <div key={msg.id} style={{ 
                    display: 'flex', 
                    justifyContent: isLead ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: isLead 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: isLead ? 'white' : '#262626',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ marginBottom: 4 }}>{msg.content}</div>
                      <Text style={{ 
                        fontSize: 11, 
                        color: isLead ? 'rgba(255,255,255,0.8)' : '#8c8c8c'
                      }}>
                        {formatTime(msg.createdAt)}
                      </Text>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: 'white' }}>
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
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ borderRadius: '8px 0 0 8px' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={sending}
                disabled={!newMessage.trim()}
                style={{
                  height: 'auto',
                  borderRadius: '0 8px 8px 0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Send
              </Button>
            </Space.Compact>
          </div>
        </>
      )}
    </Modal>
  );
}
