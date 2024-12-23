import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  Divider,
  Image,
  useToast,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { useTransaction } from "../contexts/TransactionContext";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "../contexts/UserContext";
import { useHGLDBalance } from "../hooks/useHGLDBalance";
import useHGLDTransfer from "../hooks/useHGLDTransfer";

interface Props {
  openModal: (modalName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Spell {
  spellName: string;
  spellChance: number;
  spellDamage: number;
}

function ModalShares({ openModal, isOpen, onClose }: Props) {
  const { updateTransactionData } = useTransaction();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { user, setUser } = useUser();
  const { balance } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();
  const toast = useToast();
  const [sharesValue, setSharesValue] = React.useState("0");
  const [sharesPercent, setSharesPercent] = React.useState("0");
  const [hgldValue, setHgldValue] = React.useState("");

  const [propertyDuration, setPropertyDuration] = useState<string>();
  //   const [propertyGold, setPropertyGold] = useState<string>();
  const propertyGold = "10";
  const [totalGoldSentToGovernment, setTotalGoldSentToGovernment] =
    useState<string>();

  const [propertyNumberNextToUse, setPropertyNumberNextToUse] =
    useState<string>();

  const [propertyImage, setPropertyImage] = useState<string>();
  const [propertyTokenId, setPropertyTokenId] = useState<string>();
  const [propertyHolderWallet, setPropertyHolderWallet] = useState<string>();
  const [propertyHolderDiscordName, setPropertyHolderDiscordName] =
    useState<string>();
  const [propertyName, setPropertyName] = useState<string>();

  const [heroName, setHeroName] = useState<string>();
  const [heroTokenId, setHeroTokenId] = useState<string>();
  const [heroHolderDiscordName, setHeroHolderDiscordName] = useState<string>();

  // Fetch total goldSentToGovernment
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/total-gold-sent`) // Call the total gold endpoint
        .then((response) => {
          setTotalGoldSentToGovernment(response.data.totalGold); // Store the total value + 1
        })
        .catch((error) => {
          console.error("Error fetching total goldSentToGovernment:", error);
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
          setPropertyNumberNextToUse(
            response.data.governmentNumberLastUsed + 1
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
            propertyType: "Government",
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

  const handleProceed = async () => {
    if (!hgldValue) {
      toast({
        title: "No $HGLD selected.",
        description: "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (balance && Number(balance) < Number(hgldValue)) {
      toast({
        title: "Insufficient HGLD.",
        description: `You don't have enough HGLD to purchase ${sharesValue} shares.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const result = await transferHGLD(
      propertyHolderWallet || "",
      hgldValue || ""
    );

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
        title: `You have received ${sharesValue} shares!`,
        status: "info",
        duration: 6000,
        isClosable: true,
      });

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/update-gold`,
          {
            discordId: user?.id,
            hgldValue: hgldValue,
          }
        );
        console.log("Gold updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating gold:", error);
      }

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/addPropertyInteraction`,
          {
            propertyName,
            propertyTokenId,
            propertyType: "Government",
            propertyGold: propertyGold,
            interactionDuration: propertyDuration,
            interactionConcluded: "true",
            propertyHolderWalletAddress: propertyHolderWallet,
            propertyHolderDiscordName: propertyHolderDiscordName,
            heroName,
            heroTokenId,
            heroWillReceive: "Shares",
            heroHolderWalletAddress: address,
            heroHolderDiscordName: heroHolderDiscordName,
          }
        );
      } catch (error) {
        console.error("Error adding property interaction:", error);
      }
    }
  };

  const handleConversion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHgldValue(value);

    // Convert HGLD to Shares by dividing by 10
    const shares = parseFloat(value) / 10;
    setSharesValue(isNaN(shares) ? "" : shares.toString());

    // Calculate sharesPercent safely
    const totalGold =
      parseFloat(totalGoldSentToGovernment || "0") + parseFloat(value);
    setSharesPercent(
      totalGold > 0 ? ((parseFloat(value) / totalGold) * 100).toFixed(2) : "0"
    );
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
            Purchase Shares
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              We have selected a <strong>{propertyName}</strong> owned by{" "}
              <Text as="span" fontWeight="bold" color="orange.300">
                {propertyHolderDiscordName || "unknown"}
              </Text>{" "}
              for you to purchase shares from.
            </Text>
            <Text fontSize="sm">
              👉 Shares allow you to dictate future developments for the HOH
              project
            </Text>{" "}
            <Text fontSize="sm">
              👉 You receive: 1 share per {propertyGold} $HGLD
            </Text>{" "}
            <>
              <br />
              <Text mb="8px">
                You will receive {sharesValue} shares which is {sharesPercent}%{" "}
                of total shares
              </Text>
              <Input
                value={hgldValue}
                onChange={(event) => {
                  const value = event.target.value;
                  if (/^\d*$/.test(value)) {
                    // Allow only digits
                    handleConversion(event);
                  }
                }}
                placeholder="Enter HGLD value"
                size="sm"
              />
            </>
            <Image
              src={propertyImage}
              alt="Government"
              borderRadius="md"
              my={4}
              mx="auto"
              height="auto"
              width="100%"
              maxWidth="300px"
              objectFit="cover"
            />
            <Divider my={3} />
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

export default ModalShares;
