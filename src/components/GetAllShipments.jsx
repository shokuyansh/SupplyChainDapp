import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const AllShipment = ({ contractInstance }) => {
  const [shipments, setAllshipments] = useState([]);

  const formatDate = (timestamp) => {
    if (!timestamp || Number(timestamp) === 0) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const mapStatus = (status) => {
    const statusmap = ["PENDING", "IN-TRANSIT", "DELIVERED"];
    return statusmap[status] || "UNKNOWN";
  };

  useEffect(() => {
    const getAllShipment = async () => {
      try {
        const result = await contractInstance.getAllTransactions();
        const formatted = result.map((shipment, i) => ({
          index: shipment.index.toString(),
          sender: shipment.sender.substring(0, 10) + "...",
          receiver: shipment.reciever.substring(0, 10) + "...",
          pickupTime: formatDate(shipment.pickupTime),
          deliveryTime: formatDate(shipment.deliveryTime),
          price: ethers.formatEther(shipment.price),
          distance: shipment.distance.toString() + " Km",
          status: mapStatus(shipment.status),
          isPaid: shipment.isPaid ? "Completed" : "Not Complete",
        }));
        setAllshipments(formatted);
      } catch (error) {
        console.error(error);
      }
    };

    if (contractInstance) {
      getAllShipment();
    }
  }, [contractInstance]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>Sender</th>
              <th style={tableHeaderStyle}>Receiver</th>
              <th style={tableHeaderStyle}>PickupTime</th>
              <th style={tableHeaderStyle}>Distance</th>
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Delivery Time</th>
              <th style={tableHeaderStyle}>Paid</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableCellStyle}>{s.sender}</td>
                <td style={tableCellStyle}>{s.receiver}</td>
                <td style={tableCellStyle}>{s.pickupTime === 0 ? "N/A" : s.pickupTime}</td>
                <td style={tableCellStyle}>{s.distance}</td>
                <td style={tableCellStyle}>{s.price}</td>
                <td style={tableCellStyle}>{s.deliveryTime === 0 ? "N/A" : s.deliveryTime}</td>
                <td style={tableCellStyle}>{s.isPaid}</td>
                <td style={tableCellStyle}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontWeight: "bold",
  color: "#555",
};

const tableCellStyle = {
  padding: "10px 15px",
  textAlign: "left",
  color: "#666",
};

export default AllShipment;
