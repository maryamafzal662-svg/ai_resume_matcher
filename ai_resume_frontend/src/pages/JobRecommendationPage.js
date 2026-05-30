import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const JobRecommendationPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRecommendedJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/recommended-jobs/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      let fetchedJobs = Array.isArray(response.data) ? response.data : [];

      fetchedJobs = fetchedJobs.map((rec) => ({
        ...rec,
        job: {
          ...rec.job,
          has_applied: !!rec.job.has_applied,
        },
      }));

      setJobs(fetchedJobs);
    } catch (error) {
      console.error(
        "Error fetching recommended jobs:",
        error.response?.data || error.message
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const getScoreColor = (score) => {
    if (score < 50) return "#ef4444"; // Red
    if (score < 70) return "#facc15"; // Yellow
    return "#22c55e"; // Green
  };

  if (loading)
    return <p className="text-center mt-5">Loading recommended jobs...</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper fade-in">
        <h2 className="dashboard-heading text-center mt-4">Recommended Jobs</h2>

        {jobs.length === 0 ? (
          <div className="alert alert-warning text-center">
            No recommendations found. 
          </div>
        ) : (
          <div className="row">
            {jobs.map((rec) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={rec.id}>
                <div className="dashboard-card hover-grow animated-fade d-flex flex-column justify-content-between text-center p-3">
                  {/* Score Circle */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      border: `5px solid ${getScoreColor(rec.match_score)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#333",
                      margin: "0 auto 15px auto",
                    }}
                  >
                    {rec.match_score}%
                  </div>

                  <div>
                    <h3 className="dashboard-section-title">{rec.job.title}</h3>
                    <p>
                      <strong>Company:</strong>{" "}
                      {rec.job.company_name || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {rec.job.location || "N/A"}
                    </p>
                    <p>
                      <strong>Reason:</strong> {rec.reason}
                    </p>
                  </div>

                  {/* View / Applied Button */}
                  <button
                    className="dashboard-button mt-3"
                    style={{
                      ...styles.button,
                      backgroundColor: rec.job.has_applied
                        ? "#6b7280" // Grey
                        : "#001f3f",
                      cursor: rec.job.has_applied ? "not-allowed" : "pointer",
                    }}
                    onClick={() =>
                      !rec.job.has_applied && navigate(`/job/${rec.job.id}`)
                    }
                    disabled={rec.job.has_applied}
                  >
                    {rec.job.has_applied ? "Applied" : "View Details"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  button: {
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    marginTop: "10px",
    border: "none",
    textAlign: "center",
    display: "inline-block",
    transition: "background-color 0.3s",
    textDecoration: "none",
  },
};

export default JobRecommendationPage;
