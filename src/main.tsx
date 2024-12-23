import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import DiscordLogin from "./components/DiscordLogin";
import DiscordCallback from "./components/DiscordCallback";
import theme from "./theme";
import "./index.css";
import { TransactionProvider } from "./contexts/TransactionContext";
import { AliveStatusProvider } from "./contexts/AliveStatusContext";
import { StakedStatusProvider } from "./contexts/StakedStatusContext";
import { HasClaimedStakeProvider } from "./contexts/HasClaimedStakeContext";
import { HasClaimedRentProvider } from "./contexts/HasClaimedRentContext";
import { UserProvider } from "./contexts/UserContext";
import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <UserProvider>
            <TransactionProvider>
              <AliveStatusProvider>
                <StakedStatusProvider>
                  <HasClaimedStakeProvider>
                    <HasClaimedRentProvider>
                      <Router>
                        <Routes>
                          <Route path="/" element={<App />} />
                          <Route path="/App" element={<App />} />
                          <Route
                            path="/callback"
                            element={<DiscordCallback />}
                          />
                        </Routes>
                      </Router>
                    </HasClaimedRentProvider>
                  </HasClaimedStakeProvider>
                </StakedStatusProvider>
              </AliveStatusProvider>
            </TransactionProvider>
          </UserProvider>
        </ChakraProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
