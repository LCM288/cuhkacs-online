import React, { useMemo, useState, useEffect, useCallback } from "react";
import useResizeAware from "react-resize-aware";
import {
  Row,
  TableOptions,
  TableInstance,
  UseFiltersInstanceProps,
  UseGlobalFiltersInstanceProps,
  UsePaginationInstanceProps,
  UseFiltersState,
  UseGlobalFiltersState,
  UsePaginationState,
} from "react-table";
import useAsyncDebounce from "utils/useAsyncDebounce";
import { Form, Level, Button } from "react-bulma-components";
import Papa from "papaparse";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import PaginationControl from "components/tables/paginationControl";
import EditMemberCell from "components/tables/editMemberCell";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { Member } from "types/db";
import { database, useGetAndListen } from "utils/firebase";
import { orderByChild, query, ref, startAfter } from "firebase/database";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import { StopClickDiv } from "utils/domEventHelpers";
import Table from "components/tables/table";
import { useSetTitle } from "utils/miscHooks";
import { Navigate } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";

const { Input, Field, Label, Control, Select } = Form;

type MemberStatus = "Activated" | "PG Member" | "Expired" | "Registered";

const getStatus = (member: Member): MemberStatus => {
  if (!member.memberStatus) {
    return "Registered";
  }
  if (DateTime.now().valueOf() > member.memberStatus.until) {
    return "Expired";
  }
  if (member.studentStatus.college === "NO") {
    return "PG Member";
  }
  return "Activated";
};

