import React, { useState } from "react";
import { Modal, Button, Heading } from "react-bulma-components";
import MemberUntilField from "components/fields/memberUntilField";
import { PreventDefaultForm } from "utils/domEventHelpers";

interface Props {
  sid: string;
  englishName: string;
  gradDate: string;
  onConfirm: (memberUntil: string | null) => void;
  onCancel: () => void;
}

const ApproveModal = ({
  sid,
  englishName,
  gradDate,
  onConfirm,
  onCancel,
}: Props): React.ReactElement => {
  const [memberUntil, setMemberUntil] = useState<string | null>(null);

  return (
    <Modal show closeOnEsc onClose={onCancel} className="modal-ovrflowing">
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={() => onConfirm(memberUntil)}>
          <>
            <Heading className="has-text-centered" size={5}>
              {`You are going to approve ${englishName}'s (sid: ${sid}) membership.`}
            </Heading>
            <MemberUntilField
              label="Membership Expiration Date"
              gradDate={gradDate}
              dateValue={memberUntil}
              setDateValue={setMemberUntil}
              future
              editable
            />
            <div className="is-pulled-right buttons pt-4">
              <Button type="submit" color="primary">
                Confirm
              </Button>
              <Button color="danger" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        </PreventDefaultForm>
      </Modal.Content>
    </Modal>
  );
};

export default ApproveModal;
