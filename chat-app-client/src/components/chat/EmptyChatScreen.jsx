import { FaComments } from 'react-icons/fa';
import './EmptyChatScreen.css';

export default function EmptyChatScreen() {
  return (
    <div className="empty-chat-screen">
      <FaComments className="empty-chat-icon" />
      <h2 className="empty-chat-title">No Conversation Selected</h2>
      <p className="empty-chat-desc">
        Select a conversation from the left panel to start chatting. <br />
        Or create a new one to begin a conversation with someone.
      </p>
      <small className="empty-chat-note">Tip: Your messages stay in sync across all devices.</small>
    </div>
  );
}
