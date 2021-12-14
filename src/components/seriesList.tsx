import React, {
  useRef,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import { LibrarySeries, WithID, SeriesKey } from "utils/libraryUtils";
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
} from "firebase/database";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import { Button, Level } from "react-bulma-components";
import SeriesListTable from "components/seriesListTable";

type LibrarySeriesWithID = WithID<LibrarySeries>;

const seriesDataReducer = (
  state: Record<SeriesKey, LibrarySeriesWithID>,
  {
    eventType,
    data,
  }: {
    eventType: "added" | "changed" | "removed";
    data: LibrarySeriesWithID;
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
      data: LibrarySeriesWithID;
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
    data: LibrarySeriesWithID;
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

const useGetLastestSeries = (): {
  loadSeries: (count: number) => void;
  seriesList: LibrarySeriesWithID[];
} => {
  const clearCallbacks = useRef<(() => void)[]>([]);
  const [data, dispatch] = useReducer(seriesDataReducer, {});
  const seriesList = useMemo(
    () => Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt),
    [data]
  );
  useEffect(() => {
    const queryRef = query(
      ref(database, "library/series/data"),
      orderByChild("updatedAt"),
      startAfter(DateTime.now().valueOf())
    );
    addQuery(queryRef, dispatch, clearCallbacks);
  }, []);
  const loadSeries = useCallback(
    (count: number) => {
      const queryRef = query(
        ref(database, "library/series/data"),
        orderByChild("updatedAt"),
        endBefore(
          seriesList.length
            ? seriesList[seriesList.length - 1].updatedAt
            : DateTime.now().valueOf()
        ),
        limitToLast(count)
      );
      addQuery(queryRef, dispatch, clearCallbacks);
    },
    [seriesList]
  );
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearCallbacks.current.forEach((clear) => clear());
    };
  }, []);
  return { loadSeries, seriesList };
};

interface Props {
  editable?: boolean;
}

const SeriesList = ({ editable = false }: Props): React.ReactElement => {
  const { loadSeries, seriesList } = useGetLastestSeries();
  const initialLoadSeries = useRef(false);
  useEffect(() => {
    if (!initialLoadSeries.current) {
      loadSeries(5);
      initialLoadSeries.current = true;
    }
  }, [loadSeries]);
  const {
    data: seriesCount,
    loading: seriesCountLoading,
    error: seriesCountError,
  } = useGetAndListen<number>("library/series/count");

  useEffect(() => {
    if (seriesCountError) {
      console.error(seriesCountError);
      toast.error(seriesCountError.message);
    }
  }, [seriesCountError]);

  return (
    <>
      <SeriesListTable
        loading={seriesCountLoading}
        seriesList={seriesList}
        editable={editable}
      />
      {seriesCount && seriesList.length < seriesCount ? (
        <Button fullwidth color="info" onClick={() => loadSeries(5)}>
          Show More
        </Button>
      ) : (
        <Level>
          <Level.Item>No More Series</Level.Item>
        </Level>
      )}
    </>
  );
};

export default SeriesList;
