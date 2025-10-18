import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const AllBatches = ({ contractInstance }) => {
  const [batches, setAllBatches] = useState([]);

  const formatDate = (timestamp) => {
    if (!timestamp || Number(timestamp) === 0) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const mapStatus = (status) => {
    const statusmap = ["HARVESTED", "FUNDED", "PICKED_UP", "DELIVERED (PAID)", "DENIED", "REFUNDED"];
    return statusmap[status] || "UNKNOWN";
  };
  
  const truncateAddr = (addr) => addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);

  useEffect(() => {
    const getAllBatches = async () => {
      if (!contractInstance) return;
      try {
        const result = await contractInstance.getAllBatches();
        const formatted = result.map((batch) => ({
          id: batch.batchId.toString(),
          name: batch.produceName,
          farmer: truncateAddr(batch.farmer),
          distributor: truncateAddr(batch.distributor),
          retailer: truncateAddr(batch.retailer),
          price: ethers.formatEther(batch.price),
          status: mapStatus(batch.status),
          isFunded: batch.isFunded ? "Yes" : "No",
          isPaid: batch.isPaid ? "Yes" : "No",
        }));
        setAllBatches(formatted.reverse()); // Show newest first
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    getAllBatches();
    
    // Optional: Set up an event listener to refresh the list
    const filter = contractInstance?.filters.BatchCreated;
    if(filter) {
      contractInstance.on(filter, getAllBatches);
      return () => contractInstance.off(filter, getAllBatches);
    }

  }, [contractInstance]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{textAlign: 'center', color: '#333'}}>All Produce Batches (Live Escrow Status)</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Product</th>
              <th style={tableHeaderStyle}>Farmer</th>
              <th style={tableHeaderStyle}>Retailer</th>
              <th style={tableHeaderStyle}>Price (ETH)</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Funded?</th>
              <th style={tableHeaderStyle}>Paid?</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableCellStyle}>{b.id}</td>
                <td style={tableCellStyle}>{b.name}</td>
                <td style={tableCellStyle}>{b.farmer}</td>
                <td style={tableCellStyle}>{b.retailer}</td>
                <td style={tableCellStyle}>{b.price}</td>
                <td style={tableCellStyle}>
                  <span style={statusBadge(b.status)}>{b.status}</span>
                </td>
                <td style={tableCellStyle}>{b.isFunded}</td>
                <td style={tableCellStyle}>{b.isPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tableHeaderStyle = { padding: "12px 15px", textAlign: "left", fontWeight: "bold", color: "#555" };
const tableCellStyle = { padding: "10px 15px", textAlign: "left", color: "#666", whiteSpace: 'nowrap' };

const statusColors = {
  "HARVESTED": "#888",
  "FUNDED": "#007bff",
  "PICKED_UP": "#e9c46a",
  "DELIVERED (PAID)": "#2a9d8f",
  "DENIED": "#e76f51",
  "REFUNDED": "#f4a261"
}

const statusBadge = (status) => ({
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  background: statusColors[status] || '#ccc',
  color: '#fff',
  fontSize: '0.85em',
  fontWeight: 'bold'
});

export default AllBatches;