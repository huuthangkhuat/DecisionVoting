//pinata.js

// Utulitify functions to save vote data as JSON to IPFS via Pinata
async function pinVoteToIPFS(userAddress, sessionId, optionIndex) {    
    const sessionNumber = parseInt(BigInt(sessionId));
    
    const voteDocument = JSON.stringify({
      pinataContent: {
        voter: userAddress.toLowerCase(),
        session: sessionNumber,
        optionIndex: optionIndex,
        timestamp: new Date().toISOString()
      },
      pinataMetadata: {
        name: `vote-${userAddress.toLowerCase()}-session-${sessionNumber}`,
      }
    })

    try {
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.PINATA_JWT}`,
            },
            body: voteDocument,
        });

        const resData = await res.json();
        return resData.IpfsHash.toString();
    } catch (error) {
        console.error("Pinata upload failed:", error);
        throw new Error(`Failed to upload vote data to IPFS: ${error.message}`);
    }
}

// Function to retrieve vote data from IPFS via Pinata gateway
async function retrieveVoteFromIPFS(cid) {
    try {
        const response = await fetch(`https://${config.GATEWAY_URL}/ipfs/${cid}`);

        return response.json();
    } catch (error) {
        console.error(`Failed to retrieve IPFS data for CID ${cid}:`, error);
        return null;
    }
}

// Function to unpin vote data from Pinata
async function unpinFromIPFS(cid) {
    try {
        await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${config.PINATA_JWT}`,
            },
        });
    } catch (error) {
        console.error(`Failed to unpin IPFS data for CID ${cid}:`, error);
        return null;
    }
}
