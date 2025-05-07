import React, { useState } from 'react';
import './Authform.css';
import backgroundImage from '../images/bgbg.png';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
  
    if (authError) {
      alert("❌ Failed to register: " + authError.message);
      return;
    }
  
    const userId = authData.user.id; 
  

    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      },
    ]);
    
  
    if (insertError) {
      alert("❌ Failed to save user info: " + insertError.message);
      return;
    }
  
    alert("✅ Registered successfully!");
    navigate("/login");
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
              {/* First Name */}
              <div className="input-container">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="FIRST NAME"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="input-container">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="LAST NAME"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email, Password, Confirm Password */}
              {['email', 'password', 'confirmPassword'].map((field) => (
                <div key={field} className="input-container">
                  <label htmlFor={field}>
                    {field === 'email'
                      ? 'Instructor Email'
                      : field === 'password'
                      ? 'Password'
                      : 'Confirm Password'}
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
