import React, { useState } from "react";
import {
  HStack,
  VStack,
  Image,
  Button,
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import ColorModeSwitch from "./ColorModeSwitch";
import logoVideo from "../assets/hfire.mp4";
import { Link as RouterLink } from "react-router-dom";
import WalletConnect from "./WalletConnect";
import DiscordLogin from "./DiscordLogin";
import MarketModalHandler from "./MarketModalHandler";
import Spells from "./Spells";
import InteractionsModal from "./InteractionsModal";

interface NavBarProps {
  user: { id: string; username: string } | null;
  setUser: React.Dispatch<
    React.SetStateAction<{ id: string; username: string } | null>
  >;
  setCollection: React.Dispatch<React.SetStateAction<string>>;
  setCollectionAddress: React.Dispatch<React.SetStateAction<string>>;
  setCollectionChain: React.Dispatch<React.SetStateAction<string>>;
}

const NavBar: React.FC<NavBarProps> = ({
  user,
  setUser,
  setCollection,
  setCollectionAddress,
  setCollectionChain,
}) => {
  const [isHoveringDiscord, setIsHoveringDiscord] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleMouseEnterDiscord = () => setIsHoveringDiscord(true);
  const handleMouseLeaveDiscord = () => setIsHoveringDiscord(false);

  const handleButtonClick = (
    collection: string,
    address: string,
    chain: string
  ) => {
    setCollection(collection);
    setCollectionAddress(address);
    setCollectionChain(chain);
    setActiveCollection(collection);
  };

  const collections = [
    {
      collection: "property",
      address: "0x99c6De8bc22adb0d6E59939FcB20443CD1606518",
      chain: "polygon",
    },
    {
      collection: "knight",
      address: "0xD2deFe14811BEC6332C6ae8CcE85a858b3A80B56",
      chain: "eth",
    },
    {
      collection: "druid",
      address: "0xAe65887F23558699978566664CC7dC0ccd67C0f8",
      chain: "polygon",
    },
  ];

  return (
    <Box padding="10px">
      <HStack
        justifyContent="space-between"
        display={{ base: "none", md: "flex" }}
      >
        {/* Left section */}
        <HStack spacing="20px">
          <Box
            as="video"
            src={logoVideo}
            w="100px"
            h="100px"
            borderRadius="full" // Chakra's shorthand for 50% or fully rounded
            autoPlay
            loop
            muted
            objectFit="cover" // Ensures the video scales nicely within the box
            boxShadow="0 0 15px rgba(255, 165, 0, 0.6)" // Optional glow effect
          />
          <WalletConnect />
          {user ? (
            <Button
              onClick={handleLogout}
              onMouseEnter={handleMouseEnterDiscord}
              onMouseLeave={handleMouseLeaveDiscord}
            >
              {isHoveringDiscord ? "Logout Discord" : user.username}
            </Button>
          ) : (
            <DiscordLogin />
          )}
        </HStack>

        {/* Right section */}
        <HStack spacing="20px">
          <Spells user={user} />
          <MarketModalHandler />
          <Button colorScheme="teal" onClick={() => setShowModal(true)}>
            View Interactions
          </Button>
          {showModal && (
            <InteractionsModal
              tokenId="false"
              collection={activeCollection}
              onClose={() => setShowModal(false)}
            />
          )}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              colorScheme="gray"
            >
              Select Collection
            </MenuButton>
            <MenuList>
              {collections.map((col) => (
                <MenuItem
                  key={col.collection}
                  onClick={() =>
                    handleButtonClick(col.collection, col.address, col.chain)
                  }
                  bg={activeCollection === col.collection ? "gray" : "gray.700"}
                >
                  {col.collection}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <ChakraLink
            href="https://discord.gg/heroes-of-hiraeth-1000171866960433212"
            isExternal
          >
            <IconButton
              icon={<FaDiscord />}
              aria-label="Discord"
              variant="outline"
              size="lg"
            />
          </ChakraLink>
          <ChakraLink href="https://x.com/heroeshiraeth" isExternal>
            <IconButton
              icon={<FaTwitter />}
              aria-label="Twitter"
              variant="outline"
              size="lg"
            />
          </ChakraLink>
          <ColorModeSwitch />
        </HStack>
      </HStack>

      {/* Mobile view */}
      <VStack display={{ base: "flex", md: "none" }} spacing="10px">
        <video
          src={logoVideo}
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "1000%",
          }}
          autoPlay
          loop
          muted
        />
        <WalletConnect />
        {user ? (
          <Button
            onClick={handleLogout}
            onMouseEnter={handleMouseEnterDiscord}
            onMouseLeave={handleMouseLeaveDiscord}
          >
            {isHoveringDiscord ? "Logout Discord" : user.username}
          </Button>
        ) : (
          <DiscordLogin />
        )}
        <MarketModalHandler />
        <HStack spacing="10px">
          <ChakraLink
            href="https://discord.gg/heroes-of-hiraeth-1000171866960433212"
            isExternal
          >
            <IconButton
              icon={<FaDiscord />}
              aria-label="Discord"
              variant="outline"
              size="lg"
            />
          </ChakraLink>
          <ChakraLink href="https://x.com/heroeshiraeth" isExternal>
            <IconButton
              icon={<FaTwitter />}
              aria-label="Twitter"
              variant="outline"
              size="lg"
            />
          </ChakraLink>
        </HStack>
        <ColorModeSwitch />
      </VStack>
    </Box>
  );
};

export default NavBar;
