import React, { useState } from 'react';
import './Authform.css';
import backgroundImage from '../images/bgbg.png';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Registering with:', formData.email, formData.password, formData.confirmPassword);
  };

  return (
    <div className="register-page background-blur" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-container">
        <div className="login-cards">
          {/* Left Card */}
          <div className="left-card">
            <h2 className="instructor-title">INSTRUCTOR SIGN UP</h2>
            <button className="register-btn">BACK TO LOGIN</button>
          </div>

          {/* Right Card */}
          <div className="right-card">
            <h2>SIGN UP</h2>
            <form onSubmit={handleRegister}>
              {['email', 'password', 'confirmPassword'].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>
                    {field === 'email' ? 'Instructor Email' : field === 'password' ? 'Password' : 'Confirm Password'}
                  </label>
                  <input
                    type={field.includes('password') ? 'password' : 'email'}
                    id={field}
                    placeholder={
                      field === 'email'
                        ? 'INSTRUCTOR EMAIL'
                        : field === 'password'
                        ? 'PASSWORD'
                        : 'CONFIRM PASSWORD'
                    }
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <div className="actions">
                <button type="submit">SIGN UP</button>
              </div>
            </form>

            <p className="register-text">
              Already have an account? <a href="/login">Sign In</a>
            </p>

            <div className="google-signin">
              <button className="google-btn">
                <img src="/path-to-your-google-icon.png" alt="Google Icon" />
                Or register with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
