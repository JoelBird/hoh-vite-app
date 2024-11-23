import { useWalletBalance, useActiveAccount } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const tokenAddress = "0x539025fc166d49e63E4C30De1205164D06157d2a";

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
