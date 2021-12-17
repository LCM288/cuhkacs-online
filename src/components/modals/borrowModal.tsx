import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TextField from "components/fields/textField";
import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  Columns,
  Form,
  Icon,
  Level,
  Modal,
} from "react-bulma-components";
import { toast } from "react-toastify";
import { PreventDefaultForm } from "utils/domEventHelpers";
import {
  database,
  useLazyGetCache,
  useLazyGetServer,
  useUpdate,
} from "utils/firebase";
import { Member } from "types/db";
import {
  lengthLimits as memberLengthLimits,
  patternLimits as memberPatternLimits,
} from "utils/memberUtils";
import {
  LibraryBook,
  lengthLimits as libraryLengthLimits,
  getISBN,
  BookKey,
  getDefaultDueDateString,
} from "utils/libraryUtils";
import {
  equalTo,
  increment,
  orderByChild,
  query,
  ref,
  push,
  serverTimestamp,
} from "firebase/database";
import DateField from "components/fields/dateField";
import { DateTime } from "luxon";
import Loading from "components/loading";

const { Input } = Form;

interface Props {
  onCancel: () => void;
}

const BorrowModal = ({ onCancel }: Props): React.ReactElement => {
  const { getServer } = useLazyGetServer();
  const { getCache } = useLazyGetCache();
  const { update } = useUpdate("library");
  const [loading, setLoading] = useState(false);

  const [stage, setStage] = useState(0);

  const [sid, setSid] = useState("");
  const [memberData, setMemberData] = useState<
    (Member & { currentBorrowCount: number }) | undefined
  >();

  const [isbn, setISBN] = useState("");
  const [bookData, setBookData] = useState<
    (LibraryBook & { id: string; seriesTitle: string }) | undefined
  >();

  const defaultDueDate = useMemo(() => getDefaultDueDateString(), []);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const [confirmMessage, setConfirmMessage] = useState("");

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

  const onStageZeroSubmit = useCallback(async () => {
    try {
      if (!sid) {
        throw new Error("SID is missing.");
      }
      const member = (await getServer(`/members/${sid}`)) as Member | null;
      if (!member) {
        throw new Error("Member not registered.");
      }
      if (!member.memberStatus) {
        throw new Error("Membership not approved yet.");
      }
      if (member.memberStatus.until < DateTime.now().valueOf()) {
        throw new Error("Membership expired");
      }
      const currentBorrowCount = ((await getServer(
        `/library/memberBorrowings/${sid}/currentBorrowCount`
      )) ?? 0) as number;
      setMemberData({ ...member, currentBorrowCount });
      setStage(1);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [getServer, sid]);

  const onStageOneSubmit = useCallback(async () => {
    try {
      if (!isbn) {
        throw new Error("ISBN is missing.");
      }
      const validatedISBN = getISBN(isbn);
      if (!validatedISBN) {
        setISBN("");
        throw new Error("Invalid ISBN.");
      } else {
        setISBN(validatedISBN);
      }

      const books = ((await getCache(
        query(
          ref(database, "/library/books/data"),
          orderByChild("isbn"),
          equalTo(validatedISBN)
        )
      )) ?? {}) as Record<BookKey, LibraryBook>;

      const bookKey = Object.keys(books).filter(
        (key) => books[key].status === "on-shelf"
      )[0] as string | undefined;

      if (Object.keys(books).length === 0) {
        throw new Error("Book not found.");
      }

      if (!bookKey) {
        throw new Error("Book not on shelf.");
      }

      const seriesTitle = (await getServer(
        `/library/series/data/${books[bookKey].seriesId}/title`
      )) as string | null;

      if (!seriesTitle) {
        throw new Error("Series not found.");
      }

      setBookData({ ...books[bookKey], id: bookKey, seriesTitle });
      setStage(2);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [getCache, getServer, isbn]);

  const onStageTwoSubmit = useCallback(() => {
    if (!dueDate) {
      toast.error("Due date is missing.");
      return;
    }
    setStage(3);
  }, [dueDate]);

  const onStageThreeSubmit = useCallback(async () => {
    try {
      if (confirmMessage !== "Yes") {
        throw new Error('Please input "Yes" to continue');
      }
      if (!memberData) {
        throw new Error("Member data not found");
      }
      if (!bookData) {
        throw new Error("Book data not found");
      }
      const borrowId = (await push(ref(database, "/library/borrows/data"))).key;
      const updates = {
        [`memberBorrowings/${memberData.sid}/borrowCount`]: increment(1),
        [`memberBorrowings/${memberData.sid}/borrows/${borrowId}`]: true,
        [`memberBorrowings/${memberData.sid}/currentBorrowCount`]: increment(1),
        [`memberBorrowings/${memberData.sid}/currentBorrows/${borrowId}`]: true,
        [`memberBorrowings/${memberData.sid}/updatedAt`]: serverTimestamp(),
        "borrows/count": increment(1),
        [`borrows/data/${borrowId}`]: {
          sid: memberData.sid,
          seriesId: bookData.seriesId,
          bookId: bookData.id,
          borrowTime: serverTimestamp(),
          dueDate: dueDate,
          renewCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        [`series/data/${bookData.seriesId}/borrowCount`]: increment(1),
        [`series/data/${bookData.seriesId}/updatedAt`]: serverTimestamp(),
        [`series_borrow/${bookData.seriesId}/${borrowId}`]: true,
        [`books/data/${bookData.id}/status`]: "on-loan",
        [`books/data/${bookData.id}/borrowCount`]: increment(1),
        [`books/data/${bookData.id}/updatedAt`]: serverTimestamp(),
        [`book_borrow/${bookData.id}/${borrowId}`]: true,
      };
      setLoading(true);
      await update(updates);
      toast.success(
        `${memberData.name.eng} has borrowed ${bookData.seriesTitle} ${bookData.volume}`
      );
      setStage(0);
      setMemberData(undefined);
      setISBN("");
      setBookData(undefined);
      setDueDate(defaultDueDate);
      setConfirmMessage("");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  }, [confirmMessage, memberData, bookData, dueDate, update, defaultDueDate]);

  const onSubmit = useCallback(() => {
    if (stage === 0) {
      onStageZeroSubmit();
    } else if (stage === 1) {
      onStageOneSubmit();
    } else if (stage === 2) {
      onStageTwoSubmit();
    } else if (stage === 3) {
      onStageThreeSubmit();
    }
  }, [
    stage,
    onStageZeroSubmit,
    onStageOneSubmit,
    onStageTwoSubmit,
    onStageThreeSubmit,
  ]);

  const onBack = useCallback(() => {
    if (stage === 0) {
      onCancel();
    } else {
      setStage(stage - 1);
    }
  }, [stage, onCancel]);

  return (
    <Modal
      show
      closeOnEsc={false}
      onClose={onCancel}
      className="modal-ovrflowing"
    >
      <Modal.Content
        className="has-background-white box"
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.code === "Escape") {
            onBack();
          }
        }}
      >
        <Loading loading={loading} />
        <PreventDefaultForm onSubmit={onSubmit}>
          {stage === 0 && (
            <TextField
              value={sid}
              setValue={setSid}
              label="Who?"
              placeholder="SID of the member"
              editable
              maxLength={memberLengthLimits.sid}
              pattern={memberPatternLimits.sid.source}
              required
              fullwidth
              autoFocus
            />
          )}
          {stage > 0 && (
            <Columns className="has-text-centered">
              <Columns.Column>Member</Columns.Column>
              <Columns.Column>{memberData?.sid}</Columns.Column>
              <Columns.Column>
                <div>{memberData?.name.eng}</div>
                <div>{memberData?.name.chi}</div>
              </Columns.Column>
              <Columns.Column>{memberData?.currentBorrowCount}</Columns.Column>
            </Columns>
          )}
          {stage === 1 && (
            <TextField
              value={isbn}
              setValue={setISBN}
              label="Which book?"
              placeholder="ISBN of the book"
              editable
              maxLength={libraryLengthLimits.books.isbn}
              onBlur={(event) => validateISBN(event.target.value)}
              required
              fullwidth
              autoFocus
            />
          )}
          {stage > 1 && (
            <Columns className="has-text-centered">
              <Columns.Column>Book</Columns.Column>
              <Columns.Column>{bookData?.isbn}</Columns.Column>
              <Columns.Column>{bookData?.seriesTitle}</Columns.Column>
              <Columns.Column>{bookData?.volume}</Columns.Column>
            </Columns>
          )}
          {stage === 2 && (
            <DateField
              label="Due Date"
              dateValue={dueDate}
              setDateValue={setDueDate}
              yearRange={[0, 1]}
              future
              autoFocus
              required
              editable
            />
          )}
          {stage > 2 && <div>{dueDate}</div>}
          {stage === 3 && (
            <TextField
              value={confirmMessage}
              setValue={setConfirmMessage}
              label='Please input "Yes" (without quotes) to confirm that the above information is correct'
              placeholder="Yes"
              editable
              required
              fullwidth
              autoFocus
            />
          )}
          <Input className="is-hidden" type="submit" />
          <Level className="mt-4">
            <Level.Side align="left">
              <Button color="warning" type="button" onClick={onBack}>
                <Icon>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Icon>
                <span>Back</span>
              </Button>
            </Level.Side>
            <Level.Side align="right">
              <Button color="info" submit>
                <span>Next</span>
                <Icon>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Icon>
              </Button>
            </Level.Side>
          </Level>
        </PreventDefaultForm>
      </Modal.Content>
    </Modal>
  );
};

export default BorrowModal;
