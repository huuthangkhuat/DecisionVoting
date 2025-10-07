const { PinataSDK } = require("pinata");
const cors = require('cors');
const express = require('express');
const { Blob } = require("buffer");
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors()); 
app.use(express.json());

app.post('/pin_vote', async (req, res) => {
    try {
        const voteData = req.body;

        const blob = new Blob([JSON.stringify(voteData)], { type: 'application/json' });
        
        // Use Pinata SDK to pin the content
        const result = await pinata.upload.file(blob);

        // Respond with the CID
        res.status(200).json({ result, message: "Vote successfully pinned." });
    } catch (error) {
        console.error("Pinata Pin Failed:", error);
        res.status(500).json({ 
            message: "Failed to upload to Pinata.", 
            details: error.message 
        });
    }
});

// --- ENDPOINT: GET /retrieve/:cid  ---
app.get('/retrieve/:cid', async (req, res) => {
    try {
        const stringCID = req.params.cid.toString();

        // Fetch the file using the server as a proxy
        const response = await pinata.gateways.get(stringCID)

        // Pass the JSON data directly back to the client
        const data = response.data

        res.status(200).json({ 
            data, 
            message: "Retrieve successful" 
        });
    } catch (error) {
        console.error(`Pinata Retrieval Failed for CID ${req.params.cid}:`, error);
        res.status(500).json({ 
            message: "Failed to retrieve vote data from Pinata.", 
            details: error.message 
        });
    }
});

// ENDPOINT: Delete vote file
app.delete('/unpin', async (req, res) => {
    try {
        let files = [];
		for await (const item of pinata.files.list()) {
			files.push(item.id);
		}
        
        const response = await pinata.files.delete(files);

        res.status(200).json({ message: `Successfully unpinned CIDs` });
    } catch (error) {
        console.error("Pinata Unpin Failed:", error);
        res.status(500).json({ 
            message: "Failed to unpin from Pinata.", 
            details: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Pinata Proxy Server running at http://localhost:${PORT}`);
});