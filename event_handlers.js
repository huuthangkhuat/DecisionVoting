// event_handlers.js

function logEventsFromReceipt(receipt) {
    if (!receipt || !receipt.events) {
        console.log("No events emitted by this transaction.");
        return;
    }

    // Log all events from the receipt
    console.log("Events emitted by the transaction:", receipt.events);

    

    // Event listeners for session started
    if (receipt.events.SessionStarted) {
        const event = receipt.events.SessionStarted;
        const { sessionId, _topic, _options } = event.returnValues;
        console.log(`Event 'SessionStarted' emitted:
        - sessionId: ${sessionId}
        - topic: ${_topic}
        - options: ${_options.join(', ')}`);
        alert(`New voting session started on topic: ${_topic}' with options: ${_options.join(', ')}`);
        updateUI();
    }

    // Event listeners for CommenceSetup
    if (receipt.events.CommenceSetup) {
        const event = receipt.events.CommenceSetup;
        const { sessionId } = event.returnValues;
        console.log(`Event 'CommenceSetup' emitted for sessionId: ${sessionId}`);
        alert("System is ready for a new voting session setup.");
        updateUI();
    }

    // Event listeners for VoteCasted
    if (receipt.events.VoteCasted) {
        const event = receipt.events.VoteCasted;
        const { sessionId, _voter, _optionIndex } = event.returnValues;
        console.log(`Event 'VoteCasted' emitted:
        - sessionId: ${sessionId}
        - voter: ${_voter}
        - optionIndex: ${_optionIndex}`);
        alert(`Vote casted successfully by ${_voter} for option index ${_optionIndex}`);
        updateUI();
    }

    // Event listeners for VotingEnded
    if (receipt.events.VotingEnded) {
        const event = receipt.events.VotingEnded;
        const { sessionId } = event.returnValues;
        console.log(`Event 'VotingEnded' emitted for sessionId: ${sessionId}`);
        alert("Voting has ended for the current session. Results are being tallied.");
        updateUI();
    }

    // Event listeners for VoterExcluded and VoterReinstated
    if (receipt.events.VoterExcluded) {
        const event = receipt.events.VoterExcluded;
        const { sessionId, voter } = event.returnValues;
        console.log(`Event 'VoterExcluded' emitted:
        - sessionId: ${sessionId}
        - voter: ${voter}`);
        alert(`Voter ${voter} has been excluded from session ${sessionId}.`);
        updateUI();
    }

    if (receipt.events.VoterReinstated) {
        const event = receipt.events.VoterReinstated;
        const { sessionId, voter } = event.returnValues;
        console.log(`Event 'VoterReinstated' emitted:
        - sessionId: ${sessionId}
        - voter: ${voter}`);
        alert(`Voter ${voter} has been reinstated for session ${sessionId}.`);
        updateUI();
    }

}

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
        await votingContract.methods.startSession(topic, optionsArray).call({ from: userAccount });
        const receipt = await votingContract.methods.startSession(topic, optionsArray).send({ from: userAccount });
        alert("Session started successfully!");
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

// Participant functions logic
async function handleSubmitVote() {
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (!selectedOption) {
        alert("Please select an option to vote.");
        return;
    }

    const optionIndex = selectedOption.value;
    try {
        await votingContract.methods.castVote(optionIndex).call({ from: userAccount });
        const receipt = await votingContract.methods.castVote(optionIndex).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to submit vote:", error);
        alert(error.message);
    }
}

// Admin function to check if a specific user has voted
async function handleCheckVoterStatus() {
    const voterAddress = document.getElementById('voterCheckAddress').value;
    const voterStatusResult = document.getElementById('voterStatusResult');
    
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    
    try {
        const hasVoted = await votingContract.methods.hasUserVoted(voterAddress).call({ from: userAccount });
        voterStatusResult.textContent = `Voter ${voterAddress} has voted: ${hasVoted}`;
    } catch (error) {
        console.error("Failed to check voter status:", error);
        alert(error.message);
    }
}