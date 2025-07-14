import { useEffect, useRef } from 'react';

export default function ChatMessages({ messages, user, isGroup, conversation, typingUser }) {
  const messagesEndRef = useRef(null);

  // Scroll ke bawah saat messages berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="chat-messages" style={{ overflowY: 'auto', height: '100%' }}>
      {/* ✅ Pesan sistem selalu tampil paling atas */}
      {conversation?.creator && (
        <div className="system-message" style={{ textAlign: 'center', margin: '1rem 0', color: '#888' }}>
          {conversation.creator.username} memulai percakapan
        </div>
      )}

      {typingUser && (
        <div style={{ padding: '6px 16px', fontStyle: 'italic', color: '#888' }}>
          {typingUser} sedang mengetik...
        </div>
      )}


      {/* Tampilkan pesan-pesan */}
      {messages.map((m, i) => {
        const isSender = m.sender_id === user.id;
        return (
          <div key={i} className={`message ${isSender ? 'sent' : 'received'}`}>
            <div className="message-bubble">
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

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
