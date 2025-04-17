import React, { useEffect } from "react";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWeb3State } from "../utils/getWeb3State";
import CreateShipment from "./CreateShipment";
import StartShipment from "./StartShipment";
import CompleteShipment from "./CompleteShipment";
import GetShipment from "./getShipment";
import AllShipment from "./GetAllShipments";
import ShipmentCount from "./ShipmentCount";
import GetShipmentCount from "./GetShipmentCount";

const Home = () => {
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [contractInstance, setcontractInstance] = useState(null)

    const handleWallet = async () => {
        try {
            const { contractInstance, selectedAccount } = await getWeb3State();
            setSelectedAccount(selectedAccount);
            setcontractInstance(contractInstance);
            console.log("Contract Instance : ", contractInstance, "Selected Account : ", selectedAccount);
            toast.success({ selectedAccount });
        } catch (error) {
            toast.error("Please install MetaMask!");
        }
    }

    useEffect(() => {
        handleWallet();

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts.length > 0) {
                    console.log("Account changed to:", accounts[0]);
                    const { contractInstance, selectedAccount } = await getWeb3State();
                    setSelectedAccount(selectedAccount);
                    setcontractInstance(contractInstance);
                }
            });
        }

        return () => {
            if (window.ethereum?.removeListener) {
                window.ethereum.removeListener("accountsChanged", handleWallet);
            }
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px'
            }}>
                <h1>Supply Chain Management</h1>
                <button 
                    onClick={handleWallet}
                    style={{
                        padding: '12px 24px',
                        background: '#003049',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                >
                    {selectedAccount ? `${selectedAccount.substring(0, 6)}...` : "Connect Wallet"}
                </button>
            </div>

            {/* Main Components Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '40px',
                marginBottom: '40px'
            }}>
                {/* Left Column */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    marginTop: '100px'
                }}>
                    <div style={{ width: '100%' }}>
                        <StartShipment contractInstance={contractInstance} />
                    </div>
                    <div style={{ width: '100%' }}>
                        <GetShipment contractInstance={contractInstance} />
                    </div>
                </div>

                {/* Center Column */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '40px'
                }}>
                    <div style={{ width: '100%' }}>
                        <CreateShipment contractInstance={contractInstance} />
                    </div>
                </div>

                {/* Right Column */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    marginTop: '100px'
                }}>
                    <div style={{ width: '100%' }}>
                        <CompleteShipment contractInstance={contractInstance} />
                    </div>
                    <div style={{ width: '100%' }}>
                        <GetShipmentCount contractInstance={contractInstance} />
                    </div>
                </div>
            </div>

            {/* Shipment Count */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '40px'
            }}>
                <ShipmentCount contractInstance={contractInstance} />
            </div>

            {/* All Shipments */}
            <div style={{ padding: '20px 0' }}>
                <AllShipment contractInstance={contractInstance} />
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
export default Home;
