import React from "react";
import { Button } from "@chakra-ui/react";

const DiscordLogin: React.FC = () => {
  const handleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(apiUrl);
    window.location.href = `${apiUrl}/auth/discord`;
  };

  return <Button onClick={handleLogin}>Login with Discord</Button>;
};

export default DiscordLogin;
