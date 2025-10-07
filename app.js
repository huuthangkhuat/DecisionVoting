// Contract details 
let userAccount;
let userRole; 
let web3;
const contractAddress = '0x17E353abC7361A12FdC6c76162cDfA020cC4Fe67';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"CommenceSetup","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"uint256[]","name":"_voteCounts","type":"uint256[]"}],"name":"ResultsFinalized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"string","name":"_topic","type":"string"},{"indexed":false,"internalType":"string[]","name":"_options","type":"string[]"}],"name":"SessionStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_voter","type":"address"},{"indexed":false,"internalType":"string","name":"_cid","type":"string"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterExcluded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterReinstated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"VotingEnded","type":"event"},{"inputs":[{"internalType":"string","name":"_cid","type":"string"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coordinator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentSessionId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"excludeVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getExcludedVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOptions","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPhase","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTallyComplete","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopic","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"getVoterCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"hasUserSubmitted","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ifExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"reinstateVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_finalVoteCounts","type":"uint256[]"}],"name":"setFinalResults","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"string[]","name":"_options","type":"string[]"}],"name":"startSession","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startSetup","outputs":[],"stateMutability":"nonpayable","type":"function"}];


// DOM elements
const userAddressSpan = document.getElementById('userAddress');
const userRoleSpan = document.getElementById('userRole');
const networkNameSpan = document.getElementById('networkName');
const userBalanceSpan = document.getElementById('userBalance');
const currentStatusSpan = document.getElementById('currentStatus');

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            // 1. Get user account
            userAccount = await get_current_eth_address();

            // 2. Initialize web3 and contract instance using the config file
            web3 = new Web3(window.ethereum);
            votingContract = new web3.eth.Contract(contractABI, contractAddress);

            // 3. Update UI
            updateUI();
        } catch (error) {
            console.error("User denied account access or another error occurred:", error);
            alert("Connection failed. Please check MetaMask.");
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this app.");
    }
}

// Update UI with user info and contract status
async function updateUI() {
    if (!userAccount) {
        userAddressSpan.textContent = "Not connected";
        userRoleSpan.textContent = "N/A";
        networkNameSpan.textContent = "N/A";
        userBalanceSpan.textContent = "N/A";
        currentStatusSpan.textContent = "Please connect your wallet.";
        return;
    }

    // Fetch and display user details
    userAddressSpan.textContent = userAccount;
    let networkName;
    try { 
        networkName = await get_current_network(); 
    } catch (error) { 
        console.error("Error fetching network name:", error); return; 
    }
    networkNameSpan.textContent = networkName;

    let userBalance;
    try { 
        userBalance = await get_user_balance(userAccount); userBalanceSpan.textContent = `${userBalance} ETH`; 
    } catch (error) { 
        userBalanceSpan.textContent = "Error fetching balance"; 
    }

    let coordinatorAddress; 
    try { 
        coordinatorAddress = await votingContract.methods.coordinator().call(); 
    } catch (error) { 
        console.error("Error fetching coordinator address:", error); return; 
    }

    if (userAccount.toLowerCase() === coordinatorAddress.toLowerCase()) {
        userRoleSpan.textContent = "Coordinator";
        userRole = "Coordinator";
    } else {
        userRoleSpan.textContent = "Participant";
        userRole = "Participant";
    }

    let phase;
    try {
        phase = await votingContract.methods.getPhase().call();
    } catch (error) {
        console.error("Error fetching contract phase:", error);
        return;
    }
    
    if (!phase) phase = 'Setup';
    currentStatusSpan.textContent = phase;

    loadContractData(phase);
    displayWarnings(phase);
}

