import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  TableContainer,
  Icon,
} from "@chakra-ui/react";
import getCountdown from "../functions/getCountdown";
import { useActiveAccount } from "thirdweb/react";
import { InfoIcon } from "@chakra-ui/icons";

interface Interaction {
  interactionId: string;
  propertyName: string;
  propertyTokenId: string;
  propertyType: string;
  propertyGoldEarned: string;
  interactionDuration: string;
  interactionConcluded: string;
  propertyHolderWalletAddress: string;
  propertyHolderDiscordName: string;
  heroName: string;
  heroTokenId: string;
  heroWillReceive: string;
  interactionStartTime: string;
  heroHolderWalletAddress: string;
  heroHolderDiscordName: string;
}

interface Props {
  collection: string;
  tokenId: string;
  onClose: () => void; // Function to close the modal from ParentComponent
}

const InteractionsModal: React.FC<Props> = ({
  collection,
  tokenId,
  onClose,
}) => {
  const [filteredInteractions, setFilteredInteractions] = useState<
    Interaction[]
  >([]);
  const [countdowns, setCountdowns] = useState<string[]>([]); // Array to store countdowns for each interaction
  const { isOpen, onOpen, onClose: internalOnClose } = useDisclosure();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  useEffect(() => {
    onOpen(); // Open the modal when the component mounts
    fetchAndFilterInteractions();
  }, []);

  const fetchAndFilterInteractions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/fetchPropertyInteractions`
      );
      const interactions: Interaction[] = response.data;

      let filteredData: Interaction[] = [];

      // Apply filtering based on collection and tokenId
      if (tokenId === "false" && collection === "property") {
        filteredData = interactions.filter(
          (interaction) => interaction.propertyHolderWalletAddress === address
        );
      } else if (
        tokenId === "false" &&
        (collection === "druid" || collection === "knight")
      ) {
        filteredData = interactions.filter(
          (interaction) => interaction.heroHolderWalletAddress === address
        );
      } else if (
        tokenId !== "false" &&
        (collection === "druid" || collection === "knight")
      ) {
        filteredData = interactions.filter(
          (interaction) =>
            interaction.heroTokenId === tokenId &&
            interaction.heroHolderWalletAddress === address
        );
      } else if (tokenId !== "false" && collection === "property") {
        filteredData = interactions.filter(
          (interaction) =>
            interaction.propertyTokenId === tokenId &&
            interaction.propertyHolderWalletAddress === address
        );
      }

      setFilteredInteractions(filteredData); // Set the filtered interactions
    } catch (error) {
      console.error("Error fetching property interactions:", error);
    }
  };

  // Update countdowns every second using setInterval
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdowns(
        filteredInteractions.map((interaction) =>
          getCountdown(
            parseInt(interaction.interactionStartTime),
            parseInt(interaction.interactionDuration)
          )
        )
      );
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [filteredInteractions]);

  // Combine internal and external onClose functions
  const handleClose = () => {
    internalOnClose(); // Close the modal internally
    onClose(); // Trigger the parent component's onClose to stop rendering
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalOverlay
        style={{
          backdropFilter: "blur(10px)", // Background blur effect for overlay
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Optional dark overlay for better readability
        }}
      />
      <ModalContent
        style={{
          backdropFilter: "blur(10px)", // Blur the modal content itself
          backgroundColor: "rgba(10, 10, 10, 0.4)", // Semi-transparent dark background
          color: "#f5f5f5", // Ensures text stands out
        }}
      >
        <ModalHeader display="flex" justifyContent="center" alignItems="center">
          <Icon as={InfoIcon} marginRight="0.5rem" /> {/* Add icon here */}
          {collection} Interactions
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="#63E6E0">Interaction ID</Th>
                  <Th color="#63E6E0">Property</Th>
                  <Th color="#63E6E0">Property Holder</Th>
                  <Th color="#63E6E0">Hero</Th>
                  <Th color="#63E6E0">Hero Holder</Th>
                  <Th color="#63E6E0">Hero Earns</Th>
                  <Th color="#63E6E0">Property Earns</Th>
                  <Th color="#63E6E0">Countdown</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInteractions.map((interaction, index) => (
                  <Tr key={interaction.interactionId}>
                    <Td>{interaction.interactionId}</Td>
                    <Td>{interaction.propertyName}</Td>
                    <Td>{interaction.propertyHolderDiscordName}</Td>
                    <Td>{interaction.heroName}</Td>
                    <Td>{interaction.heroHolderDiscordName}</Td>
                    <Td>{interaction.heroWillReceive}</Td>
                    <Td>{interaction.propertyGoldEarned}</Td>
                    <Td>{countdowns[index]}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default InteractionsModal;
