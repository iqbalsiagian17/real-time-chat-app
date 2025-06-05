// ChatSidebar.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatSearchBox from './ChatSearchBox';
import ChatList from './ChatList';
import ChatSidebarFooter from './ChatSidebarFooter';

export default function ChatSidebar({
  conversations,
  setConversations,
  user,
  currentId,
  setId,
  onCreate,
}) {
  const [search, setSearch] = useState('');
  const [readConversations, setReadConversations] = useState([]);
  const { logoutUser } = useAuth();

  return (
    <div
      className="chat-sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid #ccc',
        overflow: 'hidden',
      }}
    >
      <div className="sidebar-header" style={{ padding: '1rem' }}>
        <h3>Chats</h3>
        <button onClick={onCreate} title="Start new chat">＋</button>
      </div>

      <ChatSearchBox search={search} setSearch={setSearch} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ChatList
          conversations={conversations}
          setConversations={setConversations}
          user={user}
          currentId={currentId}
          setId={setId}
          search={search}
          readConversations={readConversations}
          setReadConversations={setReadConversations}
        />
      </div>


      <ChatSidebarFooter
        username={user.username}
        logoutUser={logoutUser}
      />
    </div>
  );
}
