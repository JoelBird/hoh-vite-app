import React from "react";
import { useToast } from "@chakra-ui/react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const disallowedAddresses = ["0xf48B3847936bB9cc96A3cFB0F01Eb1057cCFa349"]; // Add disallowed wallet addresses here

const WalletConnect: React.FC = () => {
  const toast = useToast();
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  //Bug to be fixed: 2 discord accounts could connect the same wallets and redeem double stake HGLD

  return (
    <ConnectButton
      autoConnect={false}
      wallets={wallets}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
      client={client}
      chain={polygon}
      detailsButton={{
        displayBalanceToken: {
          [polygon.id]: "0x539025fc166d49e63E4C30De1205164D06157d2a", // token address to display balance for
        },
      }}
      onConnect={(wallet) => {
        console.log("Connected!!!");
        const account = wallet.getAccount();
        const connectedAddress = account?.address;

        // if (
        //   connectedAddress &&
        //   disallowedAddresses.includes(connectedAddress)
        // ) {
        //   toast({
        //     title: "Connection Denied",
        //     description: `Wallet address ${connectedAddress} is not allowed to sign in.`,
        //     status: "error",
        //     duration: 3000,
        //     isClosable: true,
        //   });

        //   wallet.disconnect?.(); // Safely disconnect the wallet
        // } else {
        //   console.log(`Connected with ${connectedAddress}`);
        // }
      }}
    />
  );
};

export default WalletConnect;
