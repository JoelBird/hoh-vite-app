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
import { TransactionProvider } from "../src/TransactionContext";
import { UserProvider } from "../src/UserContext";
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
              <Router>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/App" element={<App />} />
                  <Route path="/callback" element={<DiscordCallback />} />
                </Routes>
              </Router>
            </TransactionProvider>
          </UserProvider>
        </ChakraProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
