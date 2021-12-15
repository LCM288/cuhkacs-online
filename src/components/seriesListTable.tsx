import { DateTime } from "luxon";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Level, Loader, Tag } from "react-bulma-components";
import useResizeAware from "react-resize-aware";
import { Link } from "react-router-dom";
import {
  Row,
  TableOptions,
  useTable,
  useFilters,
  useSortBy,
  TableInstance,
  UseFiltersInstanceProps,
} from "react-table";
import {
  WithID,
  LibrarySeries,
  decodeLocation,
  LocationKey,
} from "utils/libraryUtils";
import useHideColumn from "utils/useHideColumn";
import Table from "components/tables/table";

type LibrarySeriesWithID = WithID<LibrarySeries>;

const { Checkbox, Field, Control } = Form;

interface Props {
  loading: boolean;
  seriesList: LibrarySeriesWithID[];
  editable?: boolean;
}

const SeriesListTable = ({
  loading,
  seriesList,
  editable = false,
}: Props): React.ReactElement => {
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
          <Link to={`/library/browse/books/${value}`}>{value}</Link>
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
          <Link to={`/library/browse/books/${row.original.id}`}>{value}</Link>
        ),
      },
      {
        Header: "Author",
        accessor: "author",
        id: "author",
        width: 120,
        maxWidth: 120,
        Cell: ({ value }: { value: string }) => (
          <Link to={`/library/search/keyword/${value}`}>{value}</Link>
        ),
      },
      {
        Header: "Locations",
        accessor: (row: LibrarySeriesWithID): Record<LocationKey, number> =>
          row.locations ?? {},
        id: "locations",
        disableSortBy: true,
        width: 100,
        maxWidth: 100,
        Cell: ({ value }: { value: Record<LocationKey, number> }) => {
          const locations = Object.keys(value)
            .filter((key) => value[key] !== 0)
            .sort((keyA, keyB) => value[keyA] - value[keyB]);
          return (
            <Field kind="group" multiline>
              {locations.map((location) => (
                <Control key={location}>
                  <Link
                    to={`/library/search/location/${decodeLocation(location)}`}
                    className="tags has-addons"
                  >
                    <Tag color="info">{decodeLocation(location)}</Tag>
                    <Tag color="dark">*{value[location]}</Tag>
                  </Link>
                </Control>
              ))}
            </Field>
          );
        },
      },
      {
        Header: "Books",
        accessor: "bookCount",
        id: "bookCount",
        filter: emptySeriesFilter,
        width: 95,
        maxWidth: 95,
      },
      {
        Header: "Borrows",
        accessor: "borrowCount",
        id: "borrowCount",
        width: 110,
        maxWidth: 110,
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
      {loading ? (
        <Loader className="is-pulled-right" />
      ) : editable ? (
        <Checkbox
          className="is-pulled-right"
          onChange={(event) => setShowEmptySeris(event.target.checked)}
          checked={showEmptySeries}
        >
          Show empty series
        </Checkbox>
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

export default SeriesListTable;
