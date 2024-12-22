import axios from 'axios';
import Moralis from 'moralis';

    const apiKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjVkYjhkYmI1LTVjYTctNGQ5Yy1hOTZmLTI0NTg0NTEyMDA2YSIsIm9yZ0lkIjoiMzY0NDE4IiwidXNlcklkIjoiMzc0NTI5IiwidHlwZUlkIjoiNDc4ZDM4ZTQtZmI1Ni00YWE3LWI1Y2ItNzdmZDRiNWYzZjA2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTk5NzIyNzYsImV4cCI6NDg1NTczMjI3Nn0.sj3VrlDMN8Yt1aaIbnHS56TrGMgzMNz0WcXeaRg8Bm0"
    const walletAddress = "0x2C077C051fdBaDc8388427E3aD30059E050b5f8f"
    const collectionAddress = "0x99c6De8bc22adb0d6E59939FcB20443CD1606518"
    


    try {
      await Moralis.start({
        apiKey: apiKey
      });

      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        "chain": "0x89",
        "format": "decimal",
        "limit": 9999,
        "tokenAddresses": [
          collectionAddress
        ],
        "mediaItems": false,
        "address": walletAddress
      });

      console.log(response.raw);
    } catch (e) {
      console.error(e);
}