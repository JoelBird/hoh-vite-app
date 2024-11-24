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
  useToast,
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

function ModalWork({ openModal, isOpen, onClose }: Props) {
  const { updateTransactionData } = useTransaction();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { balance, isError } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();

  const toast = useToast();
  const [aliveHeroes, setAliveHeroes] = useState<string[]>([]);
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

  const propertyTypes = ["agriculture", "production"];
  const randomIndex = Math.floor(Math.random() * propertyTypes.length);
  const randomPropertyTypeLowercase = propertyTypes[randomIndex];
  const randomPropertyTypeUppercase =
    randomPropertyTypeLowercase.charAt(0).toUpperCase() +
    randomPropertyTypeLowercase.slice(1);

  // Fetch alive heroes
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/alive-heroes/${address}`)
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
        .get(`${process.env.REACT_APP_API_URL}/api/getRow`, {
          params: {
            id: "null",
            table: "propertyValues",
          },
        })
        .then((response) => {
          // Ensure data properties are accessed after `randomPropertyTypeLowercase` is set
          setPropertyDuration(
            response.data[`${randomPropertyTypeLowercase}Duration`]
          );
          setPropertyGold(response.data[`${randomPropertyTypeLowercase}Gold`]);
          setPropertyNumberNextToUse(
            response.data[`${randomPropertyTypeLowercase}NumberLastUsed`] + 1
          );
        })
        .catch((error) => {
          console.error("Error fetching property data:", error);
        });
    }
  }, [isOpen, address, randomPropertyTypeLowercase]);

  // Fetch properties
  useEffect(() => {
    if (isOpen && address && propertyNumberNextToUse) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/getPropertyByNumber`, {
          params: {
            propertyNumber: propertyNumberNextToUse,
            propertyType: randomPropertyTypeUppercase,
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

  // Handle hero selection
  const handleHeroSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHero(event.target.value);
  };

  const handleProceed = async () => {
    // Check if a hero is selected
    if (!selectedHero) {
      toast({
        title: "No hero selected.",
        description: "Please select a hero to send to work.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if hero is active
    if (heroInteractionStatus == "true") {
      toast({
        title: `${heroName} is active`,
        description: "This hero is busy and cannot Work right now",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: `${heroName} has been sent to work`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onClose();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/addPropertyInteraction`,
        {
          propertyName,
          propertyTokenId,
          propertyType: randomPropertyTypeUppercase,
          propertyGold,
          interactionDuration: "60",
          interactionConcluded: "false",
          propertyHolderWalletAddress,
          propertyHolderDiscordName,
          heroName,
          heroTokenId,
          heroWillReceive: "100 HGLD",
          heroHolderWalletAddress: address,
          heroHolderDiscordName,
        }
      );

      const { heroId, interactionId, interactionStatus } = response.data;

      console.log("Property interaction added successfully");
      updateTransactionData(heroId, interactionStatus, interactionId);
    } catch (error) {
      console.error("Error adding property interaction:", error);
    }
  };

  function convertSecondsToHoursMinutes(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
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
              for your Druid/Knight to work at
            </Text>
            <Text>
              Work Time:{" "}
              {convertSecondsToHoursMinutes(Number(propertyDuration))}
            </Text>{" "}
            <Text>You receive: {propertyGold} $HGLD</Text>{" "}
            <Image
              src={propertyImage}
              alt={randomPropertyTypeUppercase}
              borderRadius="md"
              my={4}
              mx="auto"
              height="auto"
              width="100%"
              maxWidth="300px"
              objectFit="cover"
            />
            <Divider my={3} />
            <Select
              placeholder="Select a Hero to send to Work"
              mt={4}
              bg="gray.700"
              color="white"
              borderColor="orange.300"
              _hover={{ borderColor: "orange.400" }}
              _focus={{ borderColor: "orange.500" }}
              onChange={handleHeroSelection}
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
          </ModalBody>
          <Divider my={4} />
          <ModalFooter>
            <Button
              colorScheme="orange"
              width="100%"
              size="lg"
              onClick={handleProceed}
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

export default ModalWork;
