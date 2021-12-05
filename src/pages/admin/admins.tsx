import React, { useMemo, useState, useEffect } from "react";
import useResizeAware from "react-resize-aware";
import useAdminTable from "utils/useAdminTable";
import { CellProps } from "react-table";
import { Table, Level } from "react-bulma-components";
import { toast } from "react-toastify";
import AdminActionCell from "components/tables/adminActionCell";
import AddAdmin from "components/addAdmin";
import TableRow from "components/tables/tableRow";
import TableHead from "components/tables/tableHead";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { useGetAndListen } from "utils/firebase";
import { Executive } from "types/db";
import { useSetTitle } from "utils/miscHooks";
import { Navigate } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";

const Admins = (): React.ReactElement => {
  // auth
  const userStatus = useUserStatus();

  // data
  const { data, loading, error } = useGetAndListen<Record<
    string,
    Executive
  > | null>("executives");

  const [executivesData, setExecutivesData] = useState<
    Record<string, Executive> | null | undefined
  >();

  useEffect(() => {
    setExecutivesData(data);
  }, [data]);

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
        Header: "Display Name",
        accessor: "displayName",
        id: "displayName",
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Title",
        accessor: "title",
        id: "title",
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Action",
        id: "action",
        Cell: ({ row }: CellProps<Record<string, unknown>, string>) => (
          <AdminActionCell adminData={row.values as Executive} />
        ),
        disableSortBy: true,
        minWidth: 170,
        width: 170,
        maxWidth: 170,
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    return executivesData ? Object.values(executivesData) : [];
  }, [executivesData]);

  const tableGetRowId = useMemo(() => {
    return (row: Record<string, unknown>) => row.sid as string;
  }, []);

  const tableInstance = useAdminTable({
    columns: tableColumns,
    data: tableData,
    getRowId: tableGetRowId,
  });

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

  // resize
  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(() => [["pos"], ["nickname"]], []);

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  // set title
  useSetTitle("Admin List");

  if (!userStatus?.executive) {
    return <Navigate to="/member" replace />;
  }

  return (
    <>
      {resizeListener}
      <Table {...getTableProps()}>
        <TableHead
          headerGroups={headerGroups}
          tableColumns={tableColumns}
          tableSortable
        />
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow
                key={row.id}
                row={row}
                allColumns={allColumns}
                visibleColumns={visibleColumns}
              />
            );
          })}
        </tbody>
      </Table>
      <Level className="is-mobile">
        <div />
        <Level.Side align="right">
          <AddAdmin />
        </Level.Side>
      </Level>
      <Loading loading={loading} />
    </>
  );
};

export default Admins;
