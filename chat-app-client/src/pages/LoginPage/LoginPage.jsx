import { useState } from 'react';
import { login } from '../../services/authService';

export default function LoginPage({ onLogin, onGoToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const data = await login(username, password);
      onLogin(data); // ⬅️ kirim seluruh data, bukan hanya user
    } catch (err) {
      alert('Login gagal');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>

      <p>
        Belum punya akun?{' '}
        <button onClick={onGoToRegister}>Daftar di sini</button>
      </p>
    </div>
  );
}
