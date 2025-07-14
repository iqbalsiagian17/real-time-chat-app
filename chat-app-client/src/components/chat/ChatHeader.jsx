import { formatDistanceToNow } from 'date-fns';

export default function ChatHeader({ user, participants, isGroup, conversation, typingUser }) {
  const imageSrc = isGroup ? '/image/group.png' : '/image/user.png';

  const displayName = isGroup
    ? conversation?.name || 'Group Chat'
    : participants[0]?.username || 'Chat';

  const groupMembers = participants.map((p) => p.username);
  const maxVisible = 5;
  const visibleMembers = groupMembers.slice(0, maxVisible).join(', ');
  const extraCount =
    groupMembers.length > maxVisible ? ` +${groupMembers.length - maxVisible} others` : '';

  const otherUser = !isGroup && participants.length > 0 ? participants[0] : null;

  // 🧠 Prioritaskan typingUser jika sedang mengetik
  const statusText = typingUser
    ? `${typingUser} sedang mengetik...`
    : isGroup
    ? `${visibleMembers}${extraCount}`
    : otherUser?.is_online
    ? '🟢 Online'
    : otherUser?.last_seen
    ? `Last seen ${formatDistanceToNow(new Date(otherUser.last_seen), { addSuffix: true })}`
    : '';

  return (
    <div
      className="chat-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '16px',
        borderBottom: '1px solid #eee',
        background: '#fff',
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
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0 }}>{conversationName(displayName)}</h4>
<span className="status" style={{ fontSize: '0.8rem', color: 'gray' }}>
  {typingUser ? `${typingUser} sedang mengetik...` : statusText}
</span>

      </div>
    </div>
  );
}

function conversationName(name) {
  return name.length > 50 ? name.slice(0, 47) + '...' : name;
}
