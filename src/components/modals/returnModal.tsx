import React, { useCallback } from "react";
import { Modal } from "react-bulma-components";
import { PreventDefaultForm } from "utils/domEventHelpers";

interface Props {
  onClose: () => void;
  isbn: string;
}

const ReturnModal = ({ onClose }: Props): React.ReactElement => {
  const onSubmit = useCallback(() => {}, []);
  return (
    <Modal show closeOnEsc onClose={onClose}>
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={onSubmit}>
          <></>
        </PreventDefaultForm>
      </Modal.Content>
    </Modal>
  );
};

export default ReturnModal;
