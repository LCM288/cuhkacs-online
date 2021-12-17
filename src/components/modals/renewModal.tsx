import DateField from "components/fields/dateField";
import { increment, serverTimestamp } from "firebase/database";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, Form, Button } from "react-bulma-components";
import { toast } from "react-toastify";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { useUpdate } from "utils/firebase";
import { getDefaultDueDateString } from "utils/libraryUtils";

const { Input, Field, Control, Label } = Form;

interface Props {
  onClose: () => void;
  originalDue: string;
  borrowId: string;
}

const RenewModal = ({
  onClose,
  originalDue,
  borrowId,
}: Props): React.ReactElement => {
  const defaultDueDate = useMemo(() => getDefaultDueDateString(), []);
  const [newDueDate, setNewDueDate] = useState(defaultDueDate);
  const { update } = useUpdate("/library");

  const onSubmit = useCallback(async () => {
    try {
      if (!newDueDate) {
        throw new Error("New due date is missing.");
      }
      if (originalDue === newDueDate) {
        throw new Error("Due date unchanged.");
      }
      const updates = {
        [`borrows/data/${borrowId}/renewCount`]: increment(1),
        [`borrows/data/${borrowId}/dueDate`]: newDueDate,
        [`borrows/data/${borrowId}/updatedAt`]: serverTimestamp(),
      };
      await update(updates);
      toast.success("Record updated.");
      onClose();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [newDueDate, originalDue, borrowId, update, onClose]);

  return (
    <Modal show closeOnEsc onClose={onClose}>
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={onSubmit}>
          <Field horizontal>
            <Field.Label>
              <Label>Original Due Date</Label>
            </Field.Label>
            <Field.Body>
              <Control>
                <Input value={originalDue} isStatic />
              </Control>
            </Field.Body>
          </Field>
          <Field horizontal>
            <Field.Label>
              <Label>New Due Date</Label>
            </Field.Label>
            <Field.Body>
              <Control>
                <DateField
                  label=""
                  dateValue={newDueDate}
                  setDateValue={setNewDueDate}
                  autoFocus
                  editable
                  required
                  hideLabel
                />
              </Control>
            </Field.Body>
          </Field>
          <Field kind="group" align="right">
            <Control>
              <Button color="primary" submit>
                Submit
              </Button>
            </Control>
            <Control>
              <Button type="button" color="danger" onClick={onClose}>
                Cancel
              </Button>
            </Control>
          </Field>
        </PreventDefaultForm>
      </Modal.Content>
    </Modal>
  );
};

export default RenewModal;
