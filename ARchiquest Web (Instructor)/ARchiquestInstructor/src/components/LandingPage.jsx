"use client"
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login'); 
  };

  const handleSignUp = () => {
    navigate('/register'); 
  };

  return (
    <div className="landing-container">
      {/* Main Content */}
      <div className="landing-content">
      <h2 className="landing-title">Welcome to</h2>
        <h1 className="landing-title">ARchiQuest</h1>
          <p className="landing-subtitle">
            A platform for instructors to create architectural design challenges, track student performance, and manage immersive learning experiences in real time.
          </p>

        <div className="landing-buttons">
          <button onClick={handleLogin} className="landing-btn dark">
            Login
          </button>
          <button onClick={handleSignUp} className="landing-btn light">
            Sign Up
          </button>
        </div>
      </div>

      {/* Animated House */}
      <div className="animated-house">
        <div className="house-container">
          <div className="house-base">
            <div className="house-roof"></div>
            <div className="house-door"></div>
            <div className="house-window left-window"></div>
            <div className="house-window right-window"></div>
            <div className="house-chimney"></div>
            <div className="smoke smoke1"></div>
            <div className="smoke smoke2"></div>
            <div className="smoke smoke3"></div>
          </div>
        </div>
      </div>

      {/* Cartoon People */}
      <div className="cartoon-person person1">
        <div className="person-placeholder">👨‍🎓</div>
      </div>

      <div className="cartoon-person person2">
        <div className="person-placeholder">👩‍💼</div>
      </div>

      <div className="cartoon-person person3">
        <div className="person-placeholder">🧑‍🏫</div>
      </div>

      {/* Floating Shapes */}
      <div className="animated-elements">
        <div className="shape cube shape1"></div>
        <div className="shape triangle shape2"></div>
        <div className="shape circle shape3"></div>

        {/* Additional floating shapes */}
        <div className="shape circle shape4"></div>
        <div className="shape square shape5"></div>
        <div className="shape rectangle shape6"></div>
        <div className="shape circle shape7"></div>
        <div className="shape square shape8"></div>
        <div className="shape triangle shape9"></div>
        <div className="shape rectangle shape10"></div>
        <div className="shape circle shape11"></div>
        <div className="shape square shape12"></div>
        <div className="shape triangle shape13"></div>
        <div className="shape rectangle shape14"></div>
        <div className="shape circle shape15"></div>

        {/* Stars and sparkles */}
        <div className="sparkle star1">✦</div>
        <div className="sparkle star2">✧</div>
        <div className="sparkle star3">✦</div>
        <div className="sparkle star4">✧</div>
        <div className="sparkle star5">✦</div>
        <div className="sparkle star6">✧</div>

        {/* Building blocks */}
        <div className="shape building-block block1"></div>
        <div className="shape building-block block2"></div>
        <div className="shape building-block block3"></div>
        <div className="shape building-block block4"></div>
        <div className="shape building-block block5"></div>
      </div>

      {/* Floating clouds */}
      <div className="cloud cloud1">
        <div className="cloud-main"></div>
        <div className="cloud-puff cloud-puff1"></div>
        <div className="cloud-puff cloud-puff2"></div>
      </div>

      <div className="cloud cloud2">
        <div className="cloud-main"></div>
        <div className="cloud-puff cloud-puff1"></div>
        <div className="cloud-puff cloud-puff2"></div>
      </div>
    </div>
  )
}

export default LandingPage
