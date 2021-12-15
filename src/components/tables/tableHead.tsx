import React, { useCallback } from "react";
import { HeaderGroup, UseSortByColumnProps } from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "react-bulma-components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SortableHeaderGroup = HeaderGroup & UseSortByColumnProps<any>;

type UnsortableHeaderGroup = HeaderGroup;

interface Props {
  headerGroups: UnsortableHeaderGroup[] | SortableHeaderGroup[];
  tableColumns: { id: string; disableSortBy?: boolean }[];
  tableSortable?: boolean;
}

const TableHead = ({
  headerGroups,
  tableColumns,
  tableSortable,
}: Props): React.ReactElement => {
  const getHeaderWithSortDirectionIndicatior = useCallback(
    (column) => {
      const sortable =
        tableSortable &&
        !tableColumns.find((tableColumn) => tableColumn.id === column.id)
          ?.disableSortBy;
      if (!sortable) {
        return column.render("Header");
      }
      const sortableColumn = column as SortableHeaderGroup;
      return (
        <div className="icon-text">
          {column.render("Header")}
          <Icon>
            <FontAwesomeIcon
              icon={
                sortableColumn.isSorted
                  ? sortableColumn.isSortedDesc
                    ? faSortUp
                    : faSortDown
                  : faSort
              }
            />
          </Icon>
        </div>
      );
    },
    [tableSortable, tableColumns]
  );

  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th
              {...(tableSortable
                ? column.getHeaderProps(
                    (column as SortableHeaderGroup).getSortByToggleProps()
                  )
                : column.getHeaderProps())}
              style={{
                width: column.width,
                maxWidth: column.maxWidth,
                minWidth: column.minWidth,
                position: "sticky",
                top: "3rem",
                zIndex: 1,
              }}
              className={`has-background-light ${
                !tableSortable ||
                tableColumns.find((tableColumn) => tableColumn.id === column.id)
                  ?.disableSortBy
                  ? ""
                  : "is-clickable"
              }`}
            >
              {getHeaderWithSortDirectionIndicatior(column)}
            </th>
          ))}
          <td
            className="has-background-light"
            style={{
              width: "1px",
              maxWidth: "1px",
              padding: 0,
              position: "sticky",
              top: "3rem",
              zIndex: 1,
            }}
          />
        </tr>
      ))}
    </thead>
  );
};

export default TableHead;
