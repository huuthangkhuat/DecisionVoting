// event_handlers.js

// this function reconstruct the participants list from local storage
function getCommittedParticipantsFromLocalStorage() {
    const participants = [];
    const baseKey = config.LOCAL_STORAGE_KEY + '_';
    
    // Iterate over all keys in the browser's local storage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check if the key matches our specific pattern for saved secrets
        if (key && key.startsWith(baseKey)) {
            // The address is the part of the key after the base key
            const address = key.substring(baseKey.length);
            participants.push(`${address}`);
        }
    }
    return participants;
}

// Fixes the overwriting flaw by scoping storage to the address
function getUniqueStorageKey(address) {
    return `${config.LOCAL_STORAGE_KEY}_${address.toLowerCase()}`;
}

// Retrieves the secret data using the current user's address
function loadLocalCommitment(address) {
    const uniqueKey = getUniqueStorageKey(address);
    const data = localStorage.getItem(uniqueKey);
    if (data) {
        return JSON.parse(data);
    }
    return { optionIndex: null, salt: null };
}

// Saves the vote index and salt to local storage for persistence
function saveLocalCommitment(optionIndex, salt, address) {
    const uniqueKey = getUniqueStorageKey(address);
    const data = JSON.stringify({ optionIndex, salt });
    localStorage.setItem(uniqueKey, data);
}

// Clears the secret data after a successful reveal
function clearLocalCommitment(address) {
    const uniqueKey = getUniqueStorageKey(address);
    localStorage.removeItem(uniqueKey);
}

// Helper function to generate a secure random salt (nonce)
function generateSalt() {
    const salt = web3.utils.randomHex(32).replace('0x', '');
    return salt;
}

// Function to calculate the commitment hash: keccak256(index, salt)
function calculateCommitment(optionIndex, salt) {
    const abiEncoded = web3.eth.abi.encodeParameters(['uint256', 'string'], [optionIndex, salt]);
    const commitment = web3.utils.keccak256(abiEncoded);
    return commitment;
}


function logEventsFromReceipt(receipt) {
    if (!receipt || !receipt.events) {
        return;
    }

    // Event handlers for state changes
    if (receipt.events.SessionStarted) {
        alert(`New voting session started on topic: ${receipt.events.SessionStarted.returnValues._topic}'.`);
        updateUI();
    }
    if (receipt.events.CommenceSetup) {
        alert("System is ready for a new voting session setup.");
        updateUI();
    }

    // Event: CommitmentCasted (Submission by Participant)
    if (receipt.events.CommitmentCasted) {
        const committerAddress = receipt.from;
        
        // SAVE SECRET LOCALLY AFTER SUCCESSFUL COMMIT ---
        const secret = userCommitmentData; 
        if (secret.optionIndex !== null && secret.salt !== null) {
            saveLocalCommitment(secret.optionIndex, secret.salt, committerAddress);
        }

        alert(`Commitment casted successfully by ${committerAddress}.`);
        updateUI();
    }

    // Event: VotesRevealed (Emitted during Coordinator's batch reveal)
    if (receipt.events.VotesRevealed) {
        alert(`Votes has been tallied. Result will display soon`);
        updateUI();
    }

    if (receipt.events.VotingEnded) {
        alert("Voting has ended. System moved to Reveal phase. Coordinator must tally results.");
        updateUI();
    }

    if (receipt.events.VoterExcluded || receipt.events.VoterReinstated) {
        updateUI();
    }
}

// --- Coordinator Handlers ---
async function handleStartSession() {
    // ... (Validation logic omitted for brevity in response, assumed correct) ...
    const topic = document.getElementById('topicInput').value;
    const optionsArray = document.getElementById('optionsInput').value.split(',').map(s => s.trim());

    if (!topic || optionsArray.length < 2) {
        alert("Please enter a valid topic and at least two options.");
        return;
    }
    
    try {
        await votingContract.methods.startSession(topic, optionsArray).call({ from: userAccount });
        const receipt = await votingContract.methods.startSession(topic, optionsArray).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to start session:", error);
        alert(error.message);
    }
}

async function handleEndVoting() {
    try {
        await votingContract.methods.endVoting().call({ from: userAccount });
        const receipt = await votingContract.methods.endVoting().send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to end voting:", error);
        alert(error.message);
    }
}

async function handleStartNewSession() {
    try {
        await votingContract.methods.startSetup().call({ from: userAccount });
        const receipt = await votingContract.methods.startSetup().send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to start new session:", error);
        alert(error.message);
    }
}

