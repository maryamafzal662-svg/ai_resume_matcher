import React, { useEffect, useState, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 
import Navbar from '../components/Navbar'; 

const NotificationsPage = () => { 
  const [notifications, setNotifications] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate(); 

  const fetchNotifications = useCallback(async () => { 
    try { 
      const token = localStorage.getItem('token'); 
      if (!token) { 
        navigate('/login'); 
        return; 
      } 
      const { data } = await api.get('/notifications/', { 
        headers: { Authorization: `Token ${token}` }, 
      }); 
      setNotifications(data); 
    } catch (error) { 
      console.error('Error fetching notifications:', error); 
    } finally { 
      setLoading(false); 
    } 
  }, [navigate]);  

  useEffect(() => { 
    fetchNotifications(); 
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval); 
  }, [fetchNotifications]);  

  // 🔹 Mark as read/unread 
  const toggleReadStatus = async (notif) => { 
    try { 
      const token = localStorage.getItem('token'); 
      const updated = await api.patch( 
        `/notifications/${notif.id}/`, 
        { is_read: !notif.is_read }, 
        { headers: { Authorization: `Token ${token}` } } 
      ); 
      setNotifications((prev) => 
        prev.map((n) => (n.id === notif.id ? updated.data : n)) 
      ); 
    } catch (err) { 
      console.error('Error updating notification:', err); 
    } 
  }; 

  if (loading) { 
    return <p style={{ textAlign: 'center', marginTop: 40 }}>⏳ Loading notifications...</p>; 
  } 

  return ( 
    <> 
      <Navbar /> 
      <div style={{ maxWidth: 700, margin: 'auto', padding: 20, paddingTop: 90 }}> 
        {notifications.length === 0 ? ( 
          <p style={{ textAlign: 'center', color: '#666' }}>No notifications available.</p> 
        ) : ( 
          <ul style={{ listStyle: 'none', padding: 0 }}> 
            {notifications.map((notif) => ( 
              <li 
                key={notif.id} 
                style={{ 
                  backgroundColor: notif.is_read ? '#f0f4f8' : '#fff9c4', 
                  marginBottom: 12, 
                  padding: 12, 
                  borderRadius: 6, 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                  fontSize: '15px', 
                  fontWeight: '500', 
                  cursor: 'default', 
                  transition: 'all 0.2s ease', 
                }} 
              > 
                {/* ✅ Backend se aane wala message use kar rahe hain */}
                <div>{notif.message}</div> 
                <div style={{ fontSize: '13px', marginTop: 4, color: '#444' }}>📅 {new Date(notif.created_at).toLocaleString()}</div> 

                <button 
                  onClick={() => toggleReadStatus(notif)} 
                  style={{ 
                    marginTop: 6, 
                    fontSize: '12px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#0077b6', 
                    cursor: 'pointer', 
                    textDecoration: 'underline' 
                  }} 
                > 
                  Mark as {notif.is_read ? 'Unread' : 'Read'} 
                </button> 
              </li> 
            ))} 
          </ul> 
        )} 
      </div> 
    </> 
  ); 
}; 

export default NotificationsPage;
