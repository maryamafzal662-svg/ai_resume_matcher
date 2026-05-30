// src/pages/FeedbackPage.js
import React, { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const FeedbackPage = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await api.post('/feedback/', { message }, {
        headers: { Authorization: `Token ${token}` },
      });
      setStatus('success');
      setMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setStatus('error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4">📝 Submit Feedback</h2>
        {status === 'success' && (
          <div className="alert alert-success">Thank you for your feedback!</div>
        )}
        {status === 'error' && (
          <div className="alert alert-danger">Something went wrong. Try again!</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">Your Feedback</label>
            <textarea
              id="message"
              className="form-control"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Submit Feedback</button>
        </form>
      </div>
    </>
  );
};

export default FeedbackPage;
