onClick={async () => {
    if (hasClaimedStake === "false") {
      const stakingGoldReward = "10";
      const apiKey = process.env.REACT_APP_API_KEY;

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/send-hgld`,
          {
            recipientAddress: address,
            amount: stakingGoldReward,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
          }
        );
        toast({
          title: "Transaction Successful",
          description: `Transaction Hash: ${response.data.transactionHash}`,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      } catch (error: any) {
        console.error("Error Sending HGLD Tokens:", error);

        toast({
          title: "Transaction Failed",
          description:
            error.response?.data?.error ||
            error.message ||
            "An unknown error occurred",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      }