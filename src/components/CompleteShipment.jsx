import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useRef, useState } from "react";

const CompleteShipment = ({ contractInstance }) => {
  const receiverRef = useRef(null);
  const sidRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const completeShipment = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const _receiver = receiverRef.current.value;
      const _sid = sidRef.current.value;
      const tx = await contractInstance.completeShipment(_receiver, _sid);
      toast.success("Shipment completed successfully!");
      setShowModal(false);
    } catch (e) {
      toast.error("Error completing shipment");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        style={{
          padding: "12px 24px",
          background: "#4F46E5",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          margin: "40px auto",
          display: "block"
        }}
        onClick={() => setShowModal(true)}
      >
        Complete Shipment
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              width: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                right: "18px",
                top: "16px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#888"
              }}
              aria-label="Close"
            >×</button>
            <h2 style={{
              textAlign: "center",
              marginBottom: "20px",
              fontWeight: 500,
              fontSize: "18px"
            }}>Product Tracting Details</h2>
            
            <form onSubmit={completeShipment}>
              <div style={{ 
                display: "flex", 
                marginBottom: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                overflow: "hidden" 
              }}>
                <input
                  type="text"
                  ref={receiverRef}
                  placeholder="Receiver address"
                  required
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    border: "none",
                    outline: "none"
                  }}
                />
              </div>
              
              <div style={{ 
                display: "flex", 
                marginBottom: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                overflow: "hidden" 
              }}>
                <input
                  type="number"
                  ref={sidRef}
                  placeholder="SID"
                  required
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    border: "none",
                    outline: "none"
                  }}
                />
               
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  background: "#4F46E5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "12px",
                  fontSize: "16px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Processing..." : "Complete Shipment"}
              </button>
            </form>
            
            {/* Optional: Show confirmation message after completion */}
            {/* You could add a state variable to track successful completion and show confirmation here */}
          </div>
        </div>
      )}
    </>
  );
};

export default CompleteShipment;
