import { useState } from 'react';
import { api } from '../api';

export default function AuthPanel({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [token, setToken] = useState('');

  // Register State
  const [regUser, setRegUser] = useState({ username: '', password: '', fullName: '', phoneNumber: '', email: '' });

  const handleLogin = async () => {
    try {
      const res = await api.login({ username, password });
      if (res.data?.token) {
        setToken(res.data.token);
        api.setToken(res.data.token);
        onLoginSuccess(res.data.token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegister = async () => {
    try {
      await api.createUser(regUser);
      // Auto fill login on success
      setUsername(regUser.username);
      setPassword(regUser.password);
      alert("Registration successful! You can now log in.");
    } catch (e: any) {
      console.error(e);
      alert("Registration failed: " + (e.message || "Unknown error. Check the right Logger panel."));
    }
  };

  const handleSetToken = () => {
    api.setToken(token);
    onLoginSuccess(token);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="section-card glass-panel">
        <h2>Authentication</h2>
        <div style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button onClick={handleLogin}>Login & Get Token</button>
        </div>
        
        <div className="form-group" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label>Manual Token Entry (Bearer)</label>
          <div className="flex-row">
            <input 
              value={token} 
              onChange={e => setToken(e.target.value)} 
              placeholder="Paste JWT token here..."
              style={{ flex: 1 }}
            />
            <button onClick={handleSetToken} className="success">Apply Token</button>
          </div>
        </div>
      </div>

      <div className="section-card glass-panel">
        <h2>Registration</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <input placeholder="Username" value={regUser.username} onChange={e => setRegUser({...regUser, username: e.target.value})} />
          <input type="password" placeholder="Password" value={regUser.password} onChange={e => setRegUser({...regUser, password: e.target.value})} />
          <input placeholder="Email" value={regUser.email} onChange={e => setRegUser({...regUser, email: e.target.value})} />
          <input placeholder="Full Name" value={regUser.fullName} onChange={e => setRegUser({...regUser, fullName: e.target.value})} />
          <input placeholder="Phone" value={regUser.phoneNumber} onChange={e => setRegUser({...regUser, phoneNumber: e.target.value})} />
          <button onClick={handleRegister} className="success" style={{ marginTop: '0.5rem' }}>Register Account</button>
        </div>
      </div>
    </div>
  );
}
