// event_handlers.js

// Admin functions logic
async function handleStartSession() {
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