// app.js

// Contract details 
const contractAddress = '0x20F6F589e184665d62922f3Be5fC4E6526e04331';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"CommenceSetup","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"string","name":"_topic","type":"string"},{"indexed":false,"internalType":"string[]","name":"_options","type":"string[]"}],"name":"SessionStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterExcluded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterReinstated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"VotingEnded","type":"event"},{"inputs":[{"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coordinator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentSessionId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"excludeVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getExcludedVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOptions","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPhase","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopic","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ifExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"reinstateVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"string[]","name":"_options","type":"string[]"}],"name":"startSession","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startSetup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"viewMyVote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"voteStatus","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
let votingContract;
let userAccount;
let userRole; 
let web3; 

// DOM elements
const userAddressSpan = document.getElementById('userAddress');
const userRoleSpan = document.getElementById('userRole');
const networkNameSpan = document.getElementById('networkName');
const currentStatusSpan = document.getElementById('currentStatus');

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Get user account
            userAccount = await get_current_eth_address();

            // Initialize web3 and contract instance
            web3 = new Web3(window.ethereum);
            votingContract = new web3.eth.Contract(contractABI, contractAddress);

            // Update UI with user info and contract status
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
    // If user is not connected, show default messages
    if (!userAccount) {
        userAddressSpan.textContent = "Not connected";
        userRoleSpan.textContent = "N/A";
        networkNameSpan.textContent = "N/A";
        currentStatusSpan.textContent = "Please connect your wallet.";
        return;
    }

    // Display user address
    userAddressSpan.textContent = userAccount;
    
    // Set network name
    let networkName;
    try {
        networkName = await get_current_network();
    } catch (error) {
        console.error("Error fetching network name:", error);
        alert("Failed to fetch network data. Please ensure you're connected to the correct network.");
        return;
    }

    networkNameSpan.textContent = networkName;

    // Get coordinator address
    let coordinatorAddress; 

    // Fetch coordinator address from contract
    try {
        coordinatorAddress = await votingContract.methods.coordinator().call();
    } catch (error) {
        console.error("Error fetching coordinator address:", error);
        alert("Failed to fetch contract data. Please ensure you're connected to the correct network.");
        return;
    }

    // Determine user role
    if (userAccount.toLowerCase() === coordinatorAddress.toLowerCase()) {
        userRoleSpan.textContent = "Coordinator";
        userRole = "Coordinator";
    } else {
        userRoleSpan.textContent = "Participant";
        userRole = "Participant";
    }

    // Get phase
    let phase;
 
    // Fetch current phase from contract
    try {
        phase = await votingContract.methods.getPhase().call();
        currentStatusSpan.textContent = phase;

    } catch (error) {
        console.error("Error fetching contract phase:", error);
        return;
    }
    currentStatusSpan.textContent = phase;

    // Trigger display logic based on role and phase
    displaySectionsByPhase(phase);
    loadContractData(phase);
    displayWarnings(phase);
}

function displaySectionsByPhase(phase) {
    // Hide all panels initially
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('participant-panel').style.display = 'none';
    document.getElementById('results-display').style.display = 'none';
    document.getElementById('setup-phase').style.display = 'none';
    document.getElementById('voting-phase').style.display = 'none';
    document.getElementById('reveal-phase').style.display = 'none';
    document.getElementById('admin-voter-controls').style.display = 'none';
    document.getElementById('admin-voter-check').style.display = 'none';
    document.getElementById('voting-interface').style.display = 'none';

    // Show relevant sections based on role and phase
    // Admin controls are always shown to the coordinator
    if (userRole === "Coordinator") {
        // Show admin panel and voter management controls
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('admin-voter-controls').style.display = 'block';
        document.getElementById('admin-voter-check').style.display = 'block';

        // Show phase-specific sections
        if (phase === 'Setup') {
            document.getElementById('setup-phase').style.display = 'block';
        } else if (phase === 'Voting') {
            document.getElementById('voting-phase').style.display = 'block';
        } else if (phase === 'Reveal') {
            document.getElementById('reveal-phase').style.display = 'block';
            document.getElementById('results-display').style.display = 'block';
        }
    
        // Show participant panel
    } else {
        document.getElementById('participant-panel').style.display = 'block';
        document.getElementById('voting-phase').style.display = 'block';
        document.getElementById('voting-interface').style.display = 'block';
        document.getElementById('results-display').style.display = 'block';
    }
}

// Function to log events from transaction receipt
async function loadContractData(phase) {

    // Get current session ID and exclusion status
    const sessionId = await votingContract.methods.currentSessionId().call();

    // Resetting vote status display
    document.getElementById('participantVotingStatus').textContent = "";
    document.getElementById('winner').textContent = "";
    document.getElementById('results-list').innerHTML = '';

    // Load admin-specific data
    if (userRole === 'Coordinator') {

        // Display current session ID
        document.getElementById('sessionIdDisplay').textContent = sessionId;

        // Load and display excluded voters list
        let excludedVoters;
        try {
            excludedVoters = await votingContract.methods.getExcludedVoters().call({ from: userAccount });
        } catch (error) {
            console.error("Error fetching excluded voters:", error);
            return;
        }

        // Update excluded voters list in UI
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
        // Load participant-specific data
    } else {
        document.getElementById('participantSessionIdDisplay').textContent = sessionId;
    }
    // Load phase-specific data for participants
    // Display voting options and status during Voting phase
    if (phase === 'Voting') {
        const topic = await votingContract.methods.getTopic().call();
        const options = await votingContract.methods.getOptions().call();
        
        document.getElementById('adminVotingTopic').textContent = topic;
        document.getElementById('participantVotingTopic').textContent = topic;

        // Populate options list for participants
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        options.forEach((option, index) => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="radio" name="voteOption" value="${index}"> ${option}`;
            optionsContainer.appendChild(label);
        });

        // Update results display to reflect ongoing voting
        document.getElementById('participantVotingStatus').textContent = "Please select an option and submit your vote.";
        document.getElementById('winner').textContent = "Results are not yet available. Voting is currently in progress.";
    
    // Display results and winner during Reveal phase
    } else if (phase === 'Reveal') {
        // Fetch and display voting results
        const topic = await votingContract.methods.getTopic().call();
        const results = await votingContract.methods.getResults().call();
        const options = await votingContract.methods.getOptions().call();
        
        document.getElementById('adminRevealTopic').textContent = topic;

        // Display results
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';
        
        let maxVotes = 0;
        let winners = [];
        
        // Populate results list and determine winner(s)
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
            resultsList.appendChild(li);
        });
        
        // Display winner or tie information
        if (maxVotes === 0) {
            document.getElementById('winner').textContent = "No winner, no votes were cast.";
        } else if (winners.length === 1) {
            document.getElementById('winner').textContent = `The winner is: ${winners[0]}`;
        } else {
            document.getElementById('winner').textContent = `It's a tie between: ${winners.join(" and ")}`;
        }

        // Update participant voting status
        document.getElementById('participantVotingStatus').textContent = "Voting has ended. Here are the results.";

    } else if (phase === 'Setup') {
        // Clear voting data and display a message indicating waiting for a session.
        document.getElementById('participantVotingStatus').textContent = "A new session is being set up. Please wait for the coordinator to start voting.";
        document.getElementById('winner').textContent = "Results are not available during the Setup phase. Waiting for a new voting session to begin.";
    }
}

// Function to display dynamic warning messages without disabling buttons
async function displayWarnings(phase) {

    // Clear previous warnings
    document.querySelectorAll('.warning-message').forEach(span => span.textContent = '');

    // Warnings for Coordinator
    if (userRole === "Coordinator") {
        // Beside set up phase, exclusion and reinstatement are not allowed
        if (phase !== "Setup") {
            document.getElementById('warning-excludeVoterBtn').textContent = "Voter exclusion is only allowed during the Setup phase.";
            document.getElementById('warning-reinstateVoterBtn').textContent = "Voter reinstatement is only allowed during the Setup phase.";
        }
    }

    // Warnings for Participant
    if (userRole === "Participant") {

        // Check if user has voted or is excluded
        const hasVoted = await votingContract.methods.voteStatus().call({ from: userAccount });
        const isExcluded = await votingContract.methods.ifExcluded().call({ from: userAccount });        

        // Display appropriate warnings based on phase and user status
        if (phase === "Setup") {
            document.getElementById('warning-submitVoteBtn').textContent = "Voting has not started yet.";
        } else if (phase === "Reveal") {
            document.getElementById('warning-submitVoteBtn').textContent = "Voting has ended.";
        } else if (phase === "Voting") {
            if (hasVoted) {
                document.getElementById('warning-submitVoteBtn').textContent = "You have already voted in this session.";
            } else if (isExcluded) {
                document.getElementById('warning-submitVoteBtn').textContent = "You are not eligible to vote in this session.";
            }
        }
    }
}

// Initial call to check for existing connection
window.addEventListener('load', () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});