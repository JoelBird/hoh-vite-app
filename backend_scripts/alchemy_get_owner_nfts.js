// Recursive function to deeply log all object properties
const deepLog = (obj, indent = 0) => {
    const spacing = ' '.repeat(indent * 2);
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            console.log(`${spacing}${key}:`);
            deepLog(obj[key], indent + 1); // Recursively log nested objects
        } else {
            console.log(`${spacing}${key}: ${obj[key]}`);
        }
    }
};

// Main function to fetch NFTs
const fetchNFTsByOwner = async () => {
    const apiKey = 'ZN8hlCetWAPHT47a9vYleWMDE2TTPK8e'; // Replace with your Alchemy API Key
    const network = 'polygon-mainnet'; // Replace with the appropriate network (e.g., eth-mainnet, polygon-mainnet)
    const ownerAddress = '0xABA4414Cc3bc819268dFdd14a8e5DA2300443aa1'; // Replace with the owner's wallet address
    const contractAddresses = ['0xAe65887F23558699978566664CC7dC0ccd67C0f8']; // Filter by this contract address

    const url = `https://${network}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`;

    try {
        const response = await fetch(`${url}?owner=${ownerAddress}&contractAddresses[]=${contractAddresses[0]}&withMetadata=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('NFTs by Owner (Expanded Objects):');
        data.ownedNfts.forEach((nft, index) => {
            console.log(`\n--- NFT #${index + 1} ---`);
            deepLog(nft); // Deeply log each NFT object
        });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
    }
};

// Call the function
fetchNFTsByOwner();
