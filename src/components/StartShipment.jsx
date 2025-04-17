import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useRef, useState } from "react";

const StartShipment = ({ contractInstance }) => {
  const receiverRef = useRef(null);
  const sidRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startShipment = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const _receiver = receiverRef.current.value;
      const _sid = sidRef.current.value;
      const tx = await contractInstance.startShipment(_receiver, _sid);
      toast.success("Shipment started successfully!");
      setShowModal(false);
    } catch (e) {
      toast.error("Error starting shipment");
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
        Start Shipment
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
            
            <form onSubmit={startShipment}>
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
                <button
                  type="button"
                  style={{
                    background: "#fff",
                    border: "none",
                    borderLeft: "1px solid #ccc",
                    padding: "0 12px",
                    cursor: "pointer"
                  }}
                >
                  <span role="img" aria-label="search">🔍</span>
                </button>
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
                {isLoading ? "Starting..." : "Start Shipment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StartShipment;
