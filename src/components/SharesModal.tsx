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
import { InfoIcon } from "@chakra-ui/icons";

interface Member {
  discordId: string;
  discordName: string;
  wins: string;
  losses: string;
  wallets: string;
  heroOptionsPosition: string;
  goldSentToGovernment: string;
  availableSpells: string;
}

interface ProcessedMember {
  holderPosition: number;
  holderName: string;
  sharesPossessed: number;
  percentOfTotalShares: string; // Display as a string with % sign
}

interface Props {
  tokenId: string;
  onClose: () => void; // Function to close the modal from ParentComponent
}

const SharesModal: React.FC<Props> = ({ tokenId, onClose }) => {
  const [filteredShareHolders, setFilteredShareHolders] = useState<
    ProcessedMember[]
  >([]);
  const { isOpen, onOpen, onClose: internalOnClose } = useDisclosure();

  useEffect(() => {
    onOpen(); // Open the modal when the component mounts
    fetchAndFilterShares();
  }, []);

  const fetchAndFilterShares = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/members`
      );
      const members: Member[] = response.data;

      // Calculate total gold sent to government
      const totalGoldSentToGovernment = members.reduce(
        (sum, member) => sum + parseFloat(member.goldSentToGovernment || "0"),
        0
      );

      // Process each member for shares
      const processedMembers = members
        .map((member) => {
          const goldSent = parseFloat(member.goldSentToGovernment || "0");
          const sharesPossessed = goldSent / 10;
          const percentOfTotalShares =
            totalGoldSentToGovernment > 0
              ? ((goldSent * 100) / totalGoldSentToGovernment).toFixed(2)
              : "0.00";

          return {
            holderName: member.discordName,
            sharesPossessed,
            percentOfTotalShares: `${percentOfTotalShares}%`,
          };
        })
        .sort((a, b) => b.sharesPossessed - a.sharesPossessed) // Sort by shares descending
        .map((member, index) => ({
          ...member,
          holderPosition: index + 1, // Assign position based on sorted order
        }));

      setFilteredShareHolders(processedMembers);
    } catch (error) {
      console.error("Error fetching shares data", error);
    }
  };

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
          Share Holders
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="#63E6E0">Holder Position</Th>
                  <Th color="#63E6E0">Holder Name</Th>
                  <Th color="#63E6E0">Shares Possessed</Th>
                  <Th color="#63E6E0">Percent of Total Shares</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredShareHolders.map((holder) => (
                  <Tr key={holder.holderPosition}>
                    <Td>{holder.holderPosition}</Td>
                    <Td>{holder.holderName}</Td>
                    <Td>{holder.sharesPossessed}</Td>
                    <Td>{holder.percentOfTotalShares}</Td>
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

export default SharesModal;
