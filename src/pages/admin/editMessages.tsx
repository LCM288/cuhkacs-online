import React, { useMemo, useState, useEffect } from "react";
import useResizeAware from "react-resize-aware";
import MessageEditCell from "components/tables/messageEditCell";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { useGetAndListen } from "utils/firebase";
import { MessageKey, Message } from "types/db";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import useUserStatus from "utils/useUserStatus";
import { Navigate } from "react-router-dom";
import Table from "components/tables/table";
import {
  useTable,
  useRowState,
  UseRowStateRowProps,
  TableOptions,
} from "react-table";

type MessageMeta = {
  key: MessageKey;
  desc: string;
  type: "string" | "richtext";
};

type EditMessageListRow = MessageMeta & {
  value: string;
};

const messagesMeta: MessageMeta[] = [
  {
    key: "welcome",
    desc: "Welcome message displayed to everyone",
    type: "richtext",
  },
  {
    key: "member",
    desc: "Message displayed to active members",
    type: "richtext",
  },
  {
    key: "expired",
    desc: "Message displayed to expired members",
    type: "richtext",
  },
  {
    key: "registered",
    desc: "Message displayed to unactivated members",
    type: "richtext",
  },
  {
    key: "visitor",
    desc: "Message displayed to non registered student",
    type: "richtext",
  },
];

const EditMessages = (): React.ReactElement => {
  // auth
  const userStatus = useUserStatus();

  // constant
  const alwaysHiddenColumns = useMemo(() => ["desc", "type"], []);

  // resize
  const [resizeListener, sizes] = useResizeAware();
  const windowWidth = useMemo(
    () => sizes.width ?? window.innerWidth,
    [sizes.width]
  );

  // data
  const { data, loading, error } =
    useGetAndListen<Record<MessageKey, Message>>("publicMessages");

  const [messagesData, setMessagesData] = useState(data);

  useEffect(() => setMessagesData(data), [data]);
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
        Header: "Key",
        accessor: "key",
        id: "key",
        Cell: ({
          row,
          value,
        }: {
          row: { values: EditMessageListRow };
          value: string;
        }) => {
          return (
            <div>
              <p>{value}</p>
              <p>
                <i>{row.values.desc}</i>
              </p>
            </div>
          );
        },
        width: 300,
        maxWidth: 300,
      },
      {
        Header: "Description",
        accessor: "desc",
        id: "desc",
        width: 0,
        maxWidth: 0,
      },
      {
        Header: "Type",
        accessor: "type",
        id: "type",
        width: 0,
        maxWidth: 0,
      },
      {
        Header: "Value",
        accessor: "value",
        id: "value",
        Cell: ({
          row,
          value,
          isExpanded,
        }: {
          row: { values: EditMessageListRow } & UseRowStateRowProps<
            Record<string, unknown>
          >;
          value: string;
          isExpanded?: boolean;
        }) => (
          <MessageEditCell
            messageKey={row.values.key}
            type={row.values.type}
            setEditValue={(newValue: string) => {
              row.setState({ editingValue: newValue });
            }}
            editingValue={row.state.editingValue as string}
            value={value}
            windowWidth={windowWidth}
            isExpanded={isExpanded}
          />
        ),
        minWidth: 300,
        width: 0.7 * windowWidth,
        maxWidth: 0.7 * windowWidth,
      },
    ],
    [windowWidth]
  );

  const tableData = useMemo(
    () =>
      messagesData
        ? messagesMeta.map((metaData) => ({
            ...metaData,
            value: messagesData[metaData.key].message,
          }))
        : [],
    [messagesData]
  );

  const tableOption = useMemo(
    () =>
      ({
        columns: tableColumns,
        data: tableData,
        initialState: {
          hiddenColumns: alwaysHiddenColumns,
        },
        autoResetRowState: false,
      } as TableOptions<Record<string, unknown>>),
    [alwaysHiddenColumns, tableColumns, tableData]
  );

  const tableInstance = useTable(tableOption, useRowState);

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

  // resizeListener
  const hideColumnOrder = useMemo(() => [["value"]], []);

  useHideColumn(
    windowWidth,
    hideColumnOrder,
    tableColumns,
    setHiddenColumns,
    alwaysHiddenColumns
  );

  // set title
  useSetTitle("Edit Messages");

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
        alwaysHiddenColumns={alwaysHiddenColumns}
        size="fullwidth"
        striped
      />
      <Loading loading={loading} />
    </>
  );
};

export default EditMessages;
