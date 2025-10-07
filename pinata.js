//pinata.js

const BACKEND_URL = "http://localhost:3000"; 

// Utility functions to save vote data as JSON to IPFS via Pinata
async function pinVoteToIPFS(userAddress, sessionId, optionIndex) {    
    const sessionNumber = parseInt(BigInt(sessionId));
    
    // Data structure sent to the local backend proxy
    const voteDocument = {
        voter: userAddress.toLowerCase(),
        session: sessionNumber,
        optionIndex: optionIndex,
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch(`${BACKEND_URL}/pin_vote`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voteDocument),
        });

        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.details || errorBody.message || "Pinata proxy failed.");
        }

        const resData = await res.json();

        const cid = resData.result.cid;
        if (!cid) throw new Error("Backend did not return a valid CID.");

        return cid;
    } catch (error) {
        console.error("Pinata upload failed:", error);
        throw new Error(`Failed to upload vote data to IPFS: ${error.message}`);
    }
}

// Function to retrieve vote data from IPFS via Pinata gateway
async function retrieveVoteFromIPFS(cid) {
    try {
        // Fetch YOUR LOCAL BACKEND, which then proxies to the Pinata Gateway
        const response = await fetch(`${BACKEND_URL}/retrieve/${cid}`);

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.details || errorBody.message || "Pinata retrieval proxy failed.");
        }
        
        const resData = await response.json();
        const optionIndex = await resData.data.optionIndex;

        return optionIndex;
    } catch (error) {
        console.error(`Failed to retrieve IPFS data for CID ${cid}:`, error);
        return null;
    }
}

// Function to unpin vote data from Pinata
async function unpinFromIPFS() {
    try {
        // Fetch YOUR LOCAL BACKEND, which handles the unpinning
        const res = await fetch(`${BACKEND_URL}/unpin`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.details || errorBody.message || "Pinata proxy failed.");
        }
    } catch (error) {
        console.error(`Pinata proxy unpin failed for ${cid}:`, error);
        // Allow unpin failure to be non-critical, but log it.
        return null; 
    }
}
