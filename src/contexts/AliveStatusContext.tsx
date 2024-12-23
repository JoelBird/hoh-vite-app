import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the AliveStatus context data
interface AliveStatusContextType {
  aliveStatusData: Record<string, { aliveStatus: string }>;
  updateAliveStatus: (tokenId: string, aliveStatus: string) => void;
}

// Create context with proper type
const AliveStatusContext = createContext<AliveStatusContextType | undefined>(
  undefined
);

// Define the type for the children prop
interface AliveStatusProviderProps {
  children: ReactNode;
}

// Provider component
export const AliveStatusProvider = ({ children }: AliveStatusProviderProps) => {
  const [aliveStatusData, setAliveStatusData] = useState<
    Record<string, { aliveStatus: string }>
  >({});

  const updateAliveStatus = (tokenId: string, aliveStatus: string) => {
    setAliveStatusData((prev) => ({
      ...prev,
      [tokenId]: { aliveStatus },
    }));
  };

  return (
    <AliveStatusContext.Provider value={{ aliveStatusData, updateAliveStatus }}>
      {children}
    </AliveStatusContext.Provider>
  );
};

// Custom hook to use the AliveStatus context
export const useAliveStatus = () => {
  const context = useContext(AliveStatusContext);
  if (!context) {
    throw new Error(
      "useAliveStatus must be used within an AliveStatusProvider"
    );
  }
  return context;
};
