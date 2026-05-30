// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/LoginPage.css';

const RegisterPage = () => {
  //State Variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('jobseeker');
  const [showPassword, setShowPassword] = useState(false);

  //  Popup states (same as LoginPage)
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const navigate = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPhone('');
    setLocation('');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register/', {
        username,
        email,
        password,
        phone,
        location,
        role,
      });

      setPopupMessage('✅ Registration successful!');
      setPopupType('success');
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate('/login');
      }, 2000);

    } catch (error) {
      const msg = error.response?.data || 'Something went wrong';

      setPopupMessage('❌ Registration failed: ' + JSON.stringify(msg));
      setPopupType('error');
      setShowPopup(true);

      setTimeout(() => setShowPopup(false), 2500);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <img
            src="/assets/LoginPage.png"
            alt="Register Illustration"
            className="login-img"
          />
        </div>
        <div className="login-right">
          <form
            className="login-form"
            onSubmit={handleRegister}
            autoComplete="off"
          >
            <h2 className="login-heading">Create Account</h2>
            <p className="login-text">Sign up to get started</p>

            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your full name"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="03XXXXXXXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="City, Country"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="off"
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
                  autoComplete="new-password"
                />
                <span
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? '🔓' : '🔒'}
                </span>
              </div>
            </div>

            <div className="input-group">
              <label>Role</label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <button type="submit" className="login-btn">Register</button>

            <p className="login-bottom">
              Already have an account? <a href="/login">Login</a>
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

export default RegisterPage;
