import { HStack, Switch, Text, useColorMode, Icon } from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";
import React from "react";

const ColorModeSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <HStack spacing={2}>
      <Icon as={colorMode === "dark" ? FaMoon : FaSun} />
      <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} />
    </HStack>
  );
};

export default ColorModeSwitch;