// Function to load all necessary data and update UI panels
async function loadContractData(phase) {

    const sessionId = await votingContract.methods.currentSessionId().call();
    const topic = await votingContract.methods.getTopic().call();
    const options = await votingContract.methods.getOptions().call();
    
    // Set universal header data
    document.getElementById('sessionIdDisplay').textContent = sessionId;
    document.getElementById('CurrentTopic').textContent = topic;

    // Populate options list (used by Participant for selection, Admin for result display)
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="voteOption" value="${index}"> ${option}`;
        optionsContainer.appendChild(label);
    });

    // --- UI Visibility Toggles ---
    const isCoordinator = userRole === 'Coordinator';

    // Show/Hide main panels
    document.getElementById('admin-panel').style.display = isCoordinator ? 'block' : 'none';
    document.getElementById('participant-panel').style.display = isCoordinator ? 'none' : 'block';
    
    // Admin Phase Controls Visibility
    document.getElementById('setup-phase').style.display = isCoordinator && phase === 'Setup' ? 'block' : 'none';
    document.getElementById('voting-phase').style.display = isCoordinator && phase === 'Voting' ? 'block' : 'none';
    document.getElementById('reveal-phase').style.display = isCoordinator && phase === 'Reveal' ? 'block' : 'none';

    // Participant Phase Controls Visibility
    document.getElementById('participant-setup-message').style.display = !isCoordinator && phase === 'Setup' ? 'block' : 'none';
    const votingInterface = document.getElementById('voting-interface');
    votingInterface.style.display = !isCoordinator && (phase === 'Voting' || phase === 'Reveal') ? 'block' : 'none';
    
    // Show/Hide Participant sub-panels within the main interface
    document.getElementById('options-selection').style.display = !isCoordinator && phase === 'Voting' ? 'block' : 'none';
    document.getElementById('participant-results-view').style.display = !isCoordinator && phase === 'Reveal' ? 'block' : 'none';
    
    // --- Phase-specific Data Loading ---

    if (isCoordinator) {
        // Load Admin Excluded Voters List
        let excludedVoters = await votingContract.methods.getExcludedVoters().call({ from: userAccount });
        const excludedListElement = document.getElementById('excludedVotersList');
        excludedListElement.innerHTML = '';
        if (excludedVoters.length > 0) {
             excludedVoters.forEach(voter => {
                const li = document.createElement('li');
                li.textContent = voter;
                excludedListElement.appendChild(li);
            });
        } else {
            excludedListElement.textContent = "No voters are currently excluded.";
        }
        document.getElementById('voterStatusResult').style.display = 'block';
        document.getElementById('voterStatusResult').textContent = ''; // Clear result area
        
    } else { // Participant View
        document.getElementById('voterStatusResult').style.display = 'none';
        document.getElementById('participantVotingTopic').textContent = `Voting Topic: ${topic}`;

        if (phase === 'Setup') {
            document.getElementById('participantSetupStatus').textContent = `Setup is in progress for Session ${sessionId}. Please wait for the Coordinator to start the Voting phase.`;
        }
    } 
    
    // Universal Results Loading (Only relevant in Reveal)
    if (phase === 'Reveal') {
        const results = await votingContract.methods.getResults().call();
        const tallyComplete = await votingContract.methods.getTallyComplete().call(); 
        
        // Update Admin Results View
        const resultsListAdmin = document.getElementById('results-list');
        // Update Participant Results View
        const resultsListParticipant = document.getElementById('participantResultsList');
        
        resultsListAdmin.innerHTML = '';
        resultsListParticipant.innerHTML = '';

        if (!tallyComplete) {
            const pendingText = "Tally Pending: The coordinator must finalize the results.";

            // Show the action button ONLY to the Coordinator when pending
            batchRevealBtn.disabled = false;
            
            // Populate list with initial zero counts
            options.forEach((option) => {
                const li = document.createElement('li');
                li.textContent = `${option}: 0 votes`;
                resultsListAdmin.appendChild(li);
                resultsListParticipant.appendChild(li.cloneNode(true));
            });

            document.getElementById('winner').textContent = pendingText;
            document.getElementById('participantWinner').textContent = pendingText;

        } else {
            let maxVotes = 0;
            let winners = [];

            batchRevealBtn.disabled = true;
            
            options.forEach((option, index) => {
                const voteCount = results[index];
                if (voteCount > maxVotes) {
                    maxVotes = voteCount;
                    winners = [option];
                } else if (voteCount === maxVotes) {
                    winners.push(option);
                }
                const li = document.createElement('li');
                li.textContent = `${option}: ${voteCount} votes`;
                resultsListAdmin.appendChild(li);
                resultsListParticipant.appendChild(li.cloneNode(true)); // Clone for participant list
            });
            
            const winnerText = 
                maxVotes === 0 ? "No winner, no votes were casted." : 
                winners.length === 1 ? `The winner is: ${winners[0]}` : 
                `It's a tie between: ${winners.join(" and ")}`;

            document.getElementById('winner').textContent = winnerText;
            document.getElementById('participantWinner').textContent = winnerText;
        }
    }
}


// Function to display dynamic warning messages
async function displayWarnings(phase) {

    document.querySelectorAll('.warning-message').forEach(span => span.textContent = '');

    const hasCommitted = await votingContract.methods.hasUserVoted().call({ from: userAccount });
    const isExcluded = await votingContract.methods.ifExcluded().call({ from: userAccount });

    // Participant Warnings
    if (userRole === "Participant") {
        if (isExcluded) {
            document.getElementById('submitVoteBtn').disabled = true;
            document.getElementById('warning-submitVoteBtn').textContent = "You are not eligible to vote in this session.";
            return;
        } else if (hasCommitted) {
            document.getElementById('submitVoteBtn').disabled = true;
            document.getElementById('warning-submitVoteBtn').textContent = "You have already committed your vote.";
        } else {
            document.getElementById('submitVoteBtn').disabled = false;
        }
    }
}

// Initial call to check for existing connection
window.addEventListener('load', () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});