import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWeb3State } from "../utils/getWeb3State";

// Import new role-based components
import FarmerActions from "./FarmerActions";
import DistributorActions from "./DistributorActions";
import RetailerActions from "./RetailerActions";
import VerifyProduct from "./VerifyProduct";
import AllBatches from "./AllBatches";

const Home = () => {
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [contractInstance, setContractInstance] = useState(null)

    const handleWallet = async () => {
        try {
            const { contractInstance, selectedAccount } = await getWeb3State();
            setSelectedAccount(selectedAccount);
            setContractInstance(contractInstance);
            toast.success(`Wallet connected: ${selectedAccount.substring(0, 6)}...`);
        } catch (error) {
            toast.error("Please install MetaMask!");
            console.error(error);
        }
    }

    useEffect(() => {
        const init = async () => {
            await handleWallet();
        };
        init();

        if (window.ethereum) {
            const accountChangeHandler = async (accounts) => {
                if (accounts.length > 0) {
                    console.log("Account changed to:", accounts[0]);
                    await handleWallet();
                } else {
                    setSelectedAccount(null);
                    setContractInstance(null);
                    toast.info("Wallet disconnected.");
                }
            };
            
            window.ethereum.on("accountsChanged", accountChangeHandler);

            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener("accountsChanged", accountChangeHandler);
                }
            };
        }
    }, []);

    return (
        <div style={{ minHeight: '100vh', padding: '20px', background: '#fcfcfc' }}>
            {/* Header */}
            <div style={headerStyle}>
                <h1>🚜 AgriChain DApp (Escrow Model)</h1>
                <button onClick={handleWallet} style={walletButtonStyle}>
                    {selectedAccount ? `${selectedAccount.substring(0, 6)}...${selectedAccount.substring(selectedAccount.length - 4)}` : "Connect Wallet"}
                </button>
            </div>

            {/* Consumer Section - Top Priority */}
            <div style={consumerSectionStyle}>
                <h2>Consumer: Track Your Produce</h2>
                <p>Scan a product's QR code to verify its authenticity and see its full journey.</p>
                <VerifyProduct contractInstance={contractInstance} />
            </div>

            {/* Actor Sections */}
            <div style={actorGridStyle}>
                <div style={actorCardStyle}>
                    <h3>Farmer Portal</h3>
                    <FarmerActions contractInstance={contractInstance} />
                </div>
                <div style={actorCardStyle}>
                    <h3>Distributor Portal</h3>
                    <DistributorActions contractInstance={contractInstance} />
                </div>
                <div style={actorCardStyle}>
                    <h3>Retailer Portal</h3>
                    <RetailerActions contractInstance={contractInstance} />
                </div>
            </div>

            {/* All Shipments */}
            <div style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid #eee' }}>
                <AllBatches contractInstance={contractInstance} />
            </div>

            <ToastContainer
                position="top-center"
                autoClose={3000}
                newestOnTop={false}
                closeOnClick
            />
        </div>
    )
}

// Styles
const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
};

const walletButtonStyle = {
    padding: '12px 24px',
    background: '#003049',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
};

const consumerSectionStyle = {
    textAlign: 'center',
    background: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
    marginBottom: '40px'
};

const actorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '40px'
};

const actorCardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

export default Home;
