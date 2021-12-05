import React from "react";
import { Table as BulmaTable } from "react-bulma-components";
import TableRow from "components/tables/tableRow";
import TableHead from "components/tables/tableHead";
import { TableInstance, UseTableRowProps } from "react-table";

interface Props<Row extends UseTableRowProps<Record<string, unknown>>>
  extends Pick<
    TableInstance<Record<string, unknown>>,
    | "getTableProps"
    | "headerGroups"
    | "getTableBodyProps"
    | "allColumns"
    | "visibleColumns"
  > {
  tableColumns: { id: string; disableSortBy?: boolean }[];
  rows: Row[];
  prepareRow: (row: Row) => void;
  windowWidth: number;
  alwaysHiddenColumns?: string[];
  tableSortable?: boolean;
  size?: "fullwidth" | "narrow";
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

const Table = <Row extends UseTableRowProps<Record<string, unknown>>>({
  getTableProps,
  headerGroups,
  tableColumns,
  getTableBodyProps,
  rows,
  prepareRow,
  allColumns,
  visibleColumns,
  windowWidth,
  alwaysHiddenColumns,
  tableSortable,
  size,
  striped,
  bordered,
  hoverable,
}: Props<Row>): React.ReactElement => (
  <BulmaTable
    {...getTableProps()}
    size={size}
    striped={striped}
    bordered={bordered}
    hoverable={hoverable}
  >
    <TableHead
      headerGroups={headerGroups}
      tableColumns={tableColumns}
      tableSortable={tableSortable}
    />
    <tbody {...getTableBodyProps()}>
      {rows.map((row) => {
        prepareRow(row);
        return (
          <TableRow
            windowWidth={windowWidth}
            key={row.id}
            row={row}
            allColumns={allColumns.filter(
              (column) => !alwaysHiddenColumns?.includes(column.id)
            )}
            visibleColumns={visibleColumns}
          />
        );
      })}
      {<tr />}
    </tbody>
  </BulmaTable>
);

export default Table;
