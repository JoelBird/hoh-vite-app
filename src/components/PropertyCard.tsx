import { useState, useEffect } from "react";
import { Box, Flex, Image, Text, Button, VStack } from "@chakra-ui/react";
import InteractionsModal from "./InteractionsModal";

interface PropertyCardProps {
  tokenId: string;
  name: string;
  image: string;
  holderTotalGoldEarned: number;
  holderTotalTransactions: number;
  propertyType: string;
  collection: string;
}

// Property Card component
const PropertyCard = ({
  tokenId,
  name,
  image,
  holderTotalGoldEarned,
  holderTotalTransactions,
  propertyType,
  collection,
}: PropertyCardProps) => {
  const [showModal, setShowModal] = useState(false);

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

        <Text
          fontSize="sm"
          color="gray.400"
          mb={2}
        >{`Token ID: ${tokenId}`}</Text>

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
            </>
          ) : (
            <>
              <Text fontSize="sm">
                Total Transactions: <strong>{holderTotalTransactions}</strong>
              </Text>
              <Text fontSize="sm">
                $HGLD Earned: <strong>{holderTotalGoldEarned}</strong>
              </Text>
            </>
          )}
        </VStack>

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
