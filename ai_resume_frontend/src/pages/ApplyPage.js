import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/applications/',
        { job: id, cover_letter: message },
        { headers: { Authorization: `Token ${token}` } }
      );

      setSuccess(true);

      // Save job in localStorage
      const storedApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!storedApplied.includes(Number(id))) {
        storedApplied.push(Number(id));
        localStorage.setItem('appliedJobs', JSON.stringify(storedApplied));
      }

      // ✅ Redirect after 2.5 sec
      setTimeout(() => navigate('/job-listings'), 2500);
    } catch (err) {
      const errorData = err.response?.data;
      if (Array.isArray(errorData) && errorData[0]?.toLowerCase().includes('already applied')) {
        alert('⚠️ You have already applied for this job!');
      } else {
        alert(errorData?.detail || 'Application failed! Please try again.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <h2 style={styles.title}>Apply for Job</h2>
          {success ? (
            <p style={styles.successMessage}>
              🎉 Thank you! Your application has been submitted successfully.  
              
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label htmlFor="message" style={styles.label}>
                  Your Message / Cover Letter
                </label>
                <textarea
                  id="message"
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={styles.textarea}
                ></textarea>
              </div>
              <button type="submit" style={styles.submitButton}>
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    paddingTop: '100px',
    paddingBottom: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    width: '100%',
    maxWidth: '900px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '26px',
    color: '#001f3f',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
    fontSize: '18px',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: '1.6',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '18px',
  },
  textarea: {
    width: '100%',
    minHeight: '300px',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    fontSize: '18px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.8',
  },
  submitButton: {
    backgroundColor: '#001f3f',
    color: '#fff',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'inline-block',
  },
};

export default ApplyPage;
