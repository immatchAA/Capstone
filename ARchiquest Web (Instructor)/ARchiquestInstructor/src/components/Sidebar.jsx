import React, { useState } from 'react';
import './Sidebar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaTasks, FaChartLine, FaPencilRuler, FaStore, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';

function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      alert('Logout failed. Please try again.');
    } else {
      navigate('/login');
    }
  };

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
        <Link to="/dashboard" className="nav-item"><FaHome className="icon" /> Dashboard</Link>
        <Link to="/classkey" className="nav-item"><FaTasks className="icon" /> Class Keys</Link>
        <Link to="/student-progress" className="nav-item"><FaChartLine className="icon" /> Student Progress</Link>
        <Link to="/createdesign" className="nav-item"><FaPencilRuler className="icon" /> Create Challenge</Link>
        <Link to="/Virtualstore" className="nav-item"><FaStore className="icon" /> Virtual Store</Link>

        <hr className="divider" />

        {/* Logout confirmation trigger */}
        <div className="nav-item" onClick={() => setShowConfirm(true)} style={{ cursor: 'pointer' }}>
          <FaSignOutAlt className="icon" /> Logout
        </div>

        <Link to="/account" className="nav-item"><FaUser className="icon" /> Account</Link>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="yes-btn" onClick={handleLogout}>Yes</button>
              <button className="no-btn" onClick={() => setShowConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
