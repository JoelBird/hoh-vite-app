import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the HasClaimed Stake context data
interface HasClaimedStakeContextType {
  hasClaimedStakeData: Record<string, { hasClaimed: string }>;
  updateHasClaimedStake: (tokenId: string, hasClaimed: string) => void;
}

// Create context with proper type
const HasClaimedStakeContext = createContext<
  HasClaimedStakeContextType | undefined
>(undefined);

// Define the type for the children prop
interface HasClaimedStakeProviderProps {
  children: ReactNode;
}

// Provider component
export const HasClaimedStakeProvider = ({
  children,
}: HasClaimedStakeProviderProps) => {
  const [hasClaimedStakeData, setHasClaimedStakeData] = useState<
    Record<string, { hasClaimed: string }>
  >({});

  const updateHasClaimedStake = (tokenId: string, hasClaimed: string) => {
    setHasClaimedStakeData((prev) => ({
      ...prev,
      [tokenId]: { hasClaimed },
    }));
  };

  return (
    <HasClaimedStakeContext.Provider
      value={{ hasClaimedStakeData, updateHasClaimedStake }}
    >
      {children}
    </HasClaimedStakeContext.Provider>
  );
};

// Custom hook to use the HasClaimed Stake context
export const useHasClaimedStake = () => {
  const context = useContext(HasClaimedStakeContext);
  if (!context) {
    throw new Error(
      "useHasClaimedStake must be used within a HasClaimedStakeProvider"
    );
  }
  return context;
};
