import React, { useMemo, useState, useEffect } from "react";
import useResizeAware from "react-resize-aware";
import { Level } from "react-bulma-components";
import { toast } from "react-toastify";
import AdminActionCell from "components/tables/adminActionCell";
import AddAdmin from "components/addAdmin";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { useGetAndListen } from "utils/firebase";
import { Executive } from "types/db";
import { useSetTitle } from "utils/miscHooks";
import { Navigate } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";
import Table from "components/tables/table";
import { useTable, useSortBy, CellProps } from "react-table";

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
        minWidth: 175,
        width: 175,
        maxWidth: 175,
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

  const tableOption = useMemo(
    () => ({
      columns: tableColumns,
      data: tableData,
      getRowId: tableGetRowId,
    }),
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

  // resize
  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  const hideColumnOrder = useMemo(() => [["title"], ["displayName"]], []);

  useHideColumn(windowWidth, hideColumnOrder, tableColumns, setHiddenColumns);

  // set title
  useSetTitle("Admin List");

  if (!userStatus?.executive) {
    return <Navigate to="/member" replace />;
  }

  return (
    <>
      {resizeListener}
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
