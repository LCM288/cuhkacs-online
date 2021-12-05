import {
  useSortBy,
  UseRowStateState,
  useTable,
  UseSortByInstanceProps,
  PluginHook,
  UseSortByOptions,
  UseSortByState,
  UseSortByColumnProps,
  TableDispatch,
  Row,
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
  CellProps,
  UseTableColumnProps,
} from "react-table";

export interface AdminTableState<
  D extends Record<string, unknown> = Record<string, unknown>
> extends UseSortByState<D>,
    UseRowStateState<D> {
  hiddenColumns?: Array<IdType<D>>;
}

export interface AdminColumnInstance<
  D extends Record<string, unknown> = Record<string, unknown>
> extends Omit<AdminColumnInterface<D>, "id">,
    AdminColumnInterfaceBasedOnValue<D>,
    UseAdminTableColumnProps<D>,
    UseSortByColumnProps<D> {}

export interface AdminTableOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> extends UseAdminTableOptions<D>,
    UseSortByOptions<D> {}

export interface AdminTableInstance<
  D extends Record<string, unknown> = Record<string, unknown>
> extends Omit<AdminTableOptions<D>, "columns" | "pageCount">,
    UseAdminTableInstanceProps<D>,
    UseSortByInstanceProps<D> {}

const useAdminTable: AdminTableHook = (options) =>
  (useTable as (...args: unknown[]) => AdminTableInstance)(options, useSortBy);

export default useAdminTable;

// the following should not be modified

export type UpdateHiddenColumns<
  D extends Record<string, unknown> = Record<string, unknown>
> = (oldHidden: Array<IdType<D>>) => Array<IdType<D>>;

export type AdminHeaderGroupPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableHeaderGroupProps, { column: AdminHeaderGroup<D> }>;

export type AdminFooterGroupPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableFooterGroupProps, { column: AdminHeaderGroup<D> }>;

export type AdminHeaderProps<
  D extends Record<string, unknown> = Record<string, unknown>
> = AdminTableInstance<D> & {
  column: AdminColumnInstance<D>;
};

export interface UseAdminTableColumnOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  id?: IdType<D>;
  Header?: Renderer<AdminHeaderProps<D>>;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
}

export type AdminColumnInterface<
  D extends Record<string, unknown> = Record<string, unknown>
> = UseAdminTableColumnOptions<D>;

export interface AdminColumnInterfaceBasedOnValue<
  D extends Record<string, unknown> = Record<string, unknown>,
  V = unknown
> {
  Cell?: Renderer<CellProps<D, V>>;
}

export interface AdminColumnGroupInterface<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  columns: Array<AdminColumn<D>>;
}

export type AdminColumnGroup<
  D extends Record<string, unknown> = Record<string, unknown>
> = AdminColumnInterface<D> &
  AdminColumnGroupInterface<D> &
  (
    | { Header: string }
    | ({ id: IdType<D> } & {
        Header: Renderer<AdminHeaderProps<D>>;
      })
  ) & { accessor?: Accessor<D> }; // Not used, but needed for backwards compatibility

export type ValueOf<T> = T[keyof T];

// The accessors like `foo.bar` are not supported, use functions instead
export type AdminColumnWithStrictAccessor<
  D extends Record<string, unknown> = Record<string, unknown>
> = AdminColumnInterface<D> &
  ValueOf<{
    [K in keyof D]: {
      accessor: K;
    } & AdminColumnInterfaceBasedOnValue<D, D[K]>;
  }>;

export type AdminColumnWithLooseAccessor<
  D extends Record<string, unknown> = Record<string, unknown>
> = AdminColumnInterface<D> &
  AdminColumnInterfaceBasedOnValue<D> &
  (
    | { Header: string }
    | { id: IdType<D> }
    | { accessor: keyof D extends never ? IdType<D> : never }
  ) & {
    accessor?: keyof D extends never ? IdType<D> | Accessor<D> : Accessor<D>;
  };

