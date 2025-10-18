import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useRef, useState } from "react";

const DistributorActions = ({ contractInstance }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const batchIdRef = useRef(null);

  const confirmPickup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const _batchId = batchIdRef.current.value;
      const tx = await contractInstance.confirmPickupByDistributor(_batchId);
      await tx.wait();
      toast.success("Pickup confirmed!");
      setShowModal(false);
    } catch (err) {
      toast.error("Error confirming pickup: " + (err.reason || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={buttonStyle}>
        Distributor: Confirm Pickup
      </button>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={closeButtonStyle}>×</button>
            <h2>Confirm Produce Pickup</h2>
            <form onSubmit={confirmPickup}>
              <input type="number" ref={batchIdRef} placeholder="Batch ID" required min="0" style={inputStyle} />
              <button type="submit" disabled={loading} style={submitButtonStyle}>
                {loading ? "Confirming..." : "Confirm Pickup"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Add styles
const buttonStyle = { padding: "12px 24px", background: "#e9c46a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", margin: "10px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalContentStyle = { background: "#fff", color: "#333", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" };
const closeButtonStyle = { position: "absolute", right: "18px", top: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" };
const submitButtonStyle = { width: "100%", background: "#e9c46a", color: "#fff", border: "none", borderRadius: "5px", padding: "12px", fontSize: "16px", cursor: "pointer" };

export default DistributorActions;