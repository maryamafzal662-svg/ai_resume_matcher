import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    category_input: '',
    expiry_date: '',
    skills: '',
    job_type: '',
  });

  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // ✅ Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); // success | error

  useEffect(() => {
    fetchUserJobs();
  }, []);

  const fetchUserJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/job-listings/', {
        headers: { Authorization: `Token ${token}` },
      });
      setUserJobs(res.data);
    } catch (err) {
      console.error('Job fetch error:', err);
      triggerPopup('❌ Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to trigger popup
  const triggerPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      salary: formData.salary || "Negotiable",
      category_input: formData.category_input,
      expiry_date: formData.expiry_date,
      skills: formData.skills.split(',').map((s) => s.trim()),
      job_type: formData.job_type,
    };

    try {
      if (editMode && editingJobId) {
        await axios.put(`/api/job-listings/${editingJobId}/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        triggerPopup('✅ Job updated successfully!', 'success');
      } else {
        await axios.post('/api/job-listings/', payload, {
          headers: { Authorization: `Token ${token}` },
        });
        triggerPopup('✅ Job posted successfully!', 'success');
      }

      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        category_input: '',
        expiry_date: '',
        skills: '',
        job_type: '',
      });
      setEditMode(false);
      setEditingJobId(null);
      setShowForm(false);
      await fetchUserJobs();
    } catch (err) {
      console.error('Error submitting job:', err.response?.data || err.message);
      triggerPopup('❌ Error submitting job.', 'error');
    }
  };

  const handleDelete = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`/api/job-listings/${jobId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      triggerPopup('🗑️ Job deleted successfully!', 'success');
      fetchUserJobs();
    } catch (err) {
      console.error('Delete error:', err);
      triggerPopup('❌ Could not delete job.', 'error');
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      category_input: job.category?.name || '',
      expiry_date: job.expiry_date,
      skills: Array.isArray(job.skill_names)
        ? job.skill_names.join(', ')
        : '',
      job_type: job.job_type || '',
    });
    setEditingJobId(job.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      salary: '',
      category_input: '', 
      expiry_date: '',
      skills: '',
      job_type: '',
    });
    setEditMode(false);
    setEditingJobId(null);
    setShowForm(false);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <div className="dashboard-grid" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          <div className="dashboard-card animated-slide">
            {!showForm ? (
              <>
                <h3 style={styles.sectionTitle}>Your Posted Jobs</h3>
                {loading ? (
                  <p>Loading jobs...</p>
                ) : userJobs.length === 0 ? (
                  <p>You haven’t posted any jobs yet.</p>
                ) : (
                  <ul style={styles.jobList}>
                    {userJobs.map((job) => (
                      <li key={job.id} style={styles.jobItem} className="hover-grow">
                        <h4>{job.title}</h4>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Salary:</strong> {job.salary}</p>
                        <p><strong>Expiry Date:</strong> {job.expiry_date}</p>
                        <p><strong>Category:</strong> {job.category?.name || 'N/A'}</p>
                        <p><strong>Job Type:</strong> {job.job_type || 'N/A'}</p>
                        <p><strong>Skills:</strong> 
                          {job.skill_names && job.skill_names.length > 0 
                            ? job.skill_names.join(', ') 
                            : 'N/A'}
                        </p>
                        <div style={styles.buttonRow}>
                          <button style={styles.editButton} onClick={() => handleEdit(job)}>Edit</button>
                          <button style={styles.deleteButton} className="delete-btn" onClick={() => handleDelete(job.id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button style={styles.postButton} onClick={() => setShowForm(true)}>
                  Post New Job
                </button>
              </>
            ) : (
              <>
                <h3 style={styles.sectionTitle}>{editMode ? 'Edit Job' : 'Post a New Job'}</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <label style={styles.label}>Job Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} style={styles.input} />

                  <label style={styles.label}>Description</label>
                  <textarea name="description" rows="4" required value={formData.description} onChange={handleChange} style={styles.input} />

                  <label style={styles.label}>Location</label>
                  <input type="text" name="location" required value={formData.location} onChange={handleChange} style={styles.input} />

                  <label style={styles.label}>Salary</label>
                  <input type="text" name="salary" value={formData.salary} onChange={handleChange} style={styles.input} />

                  <label style={styles.label}>Expiry Date</label>
                  <input type="date" name="expiry_date" required value={formData.expiry_date} onChange={handleChange} style={styles.input} />

                  <label style={styles.label}>Category</label>
                  <input 
                    type="text" 
                    name="category_input" 
                    value={formData.category_input}  
                    onChange={handleChange} 
                    style={styles.input} 
                  />

                  <label style={styles.label}>Job Type</label>
                  <select 
                    name="job_type" 
                    value={formData.job_type} 
                    onChange={handleChange} 
                    style={styles.input}
                  >
                    <option value="">Select Job Type</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>

                  <label style={styles.label}>Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} style={styles.input} />

                  <div style={styles.buttonRow}>
                    <button type="submit" style={styles.postButton}>
                      {editMode ? 'Update Job' : 'Submit Job'}
                    </button>
                    <button type="button" className="delete-btn" onClick={handleCancel} style={styles.cancelButton}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Popup Success/Error Messages */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={{ 
            ...styles.popupCard, 
            color: popupType === 'success' ? '#16a34a' : '#dc2626' 
          }}>
            {popupMessage}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '16px',
    fontWeight: 600,
    color: '#1e293b',
    textAlign: 'center'
  },
  jobList: { listStyle: 'none', padding: 0, marginBottom: '20px' },
  jobItem: {
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: '600', marginBottom: '6px', marginTop: '10px' },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '10px',
    fontSize: '14px',
  },
  postButton: {
    backgroundColor: '#001f3f',
    color: 'white',
    padding: '12px 20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#1d4ed8',
    color: 'white',
    padding: '12px 20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
    width: '100%',
  },
  editButton: {
    backgroundColor: '#001f3f',
    color: 'white',
    padding: '8px 12px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#1d4ed8',
    color: 'white',
    padding: '8px 12px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  // ✅ Popup styles (same as UserProfile)
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

export default PostJobPage;
