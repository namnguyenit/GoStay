import { useEffect, useState } from 'react';
import { api, type LogEntry } from '../api';

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const unsubscribe = api.subscribe((log) => {
      setLogs(prev => [log, ...prev]);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="logger-panel">
      <div className="logger-header">
        <span>API Requests & Responses</span>
        <button className="danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setLogs([])}>Clear</button>
      </div>
      <div className="log-list">
        {logs.map((log, i) => (
          <div key={i} className={`log-item ${log.responseStatus && log.responseStatus < 400 ? 'success' : 'error'}`}>
            <div className="log-item-header">
              <span className={`method ${log.method.toLowerCase()}`}>{log.method}</span>
              <span className={`status s${log.responseStatus || 500}`}>{log.responseStatus || 'ERR'}</span>
            </div>
            <div className="log-url">{log.url}</div>
            
            <div style={{ marginTop: '0.8rem', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.3rem' }}>🔼 REQUEST SENT</div>
              <pre style={{ background: 'transparent', padding: 0 }}>
                {JSON.stringify({ headers: log.requestHeaders, body: log.requestBody }, null, 2)}
              </pre>
            </div>
            
            <div style={{ marginTop: '0.8rem', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: log.responseStatus && log.responseStatus < 400 ? 'var(--success)' : 'var(--danger)', marginBottom: '0.3rem' }}>
                🔽 RESPONSE RECEIVED
              </div>
              <pre style={{ background: 'transparent', padding: 0 }}>
                {log.error ? `Error: ${log.error}` : JSON.stringify({ headers: (log as any).responseHeaders, body: log.responseBody }, null, 2)}
              </pre>
            </div>
            
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.8rem', textAlign: 'right' }}>
              {log.duration}ms
            </div>
          </div>
        ))}
        {logs.length === 0 && <div style={{textAlign: 'center', opacity: 0.5, marginTop: '2rem'}}>No API calls yet...</div>}
      </div>
    </div>
  );
}
