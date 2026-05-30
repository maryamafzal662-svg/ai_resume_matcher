import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const CandidateProfileAndResumePage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        if (!token) {
          setError("User not authenticated. Please login.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const profileRes = await api.get(`/candidates/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        let resumeRes;
        try {
          resumeRes = await api.get(`/resumes/by-user/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });
        } catch {
          resumeRes = { data: null };
        }

        setProfileData({
          ...profileRes.data,
          resume: resumeRes.data || null,
        });
      } catch (err) {
        console.error("Error fetching candidate data:", err);
        setError("Failed to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id, token]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "100px" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", marginTop: "100px" }}>
        {error}
      </p>
    );
  if (!profileData)
    return (
      <p style={{ textAlign: "center", marginTop: "100px" }}>
        No candidate data found.
      </p>
    );

  const { resume } = profileData;

  return (
    <>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          {/* Profile Image */}
          {profileData.profile_image && (
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={profileData.profile_image}
                alt={`${profileData.username}'s profile`}
                style={styles.profileImage}
              />
            </div>
          )}

          {/* Basic Info */}
          <p><strong>Username:</strong> {profileData.username}</p>
          <p><strong>Email:</strong> {profileData.email || resume?.email || "—"}</p>
          <p><strong>Phone:</strong> {profileData.phone || resume?.phone || "Not Provided"}</p>
          <p><strong>Location:</strong> {profileData.location || resume?.location || "Not Provided"}</p>
          <p><strong>Role:</strong> {profileData.role || "candidate"}</p>
          <hr style={{ margin: "20px 0" }} />

          {/* Resume Details */}
          {resume ? (
            <>
              {resume.summary && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Summary:</strong>
                  <p style={{ whiteSpace: "pre-wrap" }}>{resume.summary}</p>
                </div>
              )}
              {resume.profession && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Profession:</strong>
                  <p>{resume.profession}</p>
                </div>
              )}
              {resume.education && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Education:</strong>
                  <p style={{ whiteSpace: "pre-wrap" }}>{resume.education}</p>
                </div>
              )}
              {resume.experience && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Experience:</strong>
                  <p style={{ whiteSpace: "pre-wrap" }}>{resume.experience}</p>
                </div>
              )}
              {Array.isArray(resume.skills) && resume.skills.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Skills:</strong>
                  <p>{resume.skills.join(", ")}</p>
                </div>
              )}

              {/* Certificates */}
              {resume.certificates && resume.certificates.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Certificates:</strong>
                  <ul>
                    {resume.certificates.map((cert, index) => (
                      <li key={index}>
                        {typeof cert === "string" ? cert : cert.name}
                        {cert.file && (
                          <>
                            {" "} - <a href={cert.file} target="_blank" rel="noreferrer">View</a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "red" }}>No resume found.</p>
          )}

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link to="/applications" style={styles.backButton}>
              ⬅ Back to Applications
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// ===== Responsive & clean styles =====
const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "calc(100vh - 60px)",
    backgroundColor: "#f8fafc",
    padding: "20px",
    paddingTop: "90px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "30px 24px",
    maxWidth: "900px",
    width: "100%",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #001f3f",
  },
  backButton: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#001f3f",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default CandidateProfileAndResumePage;
