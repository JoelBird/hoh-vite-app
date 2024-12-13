import ethers from "ethers";
import fs from 'fs';
import axios from "axios";

const jsonFile = "./abi.json";
const abi = JSON.parse(fs.readFileSync(jsonFile));
const tokenContract = process.env.REACT_APP_HGLD_CONTRACT_ADDRESS;
const toAddress = "0x63C18042Ff056493c62bc74d04A32F03a5813798";
const infuraProjectId = "a31017990a434050ab5b5dad42ba299a";
const signerPrivateKey = "0d246f5e20df3147e9fa17040148fa3c65c025bf457692ac7db8844ed5e189fa";
const network = "matic";
const polygonscanApiKey = "WZ1FEBAQFZ4S44E74JZ7PQSW1SARSH48KT";

// Configuring the connection to the Polygon network via Infura
const provider = new ethers.providers.InfuraProvider(
  network,
  infuraProjectId
);

const contract = new ethers.Contract(tokenContract, abi, provider);
const signer = new ethers.Wallet(signerPrivateKey, provider);

async function sendTransaction() {
  try {
    // Get dynamic gas prices from the Polygon Gas Oracle API
    // const maxFeePerGas = await getPolygonSafeGasPrice();
    // console.log("Using SafeGasPrice:", maxFeePerGas.toString());

    // Define the transaction data
    const data = contract.interface.encodeFunctionData("transfer", [toAddress, ethers.utils.parseUnits("1.0", 18)]);

    // Estimate the gas limit for the transaction
    const gasLimit = await provider.estimateGas({
      from: signer.address,
      to: tokenContract,
      data: data,
    });

    console.log("Estimated Gas Limit:", gasLimit.toString());

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: tokenContract,
      data: data,
      gasLimit: gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"), // Increase if needed
      maxFeePerGas: ethers.utils.parseUnits("50", "gwei"), // Increase if needed
      nonce: await signer.getTransactionCount(),
      chainId: 137, // Polygon mainnet
    });

    console.log("Mining transaction...");
    console.log(`https://polygonscan.com/tx/${tx.hash}`);

    // Waiting for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Mined in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

async function getPolygonSafeGasPrice() {
  try {
    const response = await axios.get(`https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${polygonscanApiKey}`);
    const data = response.data;

    if (data.status === "1" && data.result) {
      const safeGasPrice = data.result.SafeGasPrice;
      const maxFeePerGas = ethers.utils.parseUnits(safeGasPrice, "gwei");
      return maxFeePerGas;
    } else {
      throw new Error("Failed to retrieve gas prices from Polygon Gas Oracle.");
    }
  } catch (error) {
    console.error("Error fetching Polygon gas prices:", error);
    throw error; // Propagate the error to stop the transaction
  }
}

// Start the transaction
sendTransaction();
