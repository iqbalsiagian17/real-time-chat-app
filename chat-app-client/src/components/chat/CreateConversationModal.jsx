import { useState, useMemo } from 'react';
import './CreateConversationModal.css';

export default function CreateConversationModal({
  users,
  existingConversations,
  create,
  onClose,
  onSelectConversation,
  currentUserId,
}) {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState(null); // null | 'private' | 'group'
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handlePrivateClick = (targetUserId) => {
    const existing = existingConversations.find((conv) => {
      if (conv.is_group) return false;
      const userIds = conv.Users.map((u) => u.id);
      return userIds.includes(currentUserId) && userIds.includes(targetUserId);
    });

    if (existing) {
      onSelectConversation(existing.id);
    } else {
      create([targetUserId]);
    }

    onClose();
  };

  const handleGroupCreate = () => {
    if (selectedIds.length > 1 && groupName.trim()) {
      create(selectedIds, groupName.trim());
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        {!mode ? (
          <>
            <h4>Select Chat Type</h4>
            <div className="mode-buttons">
              <button onClick={() => setMode('private')}>Private Chat</button>
              <button onClick={() => setMode('group')}>Group Chat</button>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h4>{mode === 'group' ? 'Create Group Chat' : 'Start Private Chat'}</h4>

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <div className="user-list">
              {filteredUsers.length === 0 && <p>No matching users</p>}
              {filteredUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div key={u.id} className="user-item">
                    <span>{u.username}</span>
                    {mode === 'private' ? (
                      <button
                        className="open-button"
                        onClick={() => handlePrivateClick(u.id)}
                      >
                        Chat
                      </button>
                    ) : (
                      <button
                        className={`select-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleUser(u.id)}
                      >
                        {isSelected ? 'Deselect' : 'Select'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {mode === 'group' && (
              <>
                <input
                  type="text"
                  placeholder="Group name (required)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="group-name-input"
                />
                <button
                  className="create-button"
                  onClick={handleGroupCreate}
                  disabled={selectedIds.length <= 1 || !groupName.trim()}
                >
                  Create Group
                </button>
              </>
            )}

            <div className="modal-actions">
              <button className="cancel-button" onClick={onClose}>Cancel</button>
              <button className="cancel-button" onClick={() => setMode(null)}>⬅ Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
