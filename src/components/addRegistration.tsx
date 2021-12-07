import React, { useCallback, useState } from "react";
import { Button } from "react-bulma-components";
import AddRegistrationModal, {
  NewMember,
} from "components/modals/addRegistrationModal";
import { toast } from "react-toastify";
import { StopClickDiv } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { useSet } from "utils/firebase";
import { Member } from "types/db";
import { serverTimestamp } from "firebase/database";

const AddRegistration = (): React.ReactElement => {
  const { loading, set: addRegistration } = useSet<
    Member,
    "createdAt" | "updatedAt"
  >();

  const [modalOpen, setModalOpen] = useState(false);

  useClipped(modalOpen);

  const promptAdd = useCallback(() => {
    setModalOpen(true);
  }, []);

  const onAdd = useCallback(
    (newMemberData: NewMember) => {
      if (!newMemberData.sid) {
        toast.error("SID is missing.");
        return;
      }
      if (!newMemberData.name.eng) {
        toast.error("English name is missing.");
        return;
      }
      if (!newMemberData.studentStatus.college) {
        toast.error("College is missing.");
        return;
      }
      if (!newMemberData.studentStatus.major) {
        toast.error("Major is missing.");
        return;
      }
      if (!newMemberData.studentStatus.entryDate) {
        toast.error("Date of entry is missing.");
        return;
      }
      if (!newMemberData.studentStatus.gradDate) {
        toast.error("Date of graduation is missing.");
        return;
      }
      addRegistration(`members/${newMemberData.sid}`, {
        ...newMemberData,
        sid: newMemberData.sid,
        name: {
          chi: newMemberData.name.chi,
          eng: newMemberData.name.eng,
        },
        studentStatus: {
          college: newMemberData.studentStatus.college,
          major: newMemberData.studentStatus.major,
          entryDate: newMemberData.studentStatus.entryDate,
          gradDate: newMemberData.studentStatus.gradDate,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          toast.success("New registration added.");
          setModalOpen(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [addRegistration]
  );

  return (
    <StopClickDiv>
      <>
        {modalOpen && (
          <AddRegistrationModal
            onSave={onAdd}
            onClose={() => {
              setModalOpen(false);
            }}
            loading={loading}
          />
        )}
        <Button color="primary" onClick={promptAdd}>
          Add registration
        </Button>
      </>
    </StopClickDiv>
  );
};

export default AddRegistration;
