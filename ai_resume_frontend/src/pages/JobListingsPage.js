import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const JobListingsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // ✅ Fetch jobs
        const jobsRes = await axios.get('http://127.0.0.1:8000/api/job-listings/', {
          headers: { Authorization: `Token ${token}` },
        });
        setJobs(jobsRes.data || []);

        // ✅ Fetch applied jobs (from backend)
        const appsRes = await axios.get('http://127.0.0.1:8000/api/applications/', {
          headers: { Authorization: `Token ${token}` },
        });
        const appliedIds = appsRes.data.map((app) => app.job);

        // ✅ Fetch applied jobs from localStorage
        const storedApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        // ✅ Merge backend + localStorage (unique)
        const allApplied = Array.from(new Set([...appliedIds, ...storedApplied]));

        setAppliedJobs(allApplied);

        // ✅ Update localStorage permanently (so logout/refresh pe bhi saved rahe)
        localStorage.setItem('appliedJobs', JSON.stringify(allApplied));
      } catch (error) {
        console.error('Error fetching jobs:', error.response?.data || error.message);
        setJobs([]);
      }
    };

    fetchJobsAndApplications();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper fade-in">
        <h2 className="dashboard-heading text-center mt-4">Available Jobs</h2>
        <div className="dashboard-grid">
          {jobs.length === 0 ? (
            <p className="dashboard-empty">No jobs available right now.</p>
          ) : (
            jobs.map((job) => {
              const isApplied = appliedJobs.includes(job.id);
              return (
                <div key={job.id} className="dashboard-card hover-grow animated-fade">
                  <h3 className="dashboard-section-title">{job.title}</h3>
                  <p>
                    <strong>Company:</strong>{' '}
                    {typeof job.company === 'object' && job.company ? (
                      <Link
                        to={`/company/${job.company.id}`}
                        style={{ color: '#1a0dab', textDecoration: 'underline' }}
                      >
                        {job.company.name}
                      </Link>
                    ) : (
                      job.company_name || 'N/A'
                    )}
                  </p>
                  <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                  <p><strong>Category:</strong> {job.category?.name || job.category_name || 'N/A'}</p>
                  <p><strong>Salary:</strong> {job.salary ? `Rs. ${job.salary}` : 'Not disclosed'}</p>

                  {job.skills && job.skills.length > 0 && (
                    <>
                      <strong>Skills:</strong>
                      <ul className="dashboard-list">
                        {job.skills.map((skill, index) => (
                          <li key={index}>{skill.name || skill}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* ✅ Button Logic */}
                  {isApplied ? (
                    <button
                      style={{
                        backgroundColor: '#9ca3af',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'not-allowed',
                        opacity: 0.7,
                        marginTop: '10px',
                      }}
                      disabled
                    >
                      Applied
                    </button>
                  ) : (
                    <Link
                      to={`/job/${job.id}`}
                      style={{
                        backgroundColor: '#001f3f',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-block',
                        marginTop: '10px',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
                    >
                      View Detail
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default JobListingsPage;
