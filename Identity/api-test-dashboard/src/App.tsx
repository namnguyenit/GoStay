import { useState } from 'react';
import './App.css';
import { ShieldCheck, Users, Briefcase, UserCircle, Settings } from 'lucide-react';
import AuthPanel from './components/AuthPanel';
import UsersPanel from './components/UsersPanel';
import HostsPanel from './components/HostsPanel';
import MePanel from './components/MePanel';
import LogViewer from './components/LogViewer';

function App() {
  const [activeTab, setActiveTab] = useState('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const tabs = [
    { id: 'auth', label: 'Authentication', icon: ShieldCheck },
    { id: 'users', label: 'Users Mgmt', icon: Users },
    { id: 'hosts', label: 'Hosts & Enterprise', icon: Briefcase },
    { id: 'me', label: 'My Profile', icon: UserCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'auth': return <AuthPanel onLoginSuccess={() => setIsAuthenticated(true)} />;
      case 'users': return <UsersPanel />;
      case 'hosts': return <HostsPanel />;
      case 'me': return <MePanel />;
      default: return <div className="section-card glass-panel">Select a tab</div>;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel" style={{ borderRight: 'none', borderRadius: 0 }}>
        <div className="logo">
          <Settings size={28} color="var(--accent)" />
          <span>API Tester</span>
        </div>
        
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={20} />
            {tab.label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Status: {isAuthenticated ? <span style={{color: 'var(--success)'}}>Authenticated</span> : <span style={{color: 'var(--warning)'}}>Not Auth</span>}
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
        </header>
        {renderContent()}
      </main>

      <aside style={{ height: '100vh' }}>
        <LogViewer />
      </aside>
    </div>
  );
}

export default App;
