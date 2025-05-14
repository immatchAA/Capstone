import React, { useState } from 'react';
import './AccountE.css';
import Sidebar from './Sidebar'; // assuming Sidebar is already created

const AccountE = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Cena',
    email: 'CenaJohn@gmail.com',
    phoneNumber: '1234-231-3231',
    idNumber: '01-2345-678',
    password: '123*************',
  });
  
  // Copy of form data for the popup to maintain original data until save
  const [editFormData, setEditFormData] = useState({...formData});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditClick = () => {
    // Reset edit form data to current data and show modal
    setEditFormData({...formData});
    setShowModal(true);
    // Reset password visibility when opening modal
    setShowEditPassword(false);
  };
  
  const handleSave = () => {
    // Save the edited data to the main form data
    setFormData({...editFormData});
    setShowModal(false);
  };
  
  const handleCancel = () => {
    // Discard changes
    setShowModal(false);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleEditPasswordVisibility = () => {
    setShowEditPassword(!showEditPassword);
  };

  return (
    <div className="accounte-wrapper">
      <Sidebar />
      <div className="accounte-content">
        <header className="accounte-header">
          <h1>ACCOUNT SETTINGS</h1>
          <p>Edit your account</p>
        </header>

        <div className="accounte-profile-card">
          <div className="accounte-profile-header">
            <div className="accounte-profile-photo-container">
              <div className="accounte-profile-photo">
                <div className="accounte-camera-icon">📷</div>
              </div>
              <div className="accounte-profile-name">{formData.firstName} {formData.lastName}</div>
              <div className="accounte-profile-id">ID - {formData.idNumber}</div>
            </div>
            <button className="accounte-edit-button" onClick={handleEditClick}>
              EDIT
            </button>
          </div>

          <div className="accounte-form-container">
            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  disabled={true}
                />
              </div>

              <div className="accounte-form-group">
                <label>Email</label>
                <div className="accounte-input-with-badge">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                  />
                  <span className="accounte-verified-badge">✓ Verified</span>
                </div>
              </div>

              <div className="accounte-form-group">
                <label>Phone Number</label>
                <div className="accounte-input-with-badge">
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    disabled={true}
                  />
                  <span className="accounte-verified-badge">✓ Verified</span>
                </div>
              </div>
            </div>

            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  disabled={true}
                />
              </div>

              <div className="accounte-form-group">
                <label>Password</label>
                <div className="accounte-input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    disabled={true}
                  />
                  <button 
                    type="button" 
                    className="accounte-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="accounte-form-group">
                <label>ID - Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup Modal for Editing */}
      {showModal && (
        <div className="accounte-modal-overlay">
          <div className="accounte-modal">
            <div className="accounte-modal-header">
              <h2>Edit Profile</h2>
              <button className="accounte-modal-close" onClick={handleCancel}>×</button>
            </div>
            <div className="accounte-modal-body">
              <div className="accounte-form-container">
                <div className="accounte-form-column">
                  <div className="accounte-form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="accounte-form-group">
                    <label>Email</label>
                    <div className="accounte-input-with-badge">
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleChange}
                      />
                      <span className="accounte-verified-badge">✓ Verified</span>
                    </div>
                  </div>

                  <div className="accounte-form-group">
                    <label>Phone Number</label>
                    <div className="accounte-input-with-badge">
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editFormData.phoneNumber}
                        onChange={handleChange}
                      />
                      <span className="accounte-verified-badge">✓ Verified</span>
                    </div>
                  </div>
                </div>

                <div className="accounte-form-column">
                  <div className="accounte-form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="accounte-form-group">
                    <label>Password</label>
                    <div className="accounte-input-with-icon">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        name="password"
                        value={editFormData.password}
                        onChange={handleChange}
                      />
                      <button 
                        type="button" 
                        className="accounte-password-toggle"
                        onClick={toggleEditPasswordVisibility}
                      >
                        {showEditPassword ? "🔒" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="accounte-form-group">
                    <label>ID - Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={editFormData.idNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="accounte-modal-footer">
              <button className="accounte-button-cancel" onClick={handleCancel}>Cancel</button>
              <button className="accounte-button-save" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountE;