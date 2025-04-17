import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const ShipmentCount = ({ contractInstance }) => {
  const [ShipmentCount, setShipmentCount] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getShipmentCount = async () => {
      try {
        const shipmentCount = await contractInstance.shipmentCount();
        setShipmentCount(shipmentCount);
        console.log("Shipment Count : ", shipmentCount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false when data is fetched or on error
      }
    };

    if (contractInstance) {
      getShipmentCount();
    }
  }, [contractInstance]);

  return (
    <div
      style={{
        background: "#7b68ee", // Dark Blue
        color: "#fff", // White text
        textAlign: "center",
        width: "120px", // Smaller width
        margin: "20px auto",
        paddingTop: "10px",
        paddingBottom: "15px",
        borderRadius: "10px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>
        {loading ? "Loading..." : ShipmentCount ? ShipmentCount.toString() : "N/A"}
      </div>
      <div style={{ fontSize: "0.7em", fontWeight: "bold" }}>SID</div>
    </div>
  );
};

export default ShipmentCount;
