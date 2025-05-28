import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ChatRoom from './pages/ChatPage/ChatRoom';

function App() {
  const { user, loginUser } = useAuth(); // ✅ ambil dari context
  const [showRegister, setShowRegister] = useState(false);

  if (user) return <ChatRoom />; // ✅ user dipakai di ChatRoom langsung dari context

  if (showRegister) {
    return <RegisterPage onRegistered={() => setShowRegister(false)} />;
  }

  return (
    <LoginPage
      onLogin={(data) => loginUser(data.token)} // ✅ loginUser simpan token & decode user
      onGoToRegister={() => setShowRegister(true)}
    />
  );
}

export default App;
