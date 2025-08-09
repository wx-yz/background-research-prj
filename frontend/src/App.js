import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Get API URL from config
    if (window.config && window.config.apiUrl) {
      setApiUrl(window.config.apiUrl);
    }

    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for userinfo cookie first
      const encodedUserInfo = Cookies.get('userinfo');
      if (encodedUserInfo) {
        const userInfo = JSON.parse(atob(encodedUserInfo));
        setUser(userInfo);
        // Clear the cookie as per Choreo guidelines
        Cookies.remove('userinfo', { path: '/' });
        setIsLoading(false);
        return;
      }

      // Try the userinfo endpoint
      const response = await fetch('/auth/userinfo');
      if (response.ok) {
        const userInfo = await response.json();
        setUser(userInfo);
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleLogout = async () => {
    const sessionHint = Cookies.get('session_hint');
    window.location.href = `/auth/logout?session_hint=${sessionHint}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/choreo-apis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.summary);
    } catch (error) {
      console.error('Error analyzing query:', error);
      setError('Failed to analyze the query. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="welcome-screen">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span>🔍</span>
          Background Research
        </div>
        {user ? (
          <div className="user-info">
            <div className="user-avatar">
              {user.given_name?.charAt(0) || user.username?.charAt(0) || 'U'}
            </div>
            <span>Welcome, {user.given_name || user.username || 'User'}!</span>
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout 👋
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleLogin}>
            Login 🚀
          </button>
        )}
      </header>

      <main className="main-content">
        {!user ? (
          <div className="welcome-screen">
            <h1 className="welcome-title">🔍 Background Research</h1>
            <p className="welcome-subtitle">
              Analyze companies and their investments, joint ventures, and strategic partnerships
              across various verticals with AI-powered insights.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">💼</div>
                <h3>Company Analysis</h3>
                <p>Deep dive into company portfolios and investment strategies</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤝</div>
                <h3>Joint Ventures</h3>
                <p>Discover strategic partnerships and collaborative ventures</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h3>Market Insights</h3>
                <p>Get comprehensive market analysis and vertical insights</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <h3>AI-Powered</h3>
                <p>Leverage advanced AI to generate detailed summaries</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>
              Get Started - Login to Continue 🚀
            </button>
          </div>
        ) : (
          <>
            <form className="query-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="query">
                  🎯 Enter your research query
                </label>
                <textarea
                  id="query"
                  className="form-input form-textarea"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'Tell me about Microsoft's investments in cloud computing and AI startups, including joint ventures and partnerships in the enterprise software vertical'"
                  rows={4}
                />
              </div>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isAnalyzing || !query.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <div className="loading-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze Company
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {results && (
              <div className="results-section">
                <h2 className="results-title">
                  📋 Analysis Results
                </h2>
                <div className="results-content">
                  {results}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
