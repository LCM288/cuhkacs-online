import React, { useMemo, useState, useCallback } from "react";
import useResizeAware from "react-resize-aware";
import {
  Row,
  CellProps,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
  TableInstance,
  UseFiltersInstanceProps,
  UseGlobalFiltersInstanceProps,
  UsePaginationInstanceProps,
  UseFiltersState,
  UseGlobalFiltersState,
  UsePaginationState,
  TableOptions,
} from "react-table";
import useAsyncDebounce from "utils/useAsyncDebounce";
import PaginationControl from "components/tables/paginationControl";
import Papa from "papaparse";
import { difference } from "lodash";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import { Level, Button, Form } from "react-bulma-components";
import ImportEditCell from "components/tables/importEditCell";
import ImportRemoveCell from "components/tables/importRemoveCell";
import useHideColumn from "utils/useHideColumn";
import Loading from "components/loading";
import { set, ref, serverTimestamp } from "firebase/database";
import { database, UpdateType } from "utils/firebase";
import { Member } from "types/db";
import { UpdatedMember } from "components/modals/editMemberModal";
import {
  getMemberStatus,
  PartialMember,
  lengthLimits,
  patternLimits,
} from "utils/memberUtils";
import useUserStatus from "utils/useUserStatus";
import { useSetTitle } from "utils/miscHooks";
import { Navigate } from "react-router-dom";
import Table from "components/tables/table";
import type { CollegeCode } from "static/college.json";
import { StopClickDiv } from "utils/domEventHelpers";

const { InputFile, Input, Field, Label, Control, Select } = Form;

