export default function ChatHeader({ user, participants, isGroup }) {
  const displayName = isGroup
    ? participants
        .filter((p) => p.id !== user.id)
        .map((p) => p.username)
        .join(', ')
    : participants[0]?.username || 'Chat';

  return (
    <div className="chat-header">
      <h4>{displayName}</h4>
      <span className="status">Active 2 mins ago</span>
    </div>
  );
}
