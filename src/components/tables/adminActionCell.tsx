import React, { useCallback, useState, useMemo } from "react";
import { Button } from "react-bulma-components";
import { toast } from "react-toastify";
import EditAdminModal from "components/modals/editAdminModal";
import PromptModal from "components/modals/promptModal";
import Loading from "components/loading";
import { StopClickDiv } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { Executive } from "types/db";
import { useUpdate, useRemove } from "utils/firebase";
import useUserStatus from "utils/useUserStatus";

interface Props {
  adminData: Executive;
}

const AdminActionCell = ({ adminData }: Props): React.ReactElement => {
  const userStatus = useUserStatus();
  const { loading: updateLoading, update: updateExecutive } = useUpdate<
    Executive,
    "updatedAt"
  >(`executives/${adminData.sid}`);
  const { loading: removeLoading, remove: removeExecutive } = useRemove();

  const loading = useMemo(
    () => updateLoading || removeLoading,
    [updateLoading, removeLoading]
  );
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useClipped(openEditModal);
  useClipped(openDeleteModal);

  const onSave = useCallback(
    (executive: Parameters<typeof updateExecutive>[0]) => {
      updateExecutive(executive)
        .then(() => {
          toast.success(
            `${executive.displayName} has been updated successfully.`
          );
          setOpenEditModal(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [updateExecutive]
  );

  const promptEdit = useCallback(() => {
    setOpenEditModal(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setOpenEditModal(false);
  }, []);

  const onDelete = useCallback(
    (sid: string) => {
      removeExecutive(`executives/${sid}`)
        .then(() => {
          toast.success(`${adminData.displayName} has been removed.`);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [adminData.displayName, removeExecutive]
  );

  const promptDelete = useCallback(() => {
    setOpenDeleteModal(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  return (
    <StopClickDiv>
      <>
        {openEditModal && (
          <EditAdminModal
            onSave={onSave}
            onCancel={cancelEdit}
            adminData={adminData}
            loading={loading}
          />
        )}
        {openDeleteModal && (
          <PromptModal
            message={`Are you sure to remove ${adminData.sid} from the admin list ?`}
            onConfirm={() => onDelete(adminData.sid)}
            onCancel={cancelDelete}
            confirmColor="danger"
            cancelColor="info"
            confirmText="Remove"
            cancelText="Back"
          />
        )}
        <Button.Group>
          <Button color="info" onClick={promptEdit}>
            Edit
          </Button>
          <Button
            color="danger"
            onClick={promptDelete}
            disabled={adminData.sid === userStatus?.sid}
          >
            Delete
          </Button>
        </Button.Group>
        {!openEditModal && <Loading loading={loading} />}
      </>
    </StopClickDiv>
  );
};

export default AdminActionCell;
