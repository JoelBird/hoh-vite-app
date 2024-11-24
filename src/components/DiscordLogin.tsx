import React from "react";
import { Button } from "@chakra-ui/react";

const DiscordLogin: React.FC = () => {
  const handleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const redirectUri = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify`;
    window.location.href = redirectUri;
  };

  return <Button onClick={handleLogin}>Login with Discord</Button>;
};

export default DiscordLogin;
