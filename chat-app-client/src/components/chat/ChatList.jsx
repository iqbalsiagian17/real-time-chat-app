import ChatListItem from './ChatListItem';
import { useAuth } from '../../context/AuthContext';

export default function ChatList({
  conversations,
  setConversations,
  currentId,
  setId,
  search,
  readConversations,
  setReadConversations,
}) {
  const { user } = useAuth(); // ✅ Ambil user dari context
  const token = localStorage.getItem('token');

  const handleClickConversation = async (conversationId) => {
    try {
      await fetch('http://localhost:5000/api/chat/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      setReadConversations((prev) => [...prev, conversationId]);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('❌ Gagal menandai pesan terbaca:', err);
    } finally {
      setId(conversationId);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const label = c.is_group
      ? c.name || 'Unnamed Group'
      : c.Users.find((u) => u.id !== user.id)?.username || 'Unknown';
    return label.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
      {filteredConversations.length === 0 && (
        <p style={{ color: '#999', padding: '1rem' }}>No matching conversations.</p>
      )}
      {filteredConversations.map((c) => (
        <ChatListItem
          key={c.id}
          conversation={c}
          currentId={currentId}
          onClick={() => handleClickConversation(c.id)}
          readConversations={readConversations}
        />
      ))}
    </div>
  );
}
