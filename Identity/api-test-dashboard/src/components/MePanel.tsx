import { useState } from 'react';
import { api } from '../api';

export default function MePanel() {
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const loadMyInfo = async () => {
    try {
      const res = await api.getMyInfo();
      setProfile(res.data);
    } catch (e) {}
  };

  const handleAvatarUpload = async () => {
    if (!file) return;
    try {
      await api.uploadAvatar(file);
      loadMyInfo();
    } catch (e) {}
  };

  const applyHost = async () => {
    try {
      await api.upgradeToHost({
        taxCode: 'TAX' + Math.floor(Math.random() * 10000),
        frontImageUrl: 'front.jpg',
        backImageUrl: 'back.jpg',
        fullName: 'Nguyen Van A'
      });
      loadMyInfo();
    } catch (e) {}
  };

  const applyEnterprise = async () => {
    try {
      await api.upgradeToEnterprise({
        taxCode: 'ENT' + Math.floor(Math.random() * 10000),
        businessName: 'My Company',
        businessAddress: '123 Test St',
        frontImageUrl: 'front.jpg',
        backImageUrl: 'back.jpg'
      });
      loadMyInfo();
    } catch (e) {}
  };

  return (
    <div className="section-card glass-panel">
      <h2>My Profile & Upgrades</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={loadMyInfo} className="success" style={{ marginRight: '1rem' }}>Load My Info</button>
        <button onClick={() => api.getMyProfile()} style={{ marginRight: '1rem' }}>Get Profile Data</button>
        <button onClick={() => api.getMyHostProfile()} style={{ marginRight: '1rem' }}>Get Host Data</button>
        <button onClick={() => api.getMyEnterpriseProfile()}>Get Enterprise Data</button>
      </div>

      {profile && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
          <div>
            {profile.userProfile?.avatarUrl && (
              <img src={profile.userProfile.avatarUrl} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <h3>{profile.username}</h3>
            <div>Email: {profile.email}</div>
            <div>Roles: {profile.roles?.map((r:any) => r.name).join(', ')}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Host Status:</strong> {profile.hostProfile ? profile.hostProfile.approvalStatus : 'Not Applied'} <br/>
              <strong>Enterprise Status:</strong> {profile.enterpriseProfile ? profile.enterpriseProfile.approvalStatus : 'Not Applied'}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <h3>Apply Upgrades</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={applyHost}>Apply for HOST</button>
            <button onClick={applyEnterprise}>Apply for ENTERPRISE</button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="danger" onClick={() => api.deleteProfileUpgradeToHost()}>Delete Host App</button>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <h3>Upload Avatar</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button onClick={handleAvatarUpload} className="success" disabled={!file}>Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
}
