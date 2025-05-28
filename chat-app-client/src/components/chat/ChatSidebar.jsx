import { useState } from 'react';
import axios from '../../api/axios'; // pastikan ini sudah diatur dengan auth header

export default function ChatSidebar({ conversations, user, currentId, setId, onCreate }) {
  const [search, setSearch] = useState('');
  const [readConversations, setReadConversations] = useState([]);


const handleClickConversation = async (conversationId) => {
  try {
    await axios.post('/chat/mark-as-read', { conversation_id: conversationId });

    // Tambahkan ke daftar yang sudah dibaca
    setReadConversations((prev) => [...prev, conversationId]);
  } catch (err) {
    console.error('❌ Gagal menandai pesan terbaca:', err);
  } finally {
    setId(conversationId);
  }
};




  const filteredConversations = conversations.filter((c) => {
    if (!c.Users || !Array.isArray(c.Users)) return false;

    const isGroup = c.is_group;
    const otherUsers = c.Users.filter((u) => u.id !== user.id);
    const label = isGroup
      ? c.name || 'Unnamed Group'
      : otherUsers[0]?.username || 'Unknown';

    return label?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h3>Chats</h3>
        <button onClick={onCreate} title="Start new chat">＋</button>
      </div>

      <div style={{ padding: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
        />
      </div>

      {filteredConversations.length === 0 && (
        <p style={{ color: '#999', padding: '1rem' }}>No matching conversations.</p>
      )}

      {filteredConversations.map((c) => {
        const isGroup = c.is_group;
        const otherUsers = c.Users?.filter((u) => u.id !== user.id);
        const label = isGroup
          ? c.name || 'Unnamed Group'
          : otherUsers?.[0]?.username || 'Unknown';

        const preview = c.lastMessage
          ? `${c.lastMessage.sender?.username}: ${c.lastMessage.content}`
          : 'No messages yet';

        const time = c.lastMessageDate
          ? new Date(c.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <div
            key={c.id}
            className={`chat-user ${c.id === currentId ? 'selected' : ''}`}
            onClick={() => handleClickConversation(c.id)}
            style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{label}</strong>
              <small style={{ color: '#999' }}>{time}</small>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#555' }}>{preview}</div>
          
{c.unreadCount > 0 && !readConversations.includes(c.id) && (

              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {c.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
