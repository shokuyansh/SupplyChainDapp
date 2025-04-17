import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useRef, useState } from "react";

const CreateShipment = ({ contractInstance }) => {
  const receiverRef = useRef(null);
  const distanceRef = useRef(null);
  const priceRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const createShipment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const _receiver = receiverRef.current.value;
      const _distance = distanceRef.current.value;
      const _price = priceRef.current.value;

      const tx = await contractInstance.createShipment(_receiver, _distance, _price, {
        value: _price,
      });

      toast.success("Shipment created successfully!");
      setShowModal(false);
    } catch (err) {
      toast.error("Error in Creating Shipment");
      console.error(err);
    } finally {
      setLoading(false);
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
        Create Shipment
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
            
            <form onSubmit={createShipment}>
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
                  ref={distanceRef}
                  placeholder="Distance (km)"
                  required
                  min="1"
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    border: "none",
                    outline: "none"
                  }}
                />
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  background: "#f0f0f0",
                  color: "#777"
                }}>km</span>
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
                  ref={priceRef}
                  placeholder="Price (wei)"
                  required
                  min="0"
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    border: "none",
                    outline: "none"
                  }}
                />
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  background: "#f0f0f0",
                  color: "#777"
                }}>wei</span>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#4F46E5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "12px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creating..." : "Create Shipment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateShipment;
