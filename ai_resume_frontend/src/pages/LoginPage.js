// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/LoginPage.css';

const LoginPage = () => {
  // State Variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  //  Popup States
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); 
  const navigate = useNavigate();
   
  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/custom-login/', {
        email: email,
        password: password,
      });

      console.log("Login response:", response.data);

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user_type', response.data.user_type);

      
      setPopupMessage('✅ Login successful!');
      setPopupType('success');
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong';

      setPopupMessage('❌ Login failed: ' + message);
      setPopupType('error');
      setShowPopup(true);

      setTimeout(() => setShowPopup(false), 2500);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <img src="/assets/LoginPage.png" alt="Login Art" className="login-img" />
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="login-heading">Welcome Back 👋</h2>
            <p className="login-text">Login to your account</p>

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

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  {showPassword ? '🔓' : '🔒'}
                </span>
              </div>
            </div>

            <div className="forgot">
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn">Login</button>

            <p className="login-bottom">
              New here? <a href="/register">Create account</a>
            </p>
          </form>
        </div>
      </div>

      {showPopup && (
        <div style={styles.popupOverlay}>
          <div
            style={{
              ...styles.popupCard,
              color: popupType === 'success' ? '#16a34a' : '#dc2626',
            }}
          >
            {popupMessage}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999,
  },
  popupCard: {
    backgroundColor: 'white',
    padding: '20px 30px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default LoginPage;
