import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the context data
interface TransactionContextType {
  transactionData: Record<
    string,
    { interactionStatus: string; interactionId: string }
  >;
  updateTransactionData: (
    tokenId: string,
    interactionStatus: string,
    interactionId: string
  ) => void;
}

// Create context with proper type
const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

// Define the type for the children prop
interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider = ({ children }: TransactionProviderProps) => {
  const [transactionData, setTransactionData] = useState<
    Record<string, { interactionStatus: string; interactionId: string }>
  >({});

  const updateTransactionData = (
    tokenId: string,
    interactionStatus: string,
    interactionId: string
  ) => {
    setTransactionData((prev) => ({
      ...prev,
      [tokenId]: { interactionStatus, interactionId },
    }));
  };

  return (
    <TransactionContext.Provider
      value={{ transactionData, updateTransactionData }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the transaction context
export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};
