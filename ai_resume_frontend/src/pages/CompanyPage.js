import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css'; 

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
// Form Fields States
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');

  const [userType, setUserType] = useState(null);
  const [hoverBtn, setHoverBtn] = useState(null);

  //  Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    const storedType = localStorage.getItem('user_type');
    setUserType(storedType);
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(
          id ? `/companies/${id}/` : `/companies/my-company/`
        );

        if (res?.data) {
          setCompany(res.data);
          setName(res.data.name || '');
          setLocation(res.data.location || '');
          setDescription(res.data.description || '');
          setWebsite(res.data.website || '');
          setIndustry(res.data.industry || '');
        } else {
          setCompany(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("No company yet for this user — showing create form.");
          setCompany(null);
        } else {
          console.error("Error fetching company:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const triggerPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/companies/', {
        name,
        location,
        description,
        website,
        industry,
      });
      triggerPopup('✅ Company created!');
      setEditing(false);
      window.location.reload();
    } catch (error) {
      triggerPopup('❌ Error creating company');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/companies/${company.id}/`, {
        name,
        location,
        description,
        website,
        industry,
      });
      triggerPopup('✅ Company updated!');
      setEditing(false);
    } catch (error) {
      triggerPopup('❌ Error updating company');
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this company?');
    if (!confirm) return;

    try {
      await api.delete(`/companies/${company.id}/`);
      triggerPopup('🗑️ Company deleted!');
      setCompany(null);
    } catch (error) {
      triggerPopup('❌ Error deleting company');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;

  const isEmployerViewingOwnCompany = !id;

  const getButtonStyle = (baseStyle, hoverColor, normalColor, key) => ({
    ...baseStyle,
    backgroundColor: hoverBtn === key ? hoverColor : normalColor,
  });

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={{ ...styles.card }} className="hover-grow">
          <h2 style={styles.title}>
            {company ? 'Company Profile' : 'Create Company'}
          </h2>

          {isEmployerViewingOwnCompany ? (
            company ? (
              editing ? (
                <form onSubmit={handleUpdate} style={styles.form}>
                  <CompanyFormFields {...{ name, setName, location, setLocation, industry, setIndustry, website, setWebsite, description, setDescription }} />
                  <div style={styles.buttonRow}>
                    <button
                      type="submit"
                      style={getButtonStyle(styles.smallButton, '#1d4ed8', '#001f3f', 'save')}
                      onMouseEnter={() => setHoverBtn('save')}
                      onMouseLeave={() => setHoverBtn(null)}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      style={getButtonStyle(styles.smallButton, '#001f3f', '#1d4ed8', 'cancel')}
                      onMouseEnter={() => setHoverBtn('cancel')}
                      onMouseLeave={() => setHoverBtn(null)}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={styles.detailText}>
                  <p><strong>Company Name:</strong> {company.name}</p>
                  <p><strong>Location:</strong> {company.location}</p>
                  <p><strong>Industry:</strong> {company.industry}</p>
                  <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer" style={styles.link}>{company.website}</a></p>
                  <p><strong>Description:</strong> {company.description}</p>
                  <div style={styles.buttonRow}>
                    <button
                      style={getButtonStyle(styles.smallButton, '#1d4ed8', '#001f3f', 'edit')}
                      onMouseEnter={() => setHoverBtn('edit')}
                      onMouseLeave={() => setHoverBtn(null)}
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      style={getButtonStyle(styles.smallButton, '#001f3f', '#1d4ed8', 'delete')}
                      onMouseEnter={() => setHoverBtn('delete')}
                      onMouseLeave={() => setHoverBtn(null)}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            ) : (
              <>
                <p style={styles.emptyMessage}>You haven't created a company yet.</p>
                <form onSubmit={handleCreate} style={styles.form}>
                  <CompanyFormFields {...{ name, setName, location, setLocation, industry, setIndustry, website, setWebsite, description, setDescription }} />
                  <button
                    type="submit"
                    style={getButtonStyle(styles.buttonPrimary, '#1d4ed8', '#001f3f', 'create')}
                    onMouseEnter={() => setHoverBtn('create')}
                    onMouseLeave={() => setHoverBtn(null)}
                  >
                    Create Company
                  </button>
                </form>
              </>
            )
          ) : company ? (
            <div style={styles.detailText}>
              <p><strong>Company Name:</strong> {company.name}</p>
              <p><strong>Location:</strong> {company.location}</p>
              <p><strong>Industry:</strong> {company.industry}</p>
              <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer" style={styles.link}>{company.website}</a></p>
              <p><strong>Description:</strong> {company.description}</p>
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>Company not found.</p>
          )}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div style={popupStyles.popupOverlay}>
          <div style={popupStyles.popupCard}>{popupMessage}</div>
        </div>
      )}
    </>
  );
};

const CompanyFormFields = ({ name, setName, location, setLocation, industry, setIndustry, website, setWebsite, description, setDescription }) => (
  <>
    <label style={styles.label}>Company Name</label>
    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />

    <label style={styles.label}>Location</label>
    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={styles.input} required />

    <label style={styles.label}>Industry</label>
    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} style={styles.input} required />

    <label style={styles.label}>Website</label>
    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} style={styles.input} required />

    <label style={styles.label}>Description</label>
    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={styles.input} rows={4} required />
  </>
);

const styles = {
  pageContainer: { 
    minHeight: '100vh', 
    backgroundColor: '#f4f6f9', 
    paddingTop: '120px', 
    paddingBottom: '40px', 
    paddingLeft: '10px', 
    paddingRight: '10px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '12px', 
    padding: '24px', 
    width: '100%', 
    maxWidth: '700px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
  },
  title: { textAlign: 'center', fontSize: '24px', color: '#001f3f', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontWeight: '600', color: '#1e293b' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  buttonRow: { display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
  buttonPrimary: { color: '#fff', padding: '12px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, transition: '0.3s' },
  smallButton: { color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: 0.4, transition: '0.3s' },
  emptyMessage: { textAlign: 'center', marginBottom: '20px', color: '#555' },
  detailText: { lineHeight: '1.8', color: '#333', fontSize: '16px' },
  link: { color: '#1d4ed8', textDecoration: 'underline', wordBreak: 'break-all' },
};

const popupStyles = {
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
    color: '#16a34a',
    textAlign: 'center',
  },
};

export default CompanyPage;
