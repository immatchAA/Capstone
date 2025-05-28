// src/components/StudentProgressDetail.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './studentProgressDetail.css';
import Sidebar from './Sidebar';
import { supabase } from '../../supabaseClient';

const StudentProgressDetail = () => {
  const { studentId } = useParams();

  const [studentName, setStudentName] = useState('');
  const [planOptions, setPlanOptions] = useState([]);       // All plans for this student
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  const progressRef = useRef(null);
  const insightsRef = useRef(null);
  const [activeTab, setActiveTab] = useState('progress');

  // 1) Get student’s name
  useEffect(() => {
    if (!studentId) return;
    supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', studentId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setStudentName(`${data.first_name} ${data.last_name}`);
        }
      });
  }, [studentId]);

  // 2) Load all design_plan_ids this student has scored, then fetch their names
  useEffect(() => {
    if (!studentId) return;
    // fetch unique plan IDs
    supabase
      .from('student_scores')
      .select('design_plan_id', { count: 'exact' })
      .eq('student_id', studentId)
      .then(({ data, error }) => {
        if (error || !data) return;
        const uniqueIds = [...new Set(data.map(r => r.design_plan_id))];
        if (uniqueIds.length === 0) return;

        // fetch plan names
        supabase
          .from('design_plan')
          .select('id, plan_name')
          .in('id', uniqueIds)
          .then(({ data: plans, error: planErr }) => {
            if (!planErr && plans) {
              setPlanOptions(plans);
              setSelectedPlanId(plans[0].id);  // default to first
            }
          });
      });
  }, [studentId]);

  // 3) Whenever selectedPlanId changes, reload the scoreData for that plan
  useEffect(() => {
    if (!studentId || !selectedPlanId) return;

    supabase
      .from('student_scores')
      .select(`
        overall_score,
        letter_grade,
        budget_management_score,
        material_selection_score,
        cost_efficiency_score,
        sustainability_score,
        technical_accuracy_score,
        submitted_at
      `)
      .eq('student_id', studentId)
      .eq('design_plan_id', selectedPlanId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setScoreData(null);
          return;
        }
        setScoreData({
          overall: data.overall_score,
          grade: data.letter_grade,
          categories: {
            'Budget Management': {
              score: data.budget_management_score,
              max: 25,
              level:
                data.budget_management_score === 25
                  ? 'Excellent'
                  : data.budget_management_score >= 20
                  ? 'Good'
                  : 'Needs Improvement',
            },
            'Material Selection & Specification': {
              score: data.material_selection_score,
              max: 25,
              level:
                data.material_selection_score >= 20
                  ? 'Good'
                  : data.material_selection_score > 0
                  ? 'Beginning'
                  : 'None',
            },
            'Cost Efficiency & Value Engineering': {
              score: data.cost_efficiency_score,
              max: 25,
              level:
                data.cost_efficiency_score === 25
                  ? 'Excellent'
                  : data.cost_efficiency_score >= 20
                  ? 'Good'
                  : 'Needs Improvement',
            },
            'Sustainability & Environmental Impact': {
              score: data.sustainability_score,
              max: 15,
              level:
                data.sustainability_score >= 10
                  ? 'Developing'
                  : data.sustainability_score > 0
                  ? 'Beginning'
                  : 'None',
            },
            'Technical Accuracy & Industry Standards': {
              score: data.technical_accuracy_score,
              max: 10,
              level:
                data.technical_accuracy_score >= 8
                  ? 'Developing'
                  : data.technical_accuracy_score > 0
                  ? 'Beginning'
                  : 'None',
            },
          },
        });
      });
  }, [studentId, selectedPlanId]);

  // Tab scroll handling (unchanged)
  const handleTabClick = (section) => {
    setActiveTab(section);
    if (section === 'progress' && progressRef.current) {
      progressRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (section === 'insights' && insightsRef.current) {
      insightsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current || !insightsRef.current) return;
      const pTop = progressRef.current.getBoundingClientRect().top;
      const iTop = insightsRef.current.getBoundingClientRect().top;
      if (pTop < 120 && iTop > 200) setActiveTab('progress');
      else if (iTop < 140) setActiveTab('insights');
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
            <p className="spd-subtitle">
              View {studentName || '…'}’s progress
            </p>
          </div>
        </header>

        <div className="spd-main-content">
          {/* Tabs + Student Name */}
          <div className="spd-tabs">
            <button
              className={`spd-tab ${
                activeTab === 'progress' ? 'spd-tab-active' : ''
              }`}
              onClick={() => handleTabClick('progress')}
            >
              PROGRESS
            </button>
            <button
              className={`spd-tab ${
                activeTab === 'insights' ? 'spd-tab-active' : ''
              }`}
              onClick={() => handleTabClick('insights')}
            >
              INSIGHTS
            </button>
            <div className="spd-tab-student-info">
              STUDENT: {studentName || 'Loading...'}
            </div>
          </div>

          {/* ———————————
              Plan Selector + Plan Name
          ——————————— */}
          <div className="spd-design-plan-selector">
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name}
                </option>
              ))}
            </select>
            <div className="spd-design-plan-name">
              <h2>
                {planOptions.find((p) => p.id === selectedPlanId)
                  ?.plan_name || '—'}
              </h2>
            </div>
          </div>

          {/* ———————————
              Stylish Design Scores
          ——————————— */}
          {scoreData && (
            <div className="spd-design-section">
              <h2 className="spd-design-section-title">
                Your Design Plan Score: {scoreData.overall}/100 (
                {scoreData.grade})
              </h2>
              <div className="spd-design-cards-container">
                {Object.entries(scoreData.categories).map(([cat, info]) => (
                  <div key={cat} className="spd-design-category-card">
                    <div className="spd-design-category-title">{cat}</div>
                    <div className="spd-design-category-value">
                      {info.score}/{info.max} ({info.level})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  <div
                    className="spd-progress-bar-main-fill"
                    style={{ width: '79%' }}
                  />
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
                <span className="spd-recent-modules-subtitle">
                  Your latest learning activities
                </span>
                <div className="spd-recent-module-list">
                  <div className="spd-recent-module-item">
                    <span className="spd-recent-module-icon">⭕</span>
                    <span className="spd-recent-module-label">
                      Modern Architecture Principles
                    </span>
                    <div className="spd-recent-module-bar">
                      <div
                        className="spd-recent-module-bar-fill"
                        style={{ width: '84%' }}
                      />
                    </div>
                    <span className="spd-recent-module-percent">84%</span>
                  </div>
                  <div className="spd-recent-module-item">
                    <span className="spd-recent-module-icon">⭕</span>
                    <span className="spd-recent-module-label">
                      Sustainable Building Design
                    </span>
                    <div className="spd-recent-module-bar">
                      <div
                        className="spd-recent-module-bar-fill"
                        style={{ width: '54%' }}
                      />
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
                <p className="spd-insights-description">
                  Personalized analysis of your learnings
                </p>
              </div>
              <div className="spd-insights-box">
                <h3 className="spd-insights-box-title">AI Learning Insights</h3>
                <p className="spd-insights-box-text">
                  Based on your recent activities, you excel at structural design
                  concepts but may benefit from additional practice with sustainable materials.
                </p>
              </div>
              <div className="spd-skills-section">
                {/* …skill items… */}
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
