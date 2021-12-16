import BorrowModal from "components/modals/borrowModal";
import React, { useState } from "react";
import { Button } from "react-bulma-components";
import { Navigate } from "react-router-dom";
import { useSetTitle } from "utils/miscHooks";
import useUserStatus from "utils/useUserStatus";

const Borrowing = (): React.ReactElement => {
  const userStatus = useUserStatus();

  const [openBorrowModal, setOpenBorrowModal] = useState(false);

  useSetTitle("Borrow & Return Services");

  if (!userStatus?.executive) {
    return <Navigate to="/library" replace />;
  }

  return (
    <>
      {openBorrowModal && (
        <BorrowModal onCancel={() => setOpenBorrowModal(false)} />
      )}
      <Button
        color="link"
        className="is-light"
        onClick={() => setOpenBorrowModal(true)}
      >
        Borrow
      </Button>
    </>
  );
};

export default Borrowing;
