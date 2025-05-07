import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Authform.css';
import backgroundImage from '../images/bgbg.png';
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert("❌ Login failed: " + authError.message);
      return;
    }

    const userId = authData.user.id;

    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      alert("❌ Could not fetch user data: " + userFetchError.message);
      return;
    }
    localStorage.setItem('loggedInUser', JSON.stringify(userData));

    alert("✅ Login successful!");
    navigate('/classkey'); 
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
              {['email', 'password'].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>{field === 'email' ? 'Email' : 'Password'}</label>
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

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
