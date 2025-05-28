export default function ChatMessages({ messages, user, isGroup }) {
  return (
    <div className="chat-messages">
      {messages.map((m, i) => {
        const isSender = m.sender_id === user.id;
        return (
          <div key={i} className={`message ${isSender ? 'sent' : 'received'}`}>
            <div className="message-bubble">
              {/* Tampilkan nama pengirim jika grup dan bukan diri sendiri */}
              {isGroup && !isSender && (
                <div className="sender-name">
                  <strong>{m.sender?.username || 'Unknown'}</strong>
                </div>
              )}

              <p>{m.content}</p>
              <span className="time">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
