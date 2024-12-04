import React from "react";
import { useToast } from "@chakra-ui/react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const disallowedAddresses = ["0xf48B3847936bB9cc96A3cFB0F01Eb1057cCFa349"]; // Add disallowed wallet addresses here

const WalletConnect: React.FC = () => {
  const toast = useToast();

  return (
    <ConnectButton
      client={client}
      chain={polygon}
      detailsButton={{
        displayBalanceToken: {
          [polygon.id]: "0x539025fc166d49e63E4C30De1205164D06157d2a", // token address to display balance for
        },
      }}
      onConnect={(wallet) => {
        const account = wallet.getAccount();
        const connectedAddress = account?.address;

        if (
          connectedAddress &&
          disallowedAddresses.includes(connectedAddress)
        ) {
          toast({
            title: "Connection Denied",
            description: `Wallet address ${connectedAddress} is not allowed to sign in.`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });

          wallet.disconnect?.(); // Safely disconnect the wallet
        } else {
          console.log(`Connected with ${connectedAddress}`);
        }
      }}
    />
  );
};

export default WalletConnect;
