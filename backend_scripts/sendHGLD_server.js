import fs from "fs";
import ethers from "ethers";

async function sendHGLD(toAddress, amount) {
  const jsonFile = "./abi.json";
  const abi = JSON.parse(fs.readFileSync(jsonFile));

  const tokenContract = "0x87a73CfdAddc4de32dA5A8528CcCD9eBf2B19593";
  const infuraProjectId = "a31017990a434050ab5b5dad42ba299a";
  const signerPrivateKey = "0d246f5e20df3147e9fa17040148fa3c65c025bf457692ac7db8844ed5e189fa";
  const network = "matic";

  const provider = new ethers.providers.InfuraProvider(network, infuraProjectId);
  const signer = new ethers.Wallet(signerPrivateKey, provider);
  const contract = new ethers.Contract(tokenContract, abi, signer);

  try {
    // Log signer address
    // console.log("Signer Address:", signer.address);

    // Fetch and log raw balance
    const rawBalance = await contract.balanceOf(signer.address);
    // console.log("Raw Token Balance (wei):", rawBalance.toString());

    // Fetch and log token decimals
    const decimals = await contract.decimals();
    // console.log("Token Decimals:", decimals);

    // Format balance
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    // console.log("Formatted Token Balance:", balance);

    const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);

    if (rawBalance.lt(parsedAmount)) {
      throw new Error("Insufficient token balance.");
    }

    // Encode transfer transaction
    const tx = await contract.populateTransaction.transfer(toAddress, parsedAmount);

    // Estimate gas or set manual gas limit
    let gasLimit;
    try {
      gasLimit = await provider.estimateGas({
        from: signer.address,
        to: tokenContract,
        data: tx.data,
      });
      // console.log("Estimated Gas Limit:", gasLimit.toString());
    } catch (error) {
      console.warn("Gas estimation failed. Using manual gas limit.");
      gasLimit = ethers.BigNumber.from("300000"); // Manual gas limit
    }

    // Send the transaction
    const transaction = await signer.sendTransaction({
      to: tokenContract,
      data: tx.data,
      gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"), // Lower gas fees
      maxFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Max fee
      nonce: await signer.getTransactionCount(),
      chainId: 137,
    });

    console.log("Mining transaction...");
    console.log(`Transaction Hash: https://polygonscan.com/tx/${transaction.hash}`);

    // Wait for confirmation
    const receipt = await transaction.wait();
    if (receipt.status === 0) {
      throw new Error("Transaction failed. Check the contract logic or state.");
    }

    console.log(`Transaction mined in block ${receipt.blockNumber}`);
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error(error.message || "Transaction failed");
  }
}

// Example Usage
const toAddress = "0x63C18042Ff056493c62bc74d04A32F03a5813798";
const amount = "100"; // Number of tokens to transfer
await sendHGLD(toAddress, amount);
