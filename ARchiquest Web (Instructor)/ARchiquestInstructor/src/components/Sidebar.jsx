import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaHome, FaTasks, FaChartLine, FaPencilRuler, FaStore, FaSignOutAlt, FaUser } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="custom-sidebar">
      {/* Profile Section */}
      <div className="custom-profile">
        <div className="custom-profile-pic"></div> 
        <div className="custom-profile-info">
          <h3>Bombardini</h3>
          <p>Crocodini</p>
        </div>
      </div>

      <hr className="custom-divider" />

      {/* Search Box */}
      <div className="custom-search-box">
        <input type="text" placeholder="Search..." />
      </div>

      {/* Navigation Links */}
      <nav className="custom-nav-links">
        <Link to="/dashboard" className="custom-nav-item">
          <FaHome className="custom-icon" /> Dashboard
        </Link>

        <Link to="/classkey" className="custom-nav-item">
          <FaTasks className="custom-icon" /> Class Keys
        </Link>

        <Link to="/student-progress" className="custom-nav-item">
          <FaChartLine className="custom-icon" /> Student Progress
        </Link>

        <Link to="/createdesignplan" className="custom-nav-item">
          <FaPencilRuler className="custom-icon" /> Create Design
        </Link>

        <Link to="/Virtualstore" className="custom-nav-item">
          <FaStore className="custom-icon" /> Virtual Store
        </Link>

        <hr className="custom-divider" />

        <Link to="/login" className="custom-nav-item">
          <FaSignOutAlt className="custom-icon" /> Logout
        </Link>

        <Link to="/accountE" className="custom-nav-item">
          <FaUser className="custom-icon" /> Account
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
