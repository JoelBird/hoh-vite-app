import ethers from "ethers"

// Replace with your values
const tokenContract = process.env.REACT_APP_HGLD_CONTRACT_ADDRESS;
const toAddress = "0x63C18042Ff056493c62bc74d04A32F03a5813798";
const infuraProjectId = "a31017990a434050ab5b5dad42ba299a";
const signerPrivateKey = "0d246f5e20df3147e9fa17040148fa3c65c025bf457692ac7db8844ed5e189fa";
const polygonscanApiKey = "WZ1FEBAQFZ4S44E74JZ7PQSW1SARSH48KT";
const network = "matic";
const address = "0xf48B3847936bB9cc96A3cFB0F01Eb1057cCFa349"

// Configuring the connection to the Polygon network via Infura
const provider = new ethers.providers.InfuraProvider(network, infuraProjectId);
const signer = new ethers.Wallet(signerPrivateKey, provider);

async function clearPendingTransactions() {
  // Fetch the latest nonce for your address from the blockchain
  const latestNonce = await provider.getTransactionCount(address, "latest");

  console.log("Latest Nonce from Network:", latestNonce);

  // Send a "noop" transaction (a transaction that doesn't do anything significant)
  const tx = {
    to: address, // Sending to self
    value: ethers.utils.parseEther("0.0001"), // Small amount to use the nonce
    nonce: latestNonce,
    gasLimit: ethers.utils.hexlify(21000), // Basic gas limit for a simple transfer
    maxPriorityFeePerGas: ethers.utils.parseUnits("200", "gwei"), // Increase if needed
    maxFeePerGas: ethers.utils.parseUnits("200", "gwei"), // Increase if needed
    chainId: 137, // Polygon chain ID
  };

  try {
    console.log("Sending replacement transaction to clear nonce...");
    const transactionResponse = await signer.sendTransaction(tx);
    console.log(`Transaction sent: https://polygonscan.com/tx/${transactionResponse.hash}`);

    // Wait for the transaction to be mined
    const receipt = await transactionResponse.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error sending replacement transaction:", error);
  }
}

clearPendingTransactions();
