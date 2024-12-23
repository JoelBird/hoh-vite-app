import React, { useEffect, useState } from "react";
import { SimpleGrid, useBreakpointValue, Box, Text } from "@chakra-ui/react";
import NftDisplaySkeleton from "./NftDisplaySkeleton";
import HeroCard from "./HeroCard";
import PropertyCard from "./PropertyCard";
import { useTransaction } from "../contexts/TransactionContext";
import { useStakedStatus } from "../contexts/StakedStatusContext";
import { useHasClaimedStake } from "../contexts/HasClaimedStakeContext";
import { useHasClaimedRent } from "../contexts/HasClaimedRentContext";
import { useAliveStatus } from "../contexts/AliveStatusContext";

interface NFT {
  tokenId: string;
  name: string;
  image: string;
  stakedStatus: string;
  hasClaimedStake: string;
  hasClaimedRent: string;
  aliveStatus: string;
  interactionStatus: string;
  interactionId: string;
  propertyType: string;
  propertyRentalValue: string;
  propertyLevel: string;
  heroWillReceive: string;

  // Properties specific to Property NFTs
  holderTotalGoldEarned?: number;
  holderTotalTransactions?: number;
}

interface NFTDisplayProps {
  walletAddress: string;
  collectionChain: string;
  collectionAddress: string;
  collection: string; // "druid", "knight", or "property"
  user: { id: string; username: string } | null;
}

const NFTDisplay: React.FC<NFTDisplayProps> = ({
  walletAddress,
  collectionChain,
  collectionAddress,
  collection,
  user,
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });

  useEffect(() => {
    const getNFTs = async () => {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/fetchNfts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
            collectionChain,
            collectionAddress,
            collection,
            user,
          }),
        }
      );

      const fetchedNFTs = await response.json();
      setNfts(fetchedNFTs);
      setLoading(false);
    };

    getNFTs();
  }, [walletAddress, collectionChain, collectionAddress, collection]); // Re-run effect when props change

  if (loading) return <NftDisplaySkeleton />;
  if (error) return <p>Error: {error}</p>;

  const { transactionData } = useTransaction();
  const { aliveStatusData } = useAliveStatus();
  const { stakedStatusData } = useStakedStatus();
  const { hasClaimedStakeData } = useHasClaimedStake();
  const { hasClaimedRentData } = useHasClaimedRent();

  if (nfts.length === 0) {
    return (
      <Box textAlign="center" pt={8}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          😔 Connected wallet does not have any {collection} NFTs
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} pt={8}>
      {nfts.map((nft) =>
        collection === "property" ? (
          <PropertyCard
            key={nft.tokenId}
            tokenId={nft.tokenId}
            name={nft.name}
            image={nft.image}
            hasClaimedRent={
              hasClaimedRentData[nft.tokenId]?.hasClaimed || nft.hasClaimedRent
            }
            holderTotalGoldEarned={nft.holderTotalGoldEarned || 0}
            holderTotalTransactions={nft.holderTotalTransactions || 0}
            propertyType={nft.propertyType || ""}
            propertyRentalValue={nft.propertyRentalValue || ""}
            propertyLevel={nft.propertyLevel || ""}
            collection={collection}
          />
        ) : (
          <HeroCard
            key={nft.tokenId}
            tokenId={nft.tokenId}
            name={nft.name}
            image={nft.image}
            stakedStatus={
              stakedStatusData[nft.tokenId]?.stakedStatus || nft.stakedStatus
            }
            hasClaimedStake={
              hasClaimedStakeData[nft.tokenId]?.hasClaimed ||
              nft.hasClaimedStake
            }
            aliveStatus={
              aliveStatusData[nft.tokenId]?.aliveStatus || nft.aliveStatus
            }
            interactionStatus={
              transactionData[nft.tokenId]?.interactionStatus ||
              nft.interactionStatus
            }
            interactionId={
              transactionData[nft.tokenId]?.interactionId || nft.interactionId
            }
            collection={collection}
          />
        )
      )}
    </SimpleGrid>
  );
};

export default NFTDisplay;
