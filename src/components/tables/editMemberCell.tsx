import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import EditMemberModal, {
  UpdatedMember,
} from "components/modals/editMemberModal";
import { toast } from "react-toastify";
import useClipped from "utils/useClipped";
import { useUpdate } from "utils/firebase";
import { Member } from "types/db";
import { DateTime } from "luxon";
import { serverTimestamp } from "firebase/database";

interface Props {
  member: Member;
  type: "Registration" | "Member";
}

const EditMemberCell = ({ member, type }: Props): React.ReactElement => {
  const { loading: editLoading, update: updateMember } = useUpdate<
    Member,
    "lastRenewed" | "updatedAt"
  >(`members/${member.sid}`);

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
          if (!member.memberStatus) {
            console.error("memberStatus field missing in member");
            toast.error("Some error has occurred.");
            return;
          }
          const lastRenewed = member.memberStatus.lastRenewed;
          const oldUntil = member.memberStatus.until;
          const newUntil = DateTime.fromISO(newData.memberStatus.until, {
            zone: "Asia/Hong_Kong",
          }).valueOf();
          updateMember({
            ...newData,
            studentStatus: {
              college: newData.studentStatus.college,
              major: newData.studentStatus.major,
              entryDate: newData.studentStatus.entryDate,
              gradDate: newData.studentStatus.gradDate,
            },
            memberStatus: {
              since: member.memberStatus.since,
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
    [member, type, updateMember]
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
