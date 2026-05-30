import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`http://127.0.0.1:8000/api/job-listings/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setJob(res.data))
      .catch((err) => console.error('Job detail fetch error:', err));
  }, [id]);

  if (!job) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '50px', textAlign: 'center' }}>⏳ Loading job details...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <h2 style={styles.title}>{job.title}</h2>
          <h5 style={styles.subtitle}>🏢 {job.company?.name || 'N/A'}</h5>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Category:</strong> {job.category?.name || 'N/A'}</p>
          <p><strong>Salary:</strong> {job.salary ? `Rs. ${job.salary}` : 'Not disclosed'}</p>
          <p><strong>Description:</strong> {job.description}</p>

          {job.skills && job.skills.length > 0 && (
            <>
              <p><strong>Required Skills:</strong></p>
              <ul>
                {job.skills.map((skill, index) => (
                  <li key={index}>{skill.name}</li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ Go to Apply Page */}
          <Link
            to={`/apply/${job.id}`}
            style={styles.applyButton}
          >
            Apply Now
          </Link>
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
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '700px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    color: '#001f3f',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: '20px',
  },
  applyButton: {
    backgroundColor: '#001f3f',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '20px',
    textAlign: 'center',
  },
};

export default JobDetailPage;
