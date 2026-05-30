import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import '../styles/Dashboard.css';

const CreateResumePage = () => {
  const [formData, setFormData] = useState({
    profession: "",
    education: "",
    experience: "",
    skills: [],
  });
  const [uploadFiles, setUploadFiles] = useState([]); 
  const [existingCerts, setExistingCerts] = useState([]); 
  const [originalData, setOriginalData] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [resumeExists, setResumeExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  //  Popup state
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const showNotification = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/resumes/my/", {
        headers: { Authorization: `Token ${token}` },
      });

      setFormData({
        profession: res.data.profession || "",
        education: res.data.education || "",
        experience: res.data.experience || "",
        skills: Array.isArray(res.data.skills) ? res.data.skills : [],
      });

      setExistingCerts(Array.isArray(res.data.certificates) ? res.data.certificates : []);

      setOriginalData({
        profession: res.data.profession || "",
        education: res.data.education || "",
        experience: res.data.experience || "",
        skills: Array.isArray(res.data.skills) ? res.data.skills : [],
      });

      setResumeExists(true);
      setEditMode(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setResumeExists(false);
        setFormData({ profession: "", education: "", experience: "", skills: [] });
        setExistingCerts([]);
      } else {
        console.error("API error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificates") {
      const arr = files ? Array.from(files) : [];
      setUploadFiles(arr);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const sendFormData = async (url, method) => {
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("profession", formData.profession);
    fd.append("education", formData.education);
    fd.append("experience", formData.experience);
    formData.skills.forEach((skill) => fd.append("skills", skill));
    return api[method](url, fd, {
      headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" },
    });
  };

  const uploadCertificates = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return null;
    const token = localStorage.getItem("token");
    const fd = new FormData();
    uploadFiles.forEach((f) => fd.append("certificates", f));
    try {
      const res = await api.post("/resumes/my/certificates/", fd, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" },
      });
      
      const newCerts = res.data.map((c, index) => ({
        ...c,
        file_name: uploadFiles[index]?.name || `Certificate ${c.id}`
      }));
      setExistingCerts((prev) => [...prev, ...newCerts]);
      setUploadFiles([]);
      return res;
    } catch (err) {
      console.error("Upload certificates error:", err);
      showNotification("❌ Failed to upload certificates");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendFormData("/resumes/", "post");
      await uploadCertificates();
      await fetchResume();
      setEditMode(false);
      showNotification("✅ Resume created successfully!");
    } catch (err) {
      console.error("❌ Error creating resume:", err);
      showNotification("❌ Failed to create resume");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await sendFormData("/resumes/my/", "patch");
      await uploadCertificates();
      await fetchResume();
      setEditMode(false);
      showNotification("✅ Resume updated successfully!");
    } catch (err) {
      console.error("❌ Update failed:", err);
      showNotification("❌ Failed to update resume");
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditMode(false);
    setUploadFiles([]);
    showNotification("ℹ️ Edit cancelled");
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete("/resumes/my/", {
        headers: { Authorization: `Token ${token}` },
      });
      setFormData({ profession: "", education: "", experience: "", skills: [] });
      setExistingCerts([]);
      setUploadFiles([]);
      setResumeExists(false);
      setEditMode(false);
      showNotification("✅ Resume deleted successfully!");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      showNotification("❌ Failed to delete resume");
    }
  };

  
  const handleDeleteCertificate = async (certId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/resumes/certificates/${certId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setExistingCerts((prev) => prev.filter((c) => c.id !== certId));
      showNotification("✅ Certificate deleted");
    } catch (err) {
      console.error("Failed to delete certificate:", err);
      showNotification("❌ Failed to delete certificate");
    }
  };

  const buttonStyle = (bg) => ({
    backgroundColor: bg,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: isMobile ? "12px" : "10px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
    margin: "8px 8px 0 0",
  });

  return (
    <>
      <Navbar />

      <div style={{
        backgroundColor: "#f4f8ff",
        minHeight: "100vh",
        paddingTop: "100px",
        paddingBottom: "80px",
        display: "flex",
        justifyContent: "center",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}>
        <div className="hover-grow" style={{ maxWidth: "700px", width: "100%", padding: "30px 20px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#001f3f" }}>
            Resume
          </h2>

          {loading ? (
            <p>⏳ Loading...</p>
          ) : resumeExists && !editMode ? (
            <>
              <p><strong>Profession:</strong> <br />{formData.profession || "Not provided"}</p>
              <p><strong>Education:</strong> <br />{formData.education || "Not provided"}</p>
              <p><strong>Experience:</strong> <br />{formData.experience || "Not provided"}</p>
              <p><strong>Skills:</strong> <br />{formData.skills.length > 0 ? formData.skills.join(", ") : "None"}</p>

              <div style={{ marginTop: 8 }}>
                <strong>Certificates:</strong>
                {existingCerts.length > 0 ? (
                  <ul>
                    {existingCerts.map((c) => (
                      <li key={c.id}>
                        <a href={c.file} target="_blank" rel="noreferrer">{c.file_name || `Certificate ${c.id}`}</a>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(c.id)}
                          style={{ marginLeft: "10px", color: "red", border: "none", background: "transparent", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (<div>No certificates uploaded</div>)}
              </div>

              <div style={{ display: isMobile ? "block" : "flex", gap: "8px" }}>
                <button style={buttonStyle("#001f3f")} onClick={() => setEditMode(true)}>Edit</button>
                <button className="delete" style={buttonStyle("#1d4ed8")} onClick={handleDelete}>Delete</button>
              </div>
            </>
          ) : (
            <form onSubmit={resumeExists ? handleUpdate : handleSubmit}>
              <div className="form-group mb-3">
                <label><strong>Profession</strong></label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc", padding: "10px" }}
                />
              </div>
              <div className="form-group mb-3">
                <label><strong>Education</strong></label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows="5"
                  required
                  style={{ width: "100%", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc", padding: "10px" }}
                />
              </div>
              <div className="form-group mb-3">
                <label><strong>Experience</strong></label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="5"
                  required
                  style={{ width: "100%", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc", padding: "10px" }}
                />
              </div>
              <div className="form-group mb-3">
                <label><strong>Skills</strong></label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Type a skill"
                    style={{ flexGrow: 1, borderRadius: "8px", border: "1px solid #ccc", padding: "10px" }}
                  />
                  <button type="button" onClick={handleAddSkill} style={buttonStyle("#001f3f")}>+</button>
                </div>
                <div className="skill-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="badge bg-secondary me-1"
                      style={{
                        padding: "8px",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "14px",
                          lineHeight: "14px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#d9534f",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={`Remove skill ${skill}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group mb-3">
                <label><strong>Upload Certificates (PDF) </strong></label>
                <input
                  type="file"
                  name="certificates"
                  accept="application/pdf"
                  multiple
                  onChange={handleChange}
                  style={{ marginTop: "8px" }}
                />
              </div>

              <div style={{ display: isMobile ? "block" : "flex", gap: "8px", marginTop: "12px" }}>
                <button type="submit" style={buttonStyle("#001f3f")}>
                  {resumeExists ? "Update Resume" : "Create Resume"}
                </button>
                {resumeExists && (
                  <button type="button" className="delete" style={buttonStyle("#1d4ed8")} onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

     
      {showPopup && (
        <div style={popupStyles.popupOverlay}>
          <div style={popupStyles.popupCard}>
            {popupMessage}
          </div>
        </div>
      )}
    </>
  );
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

export default CreateResumePage;
