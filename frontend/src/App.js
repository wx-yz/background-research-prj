import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get API URL from config
  const apiUrl = window.config?.apiUrl || 'http://localhost:4000';

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Try to get user info from the auth endpoint
      const response = await fetch('/auth/userinfo');
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);
        setIsAuthenticated(true);
      } else {
        // Check for userinfo cookie as fallback
        const encodedUserInfo = Cookies.get('userinfo');
        if (encodedUserInfo) {
          try {
            const userData = JSON.parse(atob(encodedUserInfo));
            setUserInfo(userData);
            setIsAuthenticated(true);
            // Clear the cookie after reading
            Cookies.remove('userinfo', { path: '/' });
          } catch (e) {
            console.error('Error parsing user info:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
    }
  };

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleLogout = async () => {
    const sessionHint = Cookies.get('session_hint');
    window.location.href = `/auth/logout?session_hint=${sessionHint || ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await axios.post(`${apiUrl}/api/summarize`, {
        query: query.trim()
      });

      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatSummary = (text) => {
    if (!text) return '';
    
    // Split by lines and process each line
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Check if line starts with bullet point
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="summary-bullet">
            {line.trim()}
          </div>
        );
      }
      
      // Check if line is a header (contains emojis or is all caps)
      if (line.includes('🧾') || line.includes('📊') || line.includes('🏢') || 
          line === line.toUpperCase() && line.length > 5) {
        return (
          <h3 key={index} className="summary-header">
            {line.trim()}
          </h3>
        );
      }
      
      return (
        <p key={index} className="summary-text">
          {line.trim()}
        </p>
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-card">
            <h1>🏢 Company Research Hub</h1>
            <p>Discover investments, partnerships, and strategic moves in any industry vertical</p>
            <button className="login-btn" onClick={handleLogin}>
              🔐 Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🏢 Company Research Hub</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>👋 Hello, {userInfo?.name || userInfo?.username || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="query-section">
          <div className="query-card">
            <h2>📊 Research Query</h2>
            <p>Ask about any company's investments, partnerships, or activities in a specific vertical</p>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Tell me about Apple's investments and partnerships in healthcare technology..."
                  rows={4}
                  className="query-input"
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading || !query.trim()}
              >
                {loading ? '⏳ Analyzing...' : '🔍 Research'}
              </button>
            </form>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}
          </div>
        </div>

        {summary && (
          <div className="results-section">
            <div className="results-card">
              <h2>📋 Research Summary</h2>
              <div className="summary-content">
                {formatSummary(summary)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
