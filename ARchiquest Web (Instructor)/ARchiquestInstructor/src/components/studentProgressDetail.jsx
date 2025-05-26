import React, { useRef, useState, useEffect } from 'react';
import './studentProgressDetail.css';
import Sidebar from './Sidebar';

const StudentProgressDetail = () => {
  const progressRef = useRef(null);
  const insightsRef = useRef(null);
  const [activeTab, setActiveTab] = useState('progress');

  // Scroll to section when tab is clicked
  const handleTabClick = (section) => {
    setActiveTab(section);
    if (section === 'progress' && progressRef.current) {
      progressRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (section === 'insights' && insightsRef.current) {
      insightsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update tab highlight on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current || !insightsRef.current) return;
      const progressTop = progressRef.current.getBoundingClientRect().top;
      const insightsTop = insightsRef.current.getBoundingClientRect().top;
      if (progressTop < 120 && insightsTop > 200) {
        setActiveTab('progress');
      } else if (insightsTop < 140) {
        setActiveTab('insights');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="spd-layout">
      <Sidebar />
      <div className="spd-container">
        <header className="spd-header">
          <div className="spd-header-content">
            <h1 className="spd-title">STUDENT PROGRESS</h1>
            <p className="spd-subtitle">View your students progress</p>
          </div>
        </header>

        <div className="spd-main-content">
          <div className="spd-tabs">
            <button
              className={`spd-tab ${activeTab === 'progress' ? 'spd-tab-active' : ''}`}
              onClick={() => handleTabClick('progress')}
            >PROGRESS</button>
            <button
              className={`spd-tab ${activeTab === 'insights' ? 'spd-tab-active' : ''}`}
              onClick={() => handleTabClick('insights')}
            >INSIGHTS</button>
            <div className="spd-tab-student-info">
              STUDENT NAME: EXAMPLE STUDENT NAME
            </div>
          </div>

          {/* PROGRESS SECTION */}
          <div ref={progressRef} id="progress-section">
            <div className="spd-progress-section">
              <div className="spd-progress-header">
                <h2 className="spd-progress-title">Learning Progress</h2>
                <span className="spd-progress-subtitle">Your overall learning journey</span>
              </div>
              <div className="spd-progress-bar-container">
                <span className="spd-progress-label">Overall Completion</span>
                <div className="spd-progress-bar-main">
                  <div className="spd-progress-bar-main-fill" style={{ width: '79%' }}></div>
                </div>
                <span className="spd-progress-percent">79%</span>
              </div>
              <div className="spd-progress-cards">
                <div className="spd-progress-card">
                  <span className="spd-progress-icon">📖</span>
                  <span className="spd-progress-card-title">12/20 Modules</span>
                </div>
                <div className="spd-progress-card">
                  <span className="spd-progress-icon">🏛️</span>
                  <span className="spd-progress-card-title">8 Buildings Completed</span>
                </div>
                <div className="spd-progress-card">
                  <span className="spd-progress-icon">⏰</span>
                  <span className="spd-progress-card-title">24 Hours Spent</span>
                </div>
                <div className="spd-progress-card">
                  <span className="spd-progress-icon">🏅</span>
                  <span className="spd-progress-card-title">5 Badges Earned</span>
                </div>
              </div>
              <div className="spd-recent-modules">
                <h3 className="spd-recent-modules-title">Recent Modules</h3>
                <span className="spd-recent-modules-subtitle">Your latest learning activities</span>
                <div className="spd-recent-module-list">
                  <div className="spd-recent-module-item">
                    <span className="spd-recent-module-icon">⭕</span>
                    <span className="spd-recent-module-label">Modern Architecture Principles</span>
                    <div className="spd-recent-module-bar">
                      <div className="spd-recent-module-bar-fill" style={{ width: '84%' }}></div>
                    </div>
                    <span className="spd-recent-module-percent">84%</span>
                  </div>
                  <div className="spd-recent-module-item">
                    <span className="spd-recent-module-icon">⭕</span>
                    <span className="spd-recent-module-label">Sustainable Building Design</span>
                    <div className="spd-recent-module-bar">
                      <div className="spd-recent-module-bar-fill" style={{ width: '54%' }}></div>
                    </div>
                    <span className="spd-recent-module-percent">54%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INSIGHTS SECTION */}
          <div ref={insightsRef} id="insights-section">
            <div className="spd-insights-section">
              <div className="spd-insights-header">
                <h2 className="spd-insights-title">AI Learning Insights</h2>
                <p className="spd-insights-description">Personalized analysis of your learnings</p>
              </div>
              <div className="spd-insights-box">
                <h3 className="spd-insights-box-title">AI Learning Insights</h3>
                <p className="spd-insights-box-text">
                  Based on your recent activities, you excel at structural design concepts but may benefit from additional practice with sustainable materials.
                </p>
              </div>
              <div className="spd-skills-section">
                <div className="spd-skill-item">
                  <div className="spd-skill-icon">📊</div>
                  <span className="spd-skill-name">Design Thinking</span>
                  <div className="spd-progress-bar">
                    <div className="spd-progress-fill" style={{ width: '92%' }}></div>
                  </div>
                  <span className="spd-skill-percentage">92%</span>
                </div>
                <div className="spd-skill-item">
                  <div className="spd-skill-icon">💡</div>
                  <span className="spd-skill-name">Technical Skills</span>
                  <div className="spd-progress-bar">
                    <div className="spd-progress-fill" style={{ width: '74%' }}></div>
                  </div>
                  <span className="spd-skill-percentage">74%</span>
                </div>
                <div className="spd-skill-item">
                  <div className="spd-skill-icon">⏰</div>
                  <span className="spd-skill-name">Project Management</span>
                  <div className="spd-progress-bar">
                    <div className="spd-progress-fill" style={{ width: '86%' }}></div>
                  </div>
                  <span className="spd-skill-percentage">86%</span>
                </div>
              </div>
            </div>
            <div className="spd-recommendations-section">
              <div className="spd-recommendations-header">
                <h2 className="spd-recommendations-title">Personalized Recommendations</h2>
                <p className="spd-recommendations-description">AI-suggested learning paths</p>
              </div>
              <div className="spd-recommendation-item">
                <div className="spd-recommendation-icon">💡</div>
                <div className="spd-recommendation-content">
                  <h3 className="spd-recommendation-title">Sustainable Materials Workshop</h3>
                  <p className="spd-recommendation-text">Improve your knowledge of eco-friendly building materials.</p>
                </div>
              </div>
              <div className="spd-recommendation-item">
                <div className="spd-recommendation-icon">💡</div>
                <div className="spd-recommendation-content">
                  <h3 className="spd-recommendation-title">Urban Planning Challenge</h3>
                  <p className="spd-recommendation-text">Apply your skills in a real-world city planning scenario.</p>
                </div>
              </div>
              <div className="spd-recommendation-item">
                <div className="spd-recommendation-icon">💡</div>
                <div className="spd-recommendation-content">
                  <h3 className="spd-recommendation-title">AR Visualization Techniques</h3>
                  <p className="spd-recommendation-text">Learn advanced methods for presenting architectural concepts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressDetail;