const ImportMembers = (): React.ReactElement => {
  // auth
  const userStatus = useUserStatus();

  // constant
  const statusOptions = useMemo(
    () => ["Incomplete", "Activated", "PG Member", "Expired", "All"],
    []
  );
  const pageSizeOptions = useMemo(() => [1, 2, 5, 10, 20, 50], []);

  // data

  const [membersData, setMembersData] = useState<PartialMember[]>([]);

  const updateMemberData = useCallback(
    (rowIndex: number, newData: UpdatedMember) => {
      if (!newData.studentStatus.college) {
        toast.error("College is missing.");
        return;
      }
      if (!newData.studentStatus.major) {
        toast.error("Major is missing.");
        return;
      }
      if (!newData.studentStatus.entryDate) {
        toast.error("Entry date is missing.");
        return;
      }
      if (!newData.studentStatus.gradDate) {
        toast.error("Graduation date is missing.");
        return;
      }
      if (!newData.memberStatus) {
        console.error("Missing member status");
        toast.error("Some error has occurred.");
        return;
      }
      const since = DateTime.fromISO(newData.memberStatus.since, {
        zone: "Asia/Hong_Kong",
      }).toMillis();
      const until = DateTime.fromISO(newData.memberStatus.until, {
        zone: "Asia/Hong_Kong",
      }).toMillis();
      const updatedMembers = [...membersData];
      updatedMembers[rowIndex] = {
        sid: newData.sid,
        name: {
          ...(newData.name.chi && { chi: newData.name.chi }),
          eng: newData.name.eng,
        },
        ...(newData.gender && { gender: newData.gender }),
        ...(newData.dob && { dob: newData.dob }),
        ...(newData.email && { email: newData.email }),
        ...(newData.phone && { phone: newData.phone }),
        studentStatus: {
          college: newData.studentStatus.college,
          major: newData.studentStatus.major,
          entryDate: newData.studentStatus.entryDate,
          gradDate: newData.studentStatus.gradDate,
        },
        memberStatus: {
          since,
          lastRenewed: 0, // placeholder
          until,
        },
      };
      setMembersData(updatedMembers);
    },
    [membersData]
  );

  const removeMembersData = useCallback(
    (rowIndex: number) => {
      const updatedMembers = membersData.filter(
        (_, index) => index !== rowIndex
      );
      setMembersData(updatedMembers);
    },
    [membersData]
  );

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
        Header: "ID",
        accessor: "id",
        id: "id",
        width: 75,
        maxWidth: 75,
      },
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
        accessor: getMemberStatus,
        id: "status",
        filter: statusFilter,
        disableSortBy: true,
        width: 120,
        maxWidth: 120,
      },
      {
        Header: "Action",
        accessor: () => "Member",
        id: "action",
        Cell: ({ row }: CellProps<PartialMember, string>) => (
          <StopClickDiv>
            <Button.Group>
              <ImportEditCell
                member={row.original}
                rowIndex={row.index}
                updateMemberData={updateMemberData}
              />
              <ImportRemoveCell
                member={row.original}
                rowIndex={row.index}
                onRemove={removeMembersData}
              />
            </Button.Group>
          </StopClickDiv>
        ),
        disableSortBy: true,
        minWidth: 180,
        width: 180,
        maxWidth: 180,
      },
    ],
    [removeMembersData, statusFilter, updateMemberData]
  );

  const tableData = useMemo(
    () =>
      membersData.map((member, index) => ({
        ...member,
        id: index + 1,
      })),
    [membersData]
  );

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => (row.id as number).toString();
  }, []);

  const initialFilters = useMemo(
    () => [
      {
        id: "status",
        value: "All",
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
        autoResetGlobalFilter: false,
        initialState: { filters: initialFilters, pageSize: 10, pageIndex: 0 },
        autoResetPage: false,
      } as TableOptions<Record<string, unknown>>),
    [initialFilters, tableColumns, tableData, tableGetRowId]
  );

  const tableInstance = useTable(
    tableOption,
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

  // import & upload
  const [isUploading, setIsUploading] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  const upload = useCallback(() => {
    const members = membersData;
    if (members.some((member) => getMemberStatus(member) === "Incomplete")) {
      toast.error("You have some incomplete members, please filter and edit.");
      return;
    }
    setIsUploading(true);
    const importMemberPromises = members.map(
      (member, index) =>
        new Promise<string[]>(async (resolve) => {
          try {
            if (!member.sid) {
              throw new Error(`Missing sid.`);
            }
            if (!member.name?.eng) {
              throw new Error(`Missing english name.`);
            }
            if (!member.studentStatus?.college) {
              throw new Error(`Missing college.`);
            }
            if (!member.studentStatus?.major) {
              throw new Error(`Missing major.`);
            }
            if (!member.studentStatus?.entryDate) {
              throw new Error(`Missing entry date.`);
            }
            if (!member.studentStatus?.gradDate) {
              throw new Error(`Missing graduation date.`);
            }
            if (!member.memberStatus?.until) {
              throw new Error(`Missing member until.`);
            }
            if (member.sid.length > lengthLimits.sid) {
              throw new Error(`SID too long.`);
            }
            if ((member.name.chi?.length ?? 0) > lengthLimits.name.chi) {
              throw new Error(`Chinese name too long.`);
            }
            if (member.name.eng.length > lengthLimits.name.eng) {
              throw new Error(`English name too long.`);
            }
            if ((member.email?.length ?? 0) > lengthLimits.email) {
              throw new Error(`Email too long.`);
            }
            if ((member.phone?.length ?? 0) > lengthLimits.phone) {
              throw new Error(`Phone number too long.`);
            }
            if (
              member.studentStatus.major.length >
              lengthLimits.studentStatus.major
            ) {
              throw new Error(`Major too long.`);
            }
            if (!patternLimits.sid.test(member.sid)) {
              throw new Error(`SID pattern mismatch.`);
            }
            if (member.gender && !patternLimits.gender.test(member.gender)) {
              throw new Error(`Gender pattern mismatch.`);
            }
            if (member.email && !patternLimits.email.test(member.email)) {
              throw new Error(`Email pattern mismatch.`);
            }
            if (member.phone && !patternLimits.phone.test(member.phone)) {
              throw new Error(`Phone number pattern mismatch.`);
            }
            if (
              !patternLimits.studentStatus.college.test(
                member.studentStatus.college
              )
            ) {
              throw new Error(`College pattern mismatch.`);
            }
            if (
              !patternLimits.studentStatus.major.test(
                member.studentStatus.major
              )
            ) {
              throw new Error(`Major pattern mismatch.`);
            }
            const memberData: UpdateType<
              Member,
              "since" | "lastRenewed" | "updatedAt" | "createdAt"
            > = {
              sid: member.sid,
              name: {
                eng: member.name.eng,
                ...(member.name.chi && { chi: member.name.chi }),
              },
              ...(member.gender && { gender: member.gender }),
              ...(member.dob && { dob: member.dob }),
              ...(member.email && { email: member.email }),
              ...(member.phone && { phone: member.phone }),
              memberStatus: {
                since: member.memberStatus.since ?? serverTimestamp(),
                lastRenewed: serverTimestamp(),
                until: member.memberStatus.until,
              },
              studentStatus: {
                college: member.studentStatus.college,
                major: member.studentStatus.major,
                entryDate: member.studentStatus.entryDate,
                gradDate: member.studentStatus.gradDate,
              },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await set(ref(database, `members/${member.sid}`), memberData);
            resolve([member.sid]);
          } catch (error) {
            console.error(`Member ID ${index + 1}: `, error);
            if (error instanceof Error) {
              toast.error(`Member ID ${index + 1}: ${error.message}`);
            }
            resolve([]);
          }
        })
    );
    Promise.all(importMemberPromises).then((importMemberSuccessSIDBatches) => {
      const importMemberSuccessSIDFlat = importMemberSuccessSIDBatches.flat();
      const importedCount = importMemberSuccessSIDFlat.length;
      const failedUploadSID = difference(
        membersData.map((member) => member.sid),
        importMemberSuccessSIDFlat
      );
      setMembersData(
        membersData.filter((member) => failedUploadSID.includes(member.sid))
      );
      setIsUploading(false);
      if (importedCount) {
        toast.success(
          `${importedCount} member${importedCount !== 1 ? "s" : ""} imported.`,
          {
            position: toast.POSITION.TOP_LEFT,
          }
        );
      } else {
        toast.error("No members were imported");
      }
    });
  }, [membersData]);

  const onImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("loading");
      setIsFileProcessing(true);
      Papa.parse<Record<string, string>>(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          console.log(results);
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const { year, month } = DateTime.local();
          const prevEntry = month >= 9 ? `${year}-09-01` : `${year - 1}-09-01`;
          const prevEntryGrad =
            month >= 9 ? `${year + 4}-07-31` : `${year + 3}-07-31`;
          const newData = results.data.map(
            ({
              SID: sid,
              "Chinese Name": chineseName,
              "English Name": englishName,
              Gender: gender,
              "Date of Birth": dob,
              Email: email,
              Phone: phone,
              College: college,
              Major: major,
              "Date of Entry": entryDate,
              "Expected Graduation Date": gradDate,
              "Member Since": memberSince,
              "Member Until": memberUntil,
            }) => ({
              sid,
              name: {
                chi: chineseName,
                eng: englishName,
              },
              gender: patternLimits.gender.test(gender) ? gender : undefined,
              dob: dateRegex.test(dob) ? dob : undefined,
              email,
              phone,
              studentStatus: {
                college: patternLimits.studentStatus.college.test(college)
                  ? (college as CollegeCode)
                  : undefined,
                major: patternLimits.studentStatus.major.test(major)
                  ? major
                  : undefined,
                entryDate: dateRegex.test(entryDate) ? entryDate : prevEntry,
                gradDate: dateRegex.test(gradDate) ? gradDate : prevEntryGrad,
              },
              memberStatus: {
                since: dateRegex.test(memberSince)
                  ? DateTime.fromISO(memberSince, {
                      zone: "Asia/Hong_Kong",
                    }).valueOf()
                  : undefined,
                until: DateTime.fromISO(
                  dateRegex.test(memberUntil)
                    ? memberUntil
                    : dateRegex.test(gradDate)
                    ? gradDate
                    : prevEntryGrad,
                  { zone: "Asia/Hong_Kong" }
                ).valueOf(),
              },
            })
          );
          setMembersData(newData);
          setIsFileProcessing(false);
        },
      });
    } else {
      toast.error("No files were selected.");
    }
  }, []);

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
      ["id"],
    ],
    []
  );

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  // set title
  useSetTitle("Import Members");

  if (!userStatus?.executive) {
    return <Navigate to="/member" replace />;
  }

  return (
    <>
      {resizeListener}
      <Level className="is-mobile is-flex-wrap-wrap">
        <Level.Side align="left">
          <Level.Item>
            <InputFile
              color="primary"
              placeholder="Textarea"
              inputProps={{ accept: ".csv,.tsv,.txt" } as any}
              onChange={onImport}
            />
          </Level.Item>
        </Level.Side>
        <Level.Side align="right">
          <Level.Item>
            <Button color="primary" onClick={upload} loading={isUploading}>
              Upload
            </Button>
          </Level.Item>
        </Level.Side>
      </Level>
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
      <Loading loading={isFileProcessing} />
    </>
  );
};

export default ImportMembers;
