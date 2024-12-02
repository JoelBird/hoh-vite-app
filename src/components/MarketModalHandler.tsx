import React, { useState } from "react";
import ModalMarket from "./ModalMarket";
import ModalRevive from "./ModalRevive";
import ModalMilitary from "./ModalMilitary";
import ModalWork from "./ModalWork";
import ModalSpell from "./ModalSpell";
import ModalStake from "./ModalStake";

import { useDisclosure } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

function MarketModalHandler() {
  const [activeModal, setActiveModal] = useState<string | null>(null); // Initially no modal
  const { isOpen, onOpen, onClose } = useDisclosure(); // Handle modal open/close

  const openModal = (modalName: string | null) => {
    setActiveModal(modalName);
    onOpen(); // Open the modal whenever the modal is set
  };

  return (
    <div>
      {/* Button to open the market modal */}
      <Button colorScheme="orange" onClick={() => openModal("market")}>
        🏛️ Enter Market
      </Button>

      {/* Render ModalMarket or ModalRevive based on activeModal state */}
      {activeModal === "market" && (
        <ModalMarket openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "revive" && (
        <ModalRevive openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {/* {activeModal === "military" && (
        <ModalMilitary
          openModal={openModal}
          isOpen={isOpen}
          onClose={onClose}
        />
      )} */}
      {activeModal === "work" && (
        <ModalWork openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "spell" && (
        <ModalSpell openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "stake" && (
        <ModalStake openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
    </div>
  );
}

export default MarketModalHandler;
