import { useState } from 'react';
import { register } from '../../services/authService';

export default function RegisterPage({ onRegistered }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(username, email, password);
      alert('Register berhasil! Silakan login.');
      onRegistered(); // balik ke login
    } catch (err) {
      alert('Gagal daftar: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>

      <p>
        Sudah punya akun?{' '}
        <button onClick={onRegistered}>Login di sini</button>
      </p>
    </div>
  );
}
