import { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const contract = getContract({
  address: process.env.REACT_APP_HGLD_CONTRACT_ADDRESS || "",
  chain: polygon,
  client: client,
});

interface TransferResult {
  title: string;
  description: string;
}

const useHGLDTransfer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: sendTx } = useSendTransaction();

  const transferHGLD = async (toAddress: string, amount: string): Promise<TransferResult> => {
    setIsLoading(true);
    const bigIntAmount = BigInt(parseInt(amount) * 10 ** 18);
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value)",
        params: [toAddress, bigIntAmount],
      });

      const transactionResult = await new Promise<any>((resolve, reject) => {
        sendTx(transaction, {
          onSuccess: (tx) => resolve(tx),
          onError: (error) => reject(error),
        });
      });

      setIsLoading(false);

      return {
        title: "Transaction Successful",
        description: `Transaction ${transactionResult.transactionHash} completed successfully.`,
      };
    } catch (err: any) {
      setIsLoading(false);

      return {
        title: "Transaction Failed",
        description: `Error: ${err?.message || "An unknown error occurred"}`,
      };
    }
  };

  return { transferHGLD, isLoading };
};

export default useHGLDTransfer;
