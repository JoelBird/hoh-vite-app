import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Icon,
  HStack,
} from "@chakra-ui/react";
import axios from "axios";
import { FaMagic } from "react-icons/fa";

interface SpellsProps {
  user: { id: string; username: string } | null;
}

interface SpellDetails {
  spellName: string;
  spellDamage: string;
  spellRarity: string;
}

const Spells: React.FC<SpellsProps> = ({ user }) => {
  const [availableSpells, setAvailableSpells] = useState<SpellDetails[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Hardcoded retailAvailableSpells data with camel casing
  const retailAvailableSpells: Record<string, SpellDetails> = {
    lightningBolt: {
      spellName: "lightningBolt",
      spellDamage: "30",
      spellRarity: "epic",
    },
    fireBall: {
      spellName: "fireBall",
      spellDamage: "20",
      spellRarity: "rare",
    },
    acidRain: {
      spellName: "acidRain",
      spellDamage: "10",
      spellRarity: "common",
    },
  };

  const fetchSpells = async () => {
    if (user && user.id) {
      try {
        // Fetch member's availableSpells
        const response = await axios.get("http://localhost:3001/api/getRow", {
          params: {
            id: user.id,
            table: "members",
          },
        });

        // Parse availableSpells as an array of spell names
        const memberSpells = JSON.parse(response.data.availableSpells);

        const mappedSpells: SpellDetails[] = [];
        for (const spellName of memberSpells) {
          const spellDetails = retailAvailableSpells[spellName];
          if (spellDetails) {
            mappedSpells.push({
              spellName: spellDetails.spellName,
              spellDamage: spellDetails.spellDamage,
              spellRarity: spellDetails.spellRarity,
            });
          } else {
            console.error(
              `Spell not found in retailAvailableSpells: ${spellName}`
            );
          }
        }

        setAvailableSpells(mappedSpells);
        onOpen();
      } catch (error) {
        console.error("Error fetching spells:", error);
      }
    }
  };

  return (
    <>
      <Button
        onClick={fetchSpells}
        colorScheme="purple"
        leftIcon={<Icon as={FaMagic} />}
        variant="solid"
      >
        My Spells
      </Button>

      {/* Modal for displaying the spells */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" justifyContent="center">
            <HStack spacing={2}>
              <Icon as={FaMagic} />
              <span>My Spells</span>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {availableSpells.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="purple.200">Spell Name</Th>
                    <Th color="purple.200">Spell Damage</Th>
                    <Th color="purple.200">Spell Rarity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {availableSpells.map((spell, index) => (
                    <Tr key={index}>
                      <Td>{spell.spellName}</Td>
                      <Td>{spell.spellDamage}</Td>
                      <Td>{spell.spellRarity}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <p>No spells available.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Spells;
