import { useEffect } from "react";
import { cloneDeep, compact } from "lodash";

const EMPTY_LIST: string[] = [];

const useHideColumn = (
  width: number,
  hideColumnOrder: string[][],
  tableColumns: { id: string; width: number }[],
  setHiddenColumns: (param: string[]) => void,
  alwaysHiddenColumns: string[] = EMPTY_LIST
): void => {
  useEffect(() => {
    let newHideColumn: string[] = alwaysHiddenColumns;
    let maxWidth =
      70 +
      tableColumns.map((column) => column.width).reduce((a, b) => a + b, 0);
    const columnsToHide = cloneDeep(hideColumnOrder);
    while (width < maxWidth && columnsToHide.length) {
      newHideColumn = newHideColumn.concat(columnsToHide[0]);
      maxWidth -= compact(
        columnsToHide[0].map((columnId) =>
          tableColumns.find((column) => column.id === columnId)
        )
      )
        .map((column) => column.width)
        .reduce((a, b) => a + b, 0);
      columnsToHide.splice(0, 1);
    }
    setHiddenColumns(newHideColumn);
  }, [
    alwaysHiddenColumns,
    width,
    hideColumnOrder,
    tableColumns,
    setHiddenColumns,
  ]);
};

export default useHideColumn;
