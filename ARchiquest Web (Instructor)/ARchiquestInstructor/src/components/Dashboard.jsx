import React from 'react';
import './Dashboard.css';
import Sidebar from './Sidebar';

function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <h1>INSTRUCTOR DASHBOARD</h1>
            <p>Here's your analytics details</p>
          </header>

          <div className="dashboard-grid">
            <div className="card">
              <h2>120</h2>
              <p>Total Students</p>
            </div>
            <div className="card">
              <h2>45</h2>
              <p>Completed Challenges</p>
            </div>
            <div className="card">
              <h2>85%</h2>
              <p>Average Score</p>
            </div>
            <div className="card">
              <h2>9</h2>
              <p>Total Projects</p>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="long-card">
              <h3>Active Challenges</h3>
              <p>Placeholder</p>
              <p>Placeholder</p>
            </div>

            <div className="long-card">
              <h3>Recent Submissions</h3>
              <p>Placeholder</p>
              <p>Placeholder</p>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="long-card">
              <h3>Inactive Challenges</h3>
              <p>Placeholder</p>
              <p>Placeholder</p>
            </div>

            <div className="long-card">
              <h3>Placeholder</h3>
              <p>Placeholder</p>
              <p>Placeholder</p>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="long-card">
              <h3>Placeholder</h3>
              <p>Placeholder</p>
              <p>Placeholder</p>
            </div>
          </div>
        </div>

        <div className="dashboard-right-panel">
          <div className="right-card">
            <h3>Top-Performing Students</h3>
            <ul>
              <li><span>Ben Tennyson</span><strong>99</strong></li>
              <li><span>Sheryl Mcguire</span><strong>96</strong></li>
              <li><span>Winfred Trevino</span><strong>95</strong></li>
              <li><span>Amelia Anderson</span><strong>93</strong></li>
              <li><span>Jermaine Fernandez</span><strong>89</strong></li>
              <li><span>Jenifer Huerta</span><strong>85</strong></li>
              <li><span>Ben Tennyson</span><strong>85</strong></li>
              <li><span>Sheryl Mcguire</span><strong>84</strong></li>
              <li><span>Winfred Trevino</span><strong>83</strong></li>
              <li><span>Amelia Anderson</span><strong>82</strong></li>
              <li><span>Jermaine Fernandez</span><strong>81</strong></li>
              <li><span>Jenifer Huerta</span><strong>81</strong></li>
              <li><span>Jamar Huerta Jr.</span><strong>81</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
