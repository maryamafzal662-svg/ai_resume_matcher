// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/LoginPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
// States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('❌ Passwords do not match!');
      setSuccess(false);
      return;
    }

    try {
      await api.post('/password-reset-confirm/', {
        uid,
        token,
        new_password: newPassword,
      });

      setSuccess(true);
      setErrorMessage('');

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      setErrorMessage('❌ Error resetting password. Invalid or expired link.');
      setSuccess(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <img src="/assets/LoginPage.png" alt="Reset Password" className="login-img" />
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handleReset}>
            <h2 className="login-heading">Reset Password</h2>

            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn">Reset Password</button>

            {success && (
              <p style={{ color: 'green', marginTop: '20px' }}>
                ✅ Password has been reset successfully!
              </p>
            )}

            {errorMessage && !success && (
              <p style={{ color: 'red', marginTop: '20px' }}>
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
