import { useEffect, useRef } from 'react';

export default function ChatMessages({ messages, user, isGroup }) {
  const messagesEndRef = useRef(null);

  // Scroll ke bawah saat messages berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="chat-messages" style={{ overflowY: 'auto', height: '100%' }}>
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
      {/* ⬇️ Elemen dummy untuk scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
}
