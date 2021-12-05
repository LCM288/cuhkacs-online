import React, { useCallback, useState } from "react";
import { Button } from "react-bulma-components";
import AddAdminModal from "components/modals/addAdminModal";
import { toast } from "react-toastify";
import { StopClickDiv } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { UpdateType, useSet } from "utils/firebase";
import { Executive } from "types/db";

const AddAdmin = (): React.ReactElement => {
  const { loading, set: addExecutive } = useSet();

  const [modalOpen, setModalOpen] = useState(false);

  useClipped(modalOpen);

  const promptAdd = useCallback(() => {
    setModalOpen(true);
  }, []);

  const onAdd = useCallback(
    (newAdmin: UpdateType<Executive, "createdAt" | "updatedAt">) => {
      addExecutive(`executives/${newAdmin.sid}`, newAdmin)
        .then(() => {
          toast.success(
            `${newAdmin.displayName} has been added to the list of executives.`
          );
          setModalOpen(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [addExecutive]
  );

  return (
    <StopClickDiv>
      <>
        {modalOpen && (
          <AddAdminModal
            onSave={onAdd}
            onClose={() => {
              setModalOpen(false);
            }}
            loading={loading}
          />
        )}
        <Button color="primary" onClick={promptAdd}>
          Add admin
        </Button>
      </>
    </StopClickDiv>
  );
};

export default AddAdmin;
