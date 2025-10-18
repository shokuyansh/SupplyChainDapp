import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from "ethers";
import React, { useRef, useState } from "react";

const VerifyProduct = ({ contractInstance }) => {
  const serialRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null); // { status, batch }
  const [loading, setLoading] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp || Number(timestamp) === 0) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getProductHistory = async (e) => {
    e.preventDefault();
    if (!contractInstance) {
      toast.error("Please connect your wallet first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const _serial = serialRef.current.value.trim();
      if (!_serial) throw new Error("Serial number is required.");
      
      const _serialHash = ethers.keccak256(ethers.toUtf8Bytes(_serial));
      
      const [verificationStatus, batchInfo] = await contractInstance.getHistory(_serialHash);
      
      setResult({
        status: verificationStatus,
        batch: batchInfo
      });
      toast.success("History retrieved!");
    } catch (error) {
      toast.error("Failed to fetch history: " + (error.reason || error.message));
      setResult(null);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusMessage = (status) => {
    switch (status) {
      case "VERIFIED_ACTIVE":
        return <h3 style={{ color: 'green' }}>✅ Verified - This product is authentic and active.</h3>;
      case "ALREADY_CONSUMED":
        return <h3 style={{ color: 'red' }}>⚠️ WARNING: This product has already been sold. This may be a counterfeit.</h3>;
      case "NOT_YET_IN_STORE":
        return <h3 style={{ color: 'orange' }}>ℹ️ Info: This product is in transit but not yet active at a retail store.</h3>;
      default:
        return <h3 style={{ color: 'red' }}>❌ INVALID: This serial number is not recognized.</h3>;
    }
  };
  
  const batchStatus = (statusInt) => {
     const statuses = ["Harvested", "Funded", "Picked Up", "Delivered (Paid)", "Denied", "Refunded"];
     return statuses[statusInt] || "Unknown";
  }
  
  const truncateAddr = (addr) => addr ? addr.substring(0, 6) + "..." + addr.substring(addr.length - 4) : "N/A";


  return (
    <>
      <button onClick={() => setShowModal(true)} style={buttonStyle}>
        Consumer: Verify Product
      </button>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={closeButtonStyle}>×</button>
            <h2>Product Tracing Details</h2>
            <form onSubmit={getProductHistory} style={{ marginBottom: "18px" }}>
              <input type="text" ref={serialRef} placeholder="Scan QR Code (Enter Serial Number)" required style={inputStyle} />
              <button type="submit" disabled={loading} style={submitButtonStyle}>
                {loading ? "Verifying..." : "Get History"}
              </button>
            </form>
            
            {result && (
              <div style={resultContainerStyle}>
                {statusMessage(result.status)}
                {result.status !== "INVALID" && (
                  <div style={detailsGridStyle}>
                    <span><strong>Product:</strong></span>
                    <span>{result.batch.produceName}</span>
                    
                    <span><strong>Batch ID:</strong></span>
                    <span>{result.batch.batchId.toString()}</span>
                    
                    <span><strong>Farm:</strong></span>
                    <span style={{ wordBreak: "break-all" }}>{result.batch.farmLocation}</span>
                    
                    <span><strong>Farmer:</strong></span>
                    <span style={{ wordBreak: "break-all" }}>{truncateAddr(result.batch.farmer)}</span>
                    
                    <span><strong>Distributor:</strong></span>
                    <span style={{ wordBreak: "break-all" }}>{truncateAddr(result.batch.distributor)}</span>
                    
                    <span><strong>Retailer:</strong></span>
                    <span style={{ wordBreak: "break-all" }}>{truncateAddr(result.batch.retailer)}</span>

                    <span><strong>Harvested:</strong></span>
                    <span>{formatDate(result.batch.harvestTimestamp)}</span>
                    
                    <span><strong>Distributor Pickup:</strong></span>
                    <span>{formatDate(result.batch.pickupTimestamp)}</span>
                    
                    <span><strong>Retailer Delivery:</strong></span>
                    <span>{formatDate(result.batch.deliveryTimestamp)}</span>
                    
                    <span><strong>Batch Status:</strong></span>
                    <span>{batchStatus(result.batch.status)} ({result.batch.isPaid ? "Paid" : "Not Paid"})</span>
                    
                    <span><strong>Certificate:</strong></span>
                    <span style={{ wordBreak: "break-all" }}>
                      {result.batch.ipfsHash !== "N/A" ? 
                        <a href={`https://ipfs.io/ipfs/${result.batch.ipfsHash}`} target="_blank" rel="noopener noreferrer">View on IPFS</a> 
                        : "N/A"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Add styles
const buttonStyle = { padding: "12px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", margin: "10px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalContentStyle = { background: "#fff", color: "#333", borderRadius: "16px", padding: "28px", width: "500px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" };
const closeButtonStyle = { position: "absolute", right: "18px", top: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" };
const submitButtonStyle = { width: "100%", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "5px", padding: "12px", fontSize: "16px", cursor: "pointer" };
const resultContainerStyle = { fontSize: "15px", background: "#f7f7fa", borderRadius: "9px", padding: "16px 14px", marginTop: "10px" };
const detailsGridStyle = { display: "grid", gridTemplateColumns: "130px 1fr", rowGap: "10px", columnGap: "16px", marginTop: '15px' };

export default VerifyProduct;