import { useWalletBalance, useActiveAccount } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const tokenAddress = process.env.REACT_APP_HGLD_CONTRACT_ADDRESS;

// Custom hook to get the HGLD balance
export const useHGLDBalance = () => {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const { data, isLoading, isError } = useWalletBalance({
    chain: polygon,
    address,
    client,
    tokenAddress,
  });

  return { balance: data?.displayValue, isError };
};
