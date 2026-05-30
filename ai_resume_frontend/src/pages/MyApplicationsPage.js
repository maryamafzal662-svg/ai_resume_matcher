import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupColor, setPopupColor] = useState('#16a34a'); // ✅ success = green, error = red

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/applications/', {
          headers: { Authorization: `Token ${token}` },
        });
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        triggerPopup('❌ Failed to fetch applications.', 'red');
      }
    };

    fetchApplications();
  }, []);

  // ✅ Popup trigger
  const triggerPopup = (message, color = '#16a34a') => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <h2 style={styles.title}>📄 My Applications</h2>
          {applications.length > 0 ? (
            <div style={styles.grid}>
              {applications.map((app) => (
                <div key={app.id} style={styles.applicationCard}>
                  <h5 style={styles.jobTitle}>{app.job.title}</h5>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          app.status === 'pending'
                            ? '#facc15'
                            : app.status === 'accepted'
                            ? '#16a34a'
                            : '#dc2626',
                        color: 'white',
                      }}
                    >
                      {app.status}
                    </span>
                  </p>
                  <p>
                    <strong>Applied At:</strong>{' '}
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>
              You haven't applied to any jobs yet.
            </p>
          )}
        </div>
      </div>

      {/* ✅ Popup like UserProfile */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={{ ...styles.popupCard, color: popupColor }}>
            {popupMessage}
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Same styling pattern as UserProfile
const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f8fafc',
    padding: '20px',
    paddingTop: '90px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '30px 24px',
    maxWidth: '900px',
    width: '100%',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: '24px',
    fontSize: '22px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  applicationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  // ✅ Popup styles (copied from UserProfile)
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

export default MyApplicationsPage;
