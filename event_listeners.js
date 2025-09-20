function logEventsFromReceipt(receipt) {
  if (!receipt || !receipt.events) {
    console.log("No events emitted by this transaction.");
    return;
  }

  // Log all events from the receipt
  console.log("Events emitted by the transaction:", receipt.events);

  // Check for specific events and log their return values
  if (receipt.events.SessionStarted) {
    const event = receipt.events.SessionStarted;
    const { sessionId, _topic, _options } = event.returnValues;
    console.log(`Event 'SessionStarted' emitted:
      - sessionId: ${sessionId}
      - topic: ${_topic}
      - options: ${_options.join(', ')}`);
  }

  if (receipt.events.VoteCasted) {
    const event = receipt.events.VoteCasted;
    const { sessionId, _voter, _optionIndex } = event.returnValues;
    console.log(`Event 'VoteCasted' emitted:
      - sessionId: ${sessionId}
      - voter: ${_voter}
      - optionIndex: ${_optionIndex}`);
  }

  if (receipt.events.VotingEnded) {
    const event = receipt.events.VotingEnded;
    const { sessionId } = event.returnValues;
    console.log(`Event 'VotingEnded' emitted for sessionId: ${sessionId}`);
  }

  if (receipt.events.ResultsRevealed) {
    const event = receipt.events.ResultsRevealed;
    const { sessionId } = event.returnValues;
    console.log(`Event 'ResultsRevealed' emitted for sessionId: ${sessionId}`);
  }

  if (receipt.events.VoterExcluded) {
    const event = receipt.events.VoterExcluded;
    const { sessionId, voter } = event.returnValues;
    console.log(`Event 'VoterExcluded' emitted:
      - sessionId: ${sessionId}
      - voter: ${voter}`);
  }

  if (receipt.events.VoterReinstated) {
    const event = receipt.events.VoterReinstated;
    const { sessionId, voter } = event.returnValues;
    console.log(`Event 'VoterReinstated' emitted:
      - sessionId: ${sessionId}
      - voter: ${voter}`);
  }
}