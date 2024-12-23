import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Image,
  Text,
  Icon,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { FaLock, FaLockOpen, FaHeart, FaSkull } from "react-icons/fa";
import InteractionsModal from "./InteractionsModal";
import getCountdown from "../functions/getCountdown";
import getTimeUntilMidnight from "../functions/getTimeUntilMidnightUTC";
import { useHasClaimedStake } from "../contexts/HasClaimedStakeContext";
import { useActiveAccount } from "thirdweb/react";

// Interface defining the props
interface Props {
  tokenId: string;
  name: string;
  image: string;
  stakedStatus: string;
  hasClaimedStake: string;
  aliveStatus: string;
  interactionStatus: string;
  interactionId: string;
  collection: string;
}

// Hero Card component
const HeroCard = ({
  tokenId,
  name,
  image,
  stakedStatus,
  hasClaimedStake,
  aliveStatus,
  interactionStatus,
  interactionId,
  collection,
}: Props) => {
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [heroWillReceive, setHeroWillReceive] = useState<string | null>(null);
  const [interactionStartTime, setInteractionStartTime] = useState<number>(0);
  const [interactionDuration, setInteractionDuration] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const { updateHasClaimedStake } = useHasClaimedStake();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const toast = useToast();

  function timeUntilMidnight(): string {
    const now = new Date(); // Current date and time
    const midnight = new Date(); // Clone current date

    // Set the time to midnight (12:00 AM)
    midnight.setHours(24, 0, 0, 0);

    // Calculate the difference in milliseconds
    const diffMs = midnight.getTime() - now.getTime(); // Ensure subtraction uses timestamps

    // Convert milliseconds to hours and minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} hours and ${minutes} minutes`;
  }

  // Fetch property interaction details if interaction is active
  useEffect(() => {
    if (interactionStatus === "true" && interactionId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/getRow`, {
          params: {
            id: interactionId,
            table: "propertyInteractions",
          },
        })
        .then((response) => {
          const data = response.data;
          setPropertyType(data.propertyType);
          setHeroWillReceive(data.heroWillReceive);
          setInteractionStartTime(data.interactionStartTime);
          setInteractionDuration(data.interactionDuration);
        })
        .catch((error) => {
          console.error("Error fetching property values:", error);
        });
    }
  }, [interactionStatus, interactionId]);

  // Update countdown every second using setInterval
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown(
        getCountdown(
          parseInt(interactionStartTime.toString()),
          parseInt(interactionDuration.toString())
        )
      );
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [interactionStartTime, interactionDuration]);

  return (
    <Box
      className="hero-card"
      borderRadius="lg"
      overflow="hidden"
      bg="gray.800"
      color="white"
    >
      <Image
        src={image}
        alt={name}
        objectFit="cover"
        height="300px"
        width="100%"
      />

      <Box p={4}>
        <Text fontWeight="bold" fontSize="lg">
          {name}
        </Text>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Text fontSize="sm" color="gray.400">
            {`Token ID: ${tokenId}`}
          </Text>
          <HStack spacing={2} ml={4}>
            <Icon
              as={aliveStatus === "alive" ? FaHeart : FaSkull}
              color={aliveStatus === "alive" ? "red.500" : "gray.500"}
              boxSize={5}
            />
            <Icon
              as={stakedStatus === "staked" ? FaLock : FaLockOpen}
              color={stakedStatus === "staked" ? "yellow.500" : "gray.500"}
              boxSize={5}
            />
          </HStack>
        </Flex>
        {interactionStatus === "true" ? (
          <Box>
            <Text fontSize="sm">
              Interacting With: <strong>{propertyType || "Loading..."}</strong>
            </Text>
            <Text fontSize="sm">
              Time Remaining: <strong>{countdown}</strong>
            </Text>
            <Text fontSize="sm">
              Will Receive: <strong>{heroWillReceive || "Loading..."}</strong>
            </Text>
          </Box>
        ) : (
          <Text fontSize="sm" color="gray.400">
            Not currently interacting
          </Text>
        )}
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
        {/* Claim Stake Button */}
        {stakedStatus === "staked" && (
          <Button
            mt={2}
            width="100%"
            colorScheme={hasClaimedStake === "true" ? "gray" : "teal"}
            variant="solid"
            size="sm"
            isDisabled={hasClaimedStake === "true"}
            onClick={async () => {
              if (hasClaimedStake === "false") {
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/updateHasClaimedStake`,
                    { tokenId },
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  // Success Toast
                  toast({
                    title: "Stake Claimed Successfully",
                    description: `You will receive your staking HGLD in ${getTimeUntilMidnight()}`,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                  });
                } catch (error: any) {
                  console.error("Error updating hasClaimedStake:", error);

                  // Extract Error Message from Response
                  const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "An unknown error occurred";

                  toast({
                    title: "Failed to Claim Stake",
                    description: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                }

                if (tokenId) {
                  console.log(
                    `Updating hasClaimedStake for tokenId: ${tokenId}`
                  );
                  updateHasClaimedStake(tokenId, "true");
                } else {
                  console.error(
                    "tokenId is undefined, cannot updateHasClaimedStake."
                  );
                }
              }
            }}
          >
            {hasClaimedStake === "true" ? "Stake claimed" : "Claim Stake"}
          </Button>
        )}
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

export default HeroCard;
