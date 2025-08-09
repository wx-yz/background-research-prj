import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';

const Emoji = ({ children }) => <span aria-hidden="true" style={{ marginRight: 6 }}>{children}</span>;

const Login = () => (
  <button className="btn" onClick={() => { window.location.href = "/auth/login"; }}>
    <Emoji>🔐</Emoji> Login with Choreo
  </button>
);

function UserBadge({ user }) {
  if (!user) return null;
  const name = user?.name || user?.preferred_username || user?.email || 'User';
  const initials = (name || '?').slice(0, 2).toUpperCase();
  return (
    <div className="user">
      <div className="avatar">{initials}</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <strong style={{ fontSize: '.9rem' }}>{name}</strong>
        {user?.email && <span style={{ opacity: .7, fontSize: '.8rem' }}>{user.email}</span>}
      </div>
      <button className="btn secondary" style={{ marginLeft: 8 }} onClick={async () => {
        window.location.href = `/auth/logout?session_hint=${Cookies.get('session_hint')}`;
      }}>Logout</button>
    </div>
  );
}

function queryBackendUrl() {
  // window.config is loaded via public/config.js script tag in index.html
  const apiUrl = window?.config?.apiUrl || '';
  return apiUrl;
}

async function fetchUserInfo() {
  try {
    // Option 1: cookie set by Choreo after login
    const encodedUserInfo = Cookies.get('userinfo');
    if (encodedUserInfo) {
      const user = JSON.parse(atob(encodedUserInfo));
      // Optional: persist elsewhere; then clear the cookie
      Cookies.remove('userinfo', { path: '/' });
      return user;
    }
    // Option 2: fallback to userinfo endpoint
    const res = await fetch('/auth/userinfo', { credentials: 'include' });
    if (res.ok) return await res.json();
  } catch (e) {
    // ignore
  }
  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('Summarize Apple’s activities in healthcare — investments, acquisitions, and partnerships.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const apiBase = useMemo(() => queryBackendUrl(), []);

  useEffect(() => {
    fetchUserInfo().then(setUser);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch(`${apiBase}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data.summary || '');
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">
          <div className="logo" />
          <span>Background Research</span>
        </div>
        {user ? <UserBadge user={user} /> : <Login />}
      </nav>

      <main className="container">
        <section className="hero">
          <h1 className="title"><Emoji>🧭</Emoji> Company + Vertical Insights</h1>
          <p className="subtitle">Ask about a company and its vertical; get a crisp summary of investments, joint ventures, and more.</p>
        </section>

        <section className="card">
          {!user && (
            <div style={{ marginBottom: 12 }} className="pill"><Emoji>👤</Emoji> Please login to submit queries</div>
          )}
          <form onSubmit={onSubmit}>
            <textarea
              className="input"
              rows="4"
              placeholder="e.g., Summarize Microsoft’s activities in gaming — investments, studios, and partnerships"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!user || loading}
            />
            <div className="actions">
              <button className="btn" disabled={!user || loading}>
                {loading ? 'Thinking…' : 'Generate Summary'}
              </button>
            </div>
          </form>
        </section>

        {(error || result) && (
          <section style={{ marginTop: 16 }} className="card">
            {error && <div className="pill" style={{ borderColor: '#ef4444', color: '#fecaca' }}><Emoji>⚠️</Emoji> {error}</div>}
            {result && (
              <div className="result" style={{ marginTop: 8 }}>
                <p><strong><Emoji>📌</Emoji> Summary</strong></p>
                <div>{result}</div>
              </div>
            )}
          </section>
        )}

        <footer>
          <span className="pill"><Emoji>⚡</Emoji> Powered by OpenAI via Choreo</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
