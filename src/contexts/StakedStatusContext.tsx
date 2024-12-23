import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the StakedStatus context data
interface StakedStatusContextType {
  stakedStatusData: Record<string, { stakedStatus: string }>;
  updateStakedStatus: (tokenId: string, stakedStatus: string) => void;
}

// Create context with proper type
const StakedStatusContext = createContext<StakedStatusContextType | undefined>(
  undefined
);

// Define the type for the children prop
interface StakedStatusProviderProps {
  children: ReactNode;
}

// Provider component
export const StakedStatusProvider = ({
  children,
}: StakedStatusProviderProps) => {
  const [stakedStatusData, setStakedStatusData] = useState<
    Record<string, { stakedStatus: string }>
  >({});

  const updateStakedStatus = (tokenId: string, stakedStatus: string) => {
    setStakedStatusData((prev) => ({
      ...prev,
      [tokenId]: { stakedStatus },
    }));
  };

  return (
    <StakedStatusContext.Provider
      value={{ stakedStatusData, updateStakedStatus }}
    >
      {children}
    </StakedStatusContext.Provider>
  );
};

// Custom hook to use the StakedStatus context
export const useStakedStatus = () => {
  const context = useContext(StakedStatusContext);
  if (!context) {
    throw new Error(
      "useStakedStatus must be used within a StakedStatusProvider"
    );
  }
  return context;
};
