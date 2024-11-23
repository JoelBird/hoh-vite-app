import React from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "28448746a7bbfa29707def6052b3eced",
});

const WalletConnect: React.FC = () => {
  return (
    <ConnectButton
      client={client}
      chain={polygon}
      detailsButton={{
        displayBalanceToken: {
          [polygon.id]: "0x539025fc166d49e63E4C30De1205164D06157d2a", // token address to display balance for
        },
      }}
    />
  );
};

export default WalletConnect;
