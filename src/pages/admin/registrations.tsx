import React, { useMemo, useState, useEffect, useCallback } from "react";
import useResizeAware from "react-resize-aware";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
  TableOptions,
  CellProps,
  TableInstance,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersState,
  UsePaginationInstanceProps,
  UsePaginationState,
} from "react-table";
import useAsyncDebounce from "utils/useAsyncDebounce";
import { Form, Level } from "react-bulma-components";
import { toast } from "react-toastify";
import ApproveCell from "components/tables/approveCell";
// import EditPersonCell from "components/admin/members/editPersonCell";
import PaginationControl from "components/tables/paginationControl";
// import AddRegistration from "components/admin/registrations/addRegistration";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { ref, query, orderByChild, startAt, endAt } from "firebase/database";
import { database, useGetAndListen } from "utils/firebase";
import { Member } from "types/db";
import { useSetTitle } from "utils/miscHooks";
import useUserStatus from "utils/useUserStatus";
import { Navigate } from "react-router-dom";
import Table from "components/tables/table";

const { Input, Field, Label, Control, Select } = Form;

const Registrations = (): React.ReactElement => {
  // auth
  const userStatus = useUserStatus();

  // constant
  const pageSizeOptions = useMemo(() => [1, 2, 5, 10, 20, 50], []);

  // data
  const queryRef = useMemo(
    () =>
      query(
        ref(database, "members"),
        orderByChild("memberStatus/since"),
        startAt(null),
        endAt(null)
      ),
    []
  );
  const { data, loading, error } = useGetAndListen<Record<
    string,
    Member
  > | null>(queryRef);

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [error]);

  // table
  const tableColumns = useMemo(
    () => [
      {
        Header: "SID",
        accessor: "sid",
        id: "sid",
        width: 110,
        maxWidth: 110,
      },
      {
        Header: "Chinese Name",
        accessor: (row: Member) => row.name.chi ?? "N/A",
        id: "chineseName",
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "English Name",
        accessor: (row: Member) => row.name.eng,
        id: "englishName",
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        width: 105,
        maxWidth: 105,
      },
      {
        Header: "Date of Birth",
        accessor: "dob",
        id: "dateOfBirth",
        width: 155,
        maxWidth: 155,
      },
      {
        Header: "Email",
        accessor: "email",
        id: "email",
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Phone",
        accessor: "phone",
        id: "phone",
        width: 145,
        maxWidth: 145,
      },
      {
        Header: "College",
        accessor: (row: Member) => row.studentStatus.college,
        id: "college",
        width: 110,
        maxWidth: 110,
      },
      {
        Header: "Major",
        accessor: (row: Member) => row.studentStatus.major,
        id: "major",
        width: 105,
        maxWidth: 105,
      },
      {
        Header: "Date of Entry",
        accessor: (row: Member) => row.studentStatus.entryDate,
        id: "dateOfEntry",
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "Expected Graduation",
        accessor: (row: Member) => row.studentStatus.gradDate,
        id: "expectedGraduationDate",
        width: 215,
        maxWidth: 215,
      },
      {
        Header: "Action",
        accessor: () => "Registration",
        id: "action",
        Cell: ({ row }: CellProps<Record<string, unknown>, string>) => (
          <div className="buttons">
            <ApproveCell
              sid={row.values.sid}
              englishName={row.values.englishName}
              gradDate={row.values.expectedGraduationDate}
            />
            {/* <EditPersonCell {...cellPrpos} /> */}
          </div>
        ),
        disableSortBy: true,
        minWidth: 200,
        width: 200,
        maxWidth: 200,
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    return data ? Object.values(data) : [];
  }, [data]);

  const tableGetRowId = useCallback(
    (row: Record<string, unknown>) => row.sid,
    []
  );

  const tableOptions = useMemo(
    () =>
      ({
        columns: tableColumns,
        data: tableData,
        getRowId: tableGetRowId,
        autoResetFilters: false,
        autoResetGlobalFilter: false,
        autoResetPage: false,
        initialState: { pageSize: 10, pageIndex: 0 },
      } as TableOptions<Record<string, unknown>>),
    [tableColumns, tableData, tableGetRowId]
  );

  const tableInstance = useTable(
    tableOptions,
    useGlobalFilter,
    useSortBy,
    usePagination
  ) as TableInstance<Record<string, unknown>> &
    UseGlobalFiltersInstanceProps<Record<string, unknown>> &
    UsePaginationInstanceProps<Record<string, unknown>> & {
      state: UseGlobalFiltersState<Record<string, unknown>> &
        UsePaginationState<Record<string, unknown>>;
    };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state: { globalFilter, pageIndex, pageSize },
    setGlobalFilter,
    setHiddenColumns,
    allColumns,
    visibleColumns,
    page,
    pageCount,
    setPageSize,
    gotoPage,
  } = tableInstance;

  const [globalFilterInput, setGlobalFilterInput] = useState(globalFilter);

  const onGlobalFilterChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 500);

  // resize
  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(
    () => [
      ["dateOfBirth"],
      ["gender"],
      ["email", "phone"],
      ["dateOfEntry", "expectedGraduationDate"],
      ["chineseName"],
      ["major", "college"],
      ["registrationType"],
      ["englishName"],
      ["id"],
    ],
    []
  );

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  // Set title
  useSetTitle("Registration List");

  if (!userStatus?.executive) {
    return <Navigate to="/member" replace />;
  }

  return (
    <>
      {resizeListener}
      <PaginationControl
        gotoPage={gotoPage}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />
      <Level className="is-mobile is-flex-wrap-wrap">
        <Level.Side align="left">
          <Field>
            <Control fullwidth>
              <Input
                placeholder="Filter by keyword"
                value={globalFilterInput}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>
                ): void => {
                  setGlobalFilterInput(event.target.value);
                  onGlobalFilterChange(event.target.value);
                }}
              />
            </Control>
          </Field>
        </Level.Side>
        <Level.Side align="right">
          <Field horizontal className="is-flex">
            <Label className="mr-2" style={{ alignSelf: "center" }}>
              Result per page
            </Label>
            <Control>
              <Select
                onChange={(
                  event: React.ChangeEvent<HTMLSelectElement>
                ): void => {
                  setPageSize(parseInt(event.target.value, 10));
                }}
                value={pageSize.toString()}
              >
                {pageSizeOptions.map((pageSizeOption) => (
                  <option key={pageSizeOption}>{pageSizeOption}</option>
                ))}
              </Select>
            </Control>
          </Field>
        </Level.Side>
      </Level>
      <Table
        getTableProps={getTableProps}
        headerGroups={headerGroups}
        tableColumns={tableColumns}
        getTableBodyProps={getTableBodyProps}
        rows={page}
        prepareRow={prepareRow}
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        windowWidth={windowWidth}
        tableSortable
        size="fullwidth"
        striped
      />
      <div style={{ textAlign: "right" }}>
        Showing {page.length} of {tableData.length} results
      </div>
      <PaginationControl
        gotoPage={gotoPage}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />
      <Level className="is-mobile">
        <div />
        <Level.Side align="right">{/* <AddRegistration /> */}</Level.Side>
      </Level>
      <Loading loading={loading} />
    </>
  );
};

export default Registrations;