const Members = (): React.ReactElement => {
  // auth
  const userStatus = useUserStatus();

  // constant
  const statusOptions = useMemo(
    () => ["Activated", "PG Member", "Expired", "All"],
    []
  );
  const pageSizeOptions = useMemo(() => [1, 2, 5, 10, 20, 50], []);

  // data
  const queryRef = useMemo(
    () =>
      query(
        ref(database, "members"),
        orderByChild("memberStatus/since"),
        startAfter(null)
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
  const statusFilter = useCallback(
    (
      rows: Array<Row<Record<string, unknown>>>,
      id: string,
      filterValue: string
    ) =>
      filterValue === "All"
        ? rows
        : rows.filter((row) => row.values[id] === filterValue),
    []
  );

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
        accessor: (row: Member) => row.name.chi,
        id: "chineseName",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
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
        Cell: ({ value }: { value: string | undefined }) =>
          value ? (
            value.substr(0, 1).toUpperCase() + value.substr(1)
          ) : (
            <i>No Data</i>
          ),
        width: 105,
        maxWidth: 105,
      },
      {
        Header: "Date of Birth",
        accessor: "dob",
        id: "dateOfBirth",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
        width: 155,
        maxWidth: 155,
      },
      {
        Header: "Email",
        accessor: "email",
        id: "email",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Phone",
        accessor: "phone",
        id: "phone",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
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
        Header: "Member Since",
        accessor: (row: Member) =>
          row.memberStatus?.since
            ? DateTime.fromMillis(row.memberStatus.since, {
                zone: "Asia/Hong_Kong",
              }).toISODate()
            : undefined,
        id: "memberSince",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "Member Until",
        accessor: (row: Member) =>
          row.memberStatus?.until
            ? DateTime.fromMillis(row.memberStatus.until, {
                zone: "Asia/Hong_Kong",
              }).toISODate()
            : undefined,
        id: "memberUntil",
        Cell: ({ value }: { value: string | undefined }) =>
          value ?? <i>No Data</i>,
        width: 165,
        maxWidth: 165,
      },
      {
        Header: "Status",
        accessor: getStatus,
        id: "status",
        filter: statusFilter,
        disableSortBy: true,
        width: 100,
        maxWidth: 100,
      },
      {
        Header: "Action",
        accessor: () => "Member",
        id: "action",
        Cell: ({ row }: { row: { original: Member } }) => (
          <StopClickDiv>
            <EditMemberCell member={row.original} type="Member" />
          </StopClickDiv>
        ),
        disableSortBy: true,
        minWidth: 85,
        width: 85,
        maxWidth: 85,
      },
    ],
    [statusFilter]
  );

  const tableData = useMemo(() => {
    return data
      ? Object.values(data).sort(
          // smaller since comes first
          (a, b) => (a.memberStatus?.since ?? 0) - (b.memberStatus?.since ?? 0)
        )
      : [];
  }, [data]);

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => row.sid;
  }, []);

  const initialFilters = useMemo(
    () => [
      {
        id: "status",
        value: "Activated",
      },
    ],
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
        initialState: { filters: initialFilters, pageSize: 10, pageIndex: 0 },
      } as TableOptions<Record<string, unknown>>),
    [initialFilters, tableColumns, tableData, tableGetRowId]
  );

  const tableInstance = useTable(
    tableOptions,
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  ) as TableInstance<Record<string, unknown>> &
    UseFiltersInstanceProps<Record<string, unknown>> &
    UseGlobalFiltersInstanceProps<Record<string, unknown>> &
    UsePaginationInstanceProps<Record<string, unknown>> & {
      state: UseFiltersState<Record<string, unknown>> &
        UseGlobalFiltersState<Record<string, unknown>> &
        UsePaginationState<Record<string, unknown>>;
    };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state: { globalFilter, filters, pageIndex, pageSize },
    setGlobalFilter,
    setFilter,
    setHiddenColumns,
    allColumns,
    visibleColumns,
    page,
    pageCount,
    setPageSize,
    gotoPage,
    rows,
  } = tableInstance;

  const [globalFilterInput, setGlobalFilterInput] = useState(globalFilter);

  const [statusFilterInput, setStatusFilterInput] = useState(
    filters.find(({ id }) => id === "status")?.value
  );

  const onGlobalFilterChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 500);

  const onStatusFilterChange = useAsyncDebounce((value) => {
    setFilter("status", value || undefined);
  }, 500);

  // export files
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  const onExport = useCallback((exportData: Member[]) => {
    if (exportData.length) {
      setIsFileProcessing(true);
      const memberExport = exportData.map(
        ({
          sid,
          name: { chi: chineseName, eng: englishName },
          gender,
          dob,
          email,
          phone,
          studentStatus: { college, major, entryDate, gradDate },
          memberStatus,
        }) => ({
          SID: sid,
          "Chinese Name": chineseName ?? "No Data",
          "English Name": englishName,
          Gender: gender ?? "No Data",
          "Date of Birth": dob ?? "No Data",
          Email: email ?? "No Data",
          Phone: phone ?? "No Data",
          College: college,
          Major: major,
          "Date of Entry": entryDate,
          "Expected Graduation Date": gradDate,
          "Member Since": memberStatus?.since
            ? DateTime.fromMillis(memberStatus.since, {
                zone: "Asia/Hong_Kong",
              }).toISODate()
            : "No Data",
        })
      );
      const csv = Papa.unparse(memberExport, {
        quotes: [
          true, // sid
          true, // chinese name
          true, // english name
          true, // gender
          false, // date of birth
          true, // email
          true, // phone
          true, // college
          true, // major
          false, // date of entry
          false, // expected graduation date
          false, // member since
        ],
      });
      const element = document.createElement("a");
      const file = new Blob([csv], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      const time = DateTime.local();
      element.download = `members-${time.toISO()}.csv`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
      setIsFileProcessing(false);
    } else {
      toast.error("No member data.");
      setIsFileProcessing(false);
    }
  }, []);

  const onExportAll = useCallback(() => {
    if (tableData.length) {
      onExport(tableData);
    } else {
      toast.error("No member data.");
      setIsFileProcessing(false);
    }
  }, [tableData, onExport]);

  const onExportFiltered = useCallback(() => {
    if (rows.length) {
      onExport(rows.map((row) => row.original as Member));
    } else {
      toast.error("No member data.");
      setIsFileProcessing(false);
    }
  }, [rows, onExport]);

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
      ["memberSince", "memberUntil"],
      ["chineseName"],
      ["major", "college"],
      ["status"],
      ["englishName"],
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
      <Button.Group align="right">
        <Button onClick={onExportAll} loading={isFileProcessing}>
          Export All
        </Button>
        <Button
          color="primary"
          onClick={onExportFiltered}
          loading={isFileProcessing}
        >
          Export Filtered
        </Button>
      </Button.Group>
      <PaginationControl
        gotoPage={gotoPage}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />
      <Level className="is-mobile is-flex-wrap-wrap">
        <Level.Side align="left">
          <Field kind="addons">
            <Control>
              <Select
                onChange={(
                  event: React.ChangeEvent<HTMLSelectElement>
                ): void => {
                  setStatusFilterInput(event.target.value);
                  onStatusFilterChange(event.target.value);
                }}
                value={statusFilterInput}
              >
                {statusOptions.map((statusOption) => (
                  <option key={statusOption}>{statusOption}</option>
                ))}
              </Select>
            </Control>
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
        Showing {page.length} of {rows.length} results
      </div>
      <PaginationControl
        gotoPage={gotoPage}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />
      <Loading loading={loading} />
    </>
  );
};

export default Members;
