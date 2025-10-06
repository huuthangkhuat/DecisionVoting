//Helper function to obtain current eth address
async function get_current_eth_address(){
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        return accounts[0]
    }
    else{
        console.error("Metamask is not installed!");
        return null;
    }
}

//Helper function to obtain user balance
async function get_user_balance(eth_address){
    if (typeof window.ethereum !== 'undefined') {
        const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [eth_address],
        })
        return (parseInt(balance, 16) / Math.pow(10,18)).toFixed(10);
    }
    else{
        console.error("Metamask is not installed!");
        return null;
    }
}

//Helper function to obtain current eth network
async function get_current_network(){
    // get current eth network
    const eth_network = await window.ethereum.request({
        method: 'eth_chainId',
        params: []
    });
    var current_network = parseInt(eth_network, 16);
    var result;
    switch (current_network) {
                    case 1:
                    result = "Mainnet";
                    break
                    case 5:
                    result = "Goerli";
                    break
                    case 11155111:
                    result =  "Sepolia";
                    break
                    case 2018:
                    result =  "Dev";
                    break
                    case 63:
                    result =  "Mordor";
                    break
                    case 61:
                    result =  "Classic";
                    break
                    default:
                    result =  "unknow";
            }
    return result;
}