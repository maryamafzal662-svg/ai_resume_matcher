// SearchPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('search') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) fetchResults(initialQuery);
  }, [initialQuery]);

  const fetchResults = async (q) => {
    if (!q.trim()) return setResults([]);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(
        `/global-search/?search=${encodeURIComponent(q)}`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(query)}`);
    fetchResults(query);
  };

  const grouped = results.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div
      style={{
        paddingTop: 90,
        maxWidth: 1000,
        margin: '0 auto',
        padding: 20,
      }}
    >
      <form onSubmit={onSubmit} style={{ marginBottom: 18 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, companies, candidates..."
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ccc',
          }}
        />
      </form>

      {loading && <div>Loading...</div>}

      {!loading && (
        <>
          {['job', 'company', 'candidate'].map((type) =>
            grouped[type]?.length > 0 ? (
              <section key={type}>
                <h3>
                  {type.charAt(0).toUpperCase() + type.slice(1)} (
                  {grouped[type].length})
                </h3>
                <ul>
                  {grouped[type].map((item) => (
                    <li
                      key={`${type}-${item.id}`}
                      style={{ marginBottom: 8 }}
                    >
                      <Link
                        to={
                          item.type === 'job'
                            ? `/job/${item.id}` // ✅ Matches: <Route path="/job/:id" ... />
                            : item.type === 'company'
                            ? `/company/${item.id}` // ✅ Matches: <Route path="/company/:id" ... />
                            : `/candidates/${item.id}` // ✅ Matches: <Route path="/candidates/:id" ... />
                        }
                      >
                        {item.name}
                      </Link>
                      <div style={{ fontSize: 13, color: '#555' }}>
                        {item.extra}{' '}
                        {item.location ? ` | ${item.location}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )}

          {results.length === 0 && <div>No results found</div>}
        </>
      )}
    </div>
  );
};

export default SearchPage;
