import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Divider,
  Box,
} from "@chakra-ui/react";

// Define the Props interface and add openModal, isOpen, and onClose as props
interface Props {
  openModal: (modalName: string) => void;
  isOpen: boolean; // Pass the isOpen state from useDisclosure
  onClose: () => void; // Pass the onClose function from useDisclosure
}

function ModalMarket({ openModal, isOpen, onClose }: Props) {
  const [page, setPage] = useState(1); // State to manage the current page

  const PageOne = () => (
    <>
      <ModalHeader fontSize="2xl">🏛️ Welcome to the Heroes Market!</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        Here you can interact with properties owned by other players to develop
        your Heroes
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="green"
          width="100%"
          size="lg"
          onClick={() => {
            onClose(); // Close the current modal (ModalMarket)
            openModal("revive"); // Open the Revive modal
          }}
        >
          ❤️ Revive a Hero
        </Button>
      </Box>
      <ModalBody>
        A Hero killed in PVP battle must be revived at a{" "}
        <strong>Housing</strong> property before they can fight again or
        interact with properties.
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="red"
          width="100%"
          size="lg"
          onClick={() => {
            onClose(); // Close the current modal (ModalMarket)
            openModal("military"); // Open the Revive modal
          }}
        >
          ⚔️ Send a Hero to Training
        </Button>
      </Box>
      <ModalBody>
        Heroes can be sent to a <strong>Military</strong> property to gain +1
        Attack or +1 Defence for PVP
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="orange"
          width="100%"
          size="lg"
          onClick={() => {
            onClose();
            openModal("work");
          }}
        >
          ⛏️ Send a Hero to Work
        </Button>
      </Box>
      <ModalBody>
        Heroes can be sent to an <strong>Agriculture</strong> property to earn
        $HGLD
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button width="100%" size="lg" onClick={() => setPage(2)}>
          Go to General Market ➡️
        </Button>
      </Box>
    </>
  );

  const PageTwo = () => (
    <>
      <ModalHeader fontSize="2xl">
        🏛️ Welcome to The General Market!
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        Here you can interact with properties owned by other players to do
        important HOH stuff
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="blue"
          width="100%"
          size="lg"
          onClick={() => {
            onClose();
            openModal("spell");
          }}
        >
          📜 Purchase a Spell
        </Button>
      </Box>
      <ModalBody>
        You will receive a random Spell from a <strong>Retail</strong> property
        to use in PVP battle.
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="purple"
          width="100%"
          size="lg"
          onClick={() => {
            onClose();
            openModal("stake");
          }}
        >
          ✅ Stake a Hero
        </Button>
      </Box>
      <ModalBody>
        Send a Hero to a <strong>Hospitality</strong> property to Stake it and
        earn $HGLD every day the Hero remains in your wallet
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="pink"
          width="100%"
          size="lg"
          onClick={() => {
            onClose();
            openModal("shares");
          }}
        >
          📈 Purchase Shares
        </Button>
      </Box>
      <ModalBody>
        Purchase shares from a <strong>Government</strong> property with $HGLD
        to increase voting power in HOH developments.
      </ModalBody>
      <Divider my={3} />
      <Box>
        <Button
          colorScheme="gray"
          width="100%"
          size="lg"
          onClick={() => setPage(1)}
        >
          ⬅️ Go to Heroes Market
        </Button>
      </Box>
    </>
  );

  return (
    <>
      <Modal size="2xl" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent px={10} pb={6}>
          {page === 1 ? <PageOne /> : <PageTwo />}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ModalMarket;
