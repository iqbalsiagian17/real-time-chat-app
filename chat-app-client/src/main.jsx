import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ⬅️ Pastikan ini di sini
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
