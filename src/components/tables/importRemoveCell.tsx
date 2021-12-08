import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import useClipped from "utils/useClipped";
import PromptModal from "components/modals/promptModal";
import Loading from "components/loading";
import { PartialMember } from "utils/memberUtils";

interface Props {
  member: PartialMember;
  rowIndex: number;
  onRemove: (rowIndex: number) => void;
}

const ImportRemoveCell = ({
  member,
  rowIndex,
  onRemove,
}: Props): React.ReactElement => {
  const [removeLoading, setRemoveLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useClipped(openModal);

  const onConfirmRemove = useCallback(() => {
    setRemoveLoading(true);
    onRemove(rowIndex);
    setRemoveLoading(false);
    setOpenModal(false);
  }, [rowIndex, onRemove]);

  const promptRemove = useCallback(() => {
    setOpenModal(true);
  }, []);

  const cancelRemove = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <>
      {openModal && (
        <>
          <PromptModal
            message={`Are you sure to remove ${member.name?.eng} (SID: ${member.sid}) from the import list?`}
            onConfirm={onConfirmRemove}
            onCancel={cancelRemove}
            confirmText="Remove"
            cancelText="Back"
            confirmColor="danger"
            cancelColor="info"
          />
          <Loading loading={removeLoading} />
        </>
      )}
      <Button color="danger" onClick={promptRemove}>
        Remove
      </Button>
    </>
  );
};

export default ImportRemoveCell;
