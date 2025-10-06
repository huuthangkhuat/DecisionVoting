// event_handlers.js

function logEventsFromReceipt(receipt) {
    if (!receipt || !receipt.events) {
        return;
    }

    // Event: SessionStarted (Coordinator starts new session)
    if (receipt.events.SessionStarted) {
        alert(`New voting session started on topic: ${receipt.events.SessionStarted.returnValues._topic}'.`);
    }

    // Event: CommenceSetup (Coordinator starts new session setup)
    if (receipt.events.CommenceSetup) {
        alert("System is ready for a new voting session setup.");
    }

    // Event: VoteCasted (Submission by Participant)
    if (receipt.events.VoteCasted) {
        const committerAddress = receipt.events.VoteCasted.returnValues._voter;
        const cid = receipt.events.VoteCasted.returnValues._cid;
        alert(`Vote CID ${cid.slice(0, 10)}... casted successfully by ${committerAddress}.`);
    }


    // Event: ResultsFinalized (Coordinator finalizes results)
    if (receipt.events.ResultsFinalized) {
        alert(`Final results has been submitted and are now on-chain.`);
    }

    // Event: VotingEnded (Coordinator ends voting phase)
    if (receipt.events.VotingEnded) {
        alert("Voting has ended. System moved to Reveal phase. Coordinator must tally results.");
    }


    updateUI();
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
        const voterCIDs = await getCIDsFromPastEvents();
        alert(`Cleaning up ${voterCIDs.length} pinned votes from previous session.`);
        for (const { cid } of voterCIDs) {
            await unpinFromIPFS(cid);
        }
        alert("Previous votes unpinned. Proceeding to start new session setup.");
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

// Data Retrieval Helper: Extracts all CIDs for the current session.
async function getCIDsFromPastEvents() {
    try {
        const sessionId = await votingContract.methods.currentSessionId().call();

        // 1. Fetch all 'VoteCasted' events using the high-level contract method.
        const events = await votingContract.getPastEvents('VoteCasted', {
            // Filter by the indexed sessionId to limit the scope of the search
            filter: { sessionId: sessionId }, 
            fromBlock: 0, 
            toBlock: 'latest'
        });

        console.log(events);

        const votedManifest = new Map();

        // 2. Process events to build a manifest of unique votes
        for (const event of events) {
            const { _voter, _cid } = event.returnValues;
            
            // Although the contract prevents duplicate votes, this ensures data cleanliness
            if (!votedManifest.has(_voter)) {
                votedManifest.set(_voter, _cid);
            }
        }
        
        // Convert the Map entries into a clean array of objects for external use
        const voterCIDs = Array.from(votedManifest, ([voter, cid]) => ({ voter, cid }));

        return voterCIDs;

    } catch (error) {
        console.error("Error fetching event logs for CIDs:", error);
        alert("Error fetching CIDs from the blockchain. Check console.");
        return [];
    }
}

// Manages the tally process (off-chain retrieval + submission).
async function handleTallySubmission() {
    if (userRole !== 'Coordinator') {
        alert("Access denied. Only the Coordinator can submit the final tally.");
        return;
    }

    const currentPhase = await votingContract.methods.getPhase().call();
    if (currentPhase !== 'Reveal') {
        alert("Cannot submit results. System must be in the Reveal phase.");
        return;
    }
    
    // 1. RETRIEVE ALL CIDs from the blockchain event logs
    const voterCIDs = await getCIDsFromPastEvents();
    console.log("Retrieved voter CIDs:", voterCIDs);

    // 2. TALLY OFF-CHAIN VOTES (Automated using Pinata retrieval)
    const options = await votingContract.methods.getOptions().call();
    let finalCounts = new Array(options.length).fill(0);
    
    let tallyLog = `Starting automated tally for ${voterCIDs.length} votes:\n\n`;

    for (const { cid } of voterCIDs) {
        // Fetch the JSON vote document from IPFS via the Pinata gateway
        await retrieveVoteFromIPFS(cid).then(voteDocument =>{
            const index = voteDocument.optionIndex;
            finalCounts[index] += 1;
            console.log(`Vote for option index ${index} counted from CID ${cid}.`);
        });
    }

    // 3. DISPLAY & CONFIRM FINAL TALLY
    let finalResultSummary = "\n========================\nFinal Calculated Tally:\n";
    options.forEach((option, index) => {
        finalResultSummary += `- ${option}: ${finalCounts[index]} votes\n`;
    });
    finalResultSummary += "========================\n\n";

    console.log(tallyLog);
    const confirmation = confirm(`${tallyLog}${finalResultSummary}\nConfirm submission of these calculated results to the blockchain?`);

    if (!confirmation) return;

    // 4. ON-CHAIN SUBMISSION
    try {
        // Pre-check the transaction locally
        await votingContract.methods.setFinalResults(finalCounts).call({ from: userAccount });
        
        // Execute the transaction
        const receipt = await votingContract.methods.setFinalResults(finalCounts).send({ from: userAccount });

        alert(`Final tally successfully submitted for ${finalCounts.length} options!`);
        logEventsFromReceipt(receipt);
    } catch (error) {
        console.error("Failed to submit final results:", error);
        alert(error.message || "Failed to submit final results. Check console for details.");
    }
}

// --- Participant Handler ---
async function handleCommitmentSubmission() {
    const currentPhase = await votingContract.methods.getPhase().call();
    const hasCommitted = await votingContract.methods.hasUserVoted().call({ from: userAccount });
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

    // 3. GET DATA
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (!selectedOption) {
        alert("Please select an option to vote.");
        return;
    }
    
    const optionIndex = parseInt(selectedOption.value);
    
    try {
        let receipt;
        // Fetch necessary data
        const sessionId = await votingContract.methods.currentSessionId().call();

        // 4. UPLOAD VOTE METADATA TO IPFS (Using the exported service function)
        const cid = await pinVoteToIPFS(userAccount, sessionId, optionIndex).then(cid => {
            // 5. Submit the IPFS CID to the contract
            votingContract.methods.castVote(cid).call({ from: userAccount });
            votingContract.methods.castVote(cid).send({ from: userAccount }).then(receipt => {
                logEventsFromReceipt(receipt);
            })
        })

    } catch (error) {
        const errorMsg = error.message.includes("Failed to upload vote data") ? "IPFS upload failed. Could not retrieve CID." : error.message;
        console.error("Failed to submit vote:", error);
        alert(errorMsg);
    }
}