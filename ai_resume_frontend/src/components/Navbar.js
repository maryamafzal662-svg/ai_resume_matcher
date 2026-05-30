// src/components/Navbar.js
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Bell } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation(); // 👈 track current page
  const timeoutRef = useRef(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get('/custom-user/', { headers: { Authorization: `Token ${token}` } });
        setUser(res.data);
      } catch (error) {
        console.error('Navbar error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    let interval;
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/notifications/', { headers: { Authorization: `Token ${token}` } });
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Fetch notifications error:', error);
      }
    };

    fetchUnread();
    interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ Reset badge when visiting notifications page
  useEffect(() => {
    if (location.pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Fetch suggestions (debounced)
  const fetchSuggestions = async (query) => {
    if (!query.trim() || !user) {
      setSuggestions([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) { setSuggestions([]); return; }
      const res = await api.get(`/global-search/?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Token ${token}` },
      });

      if (user.role === 'employer') {
        setSuggestions(res.data.filter(item => item.type === 'candidate'));
      } else {
        setSuggestions(res.data);
      }
    } catch (error) {
      console.error('Search suggestion error:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    setSuggestions([]);
  };

  const handleSuggestionClick = (item) => {
    if (item.type === 'candidate') navigate(`/candidates/${item.id}`);
    else if (item.type === 'job') navigate(`/job/${item.id}`);
    else if (item.type === 'company') navigate(`/company/${item.id}`);
    setSuggestions([]);
    setSearchQuery('');
  };

  const navBgColor = scrolled ? 'rgba(255,255,255,0.95)' : '#001f3f';
  const textColor = scrolled ? '#001f3f' : '#fff';

  if (loading) return null;

  return (
    <nav
      style={{
        backgroundColor: navBgColor,
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 999,
        transition: 'all 0.3s ease',
        overflow: 'visible'
      }}
    >
      {/* Logo + Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/dashboard" style={{ color: textColor, fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>SmartHire</Link>
        <div onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hamburger">
          <div className="bar" style={{ background: textColor }}></div>
          <div className="bar" style={{ background: textColor }}></div>
          <div className="bar" style={{ background: textColor }}></div>
        </div>
      </div>

      {/* Search Box */}
      <div className={`search-box ${isFocused ? 'focused' : ''}`} style={{ flex: 1, maxWidth: 360, margin: '0 20px', position: 'relative', zIndex: 2000 }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={user ? "Search..." : "Login to search"}
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
            style={{ color: '#000' }}
            disabled={!user}
          />
        </form>

        {suggestions.length > 0 && isFocused && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            maxHeight: 300,
            overflowY: "auto",
            zIndex: 9999,
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}>
            {suggestions.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onMouseDown={() => handleSuggestionClick(item)}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: 13, color: '#000' }}
              >
                {item.type === 'candidate' ? `${item.name} — ${item.location || ''} ${item.extra ? ' | ' + item.extra : ''}`
                  : item.type === 'job' ? `${item.name} — ${item.extra || ''} ${item.location ? ' | ' + item.location : ''}`
                  : `Company: ${item.name} — ${item.location || ''}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Links */}
      <div className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" style={{ color: textColor }}>Dashboard</Link>
        <Link to="/profile" style={{ color: textColor }}>Profile</Link>
        {user?.role === 'employer' && (
          <>
            <Link to="/company" style={{ color: textColor }}>My Company</Link>
            <Link to="/post-job" style={{ color: textColor }}>Post Job</Link>
            <Link to="/application-history" style={{ color: textColor }}>Applications</Link>
            <Link to="/candidates" style={{ color: textColor }}>Candidates</Link>
          </>
        )}
        {user?.role === 'jobseeker' && (
          <>
            <Link to="/create-resume" style={{ color: textColor }}>My Resume</Link>
            <Link to="/job-listings" style={{ color: textColor }}>Jobs</Link>
            <Link to="/recommendations" style={{ color: textColor }}>Recommendations</Link>
            <Link to="/application-history" style={{ color: textColor }}>Applications</Link>
            <Link to="/offers" style={{ color: textColor }}>Job Offers</Link>
          </>
        )}

        {/* Notifications Icon */}
        {user && (
          <Link to="/notifications" className="notification-link" onClick={() => setUnreadCount(0)}>
            <div className="notification-icon">
              <Bell size={20} color={textColor} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
          </Link>
        )}

        {user && (
          <button className={`logout-btn top ${scrolled ? 'scrolled' : ''}`} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      <style>{`
        .hamburger { display: none; flex-direction: column; cursor: pointer; }
        .hamburger .bar { width: 25px; height: 3px; margin: 4px 0; border-radius: 2px; }
        .menu { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
        .menu a { text-decoration: none; transition: transform 0.2s ease, color 0.3s; }
        .menu a:hover { transform: scale(1.05); }
        .logout-btn { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background-color: #fff; color: #001f3f; transition: all 0.3s ease; }
        .logout-btn:hover { background-color: #1d4ed8; color: #fff; }
        .logout-btn.scrolled { background-color: #001f3f; color: #fff; }
        .search-box { transition: max-width 0.3s ease; }
        .search-box.focused { max-width: 520px; }
        .search-box input { width: 100%; padding: 8px 12px; border-radius: 16px; border: 1px solid #ccc; outline: none; font-size: 13px; color: #000; }
        .notification-icon { position: relative; display: flex; align-items: center; }
        .notification-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: red;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
        }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .menu { flex-direction: column; position: absolute; top: 60px; right: 0; width: 100%; padding: 20px; background-color: rgba(0,31,63,0.95); display: none; }
          .menu.open { display: flex; }
          .menu a, .menu button { margin-bottom: 12px; }
          .search-box { max-width: 100%; margin: 0 8px; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
