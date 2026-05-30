import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const EditCompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: '',
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.get(`/companies/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setForm(response.data);
    } catch (error) {
      console.error('❌ Error fetching company:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await api.put(`/companies/${id}/`, form, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('✅ Company Updated Successfully!');
      navigate('/manage-company');
    } catch (error) {
      console.error('❌ Error updating company:', error);
      alert('❌ Failed to update company.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.heading}>✏️ Edit Company</h2>
          <form onSubmit={handleSubmit}>
            {['name', 'description', 'website', 'industry', 'location'].map((field, idx) => (
              <div key={idx} style={styles.formGroup}>
                <label style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {field === 'description' ? (
                  <textarea
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                    style={{ ...styles.input, height: '100px', resize: 'none' }}
                  />
                ) : (
                  <input
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                )}
              </div>
            ))}
            <button type="submit" style={styles.buttonEdit} className="save-btn">Save Changes</button>
            <button type="button" style={styles.buttonDelete} className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  wrapper: {
    background: 'linear-gradient(to right, #f1f5f9, #e2e8f0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  heading: {
    textAlign: 'center',
    color: '#1e293b',
    fontSize: '26px',
    marginBottom: '28px',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    outlineColor: '#6366f1',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '6px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  primaryButton: {
    width: '100%',
    color: '#fff',
    backgroundColor: '#10b981',
    fontWeight: 600,
    padding: '14px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  secondaryButton: {
    width: '100%',
    color: '#fff',
    backgroundColor: '#64748b',
    fontWeight: 600,
    padding: '14px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default EditCompanyPage;
