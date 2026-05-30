import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { FaCamera } from 'react-icons/fa';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    profile_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false); 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await api.get('/custom-user/', {
          headers: { Authorization: `Token ${token}` },
        });

        setUser(response.data);
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          profile_image: null,
        });
        setPreviewImage(response.data.profile_image || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to fetch profile. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === 'profile_image') {
      if (files && files[0]) {
        setFormData((prev) => ({ ...prev, profile_image: files[0] }));
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviewImage(ev.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('location', formData.location);
      if (formData.profile_image) {
        data.append('profile_image', formData.profile_image);
      }

      const response = await api.patch('/custom-user/', data, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setEditMode(false);
      setPreviewImage(response.data.profile_image || null);
      setFormData((prev) => ({ ...prev, profile_image: null }));

      // ✅ Show popup instead of alert
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);

    } catch (error) {
      console.error('❌ Update failed:', error);
      alert('❌ Failed to update. Please check your inputs.');
    }
  };

  // ===== Updated triggerFileInput for desktop & mobile =====
  const triggerFileInput = async (mode) => {
    if (mode === 'camera') {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // Mobile → open camera directly
        const input = document.createElement('input');
        input.type = 'file';
        input.name = 'profile_image';
        input.accept = 'image/*';
        input.capture = 'user';
        input.style.display = 'none';
        input.onchange = (event) => handleChange(event);
        document.body.appendChild(input);
        input.click();
        setTimeout(() => input.remove(), 150);
      } else {
        // Desktop/Laptop → use webcam API
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100vw';
          overlay.style.height = '100vh';
          overlay.style.background = 'rgba(0,0,0,0.8)';
          overlay.style.display = 'flex';
          overlay.style.flexDirection = 'column';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.zIndex = '9999';

          const captureBtn = document.createElement('button');
          captureBtn.innerText = '📸 Capture';
          captureBtn.style.marginTop = '10px';
          captureBtn.style.padding = '10px 20px';
          captureBtn.style.fontSize = '16px';
          captureBtn.style.cursor = 'pointer';

          overlay.appendChild(video);
          overlay.appendChild(captureBtn);
          document.body.appendChild(overlay);

          captureBtn.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
              const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
              setFormData((prev) => ({ ...prev, profile_image: file }));
              setPreviewImage(URL.createObjectURL(file));
            }, 'image/jpeg');

            stream.getTracks().forEach(track => track.stop());
            overlay.remove();
          };
        } catch (err) {
          alert('❌ Could not access camera.');
          console.error(err);
        }
      }
    } else {
      // Upload from device
      const input = document.createElement('input');
      input.type = 'file';
      input.name = 'profile_image';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = (event) => handleChange(event);
      document.body.appendChild(input);
      input.click();
      setTimeout(() => input.remove(), 150);
    }

    setShowImageMenu(false);
  };

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          {user ? (
            <>
              <h2 style={styles.title}>👤 Your Profile</h2>

              {/* Profile Image */}
              <div style={styles.imageWrapper}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    style={styles.profileImage}
                  />
                ) : (
                  <div style={styles.placeholder}>👤</div>
                )}

                {editMode && (
                  <>
                    {/* Camera Icon */}
                    <div
                      style={styles.cameraIconLabel}
                      onClick={() => setShowImageMenu((prev) => !prev)}
                    >
                      <FaCamera size={20} color="#001f3f" />
                    </div>

                    {/* Menu */}
                    {showImageMenu && (
                      <div style={styles.menu}>
                        <div
                          style={styles.menuItem}
                          onClick={() => triggerFileInput('camera')}
                        >
                          📷 Take Photo
                        </div>
                        <div
                          style={styles.menuItem}
                          onClick={() => triggerFileInput('upload')}
                        >
                          📁 Upload from Device
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div style={styles.profileInfo}>
                {editMode ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>

                    <button style={styles.primaryButton} onClick={handleSave}>
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p><strong>Location:</strong> {user.location || 'Not provided'}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Joined:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
                    <button
                      style={styles.primaryButton}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center' }}>⏳ Loading profile...</p>
          )}
        </div>
      </div>

      {/* ✅ Popup Success Message */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupCard}>
            ✅ Profile updated successfully!
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f8fafc',
    padding: '20px',
    paddingTop: '90px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '30px 24px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: '24px',
    fontSize: '22px',
  },
  imageWrapper: {
    textAlign: 'center',
    marginBottom: 20,
    position: 'relative',
    width: 120,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #001f3f',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    backgroundColor: '#cbd5e1',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#64748b',
    fontSize: 50,
    fontWeight: 'bold',
    border: '3px solid #001f3f',
  },
  cameraIconLabel: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: 6,
    cursor: 'pointer',
    boxShadow: '0 0 5px rgba(0,0,0,0.2)',
  },
  menu: {
    position: 'absolute',
    bottom: -60,
    right: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 10,
  },
  menuItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #eee',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    width: '100%',
    fontSize: '14px',
  },
  primaryButton: {
    backgroundColor: '#001f3f',
    color: 'white',
    padding: '12px 20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },

  // ✅ Popup styles
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

export default UserProfile;
