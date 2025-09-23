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

        // Extract event details
        const event = receipt.events.SessionStarted;
        const { sessionId, _topic, _options } = event.returnValues;

        // Log and alert
        console.log(`Event 'SessionStarted' emitted:
        - sessionId: ${sessionId}
        - topic: ${_topic}
        - options: ${_options.join(', ')}`);
        alert(`New voting session started on topic: ${_topic}' with options: ${_options.join(', ')}`);

        // Update UI
        updateUI();
    }

    // Event listeners for CommenceSetup
    if (receipt.events.CommenceSetup) {

        // Extract event details
        const event = receipt.events.CommenceSetup;
        const { sessionId } = event.returnValues;

        // Log and alert
        console.log(`Event 'CommenceSetup' emitted for sessionId: ${sessionId}`);
        alert("System is ready for a new voting session setup.");

        // Update UI
        updateUI();
    }

    // Event listeners for VoteCasted
    if (receipt.events.VoteCasted) {

        // Extract event details
        const event = receipt.events.VoteCasted;
        const { sessionId, _voter, _optionIndex } = event.returnValues;

        // Retrieve option text directly from the DOM
        const optionsContainer = document.getElementById('options-container');
        const votedOptionElement = optionsContainer.querySelector(`input[name="voteOption"][value="${_optionIndex}"]`);
        const votedOptionText = votedOptionElement ? votedOptionElement.parentNode.textContent.trim() : `Option at index ${_optionIndex}`;

        // Log and alert
        console.log(`Event 'VoteCasted' emitted:
        - sessionId: ${sessionId}
        - voter: ${_voter}
        - optionIndex: ${_optionIndex}`);
        alert(`Vote casted successfully by ${_voter} for option: ${votedOptionText}`);

        // Update UI
        updateUI();
    }

    // Event listeners for VotingEnded
    if (receipt.events.VotingEnded) {

        // Extract event details
        const event = receipt.events.VotingEnded;
        const { sessionId } = event.returnValues;

        // Log and alert
        console.log(`Event 'VotingEnded' emitted for sessionId: ${sessionId}`);
        alert("Voting has ended for the current session. Results are being tallied.");

        // Update UI
        updateUI();
    }

    // Event listeners for VoterExcluded and VoterReinstated
    if (receipt.events.VoterExcluded) {

        // Extract event details
        const event = receipt.events.VoterExcluded;
        const { sessionId, voter } = event.returnValues;

        // Log and alert
        console.log(`Event 'VoterExcluded' emitted:
        - sessionId: ${sessionId}
        - voter: ${voter}`);
        alert(`Voter ${voter} has been excluded from session ${sessionId}.`);

        // Update UI
        updateUI();
    }

    if (receipt.events.VoterReinstated) {

        // Extract event details
        const event = receipt.events.VoterReinstated;
        const { sessionId, voter } = event.returnValues;

        // Log and alert
        console.log(`Event 'VoterReinstated' emitted:
        - sessionId: ${sessionId}
        - voter: ${voter}`);
        alert(`Voter ${voter} has been reinstated for session ${sessionId}.`);

        // Update UI
        updateUI();
    }

}

// Admin functions logic
async function handleStartSession() {

    // Get topic and options from input fields
    const topic = document.getElementById('topicInput').value;
    const optionsString = document.getElementById('optionsInput').value;
    const optionsArray = optionsString.split(',').map(s => s.trim());

    // Basic validation
    if (!topic || optionsArray.length < 2) {
        alert("Please enter a valid topic and at least two options.");
        return;
    }

    // Call startSession method
    try {

        // Call the transaction to check for errors
        await votingContract.methods.startSession(topic, optionsArray).call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.startSession(topic, optionsArray).send({ from: userAccount });

        // Notify user and log events
        alert("Session started successfully!");
        logEventsFromReceipt(receipt);
    } catch (error) {
        // Handle errors
        console.error("Failed to start session:", error);
        alert(error.message);
    }
}

async function handleEndVoting() {
    try {

        // Call the transaction first
        await votingContract.methods.endVoting().call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.endVoting().send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {

        // Handle errors
        console.error("Failed to end voting:", error);
        alert(error.message);
    }
}

async function handleStartNewSession() {
    try {

        // Call the transaction first
        await votingContract.methods.startSetup().call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.startSetup().send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {

        // Handle errors
        console.error("Failed to start new session:", error);
        alert(error.message);
    }
}

async function handleExcludeVoter() {

    // Get voter address from input field
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }

    // Call excludeVoter method
    try {

        // Call the transaction to check for errors
        await votingContract.methods.excludeVoter(voterAddress).call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.excludeVoter(voterAddress).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {

        // Handle errors
        console.error("Failed to exclude voter:", error);
        alert(error.message);
    }
}

async function handleReinstateVoter() {

    // Get voter address from input field
    const voterAddress = document.getElementById('voterAddressInput').value;
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }

    // Call reinstateVoter method
    try {

        // Call the transaction to check for errors
        await votingContract.methods.reinstateVoter(voterAddress).call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.reinstateVoter(voterAddress).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {

        // Handle errors
        console.error("Failed to reinstate voter:", error);
        alert(error.message);
    }
}

// Participant functions logic
async function handleSubmitVote() {

    // Get selected option
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (!selectedOption) {
        alert("Please select an option to vote.");
        return;
    }

    // Call castVote method
    const optionIndex = selectedOption.value;
    try {

        // Call the transaction to check for errors
        await votingContract.methods.castVote(optionIndex).call({ from: userAccount });

        // If the call succeeds, send the transaction
        const receipt = await votingContract.methods.castVote(optionIndex).send({ from: userAccount });
        logEventsFromReceipt(receipt);
    } catch (error) {

        // Handle errors
        console.error("Failed to submit vote:", error);
        alert(error.message);
    }
}

// Admin function to check if a specific user has voted
async function handleCheckVoterStatus() {

    // Get voter address from input field
    const voterAddress = document.getElementById('voterCheckAddress').value;
    const voterStatusResult = document.getElementById('voterStatusResult');
    
    // Address validation
    if (!web3.utils.isAddress(voterAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
    }
    
    // Call hasUserVoted method
    try {

        //  Call the method to check if the user has voted
        const hasVoted = await votingContract.methods.hasUserVoted(voterAddress).call({ from: userAccount });
        voterStatusResult.textContent = `Voter ${voterAddress} has voted: ${hasVoted}`;
    } catch (error) {

        // Handle errors
        console.error("Failed to check voter status:", error);
        alert(error.message);
    }
}