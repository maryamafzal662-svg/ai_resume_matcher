// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import api from '../services/api';
import '../styles/LoginPage.css';

const ForgotPasswordPage = () => {
  // State Variables
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
// Form Submit Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/password-reset/', { email }); 
      setSuccess(true);
    } catch (error) {
      alert('Error sending reset link.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <img src="/assets/LoginPage.png" alt="Reset Art" className="login-img" />
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-heading">Forgot Password?</h2>
            <p className="login-text">Enter your email to reset your password</p>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn">Send Reset Link</button>

            {success && <p style={{ marginTop: '20px', color: '#22c55e' }}>Check your email for reset instructions.</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
