import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Button,
  Text,
  Select,
  Divider,
  Image,
  useToast, // Import toast from Chakra
} from "@chakra-ui/react";
import axios from "axios";
import { useTransaction } from "../contexts/TransactionContext";
import { useStakedStatus } from "../contexts/StakedStatusContext";
import { useActiveAccount } from "thirdweb/react";
import { useHGLDBalance } from "../hooks/useHGLDBalance";
import useHGLDTransfer from "../hooks/useHGLDTransfer";
import { useUser } from "../contexts/UserContext";

interface Props {
  openModal: (modalName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Hero {
  heroName: string;
}

function ModalStake({ openModal, isOpen, onClose }: Props) {
  const { updateTransactionData } = useTransaction();
  const { stakedStatusData, updateStakedStatus } = useStakedStatus();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { user, setUser } = useUser();
  const { balance, isError } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();

  const toast = useToast(); // Initialize toast notifications
  const [unstakedHeroes, setUnstakedHeroes] = useState<string[]>([]);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);

  const [stakingGoldReward, setStakingGoldReward] = useState<string>();
  const [propertyGold, setPropertyGold] = useState<string>();
  const [propertyNumberNextToUse, setPropertyNumberNextToUse] =
    useState<string>();

  const [propertyImage, setPropertyImage] = useState<string>();
  const [propertyTokenId, setPropertyTokenId] = useState<string>();
  const [propertyHolderWalletAddress, setPropertyHolderWalletAddress] =
    useState<string>();
  const [propertyHolderDiscordName, setPropertyHolderDiscordName] =
    useState<string>();
  const [propertyName, setPropertyName] = useState<string>();

  const [heroName, setHeroName] = useState<string>();
  const [heroImage, setHeroImage] = useState<string>();
  const [heroTokenId, setHeroTokenId] = useState<string>();
  const [heroHolderDiscordName, setHeroHolderDiscordName] = useState<string>();
  const [heroHolderDiscordId, setHeroHolderDiscordId] = useState<string>();
  const [heroInteractionStatus, setHeroInteractionStatus] = useState<string>();

  const gold = "5";

  useEffect(() => {
    if (isOpen && address) {
      axios
        .get<{ unstakedHeroes: Hero[] }>(
          `${process.env.REACT_APP_API_URL}/api/unstaked-heroes/${user?.id}`
        )
        .then((response) => {
          const heroNames = response.data.unstakedHeroes.map(
            (hero) => hero.heroName
          );
          setUnstakedHeroes(heroNames);
        })
        .catch((error) => {
          console.error("Error fetching unstaked heroes:", error);
        });
    }
  }, [isOpen, address]);

  // Fetch property values
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/getRow`, {
          params: {
            id: "null",
            table: "propertyValues",
          },
        })
        .then((response) => {
          setStakingGoldReward(response.data.stakingGoldReward);
          setPropertyGold(response.data.hospitalityGold);
          setPropertyNumberNextToUse(
            response.data.hospitalityNumberLastUsed + 1
          );
        })
        .catch((error) => {
          console.error("Error fetching property values:", error);
        });
    }
  }, [isOpen, address]);

  // Fetch properties
  useEffect(() => {
    if (isOpen && address && propertyNumberNextToUse) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/getPropertyByNumber`, {
          params: {
            propertyNumber: propertyNumberNextToUse,
            propertyType: "Hospitality",
          },
        })
        .then((response) => {
          setPropertyImage(response.data.imageLink);
          setPropertyTokenId(response.data.tokenId);
          setPropertyHolderWalletAddress(response.data.currentHolderWallet);
          setPropertyHolderDiscordName(response.data.currentHolderDiscordName);
          setPropertyName(response.data.propertyName);
        })
        .catch((error) => {
          console.error("Error fetching properties:", error);
        });
    }
  }, [isOpen, address, propertyNumberNextToUse]);

  // Fetch hero data when selected from dropdown
  useEffect(() => {
    if (isOpen && address && selectedHero) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/getRow`, {
          params: {
            id: selectedHero,
            table: "heroes",
          },
        })
        .then((response) => {
          setHeroName(response.data.heroName);
          setHeroImage(response.data.imageLink);
          setHeroTokenId(response.data.tokenId);
          setHeroHolderDiscordName(response.data.currentHolderDiscordName);
          setHeroHolderDiscordId(response.data.currentHolderDiscordId);
          setHeroInteractionStatus(response.data.interactionStatus);
        })
        .catch((error) => {
          console.error("Error fetching hero data:", error);
        });
    }
  }, [isOpen, address, selectedHero]);

  const handleHeroSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHero(event.target.value);
  };

  const handleProceed = async () => {
    if (!selectedHero) {
      toast({
        title: "No hero selected.",
        description: "Please select a hero to stake.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if user has enough HGLD
    if (balance && Number(balance) < Number(propertyGold)) {
      toast({
        title: "Insufficient HGLD.",
        description: "You don't have enough HGLD to proceed.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    } else {
      const result = await transferHGLD(
        propertyHolderWalletAddress || "",
        gold || ""
      );

      // Display a toast for the result of the HGLD transfer
      toast({
        title: result.title,
        description: result.description,
        status: result.title.includes("Successful") ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
      onClose();

      if (result.title.includes("Successful")) {
        toast({
          title: `${selectedHero} is now Staked!`,
          description: `You can now claim ${stakingGoldReward} $HGLD every day this NFT remains in your wallet`,
          status: "info",
          duration: 6000,
          isClosable: true,
        });

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/stakeHero`,
            {
              heroName: heroName,
              walletAddress: address,
            }
          );
        } catch (error) {
          console.error("Error Staking Hero:", error);
        }

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/addPropertyInteraction`,
            {
              propertyName,
              propertyTokenId,
              propertyType: "Hospitality",
              propertyGold: propertyGold,
              interactionDuration: "0",
              interactionConcluded: "true",
              propertyHolderWalletAddress: propertyHolderWalletAddress,
              propertyHolderDiscordName: propertyHolderDiscordName,
              heroName,
              heroTokenId,
              heroWillReceive: "Staking",
              heroHolderWalletAddress: address,
              heroHolderDiscordName: heroHolderDiscordName,
            }
          );

          if (heroTokenId) {
            updateStakedStatus(heroTokenId, "staked");
          } else {
            console.error(
              "heroTokenId is undefined, cannot update staked status."
            );
          }
        } catch (error) {
          console.error("Error adding property interaction:", error);
        }
      }
    }
  };

  return (
    <>
      <Modal size="2xl" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent
          px={20}
          py={6}
          borderRadius="md"
          bg="gray.800"
          color="white"
          border="1px solid"
          borderColor="orange.400"
        >
          <ModalHeader fontSize="3xl" fontWeight="bold" color="orange.300">
            Stake a Knight/Druid
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              We have selected a <strong>{propertyName}</strong> owned by{" "}
              <Text as="span" fontWeight="bold" color="orange.300">
                {propertyHolderDiscordName || "unknown"}
              </Text>{" "}
              to stake a Druid/Knight.
            </Text>
            <Text fontSize="sm">
              👉 You can claim {stakingGoldReward} $HGLD every day that your
              staked hero remains in your wallet
            </Text>
            <Text fontSize="sm">
              👉 Staking a hero does not remove it from your wallet
            </Text>{" "}
            <br />
            <Text>Staking cost: </Text>{" "}
            <Text as="span" fontWeight="bold" color="orange.300">
              {propertyGold} $HGLD
            </Text>{" "}
            <Image
              src={propertyImage}
              alt="Stake Image"
              borderRadius="md"
              my={4}
              mx="auto"
              height="auto"
              width="100%"
              maxWidth="300px" // Ensures it doesn't get too large on bigger screens
              objectFit="cover" // Ensures the image retains its aspect ratio
            />
            <Divider my={3} />
            {/* Dynamically populate the select options with dead heroes */}
            <Select
              placeholder="Select a hero to stake"
              mt={4}
              bg="gray.700"
              color="white"
              borderColor="orange.300"
              _hover={{ borderColor: "orange.400" }}
              _focus={{ borderColor: "orange.500" }}
              onChange={handleHeroSelection} // Bind the onChange handler
            >
              {unstakedHeroes.length > 0 ? (
                unstakedHeroes.map((heroName, index) => (
                  <option
                    key={index}
                    value={heroName}
                    style={{ color: "white", backgroundColor: "gray.700" }}
                  >
                    {heroName}
                  </option>
                ))
              ) : (
                <option
                  value=""
                  style={{ color: "white", backgroundColor: "gray.700" }}
                >
                  No unstaked heroes found
                </option>
              )}
            </Select>
          </ModalBody>
          <Divider my={4} />
          <ModalFooter>
            <Button
              colorScheme="orange"
              width="100%"
              size="lg"
              onClick={handleProceed} // Trigger the handleProceed function
              isLoading={isLoading}
            >
              Proceed
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ModalStake;
