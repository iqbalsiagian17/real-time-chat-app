import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function ChatInput({ sendMessage }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input" style={styles.container}>
      <textarea
        style={styles.input}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={handleKeyDown}
      />
      <button style={styles.button} onClick={handleSend} title="Send">
        <FaPaperPlane />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    resize: 'none',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
    marginRight: '10px',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
