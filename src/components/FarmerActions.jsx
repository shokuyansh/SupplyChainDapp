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

const FarmerActions = ({ contractInstance }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('create'); // 'create', 'refund'
  
  const nameRef = useRef(null);
  const locationRef = useRef(null);
  const ipfsRef = useRef(null);
  const distributorRef = useRef(null);
  const retailerRef = useRef(null);
  const priceRef = useRef(null);
  const serialsRef = useRef(null);
  const refundBatchIdRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'create') {
        const _produceName = nameRef.current.value;
        const _farmLocation = locationRef.current.value;
        const _ipfsHash = ipfsRef.current.value || "N/A";
        const _distributor = distributorRef.current.value;
        const _retailer = retailerRef.current.value;
        const _price = ethers.parseEther(priceRef.current.value);
        const _itemSerialHashes = hashSerials(serialsRef.current.value);
        
        if (_itemSerialHashes.length === 0) throw new Error("Please enter at least one serial number.");

        const tx = await contractInstance.createBatch(
          _produceName, _farmLocation, _ipfsHash, _distributor, _retailer, _price, _itemSerialHashes
        );
        await tx.wait();
        toast.success("Batch created successfully!");

      } else if (mode === 'refund') {
        const _batchId = refundBatchIdRef.current.value;
        const tx = await contractInstance.approveRefund(_batchId);
        await tx.wait();
        toast.success(`Refund for Batch #${_batchId} approved!`);
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
        Farmer: Actions
      </button>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={closeButtonStyle}>×</button>
            <h2>Farmer Portal</h2>
            
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-around' }}>
              <button style={tabStyle(mode === 'create')} onClick={() => setMode('create')}>Create Batch</button>
              <button style={tabStyle(mode === 'refund')} onClick={() => setMode('refund')}>Approve Refund</button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'create' && (
                <>
                  <h3>Create New Produce Batch</h3>
                  <input type="text" ref={nameRef} placeholder="Produce Name" required style={inputStyle} />
                  <input type="text" ref={locationRef} placeholder="Farm Location" required style={inputStyle} />
                  <input type="text" ref={ipfsRef} placeholder="IPFS Hash (for certificates)" style={inputStyle} />
                  <input type="text" ref={distributorRef} placeholder="Distributor Address" required style={inputStyle} />
                  <input type="text" ref={retailerRef} placeholder="Retailer Address" required style={inputStyle} />
                  <input type="number" ref={priceRef} placeholder="Price (in ETH)" required min="0" step="0.001" style={inputStyle} />
                  <textarea ref={serialsRef} placeholder="Unique serial numbers, one per line..." required rows="5" style={textAreaStyle} />
                </>
              )}
              {mode === 'refund' && (
                <>
                  <h3>Approve Retailer Refund</h3>
                  <p style={{fontSize: '0.9em', color: '#666'}}>Only do this if you have received returned goods or agree to the dispute.</p>
                  <input type="number" ref={refundBatchIdRef} placeholder="Batch ID to refund" required min="0" style={inputStyle} />
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
const buttonStyle = { padding: "12px 24px", background: "#2a9d8f", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", margin: "10px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalContentStyle = { background: "#fff", color: "#333", borderRadius: "16px", padding: "28px", width: "450px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" };
const closeButtonStyle = { position: "absolute", right: "18px", top: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" };
const inputStyle = { width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" };
const textAreaStyle = { ...inputStyle, height: "100px", fontFamily: "monospace" };
const submitButtonStyle = { width: "100%", background: "#2a9d8f", color: "#fff", border: "none", borderRadius: "5px", padding: "12px", fontSize: "16px", cursor: "pointer", marginTop: '10px' };
const tabStyle = (isActive) => ({ padding: '8px 12px', border: 'none', background: isActive ? '#2a9d8f' : '#eee', color: isActive ? '#fff' : '#333', cursor: 'pointer', borderRadius: '5px' });

export default FarmerActions;