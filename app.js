// app.js

// Contract details 
const contractAddress = '0x2e25eCb93fcd673d48D0dF6abfc93bB84035485a';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"ResultsRevealed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"string","name":"_topic","type":"string"},{"indexed":false,"internalType":"string[]","name":"_options","type":"string[]"}],"name":"SessionStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterExcluded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterReinstated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"VotingEnded","type":"event"},{"inputs":[{"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coordinator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentSessionId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"excludeVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getExcludedVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOptions","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPhase","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopic","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"isVoterExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"reinstateVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"string[]","name":"_options","type":"string[]"}],"name":"startSession","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startSetup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"viewMyVote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

// Global variables for Web3 and contract instances
let web3;
let votingContract;
let userAccount;
let userRole; // "Coordinator" or "Participant"

// DOM elements
const userAddressSpan = document.getElementById('userAddress');
const userRoleSpan = document.getElementById('userRole');
const networkNameSpan = document.getElementById('networkName');
const currentStatusSpan = document.getElementById('currentStatus');

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            userAccount = await get_current_eth_address();
            console.log("Connected account:", userAccount);
            web3 = new Web3(window.ethereum);
            votingContract = new web3.eth.Contract(contractABI, contractAddress);
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

    console.log("Entering updateUI(). userAccount:", userAccount);
    console.log("Is votingContract defined? ", !!votingContract);

    if (!userAccount) {
        userAddressSpan.textContent = "Not connected";
        userRoleSpan.textContent = "N/A";
        networkNameSpan.textContent = "N/A";
        currentStatusSpan.textContent = "Please connect your wallet.";
        return;
    }

    userAddressSpan.textContent = userAccount;
    
    let networkName;
    try {
        networkName = await get_current_network();
        console.log("Network Name:", networkName);
    } catch (error) {
        console.error("Error fetching network name:", error);
        alert("Failed to fetch network data. Please ensure you're connected to the correct network.");
        return;
    }

    networkNameSpan.textContent = networkName;

    // Get coordinator address
    let coordinatorAddress; 

    try {
        coordinatorAddress = await votingContract.methods.coordinator().call();
        console.log("Coordinator address:", coordinatorAddress);
    } catch (error) {
        console.error("Error fetching coordinator address:", error);
        alert("Failed to fetch contract data. Please ensure you're connected to the correct network.");
        return;
    }

    if (userAccount.toLowerCase() === coordinatorAddress.toLowerCase()) {
        userRoleSpan.textContent = "Coordinator";
        userRole = "Coordinator";
    } else {
        userRoleSpan.textContent = "Participant";
        userRole = "Participant";
    }

    // Get phase
    let phase;

    try {
        const phase = await votingContract.methods.getPhase().call();
        currentStatusSpan.textContent = phase;
        console.log("Current contract phase:", phase);

    } catch (error) {
        console.error("Error fetching contract phase:", error);
        return;
    }
    currentStatusSpan.textContent = phase;

    // Trigger display logic based on role and phase
    loadContractData(phase);
    displaySectionsByPhase(phase);
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

    if (userRole === "Coordinator") {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('admin-voter-controls').style.display = 'block';
        if (phase === 'Setup') {
            document.getElementById('setup-phase').style.display = 'block';
        } else if (phase === 'Voting') {
            document.getElementById('voting-phase').style.display = 'block';
        } else if (phase === 'Reveal') {
            document.getElementById('reveal-phase').style.display = 'block';
        }
    } else {
        document.getElementById('participant-panel').style.display = 'block';
        if (phase === 'Voting') {
            document.getElementById('voting-phase').style.display = 'block';
        } else if (phase === 'Reveal') {
            document.getElementById('results-display').style.display = 'block';
        }
    }
}

async function loadContractData(phase) {
    const sessionId = await votingContract.methods.currentSessionId().call();

    if (userRole === 'Coordinator') {
        document.getElementById('sessionIdDisplay').textContent = sessionId;
        const excludedVoters = await votingContract.methods.getExcludedVoters().call();
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
    } else {
        document.getElementById('participantSessionIdDisplay').textContent = sessionId;
    }
            
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
        
        // Check if participant has voted and update UI
        const hasVoted = await votingContract.methods.hasUserVoted().call({ from: userAccount });
        if (hasVoted) {
            document.getElementById('participantVotingStatus').textContent = "You have already voted.";
            document.getElementById('submitVoteBtn').disabled = true;
        } else {
            document.getElementById('participantVotingStatus').textContent = "Please cast your vote.";
            document.getElementById('submitVoteBtn').disabled = false;
        }

    } else if (phase === 'Reveal') {
        const topic = await votingContract.methods.getTopic().call();
        const results = await votingContract.methods.getResults().call();
        const options = await votingContract.methods.getOptions().call();
        
        document.getElementById('results-topic').textContent = topic;

        // Display results
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';
        
        let maxVotes = 0;
        let winners = [];
        
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
        
        if (maxVotes === 0) {
            document.getElementById('winner').textContent = "No winner, no votes were cast.";
        } else if (winners.length === 1) {
            document.getElementById('winner').textContent = `The winner is: ${winners[0]}`;
        } else {
            document.getElementById('winner').textContent = `It's a tie between: ${winners.join(" and ")}`;
        }
    }
}

// Initial call to check for existing connection
window.addEventListener('load', () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});