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

interface Spell {
  spellName: string;
  spellChance: number;
  spellDamage: number;
}

function ModalSpell({ openModal, isOpen, onClose }: Props) {
  const { updateTransactionData } = useTransaction();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { balance } = useHGLDBalance();
  const { transferHGLD, isLoading } = useHGLDTransfer();
  const toast = useToast();

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
  const [heroTokenId, setHeroTokenId] = useState<string>();
  const [heroHolderDiscordName, setHeroHolderDiscordName] = useState<string>();

  // Hardcoded spells
  const retailAvailableSpells: Spell[] = [
    { spellName: "lightningBolt", spellChance: 25, spellDamage: 30 },
    { spellName: "fireBall", spellChance: 50, spellDamage: 20 },
    { spellName: "acidRain", spellChance: 75, spellDamage: 10 },
  ];

  // Fetch property values
  useEffect(() => {
    if (isOpen && address) {
      axios
        .get("http://localhost:3001/api/getRow", {
          params: {
            id: "null",
            table: "propertyValues",
          },
        })
        .then((response) => {
          setPropertyDuration(response.data.retailDuration);
          setPropertyGold(response.data.retailGold);
          setPropertyNumberNextToUse(response.data.retailNumberLastUsed + 1);
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
        .get("http://localhost:3001/api/getPropertyByNumber", {
          params: {
            propertyNumber: propertyNumberNextToUse,
            propertyType: "Retail",
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

  const selectRandomSpell = () => {
    const totalChance = retailAvailableSpells.reduce(
      (total, spell) => total + spell.spellChance,
      0
    );
    let randomNum = Math.floor(Math.random() * totalChance);

    for (const spell of retailAvailableSpells) {
      if (randomNum < spell.spellChance) {
        return spell.spellName; // Return only the spell name
      }
      randomNum -= spell.spellChance;
    }
    return undefined;
  };

  const handleProceed = async () => {
    if (balance && Number(balance) < Number(propertyGold)) {
      toast({
        title: "Insufficient HGLD.",
        description: "You don't have enough HGLD to proceed.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const selectedSpell = selectRandomSpell();

    if (!selectedSpell) {
      toast({
        title: "No spell selected.",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await transferHGLD(
      propertyHolderWallet || "",
      propertyGold || ""
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
        title: `You have received ${selectedSpell}!`,
        description: "Go to My Spells to see your spells",
        status: "info",
        duration: 6000,
        isClosable: true,
      });

      try {
        const response = await axios.post(
          "http://localhost:3001/api/addSpell",
          {
            spellName: selectedSpell,
            walletAddress: address,
          }
        );
        console.log("Spell added successfully:", response.data);
      } catch (error) {
        console.error("Error adding spell:", error);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/addPropertyInteraction",
        {
          propertyName,
          propertyTokenId,
          propertyType: "Retail",
          propertyGold: propertyGold,
          interactionDuration: propertyDuration,
          interactionConcluded: "true",
          propertyHolderWalletAddress: propertyHolderWallet,
          propertyHolderDiscordName: propertyHolderDiscordName,
          heroName,
          heroTokenId,
          heroWillReceive: "Spell",
          heroHolderWalletAddress: address,
          heroHolderDiscordName: heroHolderDiscordName,
        }
      );

      const { heroId, interactionId, interactionStatus } = response.data;

      updateTransactionData(heroId, interactionStatus, interactionId);
    } catch (error) {
      console.error("Error adding property interaction:", error);
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
            Purchase a random Spell
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              We have selected a <strong>{propertyName}</strong> owned by{" "}
              <Text as="span" fontWeight="bold" color="orange.300">
                {propertyHolderDiscordName || "unknown"}
              </Text>{" "}
              for you to purchase a mystery spell from
            </Text>
            <Text>You receive: 1 mystery spell</Text>{" "}
            <Text>Spell cost: {propertyGold} $HGLD</Text>{" "}
            <Image
              src={propertyImage}
              alt="Retail"
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

export default ModalSpell;
