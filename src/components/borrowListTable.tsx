import { DateTime } from "luxon";
import React, { useMemo } from "react";
import { Loader, Level } from "react-bulma-components";
import useResizeAware from "react-resize-aware";
import { Link } from "react-router-dom";
import { TableOptions, useSortBy, useTable } from "react-table";
import { LibraryBorrow } from "utils/libraryUtils";
import useHideColumn from "utils/useHideColumn";
import Table from "components/tables/table";

type ExtendedBorrow = LibraryBorrow & {
  memberEngName: string | null;
  seriesTitle: string | null;
  bookVolume: string | null;
};

interface Props {
  loading: boolean;
  extendedBorrowList: ExtendedBorrow[];
}

const BorrowListTable = ({
  loading,
  extendedBorrowList,
}: Props): React.ReactElement => {
  const tableData = useMemo(() => extendedBorrowList, [extendedBorrowList]);

  const tableColumns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        id: "id",
        width: 210,
        maxWidth: 210,
      },
      {
        Header: "SID",
        accessor: "sid",
        id: "sid",
        width: 110,
        maxWidth: 110,
      },
      {
        Header: "Name",
        accessor: "memberEngName",
        id: "memberEngName",
        width: 300,
        maxWidth: 300,
        Cell: ({ value }: { value: string | null }) => value ?? <i>No Data</i>,
      },
      {
        Header: "Title",
        accessor: "seriesTitle",
        id: "title",
        width: 150,
        maxWidth: 150,
        Cell: ({
          value,
          row,
        }: {
          value: string | null;
          row: { original: ExtendedBorrow };
        }) =>
          value ? (
            <Link to={`/library/browse/books/${row.original.seriesId}`}>
              {value}
            </Link>
          ) : (
            <i>No Data</i>
          ),
      },
      {
        Header: "Volume",
        accessor: "bookVolume",
        id: "volume",
        width: 105,
        maxWidth: 105,
        Cell: ({ value }: { value: string | null }) => value ?? <i>No Data</i>,
      },
      {
        Header: "Borrowed On",
        accessor: (row: ExtendedBorrow) =>
          DateTime.fromMillis(row.borrowTime, {
            zone: "Asia/Hong_Kong",
          }).toISODate(),
        id: "borrowTime",
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "Renews",
        accessor: "renewCount",
        id: "renewCount",
        width: 105,
        maxWidth: 105,
      },
      {
        Header: "Due",
        accessor: "dueDate",
        id: "dueDate",
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "Returned On",
        accessor: (row: ExtendedBorrow) =>
          row.returnTime
            ? DateTime.fromMillis(row.returnTime, {
                zone: "Asia/Hong_Kong",
              }).toISODate()
            : null,
        id: "returnTime",
        width: 165,
        maxWidth: 165,
        Cell: ({ value }: { value: string | null }) => value ?? <i>No Data</i>,
      },
    ],
    []
  );

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => row.id as string;
  }, []);

  const tableOption = useMemo(
    () =>
      ({
        columns: tableColumns,
        data: tableData,
        getRowId: tableGetRowId,
      } as TableOptions<Record<string, unknown>>),
    [tableColumns, tableData, tableGetRowId]
  );

  const tableInstance = useTable(tableOption, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,
    allColumns,
    visibleColumns,
  } = tableInstance;

  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(() => [], []);

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  return (
    <>
      {resizeListener}
      {loading ? (
        <Loader className="is-pulled-right" />
      ) : (
        <div className="m-4" />
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
      {rows.length === 0 && (
        <Level>
          <Level.Item>No Result</Level.Item>
        </Level>
      )}
    </>
  );
};

export default BorrowListTable;
