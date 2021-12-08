import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import EditMemberModal, {
  UpdatedMember,
} from "components/modals/editMemberModal";
import useClipped from "utils/useClipped";
import { PartialMember } from "utils/memberUtils";

interface Props {
  member: PartialMember;
  rowIndex: number;
  updateMemberData: (rowIndex: number, newData: UpdatedMember) => void;
}

const ImportEditCell = ({
  member,
  rowIndex,
  updateMemberData,
}: Props): React.ReactElement => {
  const [editLoading, setEditLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useClipped(openModal);

  const onSave = useCallback(
    (newData: UpdatedMember) => {
      setEditLoading(true);
      updateMemberData(rowIndex, newData);
      setEditLoading(false);
      setOpenModal(false);
    },
    [rowIndex, updateMemberData]
  );

  const promptEdit = useCallback(() => {
    setOpenModal(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <>
      {openModal && (
        <EditMemberModal
          onSave={onSave}
          onCancel={cancelEdit}
          member={member}
          loading={editLoading}
          type="Member"
          fullyEditable
        />
      )}
      <Button color="info" onClick={promptEdit}>
        Edit
      </Button>
    </>
  );
};

export default ImportEditCell;
