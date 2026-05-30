import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const EmployerOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" }); // ✅ popup

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get("/offers/");
        setOffers(res.data);
      } catch (err) {
        console.error("Error fetching offers:", err);
        showPopup("❌ Failed to fetch offers.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return <p className="text-center">Loading…</p>;

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 80 }} className="dashboard-wrapper">
        <h2 className="dashboard-heading text-center mb-4">Sent Job Offers</h2>

        {offers.length === 0 ? (
          <p className="text-center text-gray-500">No sent offers yet.</p>
        ) : (
          <div className="grid-container">
            {offers.map((offer) => {
              const candidate = offer.candidate || {};
              const resume = offer.resume_data || {};
              const profession = resume.profession || "N/A";

              return (
                <div key={offer.id} className="candidate-card">
                  <h3>{offer.title}</h3>
                  <p><strong>To:</strong> {candidate.full_name || candidate.username}</p>
                  <p><strong>Profession:</strong> {profession}</p>
                  <p><strong>Status:</strong> {offer.status}</p>
                  <p><strong>Salary:</strong> {offer.salary || "Negotiable"}</p>
                  <p><strong>Type:</strong> {offer.job_type}</p>
                  <p><small>Sent: {new Date(offer.created_at).toLocaleString()}</small></p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Popup */}
      {popup.show && (
        <div style={styles.popupOverlay}>
          <div style={{ 
            ...styles.popupCard, 
            color: popup.type === "error" ? "#dc2626" : "#16a34a" 
          }}>
            {popup.message}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  popupOverlay: {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.3)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: 9999,
  },
  popupCard: {
    backgroundColor: "white", padding: "20px 30px", borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)", fontSize: "16px", fontWeight: "bold",
    textAlign: "center",
  },
};

export default EmployerOffersPage;
