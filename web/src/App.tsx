import React, { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import RemoteConfigManager from './components/RemoteConfigManager';
import MessagingPanel from './components/MessagingPanel';
import './App.css';

type Tab = 'config' | 'messaging';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('config');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in:', error);
      alert('Failed to sign in: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>EthioCal Admin Panel</h1>
          <p>Manage Remote Config and Push Notifications</p>
          <button onClick={handleLogin} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="login-note">
            Only authorized administrators can access this panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>EthioCal Admin Panel</h1>
          <div className="user-info">
            <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="user-avatar" />
            <span className="user-name">{user.displayName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Remote Config
        </button>
        <button
          className={`nav-tab ${activeTab === 'messaging' ? 'active' : ''}`}
          onClick={() => setActiveTab('messaging')}
        >
          Push Notifications
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'config' && <RemoteConfigManager />}
        {activeTab === 'messaging' && <MessagingPanel />}
      </main>

      <footer className="app-footer">
        <p>EthioCal Admin Panel &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
