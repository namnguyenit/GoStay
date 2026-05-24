import { useState } from 'react';
import { api } from '../api';

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  
  // Create User State
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', phoneNumber: '', email: '' });

  const loadUsers = async () => {
    try {
      const res = await api.getUsers(0, 10, 'ACTIVE');
      setUsers(res.data?.content || []);
    } catch (e) {}
  };

  const handleCreate = async () => {
    try {
      await api.createUser(newUser);
      loadUsers();
    } catch (e) {}
  };

  const banUser = async (id: string) => {
    try { await api.banAccount(id); loadUsers(); } catch (e) {}
  };
  
  const deleteUser = async (id: string) => {
    try { await api.deleteAccount(id); loadUsers(); } catch (e) {}
  };

  const upgradeRole = async (id: string, role: string) => {
    try { await api.upgradeRole(id, role); loadUsers(); } catch (e) {}
  };

  return (
    <div className="section-card glass-panel">
      <h2>Users Management</h2>
      
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>Create New User</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <input placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          <input placeholder="Full Name" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
          <input placeholder="Phone" value={newUser.phoneNumber} onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} />
          <button onClick={handleCreate} className="success">Create User</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>User List</h3>
        <button onClick={loadUsers}>Refresh List</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.id}</span></td>
                <td>{u.username}</td>
                <td>{u.roles?.map((r: any) => <span key={r.name} className="badge" style={{marginRight: 4}}>{r.name}</span>)}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'active' : 'banned'}`}>
                    {u.isActive ? 'ACTIVE' : 'BANNED'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="danger" onClick={() => banUser(u.id)}>Ban</button>
                    <button className="danger" onClick={() => deleteUser(u.id)}>Delete</button>
                    <select onChange={(e) => { if(e.target.value) upgradeRole(u.id, e.target.value); e.target.value=''; }} style={{ width: 'auto', padding: '0.4rem' }}>
                      <option value="">Upgrade Role...</option>
                      <option value="HOST">Host</option>
                      <option value="ENTERPRISE">Enterprise</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center'}}>No users found. Click refresh.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
