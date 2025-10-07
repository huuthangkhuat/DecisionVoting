# Secure Blockchain Voting Platform (Commit-Reveal)

This repository contains the full stack (Frontend + Node.js Proxy) for a **Decision Voting Platform**. This Decentralized Application (DApp) uses the **Commit-Reveal** voting model, interfacing with an Ethereum smart contract for session management and relying on a **Node.js/Pinata proxy** to handle off-chain vote data storage on IPFS.

It uses **web3.js** for blockchain interaction and **MetaMask** for wallet connectivity.

---

## 🧭 Overview: Voting Phases

The platform operates through a strict **three-phase lifecycle** managed by the **Coordinator**:

| Phase | Contract Status | Coordinator Action | Participant Action |
| :--- | :--- | :--- | :--- |
| **1. Setup** | `Setup` | Define topic/options, manage voter eligibility. | Waits for the voting session to start. |
| **2. Voting** | `Voting` | Monitor votes; end the voting period. | Selects an option and **Submits Commitment** (uploads vote to IPFS and commits CID on-chain). |
| **3. Reveal** | `Reveal` | **Tally & Finalize** votes (retrieves IPFS data, calculates results, and submits tally on-chain). | Views final results. |

---

## 🛠️ Functionality and IPFS Flow

The application is structured into a Node.js backend (`server.js`) and client-side assets (`app.js`, `event_handlers.js`, `pinata.js`, etc.).

### Core Features

| Feature | Description | File |
| :--- | :--- | :--- |
| **Backend Proxy (Pinata)** | A local Node.js server acts as a proxy for Pinata interactions: uploading vote JSON to IPFS, retrieving vote data from the Pinata Gateway, and unpinning old sessions. | `server.js`, `pinata.js` |
| **Wallet Connection** | Connects to the Ethereum network via MetaMask to retrieve the user's address, network, and balance. | `metamask_helpers.js`, `app.js` |
| **Commitment Submission** | Participants upload vote data to IPFS via the proxy and submit the resulting **CID** to the smart contract via `castVote`. | `event_handlers.js`, `pinata.js` |
| **Tally & Finalize** | The Coordinator fetches all CIDs, uses the Node.js proxy to resolve the vote data from IPFS, tallies the results locally, and submits the final count on-chain via `setFinalResults`. | `event_handlers.js` |
| **Voter Management** | Coordinator functions to explicitly `excludeVoter` or `reinstateVoter` a Participant in the **Setup** phase. | `event_handlers.js` |

### Key Contract Interactions

The application communicates with the smart contract deployed at address **`0x17E353abC7361A12FdC6c76162cDfA020cC4Fe67`**:

| Action | Function | Role | Notes |
| :--- | :--- | :--- | :--- |
| Check coordinator | `coordinator()` | All | Used for role-based UI. |
| Check current phase | `getPhase()` | All | Returns one of the three phases. |
| Start voting session | `startSession(topic, options[])` | Coordinator | Moves the phase from **Setup** to **Voting**. |
| Cast a commitment | `castVote(cid)` | Participant | Commits an IPFS CID, not the direct vote option. |
| End voting | `endVoting()` | Coordinator | Moves the phase from **Voting** to **Reveal**. |
| Submit final results | `setFinalResults(counts[])` | Coordinator | Submits the off-chain tally in the **Reveal** phase. |
| Start next session | `startSetup()` | Coordinator | Moves the phase from **Reveal** back to **Setup**. |

---

## 🚀 Instructions

### Prerequisites

1.  **Node.js and npm:** Required to run the Pinata backend proxy.
2.  **MetaMask:** Browser extension installed and configured with an Ethereum account.
3.  **Contract Deployment:** The DApp is hardcoded to interact with a contract at the address **`0x17E353abC7361A12FdC6c76162cDfA020cC4Fe67`**.
4.  **Pinata API Key:** A Pinata JSON Web Token (JWT) and Gateway URL are required for the backend proxy.

### Setup and Running

#### 1. Configure and Start the Backend Proxy

The DApp relies on a local Node.js proxy to interface with Pinata for IPFS pinning and retrieval.

**A. Environment File (`.env`)**

Create a file named `.env` in the root directory (where `server.js` is located) with your Pinata credentials:
PINATA_JWT="<YOUR_PINATA_JWT_HERE>"
GATEWAY_URL="<YOUR_PINATA_GATEWAY_URL_HERE>"
PORT=3000

**B. Install Dependencies and Run**

In your terminal, navigate to the root directory, install dependencies, and start the server:

```bash
npm install 
node server.js
```

The server should start on http://localhost:3000. Keep this window open.

#### 2. Serve Frontend Files
Serve the HTML, CSS, and JavaScript files using a local web server (e.g., using VS Code Live Server or Python's http.server).

#### 3. Connect and Use
**Open in Browser:** Navigate to index.html via your local server address.

**Connect Wallet:** Click the "Connect Wallet" button and approve the connection in MetaMask.

### Usage Flow (Coordinator)
**Phase 1:** Setup: Enter a topic and a comma-separated list of options. Optionally, use the Voter Eligibility Management controls to excludeVoter or reinstateVoter participants.

**Phase 2:** Voting: Click "Start Session" to move to the Voting phase. Wait for participants to submit their commitments.

**Phase 3:** Reveal: Click "End Voting" to move to the Reveal phase. Then, click "Tally & Reveal All Votes" to trigger the automated IPFS retrieval, tally calculation, and final on-chain submission.

**Start Next Session:** Click "Start Setup Phase" to reset the contract and begin a new Setup phase. (This step also attempts to run the backend's /unpin endpoint to clear old Pinata storage).

### Usage Flow (Participant)
**Phase 1:** Setup: Wait for the Coordinator to move the session to the Voting phase.

**Phase 2:** Voting (Commitment):

Select your option using the radio buttons.

Click "Submit Commitment". This action automatically uploads your vote details to IPFS via the proxy and commits the resulting CID to the contract.

**Phase 3:** Reveal: Wait for the Coordinator to complete the Tally. Once done, the winner and final counts will be displayed.