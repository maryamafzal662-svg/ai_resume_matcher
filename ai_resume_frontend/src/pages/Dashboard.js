import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

const DashboardPage = () => {
  // States
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userRes = await api.get("/custom-user/");
        const currentUser = userRes.data;
        setUser(currentUser);

        if (currentUser.role === "employer") {
          try {
            const [companyRes, jobsRes, appRes] = await Promise.allSettled([
              api.get("/companies/my-company/"),
              api.get("/job-listings/"),
              api.get("/applications/"),
            ]);

            if (companyRes.status === "fulfilled") {
              setCompany(companyRes.value.data);
            } else if (companyRes.reason?.response?.status === 404) {
              setCompany(null);
            } else {
              throw companyRes.reason;
            }

            if (jobsRes.status === "fulfilled") {
              setPostedJobs(jobsRes.value.data);
            }

            if (appRes.status === "fulfilled") {
              const filteredApps = appRes.value.data.filter(
                (app) => app.job?.owner === currentUser.id
              );
              setApplications(filteredApps);
            }
          } catch (err) {
            console.error("Employer dashboard error:", err);
            navigate("/login");
          }
        } else {
          const appRes = await api.get("/applications/");
          const filteredApps = appRes.data.filter(
            (app) =>
              app.applicant === currentUser.id ||
              app.applicant?.id === currentUser.id
          );
          setApplications(filteredApps);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-wrapper">
          <div className="dashboard-grid">
            <div className="dashboard-card full-width hover-grow">
              <p className="dashboard-empty">⏳ Loading dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <div className="dashboard-grid">
          {/*  Welcome Section with profile image */}
          <div className="dashboard-card dashboard-intro full-width hover-grow">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                justifyContent: "center",
              }}
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #001f3f",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: "#cbd5e1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#64748b",
                    fontSize: 36,
                    fontWeight: "bold",
                    border: "2px solid #001f3f",
                  }}
                >
                  👤
                </div>
              )}
              <div>
                <h2 className="dashboard-heading">
                  Welcome, {user?.full_name || user?.username || "User"} 👋
                </h2>
                <p className="dashboard-subtitle">
                  You are logged in as {user?.role || "..."}
                </p>
              </div>
            </div>
          </div>

          {/*  Profile Section */}
          <div className="dashboard-card hover-grow">
            <h3 className="dashboard-section-title">👤 My Profile</h3>
            {user ? (
              <>
                <p>
                  <strong>Username:</strong> {user.username || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {user.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone || "Not provided"}
                </p>
                <p>
                  <strong>Role:</strong> {user.role || "N/A"}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {user.date_joined
                    ? new Date(user.date_joined).toLocaleDateString()
                    : "N/A"}
                </p>
              </>
            ) : (
              <p className="dashboard-empty">User data not available.</p>
            )}
            <div className="dashboard-button-container left">
              <Link to="/profile" className="dashboard-button">
                Edit Profile
              </Link>
            </div>
          </div>

          {/*  Employer View */}
          {user?.role === "employer" && (
            <>
              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">🏢 Company Info</h3>
                {company ? (
                  <ul className="dashboard-list">
                    <li>
                      <strong>Name:</strong> {company.name}
                    </li>
                    <li>
                      <strong>Location:</strong> {company.location}
                    </li>
                    <li>
                      <strong>Industry:</strong> {company.industry}
                    </li>
                    <li>
                      <strong>Website:</strong>{" "}
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {company.website}
                      </a>
                    </li>
                  </ul>
                ) : (
                  <p className="dashboard-empty">🚫 No company profile found.</p>
                )}
                <div className="dashboard-button-container left">
                  <Link to="/company" className="dashboard-button">
                    {company ? "View / Edit Company" : "Create Company"}
                  </Link>
                </div>
              </div>

              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">📄 Job Management</h3>
                {postedJobs.length > 0 ? (
                  <ul className="dashboard-list">
                    {postedJobs.slice(0, 5).map((job) => (
                      <li key={job.id}>
                        <strong>{job.title}</strong> — {job.location}
                        <br />
                        Salary: Rs. {job.salary}
                        <br />
                        Expiry: {job.expiry_date || "Not set"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard-empty">📬 No jobs posted yet.</p>
                )}
                <div className="dashboard-button-container left">
                  <Link to="/post-job" className="dashboard-button">
                    Post New Job
                  </Link>
                </div>
              </div>

              {/*  Candidates Card */}
              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">👥 Candidates</h3>
                <p className="dashboard-subtitle">
                  View all jobseekers and offer them jobs.
                </p>
                <div className="dashboard-button-container left">
                  <Link to="/candidates" className="dashboard-button">
                    Browse Candidates
                  </Link>
                </div>
              </div>
            </>
          )}

          {/*  Jobseeker View */}
          {user?.role === "jobseeker" && (
            <>
              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">🔍 Browse Jobs</h3>
                <p className="dashboard-subtitle">
                  Explore jobs that fit your profile.
                </p>
                <div className="dashboard-button-container left">
                  <Link to="/job-listings" className="dashboard-button">
                    View Job Listings
                  </Link>
                </div>
              </div>

              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">📝 Resume</h3>
                <p className="dashboard-subtitle">Create or update your resume.</p>
                <div className="dashboard-button-container left">
                  <Link to="/create-resume" className="dashboard-button">
                    My Resume
                  </Link>
                </div>
              </div>

              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">💡 Recommendations</h3>
                <p className="dashboard-subtitle">
                  Smart job suggestions for you.
                </p>
                <div className="dashboard-button-container left">
                  <Link to="/recommendations" className="dashboard-button">
                    View Suggestions
                  </Link>
                </div>
              </div>

              {/* Job Offers Card */}
              <div className="dashboard-card hover-grow">
                <h3 className="dashboard-section-title">📨 Job Offers</h3>
                <p className="dashboard-subtitle">
                  View offers sent to you by employers.
                </p>
                <div className="dashboard-button-container left">
                  <Link to="/candidate-offers" className="dashboard-button">
                    View Job Offers
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Applications Section */}
          <div className="dashboard-card hover-grow">
            <h3 className="dashboard-section-title">📩 Recent Applications</h3>
            {applications.length > 0 ? (
              <ul className="dashboard-list">
                {applications.slice(0, 2).map((app) => (
                  <li key={app.id}>
                    {user?.role === "employer" ? (
                      <>
                        <strong>
                          {app.applicant?.full_name || app.applicant?.username}
                        </strong>{" "}
                        applied for <strong>{app.job?.title}</strong>
                        <br />
                        Status: <strong>{app.status}</strong>
                      </>
                    ) : (
                      <>
                        Job ID: {app.job} — <strong>{app.status}</strong>
                      </>
                    )}
                    <div className="dashboard-button-container left">
                      <Link
                        to={`/applications/${app.id}`}
                        className="dashboard-button"
                      >
                        View Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty">
                {user?.role === "employer"
                  ? "View applications submitted by jobseekers to your posted jobs."
                  : "📬 You have not submitted any applications yet."}
              </p>
            )}
            <div className="dashboard-button-container left">
              <Link to="/application-history" className="dashboard-button">
                View Applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/*  Chatbot Button */}
      <div
        className="ai-chatbot-float"
        title="Ask AI Assistant"
        onClick={() => setShowChatbot(true)}
      >
        <div className="ai-chatbot-icon">
          <span className="sparkle">✦</span>
          <span className="dot">🤖</span>
        </div>
      </div>

      {/*  Chatbot Modal */}
      {showChatbot && (
        <div className="chatbot-overlay" onClick={() => setShowChatbot(false)}>
          <div
            className="chatbot-modal"
            onClick={(e) => e.stopPropagation()} // Stop closing on inside click
          >
            <div className="chatbot-header">
              <h3>🤖 AI Assistant</h3>
              <button className="close-btn" onClick={() => setShowChatbot(false)}>
                ✖
              </button>
            </div>
            <div className="chatbot-body">
              <iframe
                src="/chatbot"
                title="Chatbot"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
