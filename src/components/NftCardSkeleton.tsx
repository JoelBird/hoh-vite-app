import {
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
  SkeletonTextProps,
} from "@chakra-ui/react";

const NftCardSkeleton = () => {
  return (
    <Card>
      <Skeleton height="300px" />
      <CardBody>
        <SkeletonText />
      </CardBody>
    </Card>
  );
};

export default NftCardSkeleton;
