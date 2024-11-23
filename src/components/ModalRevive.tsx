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
import { useTransaction } from "../TransactionContext";
import { useActiveAccount } from "thirdweb/react";
import { useHGLDBalance } from "../hooks/useHGLDBalance";
import useHGLDTransfer from "../hooks/useHGLDTransfer";

interface Props {
  openModal: (modalName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function ModalRevive({ openModal, isOpen, onClose }: Props) {
  const { updateTransactionData } = useTransaction();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { balance, isError } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();

  const toast = useToast(); // Initialize toast notifications
  const [deadHeroes, setDeadHeroes] = useState<string[]>([]);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);

  const [propertyDuration, setPropertyDuration] = useState<string>();
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

  // Fetch dead heroes
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get(`http://localhost:3002/api/dead-heroes/${address}`)
        .then((response) => {
          setDeadHeroes(response.data.deadHeroes);
        })
        .catch((error) => {
          console.error("Error fetching dead heroes:", error);
        });
    }
  }, [isOpen, address]);

  // Fetch property values
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get("http://localhost:3002/api/getRow", {
          params: {
            id: "null",
            table: "propertyValues",
          },
        })
        .then((response) => {
          setPropertyDuration(response.data.housingDuration);
          setPropertyGold(response.data.housingGold);
          setPropertyNumberNextToUse(response.data.housingNumberLastUsed + 1);
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
        .get("http://localhost:3002/api/getPropertyByNumber", {
          params: {
            propertyNumber: propertyNumberNextToUse,
            propertyType: "Housing",
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
        .get("http://localhost:3002/api/getRow", {
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
        description: "Please select a hero to revive.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if hero is active
    if (heroInteractionStatus == "true") {
      toast({
        title: `${heroName} is active`, // Use template literals to include heroName
        description: "This hero is busy and cannot Train right now",
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
        propertyGold || ""
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

      // Only proceed with the `addPropertyInteraction` transaction if the HGLD transfer was successful
      if (result.title.includes("Successful")) {
        console.log("In succesful revive");
        try {
          const response = await axios.post(
            "http://localhost:3002/addPropertyInteraction",
            {
              propertyName,
              propertyTokenId,
              propertyType: "Housing",
              propertyGold: propertyGold,
              interactionDuration: "10",
              interactionConcluded: "false",
              propertyHolderWalletAddress: propertyHolderWalletAddress,
              propertyHolderDiscordName: propertyHolderDiscordName,
              heroName,
              heroTokenId,
              heroWillReceive: "Revive",
              heroHolderWalletAddress: address,
              heroHolderDiscordName: heroHolderDiscordName,
            }
          );

          // Destructure the response data to get transaction information
          const { heroId, interactionId, interactionStatus } = response.data;

          console.log("Property interaction added successfully");
          console.log("Hero ID:", heroId);
          console.log("Interaction ID:", interactionId);
          console.log("Interaction Status:", interactionStatus);

          // Update the shared state with the new transaction info
          updateTransactionData(heroId, interactionStatus, interactionId);
        } catch (error) {
          console.error("Error adding property interaction:", error);
        }
      }
    }
  };

  function convertSecondsToHoursMinutes(seconds: number) {
    const hours = Math.floor(seconds / 3600); // Convert seconds to hours
    const minutes = Math.floor((seconds % 3600) / 60); // Get the remaining minutes
    return `${hours} hours and ${minutes} minutes`;
  }

  console.log(propertyName);
  console.log(propertyDuration);
  console.log(propertyGold);

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
            Revive a Knight/Druid
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              We have selected a <strong>{propertyName}</strong> owned by{" "}
              <Text as="span" fontWeight="bold" color="orange.300">
                {propertyHolderDiscordName || "unknown"}
              </Text>{" "}
              to revive a fallen Druid/Knight.
            </Text>
            <Text>Revive cost: {propertyGold} $HGLD</Text>{" "}
            <Text>
              Revival Time:{" "}
              {convertSecondsToHoursMinutes(Number(propertyDuration))}
            </Text>{" "}
            <Image
              src={propertyImage}
              alt="Revive Image"
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
              placeholder="Select a fallen Hero to Revive"
              mt={4}
              bg="gray.700"
              color="white"
              borderColor="orange.300"
              _hover={{ borderColor: "orange.400" }}
              _focus={{ borderColor: "orange.500" }}
              onChange={handleHeroSelection} // Bind the onChange handler
            >
              {deadHeroes.length > 0 ? (
                deadHeroes.map((heroName, index) => (
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
                  No dead heroes found
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

export default ModalRevive;
