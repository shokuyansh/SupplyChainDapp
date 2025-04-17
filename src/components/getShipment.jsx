import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from "ethers";
import React, { useRef, useState } from "react";

const GetShipment = ({ contractInstance }) => {
  const senderRef = useRef(null);
  const sidRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [shipment, setShipment] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp || Number(timestamp) === 0) return "Not Available";
    const date = new Date(Number(timestamp) * 1000);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getShipmentDetails = async (e) => {
    e.preventDefault();
    try {
      const _sender = senderRef.current.value;
      const _sid = sidRef.current.value;
      const result = await contractInstance.getShipment(_sender, _sid);
      setShipment({
        sender: result[0],
        receiver: result[1],
        pickupTime: formatDate(result[2]),
        deliveryTime: formatDate(result[3]),
        price: ethers.formatEther(result[4]),
        distance: result[5].toString(),
        status: result[6],
        isPaid: result[7],
      });
      toast.success("Shipment details fetched!");
    } catch (error) {
      toast.error("Failed to fetch shipment");
      setShipment(null);
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
        Get details
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
              padding: "32px 28px 28px 28px",
              minWidth: "400px",
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
              marginBottom: "22px",
              fontWeight: 600,
              letterSpacing: "0.02em"
            }}>Product Tracting Details</h2>
            <form onSubmit={getShipmentDetails} style={{ marginBottom: "18px" }}>
              <input
                type="text"
                ref={senderRef}
                placeholder="Sender address"
                required
                style={{
                  width: "80%",
                  padding: "8px",
                  marginRight: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px"
                }}
              />
              <input
                type="number"
                ref={sidRef}
                placeholder="SID"
                required
                style={{
                  width: "15%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px"
                }}
              />
              <button
                type="submit"
                style={{
                  marginLeft: "10px",
                  background: "#4F46E5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "8px 18px",
                  cursor: "pointer"
                }}
              >Get details</button>
            </form>
            {shipment && (
              <div style={{
                fontSize: "15px",
                background: "#f7f7fa",
                borderRadius: "9px",
                padding: "16px 14px",
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "130px 1fr",
                rowGap: "10px",
                columnGap: "16px"
              }}>
                <span><strong>Sender:</strong></span>
                <span style={{ wordBreak: "break-all" }}>{shipment.sender}</span>
                <span><strong>Receiver:</strong></span>
                <span style={{ wordBreak: "break-all" }}>{shipment.receiver}</span>
                <span><strong>PickupTime:</strong></span>
                <span>{shipment.pickupTime}</span>
                <span><strong>DeliveryTime:</strong></span>
                <span>{shipment.deliveryTime}</span>
                <span><strong>Distance:</strong></span>
                <span>{shipment.distance}</span>
                <span><strong>Price:</strong></span>
                <span>{shipment.price}</span>
                <span><strong>Status:</strong></span>
                <span>{shipment.status}</span>
                <span><strong>Paid:</strong></span>
                <span>{shipment.isPaid ? "Complete" : "Not Complete"}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GetShipment;
