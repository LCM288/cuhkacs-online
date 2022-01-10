import RenewModal from "components/modals/renewModal";
import ReturnModal from "components/modals/returnModal";
import React, { useState } from "react";
import { Button } from "react-bulma-components";
import { StopClickDiv } from "utils/domEventHelpers";
import { ExtendedBorrow } from "utils/libraryUtils";
import useClipped from "utils/useClipped";

interface Props {
  borrowData: ExtendedBorrow;
}

const RenewReturnCell = ({ borrowData }: Props): React.ReactElement => {
  const [openRenewModal, setOpenRenewModal] = useState(false);
  const [openReturnModal, setOpenReturnModal] = useState(false);
  useClipped(openReturnModal || openRenewModal);
  if (!borrowData.bookIsbn) {
    return <div>Error ISBN Not found</div>;
  }
  return (
    <StopClickDiv>
      {openRenewModal && (
        <RenewModal
          originalDue={borrowData.dueDate}
          borrowId={borrowData.id}
          onClose={() => setOpenRenewModal(false)}
        />
      )}
      {openReturnModal && (
        <ReturnModal
          borrowData={borrowData}
          onClose={() => setOpenReturnModal(false)}
        />
      )}
      <Button.Group>
        <Button color="link" onClick={() => setOpenRenewModal(true)}>
          Renew
        </Button>
        <Button color="success" onClick={() => setOpenReturnModal(true)}>
          Return
        </Button>
      </Button.Group>
    </StopClickDiv>
  );
};

export default RenewReturnCell;
