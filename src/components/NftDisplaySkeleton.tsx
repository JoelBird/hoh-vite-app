import React from "react";
import { SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import NftCardSkeleton from "./NftCardSkeleton";

const NftDisplaySkeleton = () => {
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });

  return (
    <SimpleGrid columns={columns} spacing={4}>
      {Array.from({ length: 10 }).map((_, index) => (
        <NftCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
};

export default NftDisplaySkeleton;
