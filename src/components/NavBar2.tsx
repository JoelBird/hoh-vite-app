import { HStack, Select, Box } from "@chakra-ui/react";
import MusicPlayer from "./MusicPlayer";

interface NavBar2Props {
  updateCollection: (newCollection: string) => void;
  collection: string | undefined;
}

const NavBar2: React.FC<NavBar2Props> = ({ updateCollection, collection }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateCollection(event.target.value);
  };

  return (
    <Box padding="">
      <HStack justifyContent="space-between" alignItems="center" width="100%">
        <Box flex="1" marginRight="20px">
          <MusicPlayer />
        </Box>
        <Select
          width="25%"
          placeholder={collection ? undefined : "Select collection"}
          onChange={handleChange}
          value={collection || ""}
        >
          <option value="Prettyvenom">Pretty Venom</option>
          <option value="Dynamite">Dynamite</option>
          <option value="Steamland">Steamland</option>
        </Select>
      </HStack>
    </Box>
  );
};

export default NavBar2;