export type AdminColumn<
  D extends Record<string, unknown> = Record<string, unknown>
> =
  | AdminColumnGroup<D>
  | AdminColumnWithLooseAccessor<D>
  | AdminColumnWithStrictAccessor<D>;

export interface AdminHeaderGroup<
  D extends Record<string, unknown> = Record<string, unknown>
> extends AdminColumnInstance<D>,
    UseAdminTableHeaderGroupProps<D> {}

export type AdminHeaderPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableHeaderProps, { column: AdminHeaderGroup<D> }>;

export type AdminFooterPropGetter<
  D extends Record<string, unknown> = Record<string, unknown>
> = PropGetter<D, TableFooterProps, { column: AdminHeaderGroup<D> }>;

export interface UseAdminTableColumnProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  id: IdType<D>;
  columns: Array<AdminColumnInstance<D>>;
  isVisible: boolean;
  render: UseTableColumnProps<D>["render"];
  totalLeft: number;
  totalWidth: number;
  getHeaderProps: (propGetter?: AdminHeaderPropGetter<D>) => TableHeaderProps;
  getFooterProps: (propGetter?: AdminFooterPropGetter<D>) => TableFooterProps;
  toggleHidden: (value?: boolean) => void;
  parent: AdminColumnInstance<D>; // not documented
  getToggleHiddenProps: (userProps?: unknown) => unknown;
  depth: number; // not documented
  index: number; // not documented
  placeholderOf?: AdminColumnInstance;
}

export interface UseAdminTableHeaderGroupProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  headers: Array<AdminHeaderGroup<D>>;
  getHeaderGroupProps: (
    propGetter?: AdminHeaderGroupPropGetter<D>
  ) => TableHeaderProps;
  getFooterGroupProps: (
    propGetter?: AdminFooterGroupPropGetter<D>
  ) => TableFooterProps;
  totalHeaderCount: number; // not documented
}

export interface UseAdminTableInstanceProps<
  D extends Record<string, unknown> = Record<string, unknown>
> {
  state: AdminTableState<D>;
  plugins: Array<PluginHook<D>>;
  dispatch: TableDispatch;
  columns: Array<AdminColumnInstance<D>>;
  allColumns: Array<AdminColumnInstance<D>>;
  visibleColumns: Array<AdminColumnInstance<D>>;
  headerGroups: Array<AdminHeaderGroup<D>>;
  footerGroups: Array<AdminHeaderGroup<D>>;
  headers: Array<AdminColumnInstance<D>>;
  flatHeaders: Array<AdminColumnInstance<D>>;
  rows: Array<Row<D>>;
  rowsById: Record<string, Row<D>>;
  getTableProps: (propGetter?: TablePropGetter<D>) => TableProps;
  getTableBodyProps: (propGetter?: TableBodyPropGetter<D>) => TableBodyProps;
  prepareRow: (row: Row<D>) => void;
  flatRows: Array<Row<D>>;
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

export type UseAdminTableOptions<
  D extends Record<string, unknown> = Record<string, unknown>
> = {
  columns: Array<AdminColumn<D>>;
  data: D[];
} & Partial<{
  initialState: Partial<AdminTableState<D>>;
  stateReducer: (
    newState: AdminTableState<D>,
    action: ActionType,
    previousState: AdminTableState<D>,
    instance?: AdminTableInstance<D>
  ) => AdminTableState<D>;
  useControlledState: (
    state: AdminTableState<D>,
    meta: Meta<D>
  ) => AdminTableState<D>;
  defaultColumn: Partial<AdminColumn<D>>;
  getSubRows: (originalRow: D, relativeIndex: number) => D[];
  getRowId: (originalRow: D, relativeIndex: number, parent?: Row<D>) => string;
}>;

export type AdminTableHook<
  D extends Record<string, unknown> = Record<string, unknown>
> = (options: AdminTableOptions<D>) => AdminTableInstance;
