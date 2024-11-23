export const abi = [
    {
      type: "function",
      name: "transferFrom",
      stateMutability: "nonpayable",
      inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "amount", type: "uint256", internalType: "uint256" }
      ],
      outputs: [
        { type: "bool", internalType: "bool" }
      ]
    }
  ] as const;
  