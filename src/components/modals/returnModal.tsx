import TextField from "components/fields/textField";
import Loading from "components/loading";
import { increment, serverTimestamp } from "firebase/database";
import React, { useCallback, useState } from "react";
import { Modal, Form, Button } from "react-bulma-components";
import { toast } from "react-toastify";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { useUpdate } from "utils/firebase";
import { ExtendedBorrow, getISBN, lengthLimits } from "utils/libraryUtils";

const { Control, Field } = Form;

interface Props {
  onClose: () => void;
  borrowData: ExtendedBorrow;
}

const ReturnModal = ({ onClose, borrowData }: Props): React.ReactElement => {
  const [isbn, setISBN] = useState("");
  const { update, loading } = useUpdate("/library");

  const validateISBN = useCallback((str: string) => {
    const isbn2 = getISBN(str);
    if (!isbn2) {
      if (str) {
        toast.error("Invalid ISBN");
      }
      setISBN("");
    } else {
      setISBN(isbn2);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      if (!isbn) {
        throw new Error("ISBN is missing.");
      }
      const validatedISBN = getISBN(isbn);
      if (!validatedISBN) {
        setISBN("");
        throw new Error("Invalid ISBN.");
      } else if (validatedISBN !== borrowData.bookIsbn) {
        setISBN("");
        throw new Error("ISBN does not match the record.");
      }
      const updates = {
        [`memberBorrowings/${borrowData.sid}/currentBorrowCount`]:
          increment(-1),
        [`memberBorrowings/${borrowData.sid}/currentBorrows/${borrowData.id}`]:
          null,
        [`memberBorrowings/${borrowData.sid}/updatedAt`]: serverTimestamp(),
        [`borrows/data/${borrowData.id}/returnTime`]: serverTimestamp(),
        [`borrows/data/${borrowData.id}/updatedAt`]: serverTimestamp(),
        [`books/data/${borrowData.bookId}/status`]: "on-shelf",
        [`books/data/${borrowData.bookId}/updatedAt`]: serverTimestamp(),
      };
      await update(updates);
      toast.success("Record updated.");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [
    borrowData.bookId,
    borrowData.bookIsbn,
    borrowData.id,
    borrowData.sid,
    isbn,
    update,
  ]);

  return (
    <>
      <Loading loading={loading} />
      <Modal show closeOnEsc onClose={onClose}>
        <Modal.Content className="has-background-white box">
          <PreventDefaultForm onSubmit={onSubmit}>
            <TextField
              label="ISBN"
              placeholder="Please scan the isbn of the book"
              value={isbn}
              setValue={setISBN}
              required
              editable
              maxLength={lengthLimits.books.isbn}
              onBlur={(event) => validateISBN(event.target.value)}
              fullwidth
              autoFocus
            />
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
    </>
  );
};

export default ReturnModal;
