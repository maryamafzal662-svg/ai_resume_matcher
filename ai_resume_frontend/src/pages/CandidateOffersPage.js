import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/Dashboard.css";

const CandidateOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get("/offers/", {
          headers: { Authorization: `Token ${token}` },
        });
        setOffers(res.data || []);
      } catch (err) {
        console.error("Error fetching offers:", err);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [token]);

  // Fetch offer detail
  const fetchOfferDetail = async (offerId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/offers/${offerId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.data) {
        setSelectedOffer(res.data);
        document.body.style.overflow = "hidden"; // prevent background scroll
      } else {
        alert("Offer details not found.");
      }
    } catch (err) {
      console.error("Error fetching offer detail:", err);
      alert("Failed to load offer details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Respond to offer
  const handleRespond = async (offerId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this offer?`)) return;
    try {
      const res = await api.patch(
        `/offers/${offerId}/respond/`,
        { status },
        { headers: { Authorization: `Token ${token}` } }
      );
      if (res.data) {
        setOffers((prev) => prev.map((o) => (o.id === res.data.id ? res.data : o)));
      }
    } catch (err) {
      console.error("Error responding:", err);
      alert("Failed to update offer status.");
    }
  };

  // Close detail popup
  const closeDetail = () => {
    setSelectedOffer(null);
    document.body.style.overflow = "auto"; // enable background scroll
  };

  if (loading) return <p className="text-center">Loading offers…</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2 className="dashboard-heading text-center mb-4">Job Offers</h2>

        {offers.length === 0 ? (
          <p className="dashboard-empty text-center">
            You have not received any job offers yet.
          </p>
        ) : (
          <div className="responsive-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="dashboard-card hover-grow">
                <h3>{offer.title || "No title"}</h3>
                <p>
                  <strong>Company:</strong>{" "}
                  {offer.company_name || (offer.company && offer.company.name) || "Unknown"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-tag status-${offer.status}`}>{offer.status}</span>
                </p>
                <p><strong>Salary:</strong> {offer.salary || "Negotiable"}</p>
                <p><strong>Type:</strong> {offer.job_type || "N/A"}</p>

                <p
                  onClick={() => fetchOfferDetail(offer.id)}
                  style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
                >
                  View detail
                </p>

                {offer.status === "pending" && (
                  <div className="dashboard-button-container" style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleRespond(offer.id, "accepted")}
                      className="dashboard-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(offer.id, "rejected")}
                      className="dashboard-button reject-button"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Popup */}
        {selectedOffer && (
          <div className="modal-overlay full-screen-overlay">
            <div className="modal-content white-popup">
              {loadingDetail ? (
                <p>Loading details…</p>
              ) : (
                <>
                  <h2>{selectedOffer.title || "No title"}</h2>
                  <p><strong>Company:</strong>{" "}
                    {selectedOffer.company_name || (selectedOffer.company && selectedOffer.company.name) || "Unknown"}
                  </p>
                  <p><strong>Description:</strong> {selectedOffer.description || "No description provided."}</p>
                  <p><strong>Location:</strong> {selectedOffer.location || "Not specified"}</p>
                  <p><strong>Salary:</strong> {selectedOffer.salary || "Negotiable"}</p>
                  <p><strong>Job Type:</strong> {selectedOffer.job_type || "N/A"}</p>
                  <p><strong>Message:</strong> {selectedOffer.message || "—"}</p>
                  <p><strong>Skills:</strong> {selectedOffer.skill_names?.join(", ") || "None specified"}</p>
                  <p><strong>Status:</strong> <span className={`status-tag status-${selectedOffer.status}`}>{selectedOffer.status}</span></p>
                  <p><small>Sent: {selectedOffer.created_at ? new Date(selectedOffer.created_at).toLocaleString() : "N/A"}</small></p>
                  {selectedOffer.responded_at && (
                    <p><small>Responded: {new Date(selectedOffer.responded_at).toLocaleString()}</small></p>
                  )}

                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <button onClick={closeDetail} className="dashboard-button">Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateOffersPage;
