import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from "@chakra-ui/react";

function PropertyInteractionsModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>View Interactions</Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" maxW="100%">
        <ModalOverlay />
        <ModalContent borderRadius="md" boxShadow="xl" p={[4, 6]} maxW="100%">
          <ModalHeader fontSize="2xl" textAlign="center">
            {" "}
            {/* Properties header set to 2xl */}
            🏛️ Property Interactions
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowX="auto">
            <Table variant="simple" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Time
                  </Th>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Property
                  </Th>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Hero
                  </Th>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Hero Earnings
                  </Th>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Your Earnings
                  </Th>
                  <Th
                    fontSize={["xs", "sm", "md"]}
                    fontWeight="bold"
                    color="teal.500"
                  >
                    Status
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td fontSize={["xs", "sm", "md"]}>10:00 AM</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Vineyard</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Knight #53</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Earned 30 $HGLD</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Earned 30 $HGLD</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Completed</Td>
                </Tr>
                <Tr>
                  <Td colSpan={6}>
                    <Divider borderColor="teal.500" />
                  </Td>
                </Tr>
                <Tr>
                  <Td fontSize={["xs", "sm", "md"]}>11:00 AM</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Military #233</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Druid #56</Td>
                  <Td fontSize={["xs", "sm", "md"]}>+1 Attack</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Earned 30 $HGLD</Td>
                  <Td fontSize={["xs", "sm", "md"]}>5 Hours Remaining</Td>
                </Tr>
                <Tr>
                  <Td colSpan={6}>
                    <Divider borderColor="teal.500" />
                  </Td>
                </Tr>
                <Tr>
                  <Td fontSize={["xs", "sm", "md"]}>12:00 PM</Td>
                  <Td fontSize={["xs", "sm", "md"]}>House #244</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Druid #101</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Restored health</Td>
                  <Td fontSize={["xs", "sm", "md"]}>Earned 10 $HGLD</Td>
                  <Td fontSize={["xs", "sm", "md"]}>2 Hours Remaining</Td>
                </Tr>
              </Tbody>
            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default PropertyInteractionsModal;
