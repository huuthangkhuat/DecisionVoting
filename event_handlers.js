// event_handlers.js

// Admin functions logic
async function handleStartSession() {
    console.log("Starting new voting session...");
    const topic = document.getElementById('topicInput').value;
    const optionsString = document.getElementById('optionsInput').value;
    const optionsArray = optionsString.split(',').map(s => s.trim());

    if (!topic || optionsArray.length < 2) {
        alert("Please enter a valid topic and at least two options.");
        return;
    }

    try {
        await votingContract.methods.startSession(topic, optionsArray).send({ from: userAccount });
        alert("Session started successfully!");
        updateUI(); // Refresh UI after transaction
    } catch (error) {
        console.error("Failed to start session:", error);
        alert("Transaction failed. Check console for details.");
    }
}

async function handleEndVoting() {
    console.log("Ending voting...");
    try {
        await votingContract.methods.endVoting().send({ from: userAccount });
        alert("Voting has ended.");
        updateUI(); // Refresh UI after transaction
    } catch (error) {
        console.error("Failed to end voting:", error);
        alert("Transaction failed. Check console for details.");
    }
}

async function handleStartNewSession() {
    console.log("Starting new session setup...");
    try {
        await votingContract.methods.startSetup().send({ from: userAccount });
        alert("New session is ready for setup.");
        updateUI(); // Refresh UI after transaction
    } catch (error) {
        console.error("Failed to start new session:", error);
        alert("Transaction failed. Check console for details.");
    }
}

async function handleExcludeVoter() {
    console.log("Excluding voter...");
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    try {
        await votingContract.methods.excludeVoter(voterAddress).send({ from: userAccount });
        alert("Voter excluded successfully.");
        updateUI();
    } catch (error) {
        console.error("Failed to exclude voter:", error);
        alert("Transaction failed. Check console for details.");
    }
}

async function handleReinstateVoter() {
    console.log("Reinstating voter...");
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    try {
        await votingContract.methods.reinstateVoter(voterAddress).send({ from: userAccount });
        alert("Voter reinstated successfully.");
        updateUI();
    } catch (error) {
        console.error("Failed to reinstate voter:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Participant functions logic
async function handleSubmitVote() {
    console.log("Submitting vote...");
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (!selectedOption) {
        alert("Please select an option to vote.");
        return;
    }

    const optionIndex = selectedOption.value;
    try {
        await votingContract.methods.castVote(optionIndex).send({ from: userAccount });
        alert("Your vote has been cast successfully!");
        updateUI(); // Refresh UI after transaction
    } catch (error) {
        console.error("Failed to cast vote:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Load and display excluded voters list
async function handleLoadExcludedVoters() {
    try {
        const excludedVoters = await votingContract.methods.getExcludedVoters().call({ from: userAccount });
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
    } catch (error) {
        console.error("Error loading excluded voters list:", error);
        alert("Failed to load excluded voters. Are you the coordinator?");
    }
}