async function handleExcludeVoter() {
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    try {
        await votingContract.methods.excludeVoter(voterAddress).call({ from: userAccount });
        const receipt = await votingContract.methods.excludeVoter(voterAddress).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to exclude voter:", error);
        alert(error.message);
    }
}

async function handleReinstateVoter() {
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    try {
        await votingContract.methods.reinstateVoter(voterAddress).call({ from: userAccount });
        const receipt = await votingContract.methods.reinstateVoter(voterAddress).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to reinstate voter:", error);
        alert(error.message);
    }
}

// Admin function to check a specific user's status
async function handleCheckVoterStatus() {
    const voterAddress = document.getElementById('voterCheckAddressVoting').value;
    const voterStatusResult = document.getElementById('voterStatusResult');
    
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    
    try {
        const status = await votingContract.methods.hasUserSubmitted(voterAddress).call({ from: userAccount });
        voterStatusResult.textContent = `Voter ${voterAddress} status: ${status}`;
        voterStatusResult.style.display = 'block';
    } catch (error) {
        console.error("Failed to check voter status:", error);
        alert(error.message);
    }
}

// --- Coordinator Batch Reveal Logic (READS FROM LOCAL STORAGE) ---
async function handleReveal() {
    if (userRole !== 'Coordinator') {
        alert("Access denied. Only the Coordinator can initiate the batch reveal.");
        return;
    }

    const currentPhase = await votingContract.methods.getPhase().call();
    if (currentPhase !== 'Reveal') {
        alert("Cannot reveal votes. System must be in the Reveal phase.");
        return;
    }

    const committedParticipants = getCommittedParticipantsFromLocalStorage();

    const voters = [];
    const optionIndexes = [];
    const salts = [];
    
    // ITERATE AND READ LOCAL STORAGE FOR EACH COMMITTED PARTICIPANT ---
    for (const address of committedParticipants) {
        const secret = loadLocalCommitment(address); 
        
        // Only include participants for whom we have a secret saved locally
        if (secret.optionIndex !== null && secret.salt !== null) {
            voters.push(address);
            optionIndexes.push(secret.optionIndex);
            salts.push(secret.salt);
        } else {
            console.warn(`Participant ${address.slice(0, 6)}... committed but their secret is missing from local storage.`);
        }

        // Clear local storage after preparing for reveal
        clearLocalCommitment(address);
    }

    try {
        // 1. Call to check for transaction errors
        await votingContract.methods.revealVotes(voters, optionIndexes, salts).call({ from: userAccount });
        
        // 2. Execute the single, large transaction
        const receipt = await votingContract.methods.revealVotes(voters, optionIndexes, salts).send({ from: userAccount });

        alert(`Batch reveal successful for ${voters.length} entries! Results are now final.`);
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to perform batch reveal:", error);
        alert(error.message || "Failed to reveal votes. Check console for details.");
    }
}


// --- Participant Handler (CRITICAL CHANGE: Submits Commitment) ---
async function handleCommitmentSubmission() {
    const currentPhase = await votingContract.methods.getPhase().call();
    const hasCommitted = await votingContract.methods.hasUserCommitted().call({ from: userAccount });
    const isExcluded = await votingContract.methods.ifExcluded().call({ from: userAccount });

    // 1. PHASE CHECK: Must be in Voting Phase
    if (currentPhase !== 'Voting') {
        alert("Cannot commit. Voting phase is currently inactive.");
        return;
    }

    // 2. ELIGIBILITY CHECKS (Must be checked client-side for UX, contract enforces it too)
    if (isExcluded) {
        alert("You are not eligible to vote in this session.");
        return;
    }
    if (hasCommitted) {
        alert("You have already cast a commitment in this session.");
        return;
    }

    // 3. GET DATA & CALCULATE COMMITMENT
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (!selectedOption) {
        alert("Please select an option to vote.");
        return;
    }
    
    const optionIndex = parseInt(selectedOption.value);
    const salt = generateSalt();
    const commitment = calculateCommitment(optionIndex, salt);

    // 4. SAVE SECRET TO CACHE (Used by logEventsFromReceipt on success)
    userCommitmentData.optionIndex = optionIndex;
    userCommitmentData.salt = salt;

    try {
        // 5. Submit the hash commitment
        await votingContract.methods.castCommitment(commitment).call({ from: userAccount });

        const receipt = await votingContract.methods.castCommitment(commitment).send({ from: userAccount });
        
        logEventsFromReceipt(receipt);

    } catch (error) {
        console.error("Failed to submit commitment:", error);
        alert(error.message);
        // Clear cache on failure to allow retry
        userCommitmentData.optionIndex = null;
        userCommitmentData.salt = null;
    }
}