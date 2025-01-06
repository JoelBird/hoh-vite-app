import React from "react";
import { useToast } from "@chakra-ui/react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

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
      autoConnect={true}
      wallets={wallets}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
      client={client}
      chain={polygon}
      detailsButton={{
        displayBalanceToken: {
          [polygon.id]: process.env.REACT_APP_HGLD_CONTRACT_ADDRESS || "", // token address to display balance for
        },
      }}
      onConnect={(wallet) => {
        const account = wallet.getAccount();
        const connectedAddress = account?.address;
      }}
    />
  );
};

export default WalletConnect;
