import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatRoom.css';

import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessages from '../../components/chat/ChatMessages';
import ChatInput from '../../components/chat/ChatInput';
import CreateConversationModal from '../../components/chat/CreateConversationModal';
import EmptyChatScreen from '../../components/chat/EmptyChatScreen';

import {
  getParticipants,
  createConversation,
  getConversationsWithLastMessage,
} from '../../services/conversationService';
import { getMessages } from '../../services/chatService';
import { getAllUsers } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ChatRoom() {
  const { user } = useAuth();
  const socketRef = useRef();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [typingUsersMap, setTypingUsersMap] = useState({}); 

  

  // 🚀 Socket connection & listeners
  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('✅ Socket connected:', socket.id));

    socket.on('receiveMessage', (msg) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === msg.conversation_id);
        if (index !== -1) {
          const updated = [...prev];
          const target = { ...updated[index] };

          target.lastMessage = msg;
          target.lastMessageDate = new Date().toISOString();

          if (msg.conversation_id !== conversationId) {
            target.unreadCount = (target.unreadCount || 0) + 1;
          } else {
            markAsRead(msg.conversation_id);
          }

          updated.splice(index, 1);
          return [target, ...updated];
        }
        return prev;
      });

      if (msg.conversation_id === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('newConversation', async (newConv) => {
      console.log('📩 Received newConversation:', newConv);
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newConv.id);
        return exists ? prev : [newConv, ...prev];
      });

      // Aktifkan jika ini untuk user sekarang
      if (newConv.Users?.some((u) => u.id === user.id)) {
        setConversationId(newConv.id);
        const [msgs, parts] = await Promise.all([
          getMessages(newConv.id),
          getParticipants(newConv.id),
        ]);
        setMessages(msgs);
        setParticipants(parts.filter((p) => p.id !== user.id));
      }
    });

    socket.on('userOnline', ({ user_id, is_online, last_seen }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === user_id ? { ...p, is_online, last_seen } : p
        )
      );
    });

    return () => socket.disconnect();
  }, [user, conversationId]);

  // 📨 Fetch Conversations + Users
  useEffect(() => {
    if (!user) return;

    getConversationsWithLastMessage()
      .then((convs) => {
        setConversations(convs);
        return getAllUsers();
      })
      .then((users) => {
        const filtered = users.filter((u) => u.id !== user.id);
        setAllUsers(filtered);
      })
      .catch((err) => console.error('❌ Error fetch data:', err));
  }, [user]);

  // 📩 Fetch messages + participants for selected conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    getMessages(conversationId).then(setMessages);
    getParticipants(conversationId).then((res) =>
      setParticipants(res.filter((p) => p.id !== user.id))
    );
  }, [conversationId, user]);


 useEffect(() => {
  const socket = socketRef.current;
  if (!socket || !conversationId) return;

  socket.on('userTyping', ({ user_id, username }) => {
    if (user_id !== user.id) {
      setTypingUser(username);
    }
  });

  socket.on('userStopTyping', ({ user_id }) => {
    if (user_id !== user.id) {
      setTypingUser(null);
    }
  });

  socket.emit('joinConversation', { conversation_id: conversationId });

  return () => {
    socket.off('userTyping');
    socket.off('userStopTyping');
  };
}, [conversationId, user]);





  useEffect(() => {
  const socket = socketRef.current;
  if (socket && conversationId) {
    socket.emit('joinConversation', { conversation_id: conversationId });
  }
}, [conversationId]);



  // 🟢 Send Message
  const sendMessage = (text) => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      conversation_id: conversationId, // boleh null
      content: text,
      target_user_ids: !conversationId ? [targetUserId] : undefined, // user/group yang dituju
      is_group: false, // atau true kalau dari group
      name: null,      // nama group kalau group
    });
  };

  // ➕ Create Conversation
  const handleCreateConversation = async (userIds, groupName = null) => {
    if (!socketRef.current) return;

    try {
      socketRef.current.emit('createConversation', {
        user_ids: userIds,
        name: groupName,
      });

      setShowCreate(false); // langsung tutup modal

    } catch (err) {
      console.error('❌ Gagal membuat conversation:', err);
      alert('Gagal membuat conversation');
    }
  };

  // ✅ Mark as Read
  const markAsRead = async (conversationId) => {
    try {
      await fetch('http://localhost:5000/api/chat/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error('❌ Gagal markAsRead:', err);
    }
  };

  useEffect(() => {
  const socket = socketRef.current;
  if (socket && conversationId) {
    socket.emit('joinConversation', { conversation_id: conversationId });
    console.log(`📡 Join conversation_${conversationId}`);
  }
}, [conversationId]);


  // ⎋ Escape key untuk keluar percakapan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setConversationId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          setConversations={setConversations}
          user={user}
          currentId={conversationId}
          setId={setConversationId}
          onCreate={() => setShowCreate(true)}
          typingUsersMap={typingUsersMap} // ✅ tambahkan ini
        />

        {/* Chat Area */}
        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {conversationId ? (
            <>
              <ChatHeader
                user={user}
                participants={participants}
                isGroup={participants.length > 1}
                conversation={conversations.find((c) => c.id === conversationId)}
                  typingUser={typingUser} // ⬅️ Tambahkan ini!
              />
              <ChatMessages
                messages={messages}
                user={user}
                isGroup={participants.length > 1}
                conversation={conversations.find((c) => c.id === conversationId)} // ⬅️ tambahkan ini!
                typingUser={typingUser} // ⬅️ Tambahkan ini
              />
              <ChatInput
                sendMessage={sendMessage}
                socketRef={socketRef}
                conversationId={conversationId}
                user={user}
              />
            </>
          ) : (
            <EmptyChatScreen />
          )}
        </div>

        {/* Modal */}
        {showCreate && (
          <CreateConversationModal
            users={allUsers}
            create={handleCreateConversation}
            onClose={() => setShowCreate(false)}
            onSelectConversation={setConversationId}
            existingConversations={conversations}
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  );
}
