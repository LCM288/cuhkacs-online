import React, { useState } from "react";
import { Modal, Button, Heading, Form } from "react-bulma-components";
import MemberUntilField from "components/fields/memberUntilField";
import { PreventDefaultForm } from "utils/domEventHelpers";

const { Field } = Form;

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
  const [memberUntil, setMemberUntil] = useState<string | null>(gradDate);

  return (
    <Modal show closeOnEsc onClose={onCancel} className="modal-ovrflowing">
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={() => onConfirm(memberUntil)}>
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
          <Field kind="group" align="right">
            <Button.Group>
              <Button type="submit" color="primary">
                Confirm
              </Button>
              <Button color="danger" onClick={onCancel}>
                Cancel
              </Button>
            </Button.Group>
          </Field>
        </PreventDefaultForm>
      </Modal.Content>
    </Modal>
  );
};

export default ApproveModal;
