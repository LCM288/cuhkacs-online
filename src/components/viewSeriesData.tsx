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
import {
  BookKey,
  decodeLocation,
  LibraryBook,
  LocationKey,
} from "utils/libraryUtils";
import useHideColumn from "utils/useHideColumn";
import Table from "components/tables/table";
import { DateTime } from "luxon";
import { Form, Loader, Button, Tag } from "react-bulma-components";
import { StopClickDiv } from "utils/domEventHelpers";
import PromptModal from "components/modals/promptModal";
import { useUpdate } from "utils/firebase";
import { increment, serverTimestamp } from "firebase/database";
import Loading from "components/loading";
import EditBookModal from "components/modals/editBookModal";
import { Link } from "react-router-dom";
import useClipped from "utils/useClipped";

const { Checkbox } = Form;

interface Props {
  seriesId: string;
  data: Record<BookKey, LibraryBook> | null | undefined;
  loading: boolean;
  error: Error | undefined;
  locations: Record<LocationKey, number>;
  editable?: boolean;
}

const ViewSeriesData = ({
  data,
  loading,
  error,
  locations,
  editable = false,
}: Props): React.ReactElement => {
  const { loading: updateLoading, update } = useUpdate("library");
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

  const [modalOpen, setModalOpen] = useState(false);
  const [promptContent, setPromptContent] = useState(<></>);
  useClipped(modalOpen);

  const deleteBook = useCallback(
    (bookData: LibraryBook & { id: string }) => {
      const updates = {
        [`series/data/${bookData.seriesId}/locations/${bookData.location}`]:
          increment(-1),
        [`series/data/${bookData.seriesId}/bookCount`]: increment(-1),
        [`series/data/${bookData.seriesId}/updatedAt`]: serverTimestamp(),
        [`series_book/${bookData.seriesId}/${bookData.id}`]: null,
        "books/count": increment(-1),
        [`books/data/${bookData.id}/status`]: "deleted",
        [`books/data/${bookData.id}/updatedAt`]: serverTimestamp(),
        [`locations/data/${bookData.location}/bookCount`]: increment(-1),
        [`locations/data/${bookData.location}/updatedAt`]: serverTimestamp(),
        [`location_series/${bookData.location}/${bookData.seriesId}`]:
          increment(-1),
        [`location_book/${bookData.location}/${bookData.id}`]: null,
      };
      update(updates)
        .then(() => {
          toast.info(`Volume ${bookData.volume} has been deleted.`);
          setPromptContent(<></>);
          setModalOpen(false);
        })
        .catch((err) => {
          console.error(err);
          if (err instanceof Error) {
            toast.error(err.message);
          }
        });
    },
    [update]
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
            if ((isNaN(numA) && isNaN(numB)) || numA === numB) {
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

  // TODO: refactor the prompts.

  const promptDelete = useCallback(
    (id: string) => {
      const bookData = tableData.find((book) => book.id === id);
      if (!bookData || bookData.status === "deleted") {
        toast.error(`Book id ${id} not found`);
        return;
      }
      setPromptContent(
        <PromptModal
          message={`Are you sure you want to delete volume ${bookData.volume}?`}
          onConfirm={() => deleteBook(bookData)}
          onCancel={() => {
            setPromptContent(<></>);
            setModalOpen(false);
          }}
          confirmText="Remove"
          cancelText="Back"
          confirmColor="danger"
          cancelColor="info"
        />
      );
      setModalOpen(true);
    },
    [deleteBook, tableData]
  );

  const openEditModal = useCallback(
    (id: string) => {
      const bookData = tableData.find((book) => book.id === id);
      if (!bookData || bookData.status === "deleted") {
        toast.error(`Book id ${id} not found`);
        return;
      }
      setPromptContent(
        <EditBookModal
          update={update}
          bookData={bookData}
          locations={locations}
          onClose={() => {
            setPromptContent(<></>);
            setModalOpen(false);
          }}
        />
      );
      setModalOpen(true);
    },
    [locations, tableData, update]
  );

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
        Header: "Volume",
        accessor: "volume",
        id: "volume",
        width: 105,
        maxWidth: 105,
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
        Cell: ({ value }: { value: string }) => (
          <Link
            to={`/library/search/location/${decodeLocation(value)}`}
            className="tags has-addons"
          >
            <Tag color="info">{decodeLocation(value)}</Tag>
          </Link>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        id: "status",
        filter: statusFilter,
        width: 95,
        maxWidth: 95,
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
      ...(editable
        ? [
            {
              Header: "Action",
              accessor: (row: { id: string }) => row.id,
              id: "action",
              disableSortBy: true,
              minWidth: 170,
              width: 170,
              maxWidth: 170,
              Cell: ({
                value,
                row,
              }: {
                value: string;
                row: Row<LibraryBook>;
              }) => (
                <StopClickDiv>
                  <Button.Group>
                    <Button
                      color="info"
                      disabled={row.original.status === "deleted"}
                      onClick={() => openEditModal(value)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      disabled={row.original.status === "deleted"}
                      onClick={() => promptDelete(value)}
                    >
                      Delete
                    </Button>
                  </Button.Group>
                </StopClickDiv>
              ),
            },
          ]
        : []),
    ],
    [editable, openEditModal, promptDelete, statusFilter]
  );

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
      ["isbn", "action"],
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
      {promptContent}
      {<Loading loading={updateLoading} />}
      {loading ? (
        <Loader className="is-pulled-right" />
      ) : (
        editable && (
          <Checkbox
            className="is-pulled-right"
            onChange={(event) => setShowDeleted(event.target.checked)}
            checked={showDeleted}
          >
            Show deleted books
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
    </>
  );
};

export default ViewSeriesData;
