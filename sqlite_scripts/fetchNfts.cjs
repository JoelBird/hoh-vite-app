const axios = require('axios');

async function fetchNFTs() {
  try {
    const collectionChain = 'polygon'; // Set your chain (e.g., eth, polygon, etc.)
    const walletAddress = '0x4d1CB1C6Cd01b93735619fC1340E413659Da1C44'; // Set your chain (e.g., eth, polygon, etc.)
    const targetContractAddress = '0x99c6De8bc22adb0d6E59939FcB20443CD1606518'; // Contract address to filter
    moralisAPiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjVkYjhkYmI1LTVjYTctNGQ5Yy1hOTZmLTI0NTg0NTEyMDA2YSIsIm9yZ0lkIjoiMzY0NDE4IiwidXNlcklkIjoiMzc0NTI5IiwidHlwZUlkIjoiNDc4ZDM4ZTQtZmI1Ni00YWE3LWI1Y2ItNzdmZDRiNWYzZjA2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTk5NzIyNzYsImV4cCI6NDg1NTczMjI3Nn0.sj3VrlDMN8Yt1aaIbnHS56TrGMgzMNz0WcXeaRg8Bm0"
    let cursor = null;

    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/${walletAddress}/nft`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": moralisAPiKey // Replace with your actual API key
        },
        params: {
          chain: collectionChain, // Specify the chain
          format: "decimal",
          cursor: cursor || undefined,
          media_items: false, // Set to false if you don't need media items
        },
      }
    );

    // Extract result and cursor for pagination
    const { result, cursor: nextCursor } = response.data;

    // Filter NFTs by target contract address
    const filteredNFTs = result.filter(
      (nft) => nft.token_address.toLowerCase() === targetContractAddress.toLowerCase()
    );
    
    // Print token details and metadata
    console.log(filteredNFTs)
    

    // Optionally, handle pagination if necessary
    if (nextCursor) {
      console.log("More pages available, cursor:", nextCursor);
      // Implement logic to fetch next pages using `nextCursor`
    }

  } catch (error) {
    console.error('Error fetching NFTs:', error);
  }
}

// Call the function to fetch and print NFTs
fetchNFTs();
