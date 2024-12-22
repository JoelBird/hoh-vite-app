// Main function to fetch NFT Metadata
const contractAddress = "0x99c6De8bc22adb0d6E59939FcB20443CD1606518"
const fetchNFTsByOwner = async () => {
    const url = `https://polygon-mainnet.g.alchemy.com/nft/v3/docs-demo/getNFTMetadata?contractAddress=${contractAddress}&tokenId=11`;

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('NFT Metadata:', data);
    } catch (error) {
        console.error('Error fetching NFT metadata:', error);
    }
};

// Call the function
fetchNFTsByOwner();
