import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import AddBookModal from "components/modals/addBookModal";
import { LocationKey } from "utils/libraryUtils";

interface Props {
  seriesId: string;
  lastVolume: string | null;
  locations: Record<LocationKey, number>;
}

const AddBook = ({
  seriesId,
  lastVolume,
  locations,
}: Props): React.ReactElement => {
  const [openModal, setOpenModal] = useState(false);
  const onClose = useCallback(() => {
    setOpenModal(false);
  }, []);
  return (
    <>
      {openModal && (
        <AddBookModal
          seriesId={seriesId}
          lastVolume={lastVolume}
          locations={locations}
          onClose={onClose}
        />
      )}
      <Button color="primary" onClick={() => setOpenModal(true)}>
        Add new books to {seriesId}
      </Button>
    </>
  );
};

export default AddBook;
