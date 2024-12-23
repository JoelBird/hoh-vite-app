import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import InteractionsModal from "./InteractionsModal";
import getTimeUntilSunday11pmUTC from "../functions/getTimeUntilSunday11pmUTC";
import { useHasClaimedRent } from "../contexts/HasClaimedRentContext";

interface PropertyCardProps {
  tokenId: string;
  name: string;
  image: string;
  hasClaimedRent: string;
  holderTotalGoldEarned: number;
  holderTotalTransactions: number;
  propertyType: string;
  propertyRentalValue: string;
  propertyLevel: string;
  collection: string;
}

// Property Card component
const PropertyCard = ({
  tokenId,
  name,
  image,
  hasClaimedRent,
  holderTotalGoldEarned,
  holderTotalTransactions,
  propertyType,
  propertyRentalValue,
  propertyLevel,
  collection,
}: PropertyCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { updateHasClaimedRent } = useHasClaimedRent();
  const toast = useToast();

  console.log("hasClaimedRent!!!!!");
  console.log(hasClaimedRent);
  console.log("propertyLevel!!!!!");
  console.log(propertyLevel);
  console.log("propertyRentalValue!!!!!");
  console.log(propertyRentalValue);

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      bg="gray.800"
      color="white"
      width="100%"
    >
      <Image
        src={image}
        alt={name}
        objectFit="cover"
        height="300px"
        width="100%"
      />

      <Box p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Text fontWeight="bold" fontSize="lg">{`${name}`}</Text>
          {/* Adding background color and ensuring visibility */}
          <Text fontSize="md" color="white" bg="blackAlpha.500" p={1}>
            {propertyType || "No Type"}
          </Text>
        </Flex>

        <Text fontSize="sm" color="gray.400" mb={2}>
          {`Token ID: ${tokenId}`}
        </Text>

        <VStack align="start" spacing={1}>
          {propertyType === "Agriculture" ||
          propertyType === "Production" ||
          propertyType === "Military" ||
          propertyType === "Housing" ? (
            <>
              <Text fontSize="sm">
                Total Occupants: <strong>{holderTotalTransactions}</strong>
              </Text>
              <Text fontSize="sm">
                $HGLD Earned: <strong>{holderTotalGoldEarned}</strong>
              </Text>
              <Text fontSize="sm">
                Property Value: <strong>{propertyRentalValue}</strong>
              </Text>
              <Text fontSize="sm">
                Property Level: <strong>{propertyLevel}</strong>
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="sm">
                Total Transactions: <strong>{holderTotalTransactions}</strong>
              </Text>
              <Text fontSize="sm">
                $HGLD Earned: <strong>{holderTotalGoldEarned}</strong>
              </Text>
              <Text fontSize="sm">
                Property Value: <strong>{propertyRentalValue}</strong>
              </Text>
              <Text fontSize="sm">
                Property Level: <strong>{propertyLevel}</strong>
              </Text>
            </>
          )}
        </VStack>

        {/* View Interactions Button */}
        <Button
          mt={4}
          width="100%"
          colorScheme="teal"
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          View Interactions
        </Button>

        {/* Claim Rent Button */}
        <Button
          mt={2}
          width="100%"
          colorScheme={hasClaimedRent === "true" ? "gray" : "teal"}
          variant="solid"
          size="sm"
          isDisabled={hasClaimedRent === "true"}
          onClick={async () => {
            if (hasClaimedRent === "false") {
              try {
                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/updateHasClaimedRent`,
                  { tokenId },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                // Success Toast
                toast({
                  title: "Rent Claimed Successfully",
                  description: `You will receive your Rent HGLD in ${getTimeUntilSunday11pmUTC()}`,
                  status: "success",
                  duration: 10000,
                  isClosable: true,
                });
              } catch (error: any) {
                console.error("Error updating hasClaimedRent:", error);

                // Extract Error Message from Response
                const errorMessage =
                  error.response?.data?.message ||
                  error.response?.data?.error ||
                  error.message ||
                  "An unknown error occurred";

                toast({
                  title: "Failed to Claim Rent",
                  description: errorMessage,
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                });
              }

              if (tokenId) {
                console.log(`Updating hasClaimedRent for tokenId: ${tokenId}`);
                updateHasClaimedRent(tokenId, "true");
              } else {
                console.error(
                  "tokenId is undefined, cannot update hasClaimedRent."
                );
              }
            }
          }}
        >
          {hasClaimedRent === "true" ? "Rent claimed" : "Claim Rent"}
        </Button>

        {/* Modal */}
        {showModal && (
          <InteractionsModal
            tokenId={tokenId}
            collection={collection}
            onClose={() => setShowModal(false)}
          />
        )}
      </Box>
    </Box>
  );
};

export default PropertyCard;
