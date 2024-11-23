import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Grid, GridItem, Center, Text } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import NftDisplay from "./components/NftDisplay";
import NftDisplaySkeleton from "./components/NftDisplaySkeleton";
import { useActiveAccount } from "thirdweb/react";

interface Token {
  id: string;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number;
    image: string;
    external_url: string;
    attributes: any[];
    properties: any;
  };
  staticUrl: string;
}

interface Member {
  discordName: string;
  discordId: string;
  stargazeWallets: string[];
  stakedPrettyvenomNfts: string[];
  stakedKnightNfts: string[];
  stakedSteamlandNfts: string[];
}

function App() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const [user, setUser] = useState<{ id: string; username: string } | null>( //DISCORD USER
    null
  );
  // const [nfts, setNfts] = useState<Token[]>([]);
  const [collection, setCollection] = useState<string>("");
  const [collectionAddress, setCollectionAddress] = useState<string>("");
  const [collectionChain, setCollectionChain] = useState<string>("");
  // const [stakedNfts, setStakedNfts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // New loading state
  const location = useLocation();

  // Effect to load user data from local storage or URL parameters
  useEffect(() => {
    console.log("Loading user data from local storage or URL parameters");
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log("Loaded user from local storage:", JSON.parse(storedUser));
    } else {
      const params = new URLSearchParams(location.search);
      const userParam = params.get("user");
      if (userParam) {
        const userData = JSON.parse(userParam);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("Loaded user from URL parameters:", userData);
        window.history.replaceState({}, document.title, "");
      }
    }
  }, [location]);

  // Checks if need to add new member entry or update with new connected wallet
  useEffect(() => {
    if (user && address) {
      axios
        .post("http://localhost:3002/api/add-member", {
          id: user.id,
          username: user.username,
          address: address,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error posting data:", error);
        });
    }
  }, [user, address]);

  return (
    <Grid
      templateAreas={{
        base: `"nav" "nav2" "main"`,
        lg: `"nav" "nav2" "main"`, // 1024px
      }}
      padding="10px"
    >
      <GridItem area="nav">
        <NavBar
          user={user}
          setUser={setUser}
          setCollection={setCollection}
          setCollectionAddress={setCollectionAddress}
          setCollectionChain={setCollectionChain}
        />
      </GridItem>
      <GridItem area="main">
        {user && address ? (
          collection ? (
            <>
              {loading ? (
                <NftDisplaySkeleton />
              ) : (
                <NftDisplay
                  walletAddress={address}
                  collectionChain={collectionChain}
                  collectionAddress={collectionAddress}
                  collection={collection}
                  user={user}
                />
              )}
            </>
          ) : (
            <Center flexDirection="column">
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Please select a collection
              </Text>
            </Center>
          )
        ) : (
          <Center flexDirection="column">
            {!user ? (
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Please log in with Discord
              </Text>
            ) : (
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Please connect your wallet to view NFTs
              </Text>
            )}
          </Center>
        )}
      </GridItem>
    </Grid>
  );
}

export default App;
