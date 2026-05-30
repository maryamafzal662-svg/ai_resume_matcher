import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const JobseekerOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("#0f172a"); 
  const token = localStorage.getItem("token");

  //  Popup show function
  const showPopupMessage = (message, color = "#0f172a") => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get("/offers/", {
        headers: { Authorization: `Token ${token}` },
      });
      setOffers(res.data);
    } catch (e) {
      console.error(e);
      showPopupMessage("⚠️ Failed to load offers. Please try again.", "#dc2626");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line
  }, []);

  const act = async (id, action, companyName) => {
    try {
      const res = await api.patch(
        `/offers/${id}/action/`,
        { action },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      // update list
      setOffers((prev) => prev.map((o) => (o.id === id ? res.data : o)));

      // ✅ Popup messages
      if (action === "accept") {
        showPopupMessage(
          `✅ The company "${companyName}" will contact you soon via email.`,
          "#16a34a"
        );
      } else if (action === "reject") {
        showPopupMessage("❌ You have rejected this job offer.", "#dc2626");
      }
    } catch (e) {
      console.error(e);
      showPopupMessage("⚠️ Action failed. Please try again.", "#dc2626");
    }
  };

  if (loading) return <p className="text-center">Loading offers…</p>;

  return (
    <>
      <Navbar />
      <div
        className="dashboard-wrapper no-sidebar-space"
        style={{ paddingTop: 80 }}
      >
        <h2 className="dashboard-heading text-center mb-4">My Job Offers</h2>

        {offers.length === 0 ? (
          <p className="text-center text-gray-500">No job offers yet.</p>
        ) : (
          <div className="grid-container">
            {offers.map((o) => (
              <div key={o.id} className="candidate-card hover-grow">
                <div className="candidate-header">
                  <h3>{o.job?.title}</h3>
                  <p className="text-gray small">{o.job?.company_name}</p>
                </div>

                <p>
                  📍 <strong>Location:</strong> {o.job?.location}
                </p>
                <p>
                  💸 <strong>Salary:</strong> {o.job?.salary}
                </p>
                <p>
                  🏷️ <strong>Type:</strong> {o.job?.job_type}
                </p>
                {o.job?.skill_names?.length > 0 && (
                  <p>
                    🎯 <strong>Skills:</strong>{" "}
                    {o.job.skill_names.join(", ")}
                  </p>
                )}
                <p>📝 <strong>Message:</strong> {o.message || "—"}</p>
                <p>⏱️ <strong>Status:</strong> {o.status}</p>

                <div
                  className="candidate-actions"
                  style={{ gap: 10, marginTop: 10 }}
                >
                  <Link
                    to={`/job/${o.job?.id}`}
                    className="dashboard-link"
                  >
                    View Job
                  </Link>
                  {o.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          act(o.id, "accept", o.job?.company_name)
                        }
                        className="offer-job-button"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => act(o.id, "reject", o.job?.company_name)}
                        className="cancel-btn"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Popup for All Messages */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={{ ...styles.popupCard, color: popupColor }}>
            {popupMessage}
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
        .offer-job-button {
          background: #001f3f;
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }
        .offer-job-button:hover { background: #1d4ed8; }
        .dashboard-link { color: #1d4ed8; text-decoration: underline; }
        .cancel-btn {
          background: #ccc; padding: 8px 14px; border: none; border-radius: 8px;
        }
      `}</style>
    </>
  );
};

const styles = {
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  popupCard: {
    backgroundColor: "white",
    padding: "20px 30px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default JobseekerOffersPage;
