import React, {
  useRef,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import {
  LibraryBorrow,
  WithID,
  BorrowKey,
  useGetAndListenFromID,
} from "utils/libraryUtils";
import { database, useGetAndListen } from "utils/firebase";
import {
  ref,
  query,
  orderByChild,
  endBefore,
  limitToLast,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  DataSnapshot,
  startAfter,
  Query,
  equalTo,
} from "firebase/database";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import { Button, Level } from "react-bulma-components";
import { uniq } from "lodash";
import BorrowListTable from "./borrowListTable";

type LibraryBorrowWithID = WithID<LibraryBorrow>;

const seriesDataReducer = (
  state: Record<BorrowKey, LibraryBorrowWithID>,
  {
    eventType,
    data,
  }: {
    eventType: "added" | "changed" | "removed";
    data: LibraryBorrowWithID;
  }
) => {
  switch (eventType) {
    case "added":
    case "changed":
      return { ...state, [data.id]: data };
    case "removed":
      if (state[data.id]?.updatedAt === data.updatedAt) {
        const newState = { ...state };
        delete newState[data.id];
        return newState;
      } else {
        return state;
      }
  }
};

type EventType = "added" | "changed" | "removed";

const dispatchEventData =
  (
    dispatch: React.Dispatch<{
      eventType: EventType;
      data: LibraryBorrowWithID;
    }>,
    eventType: EventType
  ): ((snapshot: DataSnapshot) => void) =>
  (snapshot: DataSnapshot) =>
    dispatch({ eventType, data: { ...snapshot.val(), id: snapshot.key } });

const errorCallback = (err: Error) => {
  console.error(err);
  toast.error(err.message);
};

const addQuery = (
  queryRef: Query,
  dispatch: React.Dispatch<{
    eventType: EventType;
    data: LibraryBorrowWithID;
  }>,
  clearCallbacks: React.MutableRefObject<(() => void)[]>
): void => {
  const offAdded = onChildAdded(
    queryRef,
    dispatchEventData(dispatch, "added"),
    errorCallback
  );
  const offChanged = onChildChanged(
    queryRef,
    dispatchEventData(dispatch, "changed"),
    errorCallback
  );
  const offRemoved = onChildRemoved(
    queryRef,
    dispatchEventData(dispatch, "removed"),
    errorCallback
  );
  clearCallbacks.current.push(offAdded);
  clearCallbacks.current.push(offChanged);
  clearCallbacks.current.push(offRemoved);
};

const useGetLastestBorrows = (): {
  loadBorrows: (count: number) => void;
  borrowList: LibraryBorrowWithID[];
} => {
  const clearCallbacks = useRef<(() => void)[]>([]);
  const [data, dispatch] = useReducer(seriesDataReducer, {});
  const borrowList = useMemo(
    () => Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt),
    [data]
  );
  useEffect(() => {
    const queryRef = query(
      ref(database, "library/borrows/data"),
      orderByChild("returnTime"),
      equalTo(null)
    );
    addQuery(queryRef, dispatch, clearCallbacks);
  }, []);
  useEffect(() => {
    const queryRef = query(
      ref(database, "library/borrows/data"),
      orderByChild("updatedAt"),
      startAfter(DateTime.now().valueOf())
    );
    addQuery(queryRef, dispatch, clearCallbacks);
  }, []);
  const loadBorrows = useCallback(
    (count: number) => {
      const queryRef = query(
        ref(database, "library/borrows/data"),
        orderByChild("updatedAt"),
        endBefore(
          borrowList.length
            ? borrowList[borrowList.length - 1].updatedAt
            : DateTime.now().valueOf()
        ),
        limitToLast(count)
      );
      addQuery(queryRef, dispatch, clearCallbacks);
    },
    [borrowList]
  );
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearCallbacks.current.forEach((clear) => clear());
    };
  }, []);
  return { loadBorrows, borrowList };
};

const BorrowList = (): React.ReactElement => {
  const { loadBorrows, borrowList } = useGetLastestBorrows();
  const {
    data: borrowCount,
    loading: borrowCountLoading,
    error: borrowCountError,
  } = useGetAndListen<number>("library/borrows/count");

  useEffect(() => {
    if (borrowCountError) {
      console.error(borrowCountError);
      toast.error(borrowCountError.message);
    }
  }, [borrowCountError]);

  const sidList = useMemo(
    () => uniq(borrowList.map(({ sid }) => sid)),
    [borrowList]
  );
  const getMemberEngNamePathFromId = useCallback(
    (sid: string) => `/members/${sid}/name/eng`,
    []
  );
  const { data: memberEngNameData, loading: memberEngNameLoading } =
    useGetAndListenFromID<string>(sidList, getMemberEngNamePathFromId);

  const seriesIdList = useMemo(
    () => uniq(borrowList.map(({ seriesId }) => seriesId)),
    [borrowList]
  );
  const getSeriesTitlePathFromId = useCallback(
    (seriesId: string) => `/library/series/data/${seriesId}/title`,
    []
  );
  const { data: seriesTitleData, loading: seriesTitleLoading } =
    useGetAndListenFromID<string>(seriesIdList, getSeriesTitlePathFromId);

  const bookIdList = useMemo(
    () => uniq(borrowList.map(({ bookId }) => bookId)),
    [borrowList]
  );
  const getBookVolumePathFromId = useCallback(
    (bookId: string) => `/library/books/data/${bookId}/volume`,
    []
  );
  const { data: bookVolumeData, loading: bookVolumeLoading } =
    useGetAndListenFromID<string>(bookIdList, getBookVolumePathFromId);
  const getBookIsbnPathFromId = useCallback(
    (bookId: string) => `/library/books/data/${bookId}/isbn`,
    []
  );
  const { data: bookIsbnData, loading: bookIsbnLoading } =
    useGetAndListenFromID<string>(bookIdList, getBookIsbnPathFromId);

  const extendedBorrowList = useMemo(
    () =>
      borrowList.map((borrow) => ({
        ...borrow,
        memberEngName: memberEngNameData[borrow.sid] || null,
        seriesTitle: seriesTitleData[borrow.seriesId] || null,
        bookVolume: bookVolumeData[borrow.bookId] || null,
        bookIsbn: bookIsbnData[borrow.bookId] || null,
      })),
    [
      bookIsbnData,
      bookVolumeData,
      borrowList,
      memberEngNameData,
      seriesTitleData,
    ]
  );

  return (
    <>
      <BorrowListTable
        extendedBorrowList={extendedBorrowList}
        loading={
          borrowCountLoading ||
          memberEngNameLoading ||
          seriesTitleLoading ||
          bookVolumeLoading ||
          bookIsbnLoading
        }
      />
      {borrowCount && borrowList.length < borrowCount ? (
        <Button fullwidth color="info" onClick={() => loadBorrows(5)}>
          Show More
        </Button>
      ) : (
        <Level>
          <Level.Item>No More Borrowings</Level.Item>
        </Level>
      )}
    </>
  );
};

export default BorrowList;
