import {
  useRowState,
  useTable,
  UseRowStateInstanceProps,
  PluginHook,
  UseRowStateOptions,
  UseRowStateState,
  TableDispatch,
  UseTableRowProps,
  UseRowStateRowProps,
  UseTableCellProps,
  UseRowStateCellProps,
  TablePropGetter,
  TableProps,
  TableBodyPropGetter,
  TableBodyProps,
  IdType,
  TableToggleHideAllColumnProps,
  Hooks,
  PropGetter,
  TableHeaderGroupProps,
  TableFooterGroupProps,
  TableHeaderProps,
  TableFooterProps,
  Meta,
  ActionType,
  Renderer,
  Accessor,
  CellValue,
  UseTableColumnProps,
} from "react-table";

export interface MessagesTableState<
  D extends Record<string, unknown> = Record<string, unknown>
> extends UseRowStateState<D> {
  hiddenColumns?: Array<IdType<D>>;
}

export interface MessagesColumnInstance<
  D extends Record<string, unknown> = Record<string, unknown>
> extends Omit<MessagesColumnInterface<D>, "id">,
    MessagesColumnInterfaceBasedOnValue<D>,
    UseMessagesTableColumnProps<D> {}

export type UseCustomOptions = Partial<{
  dataUpdate: (rowIndex: number, diff: Record<string, unknown>) => void;
}>;

export interface MessagesTableOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> extends UseMessagesTableOptions<D>,
    UseRowStateOptions<D>,
    UseCustomOptions {}

export interface MessagesTableInstance<
  D extends Record<string, unknown> = Record<string, unknown>
> extends Omit<MessagesTableOptions<D>, "columns" | "pageCount">,
    UseMessagesTableInstanceProps<D>,
    UseRowStateInstanceProps<D> {}

export interface MessagesRow<
  D extends Record<string, unknown> = Record<string, unknown>
> extends UseTableRowProps<D>,
    UseRowStateRowProps<D> {}

export interface MessagesCell<
  D extends Record<string, unknown> = Record<string, unknown>,
  V = unknown
> extends UseTableCellProps<D, V>,
    UseRowStateCellProps<D> {}

const useMessagesTable: MessagesTableHook = (options) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTable(options as any, useRowState) as any;

export default useMessagesTable;

// the following should not be modified

export type MessagesCellProps<
  D extends Record<string, unknown> = Record<string, unknown>,
  V = unknown
> = MessagesTableInstance<D> & {
  column: MessagesColumnInstance<D>;
  row: MessagesRow<D>;
  cell: MessagesCell<D, V>;
  value: CellValue<V>;
};

export type UpdateHiddenColumns<
  D extends Record<string, unknown> = Record<string, unknown>
> = (oldHidden: Array<IdType<D>>) => Array<IdType<D>>;

export type MessagesHeaderGroupPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableHeaderGroupProps, { column: MessagesHeaderGroup<D> }>;

export type MessagesFooterGroupPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableFooterGroupProps, { column: MessagesHeaderGroup<D> }>;

export type MessagesHeaderProps<
  D extends Record<string, unknown> = Record<string, unknown>
> = MessagesTableInstance<D> & {
  column: MessagesColumnInstance<D>;
};

export interface UseMessagesTableColumnOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  id?: IdType<D>;
  Header?: Renderer<MessagesHeaderProps<D>>;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
}

export type MessagesColumnInterface<
  D extends Record<string, unknown> = Record<string, unknown>
> = UseMessagesTableColumnOptions<D>;

export interface MessagesColumnInterfaceBasedOnValue<
  D extends Record<string, unknown> = Record<string, unknown>,
  V = unknown
> {
  Cell?: Renderer<MessagesCellProps<D, V>>;
}

export interface MessagesColumnGroupInterface<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  columns: Array<MessagesColumn<D>>;
}

export type MessagesColumnGroup<
  D extends Record<string, unknown> = Record<string, unknown>
> = MessagesColumnInterface<D> &
  MessagesColumnGroupInterface<D> &
  (
    | { Header: string }
    | ({ id: IdType<D> } & {
        Header: Renderer<MessagesHeaderProps<D>>;
      })
  ) & { accessor?: Accessor<D> }; // Not used, but needed for backwards compatibility

export type ValueOf<T> = T[keyof T];

// The accessors like `foo.bar` are not supported, use functions instead
export type MessagesColumnWithStrictAccessor<
  D extends Record<string, unknown> = Record<string, unknown>
> = MessagesColumnInterface<D> &
  ValueOf<{
    [K in keyof D]: {
      accessor: K;
    } & MessagesColumnInterfaceBasedOnValue<D, D[K]>;
  }>;

export type MessagesColumnWithLooseAccessor<
  D extends Record<string, unknown> = Record<string, unknown>
