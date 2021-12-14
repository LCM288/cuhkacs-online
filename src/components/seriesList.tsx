import React, {
  useRef,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  useState,
} from "react";
import {
  decodeLocation,
  LibrarySeries,
  LocationKey,
  SeriesKey,
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
} from "firebase/database";
import { toast } from "react-toastify";
import {
  Row,
  TableInstance,
  TableOptions,
  useFilters,
  UseFiltersInstanceProps,
  useSortBy,
  useTable,
} from "react-table";
import { DateTime } from "luxon";
import useResizeAware from "react-resize-aware";
import useHideColumn from "utils/useHideColumn";
import { Button, Form, Level, Loader, Tag } from "react-bulma-components";
import Table from "components/tables/table";
import { Link } from "react-router-dom";

type LibrarySeriesWithID = LibrarySeries & { id: string };

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

const { Checkbox } = Form;

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

  const emptySeriesFilter = useCallback(
    (
      rows: Array<Row<LibrarySeriesWithID>>,
      id: string,
      includeEmptySeries: boolean
    ) =>
      includeEmptySeries
        ? rows
        : rows.filter((row) => row.original.bookCount !== 0),
    []
  );

  const tableData = useMemo(() => seriesList, [seriesList]);

  const tableColumns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        id: "id",
        width: 330,
        maxWidth: 330,
        Cell: ({ value }: { value: string }) => (
          <Link to={`books/${value}`} key="id">
            {value}
          </Link>
        ),
      },
      {
        Header: "Title",
        accessor: "title",
        id: "title",
        width: 150,
        maxWidth: 150,
        Cell: ({
          value,
          row,
        }: {
          value: string;
          row: { original: LibrarySeriesWithID };
        }) => (
          <Link to={`books/${row.original.id}`} key="title">
            {value}
          </Link>
        ),
      },
      {
        Header: "Author",
        accessor: "author",
        id: "author",
        width: 120,
        maxWidth: 120,
      },
      {
        Header: "Locations",
        accessor: (row: LibrarySeriesWithID): Record<LocationKey, number> =>
          row.locations ?? {},
        id: "locations",
        disableSortBy: true,
        width: 90,
        maxWidth: 90,
        Cell: ({ value }: { value: Record<LocationKey, number> }) => {
          const locations = Object.keys(value)
            .filter((key) => value[key] !== 0)
            .sort((keyA, keyB) => value[keyA] - value[keyB]);
          return locations.map((location) => (
            <div key="locations">
              <Tag color="light">{decodeLocation(location)}</Tag>*
              {value[location]}
            </div>
          ));
        },
      },
      {
        Header: "Books",
        accessor: "bookCount",
        id: "bookCount",
        filter: emptySeriesFilter,
        width: 85,
        maxWidth: 85,
      },
      {
        Header: "Borrows",
        accessor: "borrowCount",
        id: "borrowCount",
        width: 100,
        maxWidth: 100,
      },
      {
        Header: "Created At",
        accessor: (row: LibrarySeriesWithID) =>
          DateTime.fromMillis(row.createdAt, {
            zone: "Asia/Hong_Kong",
          }).toISODate(),
        id: "createdAt",
        width: 140,
        maxWidth: 140,
      },
      {
        Header: "Updated At",
        accessor: (row: LibrarySeriesWithID) =>
          DateTime.fromMillis(row.updatedAt, {
            zone: "Asia/Hong_Kong",
          }).toISODate(),
        id: "updatedAt",
        width: 145,
        maxWidth: 145,
      },
      ...(editable
        ? [
            {
              Header: "Edit",
              accessor: () => "Edit",
              id: "edit",
              Cell: ({ row }: { row: { original: LibrarySeriesWithID } }) => (
                <Link
                  to={`/library/edit/series/books/${row.original.id}`}
                  className="button is-info"
                >
                  Edit
                </Link>
              ),
              disableSortBy: true,
              minWidth: 85,
              width: 85,
              maxWidth: 85,
            },
          ]
        : []),
    ],
    [editable, emptySeriesFilter]
  );

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => row.id as string;
  }, []);

  const initialFilters = useMemo(
    () => [
      {
        id: "bookCount",
        value: false,
      },
    ],
    []
  );

  const tableOption = useMemo(
    () =>
      ({
        columns: tableColumns,
        data: tableData,
        getRowId: tableGetRowId,
        autoResetFilters: false,
        initialState: { filters: initialFilters },
      } as TableOptions<Record<string, unknown>>),
    [initialFilters, tableColumns, tableData, tableGetRowId]
  );

  const tableInstance = useTable(
    tableOption,
    useFilters,
    useSortBy
  ) as TableInstance<Record<string, unknown>> &
    UseFiltersInstanceProps<Record<string, unknown>>;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    setHiddenColumns,
    allColumns,
    visibleColumns,
  } = tableInstance;

  const [showEmptySeries, setShowEmptySeris] = useState(false);

  useEffect(() => {
    setFilter("bookCount", showEmptySeries);
  }, [setFilter, showEmptySeries]);

  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(
    () => [
      ["id"],
      ["updatedAt"],
      ["edit"],
      ["bookCount", "borrowCount"],
      ["createdAt"],
      ["locations"],
      ["author"],
    ],
    []
  );

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  return (
    <>
      {resizeListener}
      {seriesCountLoading ? (
        <Loader className="is-pulled-right" />
      ) : (
        editable && (
          <Checkbox
            className="is-pulled-right"
            onChange={(event) => setShowEmptySeris(event.target.checked)}
            checked={showEmptySeries}
          >
            Show empty series
          </Checkbox>
        )
      )}
      <Table
        getTableProps={getTableProps}
        headerGroups={headerGroups}
        tableColumns={tableColumns}
        getTableBodyProps={getTableBodyProps}
        rows={rows}
        prepareRow={prepareRow}
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        windowWidth={windowWidth}
        tableSortable
        size="fullwidth"
        striped
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
