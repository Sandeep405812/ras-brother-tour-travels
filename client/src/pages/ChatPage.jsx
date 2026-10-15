import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import {
  Send,
  User,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function ChatPage({ targetUser = null, bookingRef = null }) {
  const { user, token } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { showToast } = useNotification();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(targetUser);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch active conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        if (!selectedUser && data.conversations.length > 0) {
          setSelectedUser(data.conversations[0].user);
        }
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    }
  };

  useEffect(() => {
    if (token) fetchConversations();
  }, [token]);

  // Fetch messages with selected user
  const fetchMessages = async (otherUserId) => {
    try {
      const res = await fetch(`/api/chat/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  // Socket message listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (
        selectedUser &&
        (msg.sender._id === selectedUser._id || msg.sender === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('mark_read', { messageId: msg._id, senderId: msg.sender._id || msg.sender });
      }
      fetchConversations();
    };

    const handleMessageSent = (msg) => {
      setMessages((prev) => [...prev, msg]);
      fetchConversations();
    };

    const handleUserTyping = ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setIsTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedUser) return;

    if (socket) {
      socket.emit('send_message', {
        senderId: user._id,
        receiverId: selectedUser._id,
        content: inputContent.trim(),
        bookingId: bookingRef?._id,
      });
    }

    setInputContent('');
  };

  const handleInputChange = (e) => {
    setInputContent(e.target.value);
    if (socket && selectedUser) {
      socket.emit('typing', { receiverId: selectedUser._id });
      setTimeout(() => {
        socket.emit('stop_typing', { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  const isSelectedUserOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[750px]">
          {/* Left: Conversations list (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/60">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h2 className="font-extrabold text-base text-slate-900 font-heading">
                Direct Conversations
              </h2>
              <p className="text-xs text-slate-400">Customer &amp; Vendor instant messaging</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.length === 0 && !targetUser ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No previous conversations found.
                </div>
              ) : (
                conversations.map((c) => {
                  const isOnline = onlineUsers.includes(c.user?._id);
                  const isCurrent = selectedUser?._id === c.user?._id;

                  return (
                    <div
                      key={c.user?._id}
                      onClick={() => setSelectedUser(c.user)}
                      className={`p-4 flex items-center gap-3.5 cursor-pointer transition ${
                        isCurrent ? 'bg-amber-50/80 border-r-4 border-amber-500' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm uppercase">
                          {c.user?.name?.charAt(0) || 'U'}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{c.user?.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Area (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-white">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm">
                        {selectedUser.name?.charAt(0) || 'U'}
                      </div>
                      {isSelectedUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {selectedUser.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>{isSelectedUserOnline ? 'Online now' : 'Offline'}</span>
                        <span className="capitalize">• {selectedUser.role}</span>
                      </div>
                    </div>
                  </div>

                  {bookingRef && (
                    <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                      Booking #{bookingRef.bookingId}
                    </div>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50/40">
                  {messages.map((m) => {
                    const isMe = (m.sender?._id || m.sender) === user._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-slate-900 text-amber-100 rounded-br-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (m.read ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3 text-slate-400" />)}
                        </span>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="text-xs text-amber-600 font-semibold italic animate-pulse">
                      {selectedUser.name} is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2 bg-white">
                  <input
                    type="text"
                    value={inputContent}
                    onChange={handleInputChange}
                    placeholder="Type your message about event requirements, car timing, pickup..."
                    className="flex-1 p-3 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                <h3 className="font-bold text-sm text-slate-700">Select a conversation</h3>
                <p className="text-xs max-w-xs mt-1">
                  Connect directly with car owners to coordinate wedding arrivals, driver contacts, and route directions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
