import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useRef, useState } from "react";
import { ethers } from "ethers";

const hashSerials = (serials) => {
  return serials
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => ethers.keccak256(ethers.toUtf8Bytes(s)));
};

const RetailerActions = ({ contractInstance }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('fund'); // 'fund', 'activate', 'confirm', 'deny', 'consume'

  const batchIdRef = useRef(null);
  const priceRef = useRef(null);
  const serialsRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const _batchId = batchIdRef.current?.value;
    const _serials = serialsRef.current?.value;

    try {
      if (mode === 'fund') {
        const _price = ethers.parseEther(priceRef.current.value);
        const tx = await contractInstance.fundBatch(_batchId, { value: _price });
        await tx.wait();
        toast.success("Batch funded! Farmer can now ship.");
        
      } else if (mode === 'activate') {
        const _serialHashes = hashSerials(_serials);
        if (_serialHashes.length === 0) throw new Error("No serial numbers provided.");
        const tx = await contractInstance.activateItemsByRetailer(_batchId, _serialHashes);
        await tx.wait();
        toast.success("Items activated in inventory!");

      } else if (mode === 'confirm') {
        const tx = await contractInstance.confirmDelivery(_batchId);
        await tx.wait();
        toast.success("Delivery confirmed! Farmer has been paid.");

      } else if (mode === 'deny') {
        if (!window.confirm("Are you sure you want to deny this delivery? This will flag it for the farmer to issue a refund.")) {
          setLoading(false);
          return;
        }
        const tx = await contractInstance.denyDelivery(_batchId);
        await tx.wait();
        toast.warn("Delivery denied. Farmer has been notified to review for refund.");

      } else if (mode === 'consume') {
        const _serialHashes = hashSerials(_serials);
        if (_serialHashes.length === 0) throw new Error("No serial numbers provided.");
        for (const hash of _serialHashes) {
          const tx = await contractInstance.consumeItemByRetailer(hash);
          await tx.wait();
        }
        toast.success(`Consumed ${_serialHashes.length} item(s) at checkout.`);
      }
      setShowModal(false);
    } catch (err) {
      toast.error(`Error: ${err.reason || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={buttonStyle}>
        Retailer: Actions
      </button>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={closeButtonStyle}>×</button>
            <h2>Retailer Portal</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              <button style={tabStyle(mode === 'fund')} onClick={() => setMode('fund')}>1. Fund Batch</button>
              <button style={tabStyle(mode === 'activate')} onClick={() => setMode('activate')}>2. Activate Items</button>
              <button style={tabStyle(mode === 'confirm')} onClick={() => setMode('confirm')}>3. Confirm Delivery</button>
              <button style={tabStyle(mode === 'deny')} onClick={() => setMode('deny')}>3B. Deny Delivery</button>
              <button style={tabStyle(mode === 'consume')} onClick={() => setMode('consume')}>Consume (POS)</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {mode === 'fund' && (
                <>
                  <h3>Fund Batch (Escrow)</h3>
                  <input type="number" ref={batchIdRef} placeholder="Batch ID" required min="0" style={inputStyle} />
                  <input type="number" ref={priceRef} placeholder="Payment (ETH)" required min="0" step="0.001" style={inputStyle} />
                </>
              )}
              {mode === 'activate' && (
                <>
                  <h3>Activate Items</h3>
                  <input type="number" ref={batchIdRef} placeholder="Batch ID" required min="0" style={inputStyle} />
                  <textarea ref={serialsRef} placeholder="Scan items to activate..." required rows="5" style={textAreaStyle} />
                </>
              )}
              {mode === 'confirm' && (
                <>
                  <h3>Confirm Delivery (Pays Farmer)</h3>
                  <input type="number" ref={batchIdRef} placeholder="Batch ID" required min="0" style={inputStyle} />
                </>
              )}
               {mode === 'deny' && (
                <>
                  <h3>Deny Delivery (Requests Refund)</h3>
                  <input type="number" ref={batchIdRef} placeholder="Batch ID" required min="0" style={inputStyle} />
                </>
              )}
              {mode === 'consume' && (
                <>
                  <h3>Consume Item (Point of Sale)</h3>
                  <textarea ref={serialsRef} placeholder="Scan item to consume..." required rows="2" style={textAreaStyle} />
                </>
              )}
              <button type="submit" disabled={loading} style={submitButtonStyle}>
                {loading ? "Processing..." : "Submit Action"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Add styles
const buttonStyle = { padding: "12px 24px", background: "#f4a261", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", margin: "10px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalContentStyle = { background: "#fff", color: "#333", borderRadius: "16px", padding: "28px", width: "450px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" };
const closeButtonStyle = { position: "absolute", right: "18px", top: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" };
const inputStyle = { width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" };
const textAreaStyle = { ...inputStyle, height: "100px", fontFamily: "monospace" };
const submitButtonStyle = { width: "100%", background: "#f4a261", color: "#fff", border: "none", borderRadius: "5px", padding: "12px", fontSize: "16px", cursor: "pointer", marginTop: '10px' };
const tabStyle = (isActive) => ({
  padding: '8px 12px',
  border: 'none',
  background: isActive ? '#f4a261' : '#eee',
  color: isActive ? '#fff' : '#333',
  cursor: 'pointer',
  borderRadius: '5px',
  fontSize: '0.9em'
});

export default RetailerActions;