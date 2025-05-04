import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Authform.css';
import backgroundImage from '../images/bgbg.png';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', formData.username, formData.password);

    // Simulate login and redirect
    navigate('/dashboard');
  };

  return (
    <div className="login-page background-blur" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-container">
        <div className="login-cards">
          {/* Left Card */}
          <div className="left-card">
            <h2 className="instructor-title">INSTRUCTOR LOGIN</h2>
            <button className="register-btn" onClick={() => navigate('/register')}>REGISTER HERE</button>
          </div>

          {/* Right Card */}
          <div className="right-card">
            <h2>SIGN IN</h2>
            <form onSubmit={handleLogin}>
              {['username', 'password'].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>{field === 'username' ? 'Username / Email' : 'Password'}</label>
                  <input
                    type={field === 'password' ? 'password' : 'email'}
                    id={field}
                    placeholder={field === 'password' ? 'PASSWORD' : 'INSTRUCTOR EMAIL'}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <div className="actions">
                <button type="submit">LOGIN</button>
                <p className="forgot-password">Forgot Password?</p>
              </div>
            </form>

            <p className="register-text">
              Don't have an Account? <a href="/register">Sign Up</a>
            </p>

            <div className="google-signin">
              <button className="google-btn">
                <img src="/path-to-your-google-icon.png" alt="Google Icon" />
                Sign In With Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