> = MessagesColumnInterface<D> &
  MessagesColumnInterfaceBasedOnValue<D> &
  (
    | { Header: string }
    | { id: IdType<D> }
    | { accessor: keyof D extends never ? IdType<D> : never }
  ) & {
    accessor?: keyof D extends never ? IdType<D> | Accessor<D> : Accessor<D>;
  };

export type MessagesColumn<
  D extends Record<string, unknown> = Record<string, unknown>
> =
  | MessagesColumnGroup<D>
  | MessagesColumnWithLooseAccessor<D>
  | MessagesColumnWithStrictAccessor<D>;

export interface MessagesHeaderGroup<
  D extends Record<string, unknown> = Record<string, unknown>
> extends MessagesColumnInstance<D>,
    UseMessagesTableHeaderGroupProps<D> {}

export type MessagesHeaderPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableHeaderProps, { column: MessagesHeaderGroup<D> }>;

export type MessagesFooterPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableFooterProps, { column: MessagesHeaderGroup<D> }>;

export interface UseMessagesTableColumnProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  id: IdType<D>;
  columns: Array<MessagesColumnInstance<D>>;
  isVisible: boolean;
  render: UseTableColumnProps<D>["render"];
  totalLeft: number;
  totalWidth: number;
  getHeaderProps: (
    propGetter?: MessagesHeaderPropGetter<D>
  ) => TableHeaderProps;
  getFooterProps: (
    propGetter?: MessagesFooterPropGetter<D>
  ) => TableFooterProps;
  toggleHidden: (value?: boolean) => void;
  parent: MessagesColumnInstance<D>; // not documented
  getToggleHiddenProps: (userProps?: unknown) => unknown;
  depth: number; // not documented
  index: number; // not documented
  placeholderOf?: MessagesColumnInstance;
}

export interface UseMessagesTableHeaderGroupProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  headers: Array<MessagesHeaderGroup<D>>;
  getHeaderGroupProps: (
    propGetter?: MessagesHeaderGroupPropGetter<D>
  ) => TableHeaderProps;
  getFooterGroupProps: (
    propGetter?: MessagesFooterGroupPropGetter<D>
  ) => TableFooterProps;
  totalHeaderCount: number; // not documented
}

export interface UseMessagesTableInstanceProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  state: MessagesTableState<D>;
  plugins: Array<PluginHook<D>>;
  dispatch: TableDispatch;
  columns: Array<MessagesColumnInstance<D>>;
  allColumns: Array<MessagesColumnInstance<D>>;
  visibleColumns: Array<MessagesColumnInstance<D>>;
  headerGroups: Array<MessagesHeaderGroup<D>>;
  footerGroups: Array<MessagesHeaderGroup<D>>;
  headers: Array<MessagesColumnInstance<D>>;
  flatHeaders: Array<MessagesColumnInstance<D>>;
  rows: Array<MessagesRow<D>>;
  rowsById: Record<string, MessagesRow<D>>;
  getTableProps: (propGetter?: TablePropGetter<D>) => TableProps;
  getTableBodyProps: (propGetter?: TableBodyPropGetter<D>) => TableBodyProps;
  prepareRow: (row: MessagesRow<D>) => void;
  flatRows: Array<MessagesRow<D>>;
  totalColumnsWidth: number;
  allColumnsHidden: boolean;
  toggleHideColumn: (columnId: IdType<D>, value?: boolean) => void;
  setHiddenColumns: (param: Array<IdType<D>> | UpdateHiddenColumns<D>) => void;
  toggleHideAllColumns: (value?: boolean) => void;
  getToggleHideAllColumnsProps: (
    props?: Partial<TableToggleHideAllColumnProps>
  ) => TableToggleHideAllColumnProps;
  getHooks: () => Hooks<D>;
}

export type UseMessagesTableOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> = {
  columns: Array<MessagesColumn<D>>;
  data: D[];
} & Partial<{
  initialState: Partial<MessagesTableState<D>>;
  stateReducer: (
    newState: MessagesTableState<D>,
    action: ActionType,
    previousState: MessagesTableState<D>,
    instance?: MessagesTableInstance<D>
  ) => MessagesTableState<D>;
  useControlledState: (
    state: MessagesTableState<D>,
    meta: Meta<D>
  ) => MessagesTableState<D>;
  defaultColumn: Partial<MessagesColumn<D>>;
  getSubRows: (originalRow: D, relativeIndex: number) => D[];
  getRowId: (
    originalRow: D,
    relativeIndex: number,
    parent?: MessagesRow<D>
  ) => string;
}>;

export type MessagesTableHook<
  D extends Record<string, unknown> = Record<string, unknown>
> = (options: MessagesTableOptions<D>) => MessagesTableInstance;
