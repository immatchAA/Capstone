import React, { useState } from 'react';
import './Authform.css';
import backgroundImage from '../images/bgbg.png';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if(formData.password !== formData.confirmPassword){
      alert("Password's dont match ");
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      const { data, error } = await supabase.from('users').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email.trim().toLowerCase(),
          password: hashedPassword,
          role: 'teacher'
        }
      ]);

      if(error) {
        console.error("Insert error: ", error.message);
        alert("Error: " + error.message);
      } else {
        alert("Registration successful!");
        console.log("Inserted user: ", data);
        window.location.href = "/login";
      }
    } catch (err){
      console.error("Unexoected error: ", err);
      alert("Something went wrong");
    }
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
