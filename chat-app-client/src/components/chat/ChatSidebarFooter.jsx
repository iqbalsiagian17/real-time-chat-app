import { useState } from 'react';

export default function ChatSidebarFooter({ username, logoutUser }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        position: 'relative',
      }}
    >
      <div
        onClick={() => setShowMenu((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
      >
        <img
          src="/image/user.png"
          alt="Profile"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '0.95rem' }}>{username}</strong>
        </div>
        <span style={{ fontSize: '1.25rem', color: '#888' }}>▾</span>
      </div>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '1rem',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 99,
            width: 'calc(100% - 2rem)',
          }}
        >
          <button
            onClick={logoutUser}
            style={{
              padding: '0.75rem',
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#e53935',
              textAlign: 'left',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
