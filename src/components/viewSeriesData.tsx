import React, { useCallback, useEffect, useMemo, useState } from "react";
import useResizeAware from "react-resize-aware";
import {
  Row,
  TableInstance,
  TableOptions,
  useFilters,
  UseFiltersInstanceProps,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import { BookKey, decodeLocation, LibraryBook } from "utils/libraryUtils";
import useHideColumn from "utils/useHideColumn";
import Table from "components/tables/table";
import { DateTime } from "luxon";
import { Form, Loader } from "react-bulma-components";

const { Checkbox } = Form;

interface Props {
  seriesId: string;
  data: Record<BookKey, LibraryBook> | null | undefined;
  loading: boolean;
  error: Error | undefined;
}

const ViewSeriesData = ({
  data,
  loading,
  error,
}: Props): React.ReactElement => {
  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [error]);

  const statusFilter = useCallback(
    (rows: Array<Row<LibraryBook>>, id: string, filterValue: boolean) =>
      filterValue
        ? rows
        : rows.filter((row) => row.original.status !== "deleted"),
    []
  );

  const tableColumns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        id: "id",
        width: 330,
        maxWidth: 330,
      },
      {
        Header: "Volume",
        accessor: "volume",
        id: "volume",
        width: 95,
        maxWidth: 95,
      },
      {
        Header: "Language",
        accessor: "language",
        id: "language",
        width: 120,
        maxWidth: 120,
      },
      {
        Header: "Location",
        accessor: (row: LibraryBook) => decodeLocation(row.location),
        id: "location",
        width: 110,
        maxWidth: 110,
      },
      {
        Header: "Status",
        accessor: "status",
        id: "status",
        filter: statusFilter,
        width: 85,
        maxWidth: 85,
      },
      {
        Header: "Created At",
        accessor: (row: LibraryBook) =>
          DateTime.fromMillis(row.createdAt, {
            zone: "Asia/Hong_Kong",
          }).toISODate(),
        id: "createdAt",
        width: 140,
        maxWidth: 140,
      },
      {
        Header: "ISBN",
        accessor: "isbn",
        id: "isbn",
        width: 150,
        maxWidth: 150,
      },
      {
        Header: "Updated At",
        accessor: (row: LibraryBook) =>
          DateTime.fromMillis(row.updatedAt, {
            zone: "Asia/Hong_Kong",
          }).toISODate(),
        id: "updatedAt",
        width: 145,
        maxWidth: 145,
      },
    ],
    [statusFilter]
  );

  const tableData = useMemo(() => {
    return data
      ? Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => {
            const numA = parseFloat(a.volume);
            const numB = parseFloat(b.volume);
            if (isNaN(numA) && isNaN(numB)) {
              return a.volume < b.volume ? -1 : 1;
            } else if (isNaN(numA)) {
              return -1;
            } else if (isNaN(numB)) {
              return 1;
            } else {
              return numA - numB;
            }
          })
      : [];
  }, [data]);

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => row.id as string;
  }, []);

  const initialFilters = useMemo(
    () => [
      {
        id: "status",
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

  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    setFilter("status", showDeleted);
  }, [setFilter, showDeleted]);

  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(
    () => [
      ["id"],
      ["language"],
      ["updatedAt"],
      ["isbn"],
      ["createdAt"],
      ["location"],
      ["status"],
    ],
    []
  );

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  return (
    <>
      {resizeListener}
      {loading ? (
        <Loader className="is-pulled-right" />
      ) : (
        <Checkbox
          className="is-pulled-right"
          onChange={(event) => setShowDeleted(event.target.checked)}
          checked={showDeleted}
        >
          Show deleted books
        </Checkbox>
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
    </>
  );
};

export default ViewSeriesData;
