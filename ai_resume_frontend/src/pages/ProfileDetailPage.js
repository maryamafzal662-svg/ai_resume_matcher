import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const ProfileDetailPage = () => {
  // States
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await api.get(`/candidates/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setCandidate(res.data);
      } catch (err) {
        console.error("Error fetching candidate profile:", err);
        setError("Failed to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id, navigate]);

  const handleJobOffer = () => {
    if (!candidate?.email) return alert("Candidate email not available");
    const subject = encodeURIComponent(`Job Offer for ${candidate.full_name}`);
    const body = encodeURIComponent(
      `Hello ${candidate.full_name},\n\n` +
        `We reviewed your profile and would like to offer you a job opportunity.\n` +
        `Please respond to discuss further details.\n\nBest Regards,\nYour Company`
    );
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  const handleDownloadResume = () => {
    if (candidate?.resume_url) {
      window.open(candidate.resume_url, "_blank");
    } else {
      alert("Resume not available.");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>⏳ Loading candidate profile...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", marginTop: 50 }}>{error}</p>;
  if (!candidate) return null;

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <h2 style={styles.title}>👤 Candidate Profile</h2>
          <p><strong>Name:</strong> {candidate.full_name}</p>
          <p><strong>Email:</strong> {candidate.email || "N/A"}</p>
          <p><strong>Phone:</strong> {candidate.phone || "N/A"}</p>
          <p><strong>Location:</strong> {candidate.location || "N/A"}</p>
          <p><strong>Profession:</strong> {candidate.profession || "N/A"}</p>
          <p><strong>Experience:</strong> {candidate.experience ? `${candidate.experience} years` : "N/A"}</p>
          {candidate.skills && candidate.skills.length > 0 && (
            <p><strong>Skills:</strong> {candidate.skills.join(", ")}</p>
          )}

          {/* Optional projects section */}
          {candidate.projects && candidate.projects.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Projects:</h3>
              <ul>
                {candidate.projects.map((proj, idx) => (
                  <li key={idx}>
                    <strong>{proj.title}</strong>: {proj.description}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Optional certifications section */}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Certifications:</h3>
              <ul>
                {candidate.certifications.map((cert, idx) => (
                  <li key={idx}>
                    {cert.name} - {cert.issuer} ({cert.year})
                  </li>
                ))}
              </ul>
            </>
          )}

          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={handleJobOffer}>
              📧 Send Job Offer
            </button>
            <button style={styles.button} onClick={handleDownloadResume}>
              📄 Download Resume
            </button>
            <button style={styles.button} onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  pageContainer: {
    minHeight: "calc(100vh - 60px)",
    paddingTop: 90,
    padding: 20,
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    maxWidth: 700,
    width: "100%",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    color: "#0f172a",
    fontSize: 22,
  },
  buttonGroup: {
    marginTop: 30,
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#001f3f",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    transition: "background-color 0.3s ease",
  },
};

export default ProfileDetailPage;
