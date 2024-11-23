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

function ModalMilitary({ openModal, isOpen, onClose }: Props) {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { balance, isError } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();

  const toast = useToast(); // Initialize toast notifications
  const [aliveHeroes, setAliveHeroes] = useState<string[]>([]);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [selectedTrainingTrait, setSelectedTrainingTrait] = useState<
    string | null
  >(null);

  const [propertyDuration, setPropertyDuration] = useState<string>();
  const [propertyGold, setPropertyGold] = useState<string>();
  const [propertyNumberNextToUse, setPropertyNumberNextToUse] =
    useState<string>();

  const [propertyImage, setPropertyImage] = useState<string>();
  const [propertyTokenId, setPropertyTokenId] = useState<string>();
  const [propertyHolderWallet, setPropertyHolderWallet] = useState<string>();
  const [propertyHolderDiscordName, setPropertyHolderDiscordName] =
    useState<string>();
  const [propertyName, setPropertyName] = useState<string>();

  const [heroName, setHeroName] = useState<string>();
  const [heroImage, setHeroImage] = useState<string>();
  const [heroTokenId, setHeroTokenId] = useState<string>();
  const [heroHolderDiscordName, setHeroHolderDiscordName] = useState<string>();
  const [heroHolderDiscordId, setHeroHolderDiscordId] = useState<string>();
  const [heroInteractionStatus, setHeroInteractionStatus] = useState<string>();

  const { updateTransactionData } = useTransaction();

  // Fetch alive heroes
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get(`http://localhost:3002/api/alive-heroes/${address}`)
        .then((response) => {
          setAliveHeroes(response.data.aliveHeroes);
        })
        .catch((error) => {
          console.error("Error fetching alive heroes:", error);
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
          setPropertyDuration(response.data.militaryDuration);
          setPropertyGold(response.data.militaryGold);
          setPropertyNumberNextToUse(response.data.militaryNumberLastUsed + 1);
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
            propertyType: "Military",
          },
        })
        .then((response) => {
          setPropertyImage(response.data.imageLink);
          setPropertyTokenId(response.data.tokenId);
          setPropertyHolderWallet(response.data.currentHolderWallet);
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

  // Handle hero selection
  const handleHeroSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHero(event.target.value);
  };

  // Handle hero selection
  const handleTraitSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedTrainingTrait(event.target.value);
  };

  const handleProceed = async () => {
    // Check if a hero is selected
    if (!selectedHero) {
      toast({
        title: "No hero selected.",
        description: "Please select a hero to train.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!selectedTrainingTrait) {
      toast({
        title: "No training trait selected.",
        description: "Please select a trait to train.",
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
        propertyHolderWallet || "",
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
        try {
          const response = await axios.post(
            "http://localhost:3002/addPropertyInteraction",
            {
              propertyName,
              propertyTokenId,
              propertyType: "Military",
              propertyGold: propertyGold,
              interactionDuration: "10",
              interactionConcluded: "false",
              propertyHolderWalletAddress: propertyHolderWallet,
              propertyHolderDiscordName: propertyHolderDiscordName,
              heroName,
              heroTokenId,
              heroWillReceive: selectedTrainingTrait,
              heroHolderWalletAddress: address,
              heroHolderDiscordName: heroHolderDiscordName,
            }
          );

          // Destructure the response data
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
            Upgrade a Knight/Druid
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              We have selected a <strong>{propertyName}</strong> owned by{" "}
              <Text as="span" fontWeight="bold" color="orange.300">
                {propertyHolderDiscordName || "unknown"}
              </Text>{" "}
              to train a Druid/Knight.
            </Text>
            <Text>Training cost: {propertyGold} $HGLD</Text>{" "}
            <Text>
              Training Time:{" "}
              {convertSecondsToHoursMinutes(Number(propertyDuration))}
            </Text>{" "}
            <Image
              src={propertyImage}
              alt="Military Image"
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
              placeholder="Select a Hero to Train"
              mt={4}
              bg="gray.700"
              color="white"
              borderColor="orange.300"
              _hover={{ borderColor: "orange.400" }}
              _focus={{ borderColor: "orange.500" }}
              onChange={handleHeroSelection} // Bind the onChange handler
            >
              {aliveHeroes.length > 0 ? (
                aliveHeroes.map((heroName, index) => (
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
                  All your heroes are dead
                </option>
              )}
            </Select>
            <Select
              placeholder="Select a trait to train"
              mt={4}
              bg="gray.700"
              color="white"
              borderColor="orange.300"
              _hover={{ borderColor: "orange.400" }}
              _focus={{ borderColor: "orange.500" }}
              onChange={handleTraitSelection} // Bind the onChange handler
            >
              {aliveHeroes.length > 0 ? (
                <>
                  <option
                    value="Defence"
                    style={{ color: "white", backgroundColor: "gray.700" }}
                  >
                    Defence
                  </option>
                  <option
                    value="Attack"
                    style={{ color: "white", backgroundColor: "gray.700" }}
                  >
                    Attack
                  </option>
                </>
              ) : (
                <option
                  value=""
                  style={{ color: "white", backgroundColor: "gray.700" }}
                >
                  All your heroes are dead
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

export default ModalMilitary;
