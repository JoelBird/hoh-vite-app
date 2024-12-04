import React, { useState } from "react";
import ModalMarket from "./ModalMarket";
import ModalRevive from "./ModalRevive";
import ModalMilitary from "./ModalMilitary";
import ModalWork from "./ModalWork";
import ModalSpell from "./ModalSpell";
import ModalStake from "./ModalStake";
import ModalShares from "./ModalShares";
import { useUser } from "../UserContext";
import { useActiveAccount } from "thirdweb/react";
import { useDisclosure, useToast, Button } from "@chakra-ui/react";

function MarketModalHandler() {
  const [activeModal, setActiveModal] = useState<string | null>(null); // Initially no modal
  const { isOpen, onOpen, onClose } = useDisclosure(); // Handle modal open/close
  const { user } = useUser();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const toast = useToast(); // Initialize toast notifications

  const openModal = (modalName: string | null) => {
    if (address && user) {
      setActiveModal(modalName);
      onOpen(); // Open the modal whenever the modal is set
    } else {
      toast({
        title: "Action required",
        description: "Please connect your wallet and sign into Discord.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
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
      {activeModal === "military" && (
        <ModalMilitary
          openModal={openModal}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      {activeModal === "work" && (
        <ModalWork openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "spell" && (
        <ModalSpell openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "stake" && (
        <ModalStake openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
      {activeModal === "shares" && (
        <ModalShares openModal={openModal} isOpen={isOpen} onClose={onClose} />
      )}
    </div>
  );
}

export default MarketModalHandler;
