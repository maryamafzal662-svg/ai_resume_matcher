import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

const RecommendationDetailPage = () => {
  const { id } = useParams();
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/recommended-jobs/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        const jobs = response.data || [];
        const selectedJob = jobs.find((job) => String(job.id) === id);
        setJobDetail(selectedJob || null);
      } catch (err) {
        console.error("Error fetching job detail:", err);
        setJobDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id, token]);

  if (loading) return <p className="text-center mt-5">Loading job details…</p>;
  if (!jobDetail) return <p className="text-center">Job not found.</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper no-sidebar-space fade-in">
        <h2 className="dashboard-heading text-center mb-4">
          🧾 Job Recommendation Details
        </h2>

        <div className="dashboard-card shadow-sm p-4 max-w-3xl mx-auto hover-grow animated-fade">
          <h3 className="dashboard-section-title">{jobDetail.job.title}</h3>
          <p>
            <strong>Company:</strong> {jobDetail.job.company_name || "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {jobDetail.job.location || "Not specified"}
          </p>
          <p>
            <strong>Match Score:</strong> {jobDetail.match_score}%
          </p>
          <p>
            <strong>Reason:</strong> {jobDetail.reason}
          </p>

          <div className="mt-5 text-center">
            <Link
              to="/recommendations"
              className="dashboard-button"
              style={styles.button}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#001f3f")}
            >
              ⬅ Back to Recommendations
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  button: {
    backgroundColor: "#001f3f",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    marginTop: "10px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    textDecoration: "none",
  },
};

export default RecommendationDetailPage;
