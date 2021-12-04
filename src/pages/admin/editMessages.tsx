import React, { useMemo, useState, useEffect } from "react";
import useResizeAware from "react-resize-aware";
import useMessagesTable, { MessagesCellProps } from "utils/useMessagesTable";
import { Table } from "react-bulma-components";
import MessageEditCell from "components/tables/messageEditCell";
import TableRow from "components/tables/tableRow";
import TableHead from "components/tables/tableHead";
import Loading from "components/loading";
import useHideColumn from "utils/useHideColumn";
import { useGetAndListen } from "utils/firebase";
import { Message } from "types/db";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import useUserStatus from "utils/useUserStatus";
import { Navigate } from "react-router-dom";

type MessageKey = "welcome" | "member" | "expired" | "registered" | "visitor";

type MessageMeta = {
  key: MessageKey;
  desc: string;
  type: "string" | "richtext";
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
        }: MessagesCellProps<Record<string, unknown>, string>) => {
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
        }: MessagesCellProps<Record<string, unknown>, string> & {
          isExpanded?: boolean;
        }) => (
          <MessageEditCell
            messageKey={row.values.key as MessageMeta["key"]}
            type={row.values.type as MessageMeta["type"]}
            setEditValue={(newValue: string) => {
              row.setState({ editingValue: newValue });
            }}
            editingValue={(row.state.editingValue ?? value) as string}
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

  const tableInstance = useMessagesTable({
    columns: tableColumns,
    data: tableData,
    initialState: {
      hiddenColumns: alwaysHiddenColumns,
    },
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

  // const [toyValue, setToyValue] = useState("");
  // return (
  //   <MessageEditCell
  //     key={messagesMeta[0].key}
  //     type={messagesMeta[0].type}
  //     setEditValue={setToyValue}
  //     editingValue={toyValue}
  //     value={""}
  //     windowWidth={windowWidth}
  //   />
  // );

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
          tableSortable={false}
        />
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow
                key={row.id}
                row={row}
                allColumns={allColumns.filter(
                  (column) => !alwaysHiddenColumns.includes(column.id)
                )}
                visibleColumns={visibleColumns}
              />
            );
          })}
        </tbody>
      </Table>
      <Loading loading={loading} />
    </>
  );
};

export default EditMessages;
