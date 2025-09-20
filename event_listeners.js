// event_listeners.js

// Function to set up all event listeners for the DApp
function setup_listeners(votingContract) {
    // Listen for the start of a new session
    votingContract.events.SessionStarted({}, (error, event) => {
        console.log("Setting up event listeners...");
        if (error) {
            console.error("Error with SessionStarted event:", error);
        } else {
            console.log("SessionStarted event received:", event);
            console.log("Topic:", event.returnValues._topic);
            console.log("Options:", event.returnValues._options);
            alert(`New session started!\nTopic: ${event.returnValues._topic}\nOptions: ${event.returnValues._options.join(", ")}`);
            updateUI();
        }
    });

    // Listen for a vote being cast
    votingContract.events.VoteCasted({}, (error, event) => {
        console.log("Listening for VoteCasted events...");
        if (error) {
            console.error("Error with VoteCasted event:", error);
        } else {
            console.log("VoteCasted event received:", event);
            updateUI();
        }
    });

    // Listen for the end of the voting phase
    votingContract.events.VotingEnded({}, (error, event) => {
        console.log("Listening for VotingEnded events...");
        if (error) {
            console.error("Error with VotingEnded event:", error);
        } else {
            console.log("VotingEnded event received:", event);
            alert("Voting has ended. Results can now be revealed.");
            updateUI();
        }
    });
    
    // Listen for results being revealed
    votingContract.events.ResultsRevealed({}, (error, event) => {
        console.log("Listening for ResultsRevealed events...");
        if (error) {
            console.error("Error with ResultsRevealed event:", error);
        } else {
            console.log("ResultsRevealed event received:", event);
            alert("Results are now available!");
            updateUI();
        }
    });

    // Listen for a voter being excluded
    votingContract.events.VoterExcluded({}, (error, event) => {
        console.log("Listening for VoterExcluded events...");
        if (error) {
            console.error("Error with VoterExcluded event:", error);
        } else {
            console.log("VoterExcluded event received:", event);
            updateUI();
        }
    });

    // Listen for a voter being reinstated
    votingContract.events.VoterReinstated({}, (error, event) => {
        console.log("Listening for VoterReinstated events...");
        if (error) {
            console.error("Error with VoterReinstated event:", error);
        } else {
            console.log("VoterReinstated event received:", event);
            updateUI();
        }
    });
}