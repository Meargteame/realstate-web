import React, { useState, useEffect, useRef } from "react";
import { useOutletContext, useLocation, Link } from "react-router-dom";
import {
  Search,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Home,
  ChevronLeft,
  Clock,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'agent' | 'lead';
  content: string;
  isRead: boolean;
  createdAt: string;
  pending?: boolean;
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
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const MESSAGE_PAGE_SIZE = 30;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const authHeaders = () => ({
    'Authorization': `Bearer ${agent?.token || ''}`
  });

  const templates = [
    { label: 'Schedule Showing', text: "I'd be pleased to arrange a private viewing of this residence. What days and times suit your schedule?" },
    { label: 'Follow Up', text: "Following up on your inquiry. Have you had an opportunity to review the property portfolio I shared?" },
    { label: 'Lending Introduction', text: "To give our offers priority standing, connecting with our private wealth lending partners is beneficial. Would you like an introduction?" },
    { label: 'Market Comps', text: "I have prepared a comparative market valuation dossier for this neighborhood. Would you like me to transmit it?" },
  ];

  useEffect(() => {
    if (!agent) return;
    fetchConversations();
  }, [agent]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messages/conversations/${agent.id}`, { headers: authHeaders() });
      const data = await res.json();
      
      if (!res.ok || !Array.isArray(data)) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      setConversations(data);
      
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
    } catch {
      setConversations([]);
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMobileThreadOpen(true);
    setHasMoreMessages(false);
    try {
      const res = await fetch(`/api/messages/conversation/${conversation.id}?limit=${MESSAGE_PAGE_SIZE}`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setMessages(list);
      setHasMoreMessages(list.length === MESSAGE_PAGE_SIZE);

      if (conversation.unreadCount > 0) {
        await fetch(`/api/messages/conversation/${conversation.id}/read`, {
          method: 'PATCH',
          headers: authHeaders()
        });
        setConversations(prev => prev.map(c =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
      }
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const oldest = messages[0];
      const res = await fetch(
        `/api/messages/conversation/${selectedConversation.id}?limit=${MESSAGE_PAGE_SIZE}&before=${encodeURIComponent(oldest.createdAt)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      const older = Array.isArray(data) ? data : [];
      setMessages(prev => [...older, ...prev]);
      setHasMoreMessages(older.length === MESSAGE_PAGE_SIZE);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: any = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: agent.id,
      senderType: 'agent',
      content,
      createdAt: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage("");
    setSending(true);
    scrollToBottom();

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: agent.id,
          senderType: 'agent',
          content
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const msg = await res.json();
      setMessages(prev => prev.map(m => m.id === tempId ? msg : m));

      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
          : c
      ));
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.lead?.name || '').toLowerCase().includes(q) ||
      (c.lead?.email || '').toLowerCase().includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-72px)] flex bg-white border-t border-stone-200 overflow-hidden">
      {/* Left Column: Conversation Directory */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-stone-200/90 flex flex-col bg-stone-50/50 ${
        mobileThreadOpen ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-stone-200/90 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg text-stone-900 tracking-tight">
              Client Conversations
            </h2>
            <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100/70 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {loading ? (
            <div className="p-8 text-center text-stone-400 text-xs">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-xs">No client conversations registered.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-3 border-[#b40101] shadow-2xs' : 'hover:bg-stone-100/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-sm shrink-0">
                    {conv.lead?.name?.[0]?.toUpperCase() || 'C'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs truncate ${isSelected ? 'font-semibold text-stone-900' : 'font-medium text-stone-800'}`}>
                        {conv.lead?.name || 'Prospective Client'}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                          {new Date(conv.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 truncate leading-relaxed">
                      {conv.lastMessage || conv.lead?.message || 'Started consultation dialogue.'}
                    </p>

                    {conv.lead?.property && (
                      <div className="flex items-center gap-1 text-[10px] text-[#b40101] truncate mt-1">
                        <Home className="w-3 h-3 shrink-0" />
                        <span className="truncate">{conv.lead.property.address}</span>
                      </div>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#b40101] shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Dialogue Thread */}
      <div className={`flex-1 flex flex-col bg-white ${
        !mobileThreadOpen ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-stone-200/90 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileThreadOpen(false)}
                  className="p-1.5 -ml-1 text-stone-600 hover:text-stone-900 md:hidden rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-base shrink-0">
                  {selectedConversation.lead?.name?.[0]?.toUpperCase() || 'C'}
                </div>

                <div>
                  <h3 className="font-serif text-base text-stone-900 leading-tight">
                    {selectedConversation.lead?.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
                    {selectedConversation.lead?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {selectedConversation.lead.email}
                      </span>
                    )}
                    {selectedConversation.lead?.phone && (
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {selectedConversation.lead.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedConversation.lead?.property && (
                <Link
                  to={`/properties/${selectedConversation.lead.property.id}`}
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-[#b40101]" />
                  <span className="max-w-[160px] truncate">{selectedConversation.lead.property.address}</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </Link>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
              {hasMoreMessages && (
                <div className="text-center pb-2">
                  <button
                    onClick={loadOlderMessages}
                    disabled={loadingOlder}
                    className="text-[11px] text-[#b40101] hover:underline uppercase tracking-wider font-semibold"
                  >
                    {loadingOlder ? 'Loading earlier messages...' : 'Load earlier messages'}
                  </button>
                </div>
              )}

              {/* Initial lead inquiry snippet card if available */}
              {selectedConversation.lead?.message && (
                <div className="mx-auto max-w-lg p-4 bg-white border border-stone-200 rounded-lg shadow-2xs text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    <span>Initial Web Inquiry</span>
                    <Clock className="w-3 h-3" />
                  </div>
                  <p className="text-stone-700 italic">
                    "{selectedConversation.lead.message}"
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isAgent = msg.senderType === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-lg text-xs leading-relaxed shadow-2xs ${
                        isAgent
                          ? 'bg-[#0d0f12] text-white rounded-br-none'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.pending && ' • sending...'}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Bar */}
            <div className="px-4 pt-3 pb-1 border-t border-stone-100 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#b40101]" />
                Templates:
              </span>
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setNewMessage(tpl.text)}
                  className="px-2.5 py-1 text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200 rounded whitespace-nowrap transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-stone-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Draft your private response..."
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-[#b40101] hover:bg-[#900101] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
            <MessageSquare className="w-12 h-12 text-stone-300 mb-3" />
            <h4 className="font-serif text-lg text-stone-700">Torra Private Concierge Suite</h4>
            <p className="text-xs text-stone-400 max-w-sm mt-1">
              Select a client conversation from the left register to review the transcript and dispatch replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
