import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useRef } from "react";

const GetShipmentCount = ({ contractInstance }) => {
  const senderRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [shipmentCount, setShipmentCount] = useState(null);

  const getshipmentcount = async (e) => {
    try {
      e.preventDefault();
      const _sender = senderRef.current.value;
      const result = await contractInstance.getShipmentCount(_sender);
      setShipmentCount(result.toString());
      toast.success("Shipment count retrieved!");
    } catch (err) {
      toast.error("Failed to get shipment count");
      console.error(err);
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
        Get Shipment Count
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
            
            <div style={{ 
              display: "flex", 
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              overflow: "hidden" 
            }}>
              <input
                type="text"
                ref={senderRef}
                placeholder="Sender address"
                required
                style={{
                  flexGrow: 1,
                  padding: "10px",
                  border: "none",
                  outline: "none"
                }}
              />
              <button
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
              onClick={getshipmentcount}
              style={{
                width: "100%",
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                padding: "12px",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "15px"
              }}
            >
              Get details
            </button>
            
            {shipmentCount !== null && (
              <div style={{
                fontSize: "14px",
                lineHeight: "1.7"
              }}>
                <div>Sender: {senderRef.current.value.substring(0, 30)}...</div>
                <div>Shipment Count: {shipmentCount}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GetShipmentCount;
