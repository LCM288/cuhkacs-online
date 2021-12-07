import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import EditMemberModal, {
  UpdatedMember,
} from "components/modals/editMemberModal";
import { toast } from "react-toastify";
import useClipped from "utils/useClipped";
import { useUpdate } from "utils/firebase";
import { Member } from "types/db";
import { RegistrationListRow, MemberListRow } from "types/tableRow";
import { DateTime } from "luxon";
import { serverTimestamp } from "firebase/database";

interface Props {
  row: RegistrationListRow | MemberListRow;
  type: "Registration" | "Member";
}

const EditMemberCell = ({ row, type }: Props): React.ReactElement => {
  const { loading: editLoading, update: updateMember } = useUpdate<
    Member,
    "lastRenewed" | "updatedAt"
  >(`members/${row.sid}`);

  const [openModal, setOpenModal] = useState(false);

  useClipped(openModal);

  const onSave = useCallback(
    (newData: UpdatedMember) => {
      if (!newData.studentStatus.college) {
        toast.error("College is missing.");
        return;
      }
      if (!newData.studentStatus.major) {
        toast.error("Major is missing.");
        return;
      }
      if (!newData.studentStatus.entryDate) {
        toast.error("Entry date is missing.");
        return;
      }
      if (!newData.studentStatus.gradDate) {
        toast.error("Graduation date is missing.");
        return;
      }
      switch (type) {
        case "Registration":
          updateMember({
            ...newData,
            studentStatus: {
              college: newData.studentStatus.college,
              major: newData.studentStatus.major,
              entryDate: newData.studentStatus.entryDate,
              gradDate: newData.studentStatus.gradDate,
            },
            memberStatus: null,
            updatedAt: serverTimestamp(),
          })
            .then(() => {
              toast.success("Registration updated.");
              setOpenModal(false);
            })
            .catch((err) => {
              console.error(err);
              toast.error(err.message);
            });
          break;
        case "Member":
          if (!newData.memberStatus) {
            console.error("Missing member status");
            toast.error("Some error has occurred.");
            return;
          }
          if (!("memberSince" in row)) {
            console.error("memberSince field missing in row");
            toast.error("Some error has occurred.");
            return;
          }
          if (!("lastRenewed" in row)) {
            console.error("lastRenewed field missing in row");
            toast.error("Some error has occurred.");
            return;
          }
          if (!("memberUntil" in row)) {
            console.error("memberUntil field missing in row");
            toast.error("Some error has occurred.");
            return;
          }
          const since = DateTime.fromISO(row.memberSince, {
            zone: "Asia/Hong_Kong",
          }).valueOf();
          const lastRenewed = DateTime.fromISO(row.lastRenewed, {
            zone: "Asia/Hong_Kong",
          }).valueOf();
          const oldUntil = DateTime.fromISO(row.memberUntil, {
            zone: "Asia/Hong_Kong",
          }).valueOf();
          const newUntil = DateTime.fromISO(newData.memberStatus.until, {
            zone: "Asia/Hong_Kong",
          }).valueOf();
          if (newUntil < DateTime.now().valueOf()) {
            toast.error("Please specify a future date.");
            return;
          }
          updateMember({
            ...newData,
            studentStatus: {
              college: newData.studentStatus.college,
              major: newData.studentStatus.major,
              entryDate: newData.studentStatus.entryDate,
              gradDate: newData.studentStatus.gradDate,
            },
            memberStatus: {
              since,
              lastRenewed:
                newUntil > oldUntil ? serverTimestamp() : lastRenewed,
              until: newUntil,
            },
            updatedAt: serverTimestamp(),
          })
            .then(() => {
              toast.success("Member updated.");
              setOpenModal(false);
            })
            .catch((err) => {
              console.error(err);
              toast.error(err.message);
            });
      }
    },
    [row, type, updateMember]
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
          row={row}
          loading={editLoading}
          type={type}
        />
      )}
      <Button color="info" onClick={promptEdit}>
        Edit
      </Button>
    </>
  );
};

export default EditMemberCell;
