import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const ApplicationHistoryPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);
  const [employerCompanyId, setEmployerCompanyId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        const userRes = await api.get('/user/profile/', {
          headers: { Authorization: `Token ${token}` },
        });

        const role = (userRes.data.role || '').toLowerCase();
        setUserType(role);
        localStorage.setItem('user_type', role);

        const detectedCompanyId =
          userRes.data.company_id ||
          (userRes.data.company && userRes.data.company.id) ||
          userRes.data.employer_company_id ||
          null;
        setEmployerCompanyId(detectedCompanyId);

        // Fetch applications
        const appRes = await api.get('/applications/', {
          headers: { Authorization: `Token ${token}` },
        });

        const rawApps = Array.isArray(appRes.data) ? appRes.data : [];
        const apps = rawApps.map((app) => ({
          id: app.id,
          candidate_name: app.candidate_name || app.user_name || app.applicant_name || '',
          candidate_email: app.candidate_email || app.user_email || '',
          candidate_phone: app.candidate_phone || app.user_phone || '',
          job_title: (app.job && app.job.title) || app.job_title || '',
          job_location: (app.job && app.job.location) || app.job_location || '',
          job_salary: (app.job && app.job.salary) || app.job_salary || '',
          status: (app.status || 'pending').toLowerCase(),
          created_at: app.created_at || null,
          company_id: app.company_id || (app.job && app.job.company_id) || (app.job && app.job.company) || null,
          company_name: app.company_name || (app.job && app.job.company_name) || '',
          cover_letter: app.cover_letter || '',
          user_id: app.user_id || app.user || (app.applicant && app.applicant.id) || null,
          resume_created: app.resume_created || app.has_resume || false,
        }));

        let filteredApps = apps;
        if (role === 'employer' && detectedCompanyId) {
          filteredApps = apps.filter((a) => {
            const appCompany =
              a.company_id && typeof a.company_id === 'object'
                ? a.company_id.id || null
                : a.company_id;
            return String(appCompany) === String(detectedCompanyId);
          });
        }

        setApplications(filteredApps);
      } catch (err) {
        console.error('Error fetching applications or user profile:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setError('User not authenticated. Please login.');
      setLoading(false);
      return;
    }

    fetchData();
  }, [token]);

  const handleStatusChange = async (id, newStatus, jobTitle, companyName, candidateId) => {
    try {
      const res = await api.patch(
        `/applications/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (res.status === 200) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );

        const notifMessage =
          newStatus === 'accepted'
            ? `✅ Congratulations! Your application for ${jobTitle} at ${companyName} has been accepted. Our team will contact you shortly via email or phone.`
            : `❌ Thank you for applying for ${jobTitle} at ${companyName}. After careful review, we regret to inform you that your application was not selected. We wish you the best in your job search.`;

        await api.post(
          '/notifications/',
          {
            user: candidateId,
            type: newStatus === 'accepted' ? 'application_accepted' : 'application_rejected',
            message: notifMessage,
          },
          { headers: { Authorization: `Token ${token}` } }
        );
      }
    } catch (err) {
      console.error('Error updating application status or sending notification:', err);
      setError(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'accepted') return { background: '#d4f4dd', color: '#2a9d8f' };
    if (status === 'rejected') return { background: '#fddede', color: '#e63946' };
    return { background: '#fff8d9', color: '#e9a118' };
  };

  if (loading)
    return <p style={{ textAlign: 'center', paddingTop: '100px' }}>Loading…</p>;
  if (error)
    return (
      <p style={{ textAlign: 'center', color: 'red', paddingTop: '100px' }}>
        {error}
      </p>
    );
  if (!userType)
    return <p style={{ textAlign: 'center', paddingTop: '100px' }}>User type not found.</p>;

  return (
    <>
      <Navbar />
      <div
        style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          marginTop: '80px',
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '1.6rem',
          }}
        >
          {userType === 'employer' ? 'Received Applications' : 'My Job Applications'}
        </h2>

        {applications.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>No applications found.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.04)',
                  padding: '24px',
                }}
                className="hover-grow"
              >
                {userType === 'employer' ? (
                  <>
                    <h3>{app.candidate_name || 'Candidate'}</h3>
                    <p>
                      <strong>Email:</strong> {app.candidate_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {app.candidate_phone || 'Not Provided'}
                    </p>

                    {/* ✅ Applied For on one line, View Resume on new line */}
                    <p style={{ margin: 0 }}>
                      <strong>Applied for:</strong> {app.job_title || 'N/A'}
                    </p>
                    {app.user_id ? (
                      <p style={{ marginTop: '5px' }}>
                        <Link to={`/candidates/${app.user_id}`} className="dashboard-link">
                          View Resume
                        </Link>
                      </p>
                    ) : (
                      <p style={{ color: 'red', margin: 0 }}>No resume found.</p>
                    )}

                    {/* Status aligned neatly */}
                    <div style={{ marginTop: '8px' }}>
                      <p
                        style={{
                          ...getStatusClass(app.status),
                          display: 'inline-block',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                        }}
                      >
                        <strong>Status:</strong> {app.status}
                      </p>
                    </div>

                    {app.cover_letter && (
                      <p>
                        <span
                          style={{
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: '500',
                          }}
                          onClick={() => setSelectedCoverLetter(app.cover_letter)}
                        >
                          Cover Letter
                        </span>
                      </p>
                    )}

                    {app.status === 'pending' && (
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          style={{
                            backgroundColor: '#001f3f',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            handleStatusChange(
                              app.id,
                              'accepted',
                              app.job_title,
                              app.company_name,
                              app.user_id
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          style={{
                            backgroundColor: '#1d4ed8',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            handleStatusChange(
                              app.id,
                              'rejected',
                              app.job_title,
                              app.company_name,
                              app.user_id
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3>{app.job_title}</h3>
                    <p>
                      <strong>Company:</strong>{' '}
                      {app.company_id ? (
                        <Link to={`/company/${app.company_id}`} className="dashboard-link">
                          {app.company_name}
                        </Link>
                      ) : (
                        app.company_name || 'N/A'
                      )}
                    </p>
                    <p
                      style={{
                        ...getStatusClass(app.status),
                        marginTop: '10px',
                        display: 'inline-block',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      <strong>Status:</strong> {app.status}
                    </p>
                    <p>
                      <strong>Applied At:</strong>{' '}
                      {app.created_at ? new Date(app.created_at).toLocaleString() : 'N/A'}
                    </p>
                    <p>
                      📍 <strong>Location:</strong> {app.job_location || 'Not specified'}
                    </p>
                    <p>
                      💰 <strong>Salary:</strong>{' '}
                      {app.job_salary ? `Rs. ${app.job_salary}` : 'Not disclosed'}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedCoverLetter && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 8,
                maxWidth: 700,
                width: '90%',
              }}
            >
              <h3>Cover Letter</h3>
              <div style={{ maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {selectedCoverLetter}
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <button onClick={() => setSelectedCoverLetter(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ApplicationHistoryPage;
