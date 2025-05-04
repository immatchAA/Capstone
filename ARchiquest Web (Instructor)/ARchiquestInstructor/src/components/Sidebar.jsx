import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaHome, FaTasks, FaChartLine, FaPencilRuler, FaStore, FaSignOutAlt, FaUser } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Profile Section */}
      <div className="profile">
        <div className="profile-pic"></div> 
        <div className="profile-info">
          <h3>Bombardini</h3>
          <p>Crocodini</p>
        </div>
      </div>

      <hr className="divider" />

      {/* Search Box */}
      <div className="search-box">
        <input type="text" placeholder="Search..." />
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        <Link to="/dashboard" className="nav-item">
          <FaHome className="icon" /> Dashboard
        </Link>

        <Link to="/create-challenge" className="nav-item">
          <FaTasks className="icon" /> Create Challenge
        </Link>

        <Link to="/student-progress" className="nav-item">
          <FaChartLine className="icon" /> Student Progress
        </Link>

        <Link to="/createdesignplan" className="nav-item">
          <FaPencilRuler className="icon" /> Create Design
        </Link>

        <Link to="/Virtualstore" className="nav-item">
          <FaStore className="icon" /> Virtual Store
        </Link>

        <hr className="divider" />

        <Link to="/login" className="nav-item">
          <FaSignOutAlt className="icon" /> Logout
        </Link>

        <Link to="/account" className="nav-item">
          <FaUser className="icon" /> Account
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
