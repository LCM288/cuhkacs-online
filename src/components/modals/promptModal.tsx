import React from "react";
import { Modal, Button, Heading, Form } from "react-bulma-components";
import { PreventDefaultForm } from "utils/domEventHelpers";

const { Field } = Form;

interface Props {
  message: string | React.ReactElement;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: Parameters<typeof Button>[0]["color"];
  cancelColor?: Parameters<typeof Button>[0]["color"];
  disabled?: boolean;
}

const PromptModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  cancelColor = "danger",
  disabled = false,
}: Props): React.ReactElement => (
  <Modal show closeOnEsc onClose={onCancel}>
    <Modal.Content className="has-background-white box">
      <PreventDefaultForm onSubmit={onConfirm}>
        {(typeof message === "string" && (
          <Heading className="has-text-centered" size={5}>
            {message}
          </Heading>
        )) ||
          message}
        <Field kind="group" align="right">
          <Button.Group>
            <Button type="submit" color={confirmColor} disabled={disabled}>
              {confirmText}
            </Button>
            <Button type="button" color={cancelColor} onClick={onCancel}>
              {cancelText}
            </Button>
          </Button.Group>
        </Field>
      </PreventDefaultForm>
    </Modal.Content>
  </Modal>
);

export default PromptModal;
