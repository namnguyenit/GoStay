import { useState } from 'react';
import { api } from '../api';

export default function HostsPanel() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [hostType, setHostType] = useState('ALL'); // ALL, PENDING

  const loadHosts = async () => {
    try {
      if (hostType === 'PENDING') {
        const res = await api.getHostsPending(0, 10, 'PENDING');
        setHosts(res.data?.content || []);
      } else {
        const res = await api.getAllHosts(0, 10);
        setHosts(res.data?.content || []);
      }
    } catch (e) {}
  };

  const approveStatus = async (accountId: string, type: string, status: string) => {
    try {
      await api.approveHostStatus(accountId, type, status);
      loadHosts();
    } catch (e) {}
  };

  const viewDetail = async (accountId: string) => {
    try { await api.getHostDetail(accountId); } catch (e) {}
  };

  return (
    <div className="section-card glass-panel">
      <h2>Hosts / Enterprise Management</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={hostType} onChange={e => setHostType(e.target.value)} style={{ width: 'auto' }}>
            <option value="ALL">All Hosts</option>
            <option value="PENDING">Pending Approval</option>
          </select>
          <button onClick={loadHosts}>Load Hosts</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID / Username</th>
              <th>Roles</th>
              <th>Host Profile</th>
              <th>Enterprise Profile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map(u => (
              <tr key={u.id}>
                <td>
                  <div>{u.username}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{u.id}</div>
                </td>
                <td>{u.roles?.map((r: any) => <span key={r.name} className="badge" style={{marginRight: 4}}>{r.name}</span>)}</td>
                <td>
                  {u.hostProfile ? (
                    <span className={`badge ${u.hostProfile.approvalStatus.toLowerCase()}`}>
                      {u.hostProfile.approvalStatus}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  {u.enterpriseProfile ? (
                    <span className={`badge ${u.enterpriseProfile.approvalStatus.toLowerCase()}`}>
                      {u.enterpriseProfile.approvalStatus}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <div className="actions" style={{ flexDirection: 'column', gap: '4px' }}>
                    <button onClick={() => viewDetail(u.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>View Detail</button>
                    
                    {u.hostProfile && u.hostProfile.approvalStatus === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="success" onClick={() => approveStatus(u.id, 'HOST', 'APPROVED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Approve Host</button>
                        <button className="danger" onClick={() => approveStatus(u.id, 'HOST', 'REJECTED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Reject Host</button>
                      </div>
                    )}
                    
                    {u.enterpriseProfile && u.enterpriseProfile.approvalStatus === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="success" onClick={() => approveStatus(u.id, 'ENTERPRISE', 'APPROVED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Approve Ent</button>
                        <button className="danger" onClick={() => approveStatus(u.id, 'ENTERPRISE', 'REJECTED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Reject Ent</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {hosts.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center'}}>No hosts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
