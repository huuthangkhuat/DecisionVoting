// app.js

// Contract details 
const contractAddress = '0xd00d798b53c0Ef8b0A76B7a0FaF8110cf9D3A64C';
const contractABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"ResultsRevealed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"string","name":"_topic","type":"string"},{"indexed":false,"internalType":"string[]","name":"_options","type":"string[]"}],"name":"SessionStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterExcluded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"VoterReinstated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"VotingEnded","type":"event"},{"inputs":[{"internalType":"uint256","name":"_optionIndex","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coordinator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentSessionId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"excludeVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getExcludedVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOptions","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPhase","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopic","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"isVoterExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"reinstateVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"string[]","name":"_options","type":"string[]"}],"name":"startSession","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"viewMyVote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}
];

// Global variables for Web3 and contract instances
let web3;
let votingContract;
let userAccount;
let userRole; // "Coordinator" or "Participant"

// DOM elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const userAddressSpan = document.getElementById('userAddress');
const userRoleSpan = document.getElementById('userRole');
const networkNameSpan = document.getElementById('networkName');
const currentStatusSpan = document.getElementById('currentStatus');

//Helper function to obtain current eth address
async function get_current_eth_address(){
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log(accounts);
        return accounts[0]
    }
    else{
        console.error("Metamask is not installed!");
        return null;
    }
}

//Helper function to obtain user balance
async function get_user_balance(eth_address){
    if (typeof window.ethereum !== 'undefined') {
        const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [eth_address],
        })
        console.log(balance);
        return (parseInt(balance, 16) / Math.pow(10,18)).toFixed(10);
    }
    else{
        console.error("Metamask is not installed!");
        return null;
    }
}

//Helper function to obtain current eth network
async function get_current_network(){
    // get current eth network
    const eth_network = await window.ethereum.request({
        method: 'eth_chainId',
        params: []
    });
    var current_network = parseInt(eth_network, 16);
    // console.log(typeof(current_network));
    var result;
    switch (current_network) {
                    case 1:
                    result = "Mainnet";
                    break
                    case 5:
                    result = "Goerli";
                    break
                    case 11155111:
                    result =  "Sepolia";
                    break
                    case 2018:
                    result =  "Dev";
                    break
                    case 63:
                    result =  "Mordor";
                    break
                    case 61:
                    result =  "Classic";
                    break
                    default:
                    result =  "unknow";
            }
    return result;
}

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
        const networkName = await get_current_network();
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

    if (userRole === "Coordinator") {
        document.getElementById('admin-panel').style.display = 'block';
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

// Add event listener to the connect button
connectWalletBtn.addEventListener('click', connectWallet);

// Initial call to check for existing connection
window.addEventListener('load', () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});