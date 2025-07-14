import { useAuth } from '../../context/AuthContext';

export default function ChatListItem({
  conversation,
  currentId,
  onClick,
  readConversations,
  typingUsersMap = {}, // ⬅️ Tambahan: mapping userId => username
}) {
  const { user } = useAuth();

  const isGroup = conversation.is_group;
  const otherUsers = conversation.Users?.filter((u) => u.id !== user.id);
  const label = isGroup
    ? conversation.name || 'Unnamed Group'
    : otherUsers?.[0]?.username || 'Unknown';

  const preview = conversation.lastMessage
    ? (conversation.lastMessage.sender_id === user.id
        ? conversation.lastMessage.content
        : `${conversation.lastMessage.sender?.username}: ${conversation.lastMessage.content}`)
    : 'No messages yet';

  const time = conversation.lastMessageDate
    ? new Date(conversation.lastMessageDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const imageSrc = isGroup
    ? '/image/group.png'
    : '/image/user.png';

  // 🟢 Tampilkan jika ada yang sedang mengetik (kecuali diri sendiri)
  const typingInThisConversation = typingUsersMap[conversation.id];
  const isSomeoneTyping = typingInThisConversation && typingInThisConversation.user_id !== user.id;

  return (
    <div
      className={`chat-user ${conversation.id === currentId ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        padding: '0.75rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: conversation.id === currentId ? '#f0f0f0' : 'transparent',
      }}
    >
      <img
        src={imageSrc}
        alt="avatar"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong style={{ fontSize: '0.95rem' }}>{label}</strong>
          <small style={{ color: '#999', flexShrink: 0 }}>{time}</small>
        </div>

        <div
          style={{
            fontSize: '0.875rem',
            color: isSomeoneTyping ? 'green' : '#555',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontStyle: isSomeoneTyping ? 'italic' : 'normal',
          }}
        >
          {isSomeoneTyping
            ? `${typingInThisConversation.username} sedang mengetik...`
            : preview}
        </div>
      </div>

      {conversation.unreadCount > 0 && (
        <span
          style={{
            backgroundColor: 'green',
            color: 'white',
            borderRadius: '999px',
            padding: '4px 8px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginLeft: '0.5rem',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {conversation.unreadCount}
        </span>
      )}
    </div>
  );
}
