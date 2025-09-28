# DevBlockChain: Decision Voting Platform

This repository contains the front-end code for a **Decision Voting Platform**, a Decentralized Application (DApp) that interfaces with an Ethereum smart contract for managing voting sessions. It uses **web3.js** for blockchain interaction and **MetaMask** for wallet connectivity.

---

## 🧭 Overview

The DApp allows a designated **Coordinator** to manage the lifecycle of a voting session—from setup to result revelation. **Participants** can connect their wallets, view the current voting topic and options, and cast a single vote during the active **Voting** phase. All interactions, role verification, and status updates are handled by communicating directly with the underlying smart contract.

---

## 🎭 Roles

The application defines two primary roles based on the smart contract's `coordinator` address:

| Role | Description |
| :--- | :--- |
| **Coordinator** | The administrative user responsible for setting up and controlling the voting session lifecycle (e.g., starting setup, starting voting, ending voting). |
| **Participant** | A regular user who is eligible to view the voting topic, options, and submit a single vote. |

---

## 🛠️ Functionality

The application is structured into JavaScript files (`app.js`, `event_handlers.js`, `metamask_helpers.js`) and an HTML file (`index.html`).

### Core Features

| Feature | Description | File |
| :--- | :--- | :--- |
| **Wallet Connection** | Connects to the Ethereum network via MetaMask to retrieve the user's address, network, and balance. | `metamask_helpers.js`, `app.js` |
| **Role-Based UI** | Dynamically adjusts the interface and available actions based on whether the connected user is the Coordinator or a Participant. | `app.js` |
| **Session Management** | Coordinator functions to start a new session setup, define a new voting topic and options, and end the current voting period. | `event_handlers.js` |
| **Voter Management** | Coordinator functions to temporarily `exclude` or `reinstate` a Participant from the current session. | `event_handlers.js` |
| **Voting** | Participants can cast a vote for one of the available options during the **Voting** phase. | `event_handlers.js` |
| **Status Display** | Displays the current contract phase (**Setup**, **Voting**, or **Reveal**) and conditionally shows relevant data (e.g., excluded voters, current results). | `app.js` |
| **Real-time Feedback**| Logs, alerts, and updates the UI based on events emitted by successful contract transactions. | `event_handlers.js` |

### Key Contract Interactions

The application communicates with a smart contract (located at `0x20F6F589e184665d62922f3Be5fC4E6526e04331`):

| Action | Function | Role |
| :--- | :--- | :--- |
| Check coordinator | `coordinator()` | All |
| Check current phase | `getPhase()` | All |
| Start new session setup | `startSetup()` | Coordinator |
| Start voting session | `startSession(topic, options[])` | Coordinator |
| End voting | `endVoting()` | Coordinator |
| Cast a vote | `castVote(optionIndex)` | Participant |
| View my vote | `viewMyVote()` | Participant |
| Exclude/Reinstate voter | `excludeVoter(address)`, `reinstateVoter(address)` | Coordinator |
| View results | `getResults()` | All (in Reveal phase) |

---

## 🚀 Instructions

### Prerequisites

1.  **MetaMask:** You must have the MetaMask browser extension installed and configured with an Ethereum account.
2.  **Web3.js Dependency:** The project relies on the bundled `web3.min.js` file, which is included in the directory.
3.  **Contract Deployment:** The DApp is hardcoded to interact with a contract at the address `0x20F6F589e184665d62922f3Be5fC4E6526e04331`. Ensure the corresponding contract has been deployed to your connected network.

### Setup and Running

1.  **Host Files:** Serve the HTML, CSS, and JavaScript files using a local web server (e.g., using VS Code Live Server or Python's `http.server`).
2.  **Open in Browser:** Navigate to `index.html` via your local server address.
3.  **Connect Wallet:** Click the **"Connect Wallet"** button and approve the connection in MetaMask. The UI will automatically update based on your account and the contract's current phase.

### Usage Flow (Coordinator)

1.  **Connect Wallet:** Ensure your connected address is the Coordinator.
2.  **Setup Phase:** Enter a **topic** and a comma-separated list of **options** in the text fields.
3.  **Start Session:** Click **"Start Session"**. Approve the transaction in MetaMask. This moves the contract to the **Voting** phase.
4.  **(Optional) Voter Management:** In the Setup phase, use **"Exclude Voter"** or **"Reinstate Voter"** to manage participants.
5.  **End Voting:** Once voting is complete, click **"End Voting"**. This moves the contract to the **Reveal** phase and displays the results.
6.  **Start Next Setup:** Click **"Start Setup Phase"** to clear results and begin the setup for a new session.

### Usage Flow (Participant)

1.  **Connect Wallet:** Ensure your connected address is a Participant.
2.  **Wait for Voting:** Wait for the Coordinator to start the **Voting** phase.
3.  **Vote:** Select a radio button for your preferred option.
4.  **Submit Vote:** Click **"Submit Vote"** and approve the transaction in MetaMask.
5.  **View Vote:** If you have voted, your selection will be displayed. You cannot vote again in the current session.