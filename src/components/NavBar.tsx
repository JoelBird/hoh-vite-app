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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import logoVideo from "../assets/hfire.mp4";
import WalletConnect from "./WalletConnect";
import DiscordLogin from "./DiscordLogin";
import MarketModalHandler from "./MarketModalHandler";
import Spells from "./Spells";
import InteractionsModal from "./InteractionsModal";
import SharesModal from "./SharesModal";

interface NavBarProps {
  user: { id: string; username: string; avatar: string } | null;
  setUser: React.Dispatch<
    React.SetStateAction<{
      id: string;
      username: string;
      avatar: string;
    } | null>
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
  const [showInteractionsModal, setShowInteractionsModal] = useState(false);
  const [showSharesModal, setShowSharesModal] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

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
      {/* Desktop View */}
      <HStack
        justifyContent="space-between"
        display={{ base: "none", md: "flex" }}
      >
        {/* Left Section */}
        <HStack spacing="20px">
          <Box
            as="video"
            src={logoVideo}
            w="100px"
            h="100px"
            borderRadius="full"
            autoPlay
            loop
            muted
            objectFit="cover"
            boxShadow="0 0 15px rgba(255, 165, 0, 0.6)"
          />
          <WalletConnect />
          {user ? (
            <HStack
              spacing="5px"
              padding="5px"
              background="gray.900"
              borderRadius="md"
              boxShadow="md"
              align="center"
            >
              <Image
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="User Avatar"
                borderRadius="full"
                boxSize="40px"
              />
              <Button
                variant="ghost"
                color="white"
                size="sm"
                fontWeight="bold"
                onClick={handleLogout}
                onMouseEnter={handleMouseEnterDiscord}
                onMouseLeave={handleMouseLeaveDiscord}
                _hover={{ bg: "gray.700" }}
              >
                {isHoveringDiscord ? "Logout Discord" : user.username}
              </Button>
            </HStack>
          ) : (
            <DiscordLogin />
          )}
          <Button
            variant="outline"
            borderColor="yellow.400"
            color="yellow.400"
            bg="gray.800"
            _hover={{ bg: "yellow.400", color: "gray.800" }}
            onClick={() =>
              window.open(
                "https://www.dexview.com/polygon/0x87a73CfdAddc4de32dA5A8528CcCD9eBf2B19593",
                "_blank"
              )
            }
          >
            Buy HGLD
          </Button>
        </HStack>

        {/* Right Section */}
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Menu"
          onClick={onOpen}
          variant="outline"
        />
      </HStack>

      {/* Mobile View */}
      <HStack
        display={{ base: "flex", md: "none" }}
        justifyContent="space-between"
      >
        <HStack spacing="10px">
          <WalletConnect />
          {user ? (
            <HStack
              spacing="5px"
              padding="5px"
              background="gray.900"
              borderRadius="md"
              boxShadow="md"
              align="center"
            >
              <Image
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="User Avatar"
                borderRadius="full"
                boxSize="40px"
              />
              <Button
                variant="ghost"
                color="white"
                size="sm"
                fontWeight="bold"
                onClick={handleLogout}
                _hover={{ bg: "gray.700" }}
              >
                {user.username}
              </Button>
            </HStack>
          ) : (
            <DiscordLogin />
          )}
          <Button
            variant="outline"
            borderColor="yellow.400"
            color="yellow.400"
            bg="gray.800"
            _hover={{ bg: "yellow.400", color: "gray.800" }}
            onClick={() =>
              window.open(
                "https://www.dexview.com/polygon/0x87a73CfdAddc4de32dA5A8528CcCD9eBf2B19593",
                "_blank"
              )
            }
          >
            Buy HGLD
          </Button>
        </HStack>
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Menu"
          onClick={onOpen}
          variant="outline"
        />
      </HStack>

      {/* Transparent Hamburger Menu (Visible on All Screens) */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        />
        <DrawerContent
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(10, 10, 10, 0.4)",
            color: "#f5f5f5",
          }}
        >
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing="20px" align="start">
              <Spells user={user} />
              <MarketModalHandler />
              <Button
                colorScheme="teal"
                onClick={() => setShowInteractionsModal(true)}
              >
                Interactions
              </Button>
              {showInteractionsModal && (
                <InteractionsModal
                  tokenId="false"
                  collection={activeCollection}
                  onClose={() => setShowInteractionsModal(false)}
                />
              )}
              <Button
                colorScheme="teal"
                onClick={() => setShowSharesModal(true)}
              >
                Shares
              </Button>
              {showSharesModal && (
                <SharesModal
                  tokenId="false"
                  onClose={() => setShowSharesModal(false)}
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
                        handleButtonClick(
                          col.collection,
                          col.address,
                          col.chain
                        )
                      }
                      bg={
                        activeCollection === col.collection
                          ? "gray"
                          : "gray.700"
                      }
                    >
                      {col.collection}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
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
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default NavBar;
