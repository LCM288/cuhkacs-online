import React from "react";
import { Modal, Button, Heading } from "react-bulma-components";

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
      {(typeof message === "string" && (
        <Heading className="has-text-centered" size={5}>
          {message}
        </Heading>
      )) ||
        message}
      <div className="is-pulled-right buttons pt-4">
        <Button
          type="button"
          color={confirmColor}
          onClick={onConfirm}
          disabled={disabled}
        >
          {confirmText}
        </Button>
        <Button color={cancelColor} onClick={onCancel}>
          {cancelText}
        </Button>
      </div>
    </Modal.Content>
  </Modal>
);

export default PromptModal;
