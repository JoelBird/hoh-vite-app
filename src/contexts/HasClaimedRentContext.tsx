import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the HasClaimedRent context data
interface HasClaimedRentContextType {
  hasClaimedRentData: Record<string, { hasClaimed: string }>;
  updateHasClaimedRent: (tokenId: string, hasClaimed: string) => void;
}

// Create context with proper type
const HasClaimedRentContext = createContext<
  HasClaimedRentContextType | undefined
>(undefined);

// Define the type for the children prop
interface HasClaimedRentProviderProps {
  children: ReactNode;
}

// Provider component
export const HasClaimedRentProvider = ({
  children,
}: HasClaimedRentProviderProps) => {
  const [hasClaimedRentData, setHasClaimedRentData] = useState<
    Record<string, { hasClaimed: string }>
  >({});

  const updateHasClaimedRent = (tokenId: string, hasClaimed: string) => {
    setHasClaimedRentData((prev) => ({
      ...prev,
      [tokenId]: { hasClaimed },
    }));
  };

  return (
    <HasClaimedRentContext.Provider
      value={{ hasClaimedRentData, updateHasClaimedRent }}
    >
      {children}
    </HasClaimedRentContext.Provider>
  );
};

// Custom hook to use the HasClaimedRent context
export const useHasClaimedRent = () => {
  const context = useContext(HasClaimedRentContext);
  if (!context) {
    throw new Error(
      "useHasClaimedRent must be used within a HasClaimedRentProvider"
    );
  }
  return context;
};
