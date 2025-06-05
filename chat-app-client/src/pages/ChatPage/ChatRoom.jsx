import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './ChatRoom.css';

import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessages from '../../components/chat/ChatMessages';
import ChatInput from '../../components/chat/ChatInput';
import CreateConversationModal from '../../components/chat/CreateConversationModal';

import {
  getAllConversations,
  getParticipants,
  createConversation,
  getConversationsWithLastMessage,
} from '../../services/conversationService';
import { getMessages } from '../../services/chatService';
import { getAllUsers } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ChatRoom() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
  if (!user) return;

  const newSocket = io('http://localhost:5000', {
    auth: { token: localStorage.getItem('token') },
  });

  // ✅ pakai newSocket, BUKAN socket
  newSocket.on('receiveMessage', (msg) => {
    setConversations((prev) => {
      const existingIndex = prev.findIndex(c => c.id === msg.conversation_id);

      if (existingIndex !== -1) {
        const updated = [...prev];
        const target = { ...updated[existingIndex] };

        target.lastMessage = msg;
        target.lastMessageDate = new Date().toISOString();

        if (msg.conversation_id !== conversationId) {
          target.unreadCount = (target.unreadCount || 0) + 1;
        }

        updated.splice(existingIndex, 1);
        return [target, ...updated];
      }

      return prev;
    });

    if (msg.conversation_id === conversationId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  newSocket.on('newConversation', (newConv) => {
    setConversations((prev) => {
      const exists = prev.some(c => c.id === newConv.id);
      return exists ? prev : [...prev, newConv];
    });
  });

  setSocket(newSocket);

  return () => newSocket.disconnect();
}, [conversationId, user]);


  useEffect(() => {
  if (!user) return;

  getConversationsWithLastMessage().then((convs) => {
    setConversations(convs);

    getAllUsers().then((users) => {
      const privateConvs = convs.filter(c => !c.is_group);
      const existingUserIds = new Set();
      privateConvs.forEach(c => {
        c.Users?.forEach(u => {
          if (u.id !== user.id) existingUserIds.add(u.id);
        });
      });

      const filtered = users.filter(u => u.id !== user.id);
      setAllUsers(filtered);
    });
  }).catch(err => {
    console.error('Failed to fetch conversations:', err);
  });
}, [user]);


  useEffect(() => {
    if (!conversationId || !user) return;

    getMessages(conversationId).then(setMessages);

    getParticipants(conversationId).then((res) =>
      setParticipants(res.filter((p) => p.id !== user.id))
    );
  }, [conversationId, user]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const newMessage = {
      content: text,
      conversation_id: conversationId,
      sender_id: user.id,
      sender: user,
      created_at: new Date().toISOString(),
    };

    socket.emit('sendMessage', {
      conversation_id: conversationId,
      content: text,
    });
  };

  const handleCreateConversation = async (userIds, groupName = null) => {
    try {
      await createConversation(userIds, groupName);

      const updatedConvs = await getAllConversations();
      setConversations(updatedConvs);

      const newConv = updatedConvs.find(c => {
        const ids = c.Users.map(u => u.id).sort();
        const selectedIds = [...userIds, user.id].sort();
        return JSON.stringify(ids) === JSON.stringify(selectedIds);
      });

      if (newConv) {
        setConversationId(newConv.id);
      }

      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat conversation');
    }
  };

  const otherUser = participants[0];

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <ChatSidebar
          conversations={conversations}
          setConversations={setConversations}
          user={user}
          currentId={conversationId}
          setId={setConversationId}
          onCreate={() => setShowCreate(true)}
          socket={socket}
        />

        <div className="chat-main">
          <ChatHeader
            user={user}
            participants={participants}
            isGroup={participants.length > 1}
            conversation={conversations.find(c => c.id === conversationId)}
          />

          <ChatMessages messages={messages} user={user} isGroup={participants.length > 1} />

          <ChatInput sendMessage={sendMessage} />
        </div>

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
