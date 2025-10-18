# AgriChain - Blockchain Supply Chain for Agricultural Produce

AgriChain is a Decentralized Application (DApp) built on the Ethereum blockchain to bring transparency, security, and efficiency to the agricultural supply chain. It addresses issues like lack of traceability, delayed payments for farmers, and counterfeit products by creating an immutable, end-to-end record for produce batches from farm to consumer.

This project implements a secure **Escrow Model** managed by a Solidity smart contract, ensuring farmers are paid promptly upon verified delivery, while also incorporating **item-level tracking** to prevent counterfeiting via QR code cloning.

## Problem Addressed

* **Lack of Transparency:** Consumers often lack reliable information about the origin and journey of their food.
* **Payment Delays:** Farmers face delays in receiving payments due to complex invoicing and disputes.
* **Counterfeiting:** It's easy to mislabel non-organic or lower-quality produce with fake credentials.
* **Inefficiency:** Manual record-keeping and dispute resolution slow down the supply chain.

## Features

* **Role-Based Access Control:** Distinct actions for Farmer, Distributor, and Retailer enforced by the smart contract.
* **Secure Escrow Payments:** Retailer funds are locked in the smart contract upon order and automatically released to the Farmer upon confirmed delivery.
* **Delivery Dispute Mechanism:** Retailers can deny delivery, flagging the batch for the Farmer to approve a refund.
* **Item-Level Tracking & Anti-Counterfeiting:** Each item receives a unique serial number (hashed on-chain). Consumers can verify authenticity, and the system prevents duplicate scans of consumed items.
* **Immutable Ledger:** All batch creation and status updates are recorded permanently on the blockchain.
* **Consumer Verification:** Anyone can scan a product's unique QR code (serial) to view its verified history via the DApp.
* **Real-time Status Updates:** View the current status of all batches (Harvested, Funded, Picked Up, Delivered, Denied, Refunded).

## Tech Stack

* **Blockchain:** Ethereum (designed for Sepolia/Holesky testnets or compatible EVM chains)
* **Smart Contract:** Solidity (`AgriChainEscrow.sol`)
* **Frontend:** React.js
* **Wallet Interaction:** ethers.js
* **Wallet:** MetaMask (or any browser-injected `window.ethereum` compatible wallet)
* **Development Environment:** Vite
* **Notifications:** React Toastify

## Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn
* MetaMask browser extension installed

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

1.  **Deploy the Smart Contract:**
    * Compile `src/constant/supplychain.sol` (which contains `AgriChainEscrow`) using Remix IDE or Hardhat.
    * Deploy the compiled contract to an Ethereum testnet (e.g., Sepolia).
    * Copy the deployed contract address.
2.  **Update Contract Address:**
    * Open `src/utils/getWeb3State.jsx`.
    * Replace the placeholder value of `contractAddress` with your newly deployed contract address.
3.  **Update ABI:**
    * After compiling, copy the ABI (Application Binary Interface) of the `AgriChainEscrow` contract.
    * Replace the entire contents of `src/constant/abi.json` with the new ABI.
4.  **Setup MetaMask:**
    * Add the testnet you deployed to (e.g., Sepolia) to MetaMask.
    * Create at least 3 accounts for testing: Farmer, Distributor, Retailer.
    * Obtain test ETH for these accounts from a faucet for the chosen testnet.

### Running the Application

```bash
npm run dev
# or
yarn dev