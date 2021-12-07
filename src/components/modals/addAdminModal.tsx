import React, { useState, useCallback, useMemo } from "react";
import {
  Heading,
  Modal,
  Button,
  Loader,
  Columns,
} from "react-bulma-components";
import Loading from "components/loading";
import PromptModal from "components/modals/promptModal";
import TextField from "components/fields/textField";
import { PreventDefaultForm } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { Executive, Member } from "types/db";
import { UpdateType, useLazyGetServer } from "utils/firebase";
import { serverTimestamp } from "firebase/database";
import collegeData from "static/college.json";
import majorData from "static/major.json";

interface Props {
  onSave: (newAdmin: UpdateType<Executive, "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  loading: boolean;
}

const AddAdminModal = ({
  onSave,
  onClose,
  loading,
}: Props): React.ReactElement => {
  const {
    loading: memberLoading,
    data: member,
    error,
    getServer: getMember,
  } = useLazyGetServer<Member | null>();

  const [sid, setSID] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  useClipped(openConfirmModal);

  const messageElement = useMemo(() => {
    const collegeCode = member?.studentStatus.college;
    const college = collegeData.colleges.find(
      ({ code }) => code === collegeCode
    );
    const majorCode = member?.studentStatus.college;
    const major = majorData.majors.find(({ code }) => code === majorCode);
    return (
      <>
        <Heading className="has-text-centered" size={5}>
          {`Are you sure to add ${sid} as an admin ?`}
        </Heading>
        {memberLoading ? (
          <Loader />
        ) : (
          <>
            {error && <div>{error.message}</div>}
            {member ? (
              <Columns className="has-text-centered">
                <Columns.Column>
                  <div>{member.name.eng}</div>
                  <div>{member.name.chi}</div>
                </Columns.Column>
                <Columns.Column>
                  <div>{college?.englishName ?? collegeCode}</div>
                  <div>{college?.chineseName ?? "College not found"}</div>
                </Columns.Column>
                <Columns.Column>
                  <div>{major?.englishName ?? majorCode}</div>
                  <div>{major?.chineseName ?? "Major not found"}</div>
                </Columns.Column>
              </Columns>
            ) : (
              <div>{sid} cannot be found on the member list.</div>
            )}
          </>
        )}
      </>
    );
  }, [sid, memberLoading, member, error]);

  const onConfirm = useCallback(
    (newAdmin: UpdateType<Executive, "createdAt" | "updatedAt">) => {
      onSave(newAdmin);
      setOpenConfirmModal(false);
    },
    [onSave]
  );

  const promptConfirm = useCallback(
    (confirmSid: string) => {
      // error will be handled elsewhere
      getMember(`members/${confirmSid}`).catch(() => {});
      setOpenConfirmModal(true);
    },
    [getMember]
  );

  const cancelConfirm = useCallback(() => {
    setOpenConfirmModal(false);
  }, []);

  return (
    <Modal show closeOnEsc={false} onClose={onClose}>
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={() => promptConfirm(sid)}>
          <>
            <Heading className="has-text-centered">New Admin</Heading>
            <TextField
              value={sid}
              setValue={setSID}
              pattern="^\d{10}$"
              label="Student ID"
              placeholder="Student ID"
              editable
              required
            />
            <TextField
              value={displayName}
              setValue={setDisplayName}
              label="Display Name"
              placeholder="Display Name"
              editable
            />
            <TextField
              value={title}
              setValue={setTitle}
              label="Title"
              placeholder="Title"
              editable
            />
            <div className="is-pulled-right buttons pt-4">
              <Button color="primary" type="submit">
                Add
              </Button>
              <Button color="danger" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        </PreventDefaultForm>
      </Modal.Content>
      {openConfirmModal && (
        <PromptModal
          message={messageElement}
          onConfirm={() =>
            onConfirm({
              sid,
              displayName,
              title,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
          onCancel={cancelConfirm}
          disabled={!member?.memberStatus?.since}
        />
      )}
      <Loading loading={loading} />
    </Modal>
  );
};

export default AddAdminModal;
