import React, { useState, useMemo, useCallback } from "react";
import { Row, ColumnInstance } from "react-table";
import TableCell from "components/tables/tableCell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";

import _ from "lodash";
import { Icon } from "react-bulma-components";

interface Props {
  row: Row;
  allColumns: ColumnInstance[];
  visibleColumns: ColumnInstance[];
  windowWidth: number;
}

const TableRow = ({
  row,
  allColumns,
  visibleColumns,
  windowWidth,
}: Props): React.ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hiddenColumns = useMemo(() => {
    return _.difference(allColumns, visibleColumns);
  }, [allColumns, visibleColumns]);

  const expandedHiddenColumns = useMemo(() => {
    if (hiddenColumns.length) {
      return (
        <td
          colSpan={visibleColumns.length + 1}
          style={{
            maxWidth: "1px", // this is a hack for table data cell
          }}
        >
          {row.allCells
            .filter((cell) =>
              hiddenColumns.map((column) => column.id).includes(cell.column.id)
            )
            .map((cell) => (
              <div
                key={cell.column.id}
                style={{
                  overflow: "auto",
                }}
              >
                <strong style={{ position: "sticky", left: 0 }}>
                  {cell.column.Header}:{" "}
                </strong>
                <br />
                {cell.render("Cell", { isHidden: true, isExpanded })}
              </div>
            ))}
        </td>
      );
    }
    return <></>;
  }, [hiddenColumns, row, visibleColumns, isExpanded]);

  const rowStyle = useMemo(() => {
    if (hiddenColumns.length) {
      return { cursor: "pointer" };
    }
    return {};
  }, [hiddenColumns]);

  const onRowClick = useCallback(() => {
    if (hiddenColumns.length) {
      setIsExpanded(!isExpanded);
    }
  }, [hiddenColumns, isExpanded]);

  return (
    <>
      <tr {...row.getRowProps()} onClick={onRowClick} style={rowStyle}>
        {row.cells.map((cell) => (
          <TableCell
            cell={cell}
            key={cell.column.id}
            windowWidth={windowWidth}
          />
        ))}
        {Boolean(hiddenColumns.length) && (
          <td style={{ width: 1 }}>
            <Icon>
              <FontAwesomeIcon
                className="is-pulled-right"
                icon={isExpanded ? faAngleUp : faAngleDown}
              />
            </Icon>
          </td>
        )}
      </tr>
      <tr className={!isExpanded ? "is-hidden" : ""} />
      <tr className={!isExpanded ? "is-hidden" : ""}>
        {expandedHiddenColumns}
      </tr>
    </>
  );
};

export default TableRow;
