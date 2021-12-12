import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import AddBookModal from "components/modals/addBookModal";
import { LocationKey } from "utils/libraryUtils";
import { StopClickDiv } from "utils/domEventHelpers";

interface Props {
  seriesId: string;
  nextVolume: number;
  locations: Record<LocationKey, number>;
}

const AddBook = ({
  seriesId,
  nextVolume,
  locations,
}: Props): React.ReactElement => {
  const [openModal, setOpenModal] = useState(false);
  const onClose = useCallback(() => {
    setOpenModal(false);
  }, []);
  return (
    <StopClickDiv>
      {openModal && (
        <AddBookModal
          seriesId={seriesId}
          nextVolume={nextVolume}
          locations={locations}
          onClose={onClose}
        />
      )}
      <Button color="primary" fullwidth onClick={() => setOpenModal(true)}>
        Add a new book
      </Button>
    </StopClickDiv>
  );
};

export default AddBook;
