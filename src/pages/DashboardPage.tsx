import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Academy Admin</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user?.name || user?.contactNumber}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to Academy Admin</h2>
          <p>
            Manage training videos, quizzes, and track rider progress from this
            dashboard.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card clickable" onClick={() => navigate('/videos')}>
            <div className="feature-icon">Videos</div>
            <h3>Video Management</h3>
            <p>Upload, edit, and organize training videos</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">Quiz</div>
            <h3>Quiz Builder</h3>
            <p>Create and manage quiz questions for videos</p>
            <span className="coming-soon">Coming Soon</span>
          </div>

          <div className="feature-card clickable" onClick={() => navigate('/tracks')}>
            <div className="feature-icon">Tracks</div>
            <h3>Mandatory Tracks</h3>
            <p>Configure training sequences by delivery type</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">Analytics</div>
            <h3>Analytics</h3>
            <p>View training completion metrics and reports</p>
            <span className="coming-soon">Coming Soon</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
