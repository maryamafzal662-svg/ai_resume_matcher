import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFileAlt } from "react-icons/fa";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

const EmployerCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "Negotiable",
    expiry_date: "",
    skills: "",
    job_type: "On-site",
    message: ""
  });

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get("/candidates/");
        setCandidates(res.data);
      } catch (err) {
        console.error("Error fetching candidates:", err?.response?.data || err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Open Modal
  const handleOfferClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
    document.body.style.overflow = "auto";
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Offer
  const handleSubmit = async () => {
    if (!selectedCandidate) return;

    try {
      // Format expiry_date as YYYY-MM-DD (or omit if empty)
      const formattedDate = jobData.expiry_date
        ? new Date(jobData.expiry_date).toISOString().split("T")[0]
        : null;

      // ✅ SEND SKILL NAMES as strings — serializer expects List[str]
      const skillsArray =
        jobData.skills
          .split(",")
          .map(s => s.trim())
          .filter(Boolean); // removes empty strings

      const payload = {
        candidate_id: selectedCandidate.id,              // required by serializer
        title: (jobData.title || "Frontend Developer").trim(),
        description: (jobData.description || "We are looking for a skilled frontend developer.").trim(),
        location: (jobData.location || "Karachi, Pakistan").trim(),
        salary: (jobData.salary || "Negotiable").trim(),
        ...(formattedDate ? { expiry_date: formattedDate } : {}), // only send when provided
        skills: skillsArray,                             // <-- IMPORTANT
        job_type: jobData.job_type || "On-site",        // must match backend choices
        message: (jobData.message || "Hi, we are excited to offer you this opportunity!").trim()
      };

      const res = await api.post("/offer-job/", payload);

      if (res.status === 201) {
        alert("Job offer sent successfully!");
        handleCloseModal();
        setJobData({
          title: "",
          description: "",
          location: "",
          salary: "Negotiable",
          expiry_date: "",
          skills: "",
          job_type: "On-site",
          message: ""
        });
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      const msg = err?.response?.data || err?.message || err;
      console.error("Error sending job offer:", msg);
      alert("Failed to send job offer. Open Console for server details.");
    }
  };

  const inputStyle = {
    width: "100%",
    marginBottom: "10px",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  };

  if (loading) return <p className="text-center">Loading candidates…</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper no-sidebar-space" style={{ paddingTop: 80 }}>
        <h2 className="dashboard-heading text-center mb-4">All Jobseekers</h2>

        {candidates.length === 0 ? (
          <p className="text-center text-gray-500">No jobseekers found.</p>
        ) : (
          <div className="grid-container">
            {candidates.map((candidate) => {
              const resume = candidate.resume_data || {};
              const profession = resume.profession || "Not specified";

              return (
                <div key={candidate.id} className="candidate-card hover-grow">
                  <div className="candidate-header">
                    <h3>{candidate.full_name || candidate.username}</h3>
                    <p className="text-gray small">{profession}</p>
                  </div>
                  <p>📧 <strong>Email:</strong> {candidate.email}</p>
                  <p>📍 <strong>Location:</strong> {candidate.location || "Not specified"}</p>
                  <p>💼 <strong>Profession:</strong> {profession}</p>
                  <p className="resume-link">
                    <FaFileAlt style={{ color: "#ff6f61", marginRight: "8px", fontSize: "18px" }} />
                    <Link to={`/candidates/${candidate.id}`} className="dashboard-link">View Resume</Link>
                  </p>
                  {candidate.skills?.length > 0 && (
                    <p>🎯 <strong>Skills:</strong> {candidate.skills.join(", ")}</p>
                  )}
                  <div className="candidate-actions">
                    <button
                      onClick={() => handleOfferClick(candidate)}
                      className="btn-offer"
                    >
                      Offer Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Offer Job to {selectedCandidate?.full_name || selectedCandidate?.username}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Form Fields */}
            <input name="title" placeholder="Job Title" value={jobData.title} onChange={handleChange} style={inputStyle} />
            <textarea name="description" placeholder="Job Description" value={jobData.description} onChange={handleChange} style={inputStyle} />
            <input name="location" placeholder="Location" value={jobData.location} onChange={handleChange} style={inputStyle} />
            <input name="salary" placeholder="Salary" value={jobData.salary} onChange={handleChange} style={inputStyle} />
            <input type="date" name="expiry_date" value={jobData.expiry_date} onChange={handleChange} style={inputStyle} />
            <input name="skills" placeholder="Skills (comma-separated, e.g. React, Django, SQL)" value={jobData.skills} onChange={handleChange} style={inputStyle} />
            <select name="job_type" value={jobData.job_type} onChange={handleChange} style={inputStyle}>
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <textarea name="message" placeholder="Custom Message" value={jobData.message} onChange={handleChange} style={inputStyle} />

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={handleSubmit} className="btn-send">Send Offer</button>
              <button onClick={handleCloseModal} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        .candidate-card {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: transform 0.2s ease-in-out;
        }
        .candidate-card:hover { transform: translateY(-4px); }
        .dashboard-link { color: #1d4ed8; text-decoration: underline; }
        .resume-link { display: flex; align-items: center; }

        /* Custom Buttons */
        .btn-offer {
          background-color: #001f3f;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .btn-offer:hover {
          background-color: #1d4ed8;
        }

        .btn-send {
          background-color: #001f3f;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .btn-send:hover {
          background-color: #1d4ed8;
        }

        .btn-cancel {
  background-color: #1d4ed8;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.btn-cancel:hover {
  background-color: #001f3f !important;
}

      `}</style>
    </>
  );
};

export default EmployerCandidatesPage;
