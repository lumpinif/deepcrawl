import { useDataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  type Cell,
  type Column,
  flexRender,
  type Header,
  type HeaderGroup,
  type Row,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { type CSSProperties, Fragment, type ReactNode } from 'react';

const headerCellSpacingVariants = cva('', {
  variants: {
    size: {
      dense: 'h-8 px-2.5',
      default: 'px-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const bodyCellSpacingVariants = cva('', {
  variants: {
    size: {
      dense: 'px-2.5 py-2',
      default: 'px-4 py-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

function getPinningStyles<TData>(column: Column<TData>): CSSProperties {
  const isPinned = column.getIsPinned();

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

function DataGridTableBase({ children }: { children: ReactNode }) {
  const { props } = useDataGrid();

  return (
    <table
      className={cn(
        'w-full caption-bottom text-left align-middle font-normal text-foreground text-sm rtl:text-right',
        !props.tableLayout?.columnsDraggable &&
          'border-separate border-spacing-0',
        props.tableLayout?.width === 'fixed' ? 'table-fixed' : 'table-auto',
        props.tableClassNames?.base,
      )}
      data-slot="data-grid-table"
    >
      {children}
    </table>
  );
}

function DataGridTableHead({ children }: { children: ReactNode }) {
  const { props } = useDataGrid();

  return (
    <thead
      className={cn(
        props.tableClassNames?.header,
        props.tableLayout?.headerSticky && props.tableClassNames?.headerSticky,
      )}
    >
      {children}
    </thead>
  );
}

function DataGridTableHeadRow<TData>({
  children,
  headerGroup,
}: {
  children: ReactNode;
  headerGroup: HeaderGroup<TData>;
}) {
  const { props } = useDataGrid();

  return (
    <tr
      className={cn(
        'bg-muted/40',
        props.tableLayout?.headerBorder && '[&>th]:border-b',
        props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
        props.tableLayout?.stripped && 'bg-transparent',
        props.tableLayout?.headerBackground === false && 'bg-transparent',
        props.tableClassNames?.headerRow,
      )}
      key={headerGroup.id}
    >
      {children}
    </tr>
  );
}

function DataGridTableHeadRowCell<TData>({
  children,
  header,
  dndRef,
  dndStyle,
}: {
  children: ReactNode;
  header: Header<TData, unknown>;
  dndRef?: React.Ref<HTMLTableCellElement>;
  dndStyle?: CSSProperties;
}) {
  'use no memo';

  const { props } = useDataGrid();

  const { column } = header;
  const isPinned = column.getIsPinned();
  const isLastLeftPinned =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned =
    isPinned === 'right' && column.getIsFirstColumn('right');
  const headerCellSpacing = headerCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  });

  return (
    <th
      className={cn(
        'relative h-10 text-left align-middle font-normal text-secondary-foreground/80 rtl:text-right [&:has([role=checkbox])]:pe-0',
        headerCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          'data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border',
        header.column.columnDef.meta?.headerClassName,
        column.getIndex() === 0 ||
          column.getIndex() === header.headerGroup.headers.length - 1
          ? props.tableClassNames?.edgeCell
          : '',
      )}
      data-last-col={
        isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined
      }
      data-pinned={isPinned || undefined}
      key={header.id}
      ref={dndRef}
      style={{
        ...(props.tableLayout?.width === 'fixed' && {
          width: `${header.getSize()}px`,
        }),
        ...(props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          getPinningStyles(column)),
        ...(dndStyle ? dndStyle : null),
      }}
    >
      {children}
    </th>
  );
}

function DataGridTableHeadRowCellResize<TData>({
  header,
}: {
  header: Header<TData, unknown>;
}) {
  'use no memo';

  const { column } = header;

  return (
    <div
      {...{
        onDoubleClick: () => column.resetSize(),
        onMouseDown: header.getResizeHandler(),
        onTouchStart: header.getResizeHandler(),
        className:
          'absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -end-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px',
      }}
    />
  );
}

function DataGridTableRowSpacer() {
  return <tbody aria-hidden="true" className="h-2" />;
}

function DataGridTableBody({ children }: { children: ReactNode }) {
  const { props } = useDataGrid();

  return (
    <tbody
      className={cn(
        '[&_tr:last-child]:border-0',
        props.tableLayout?.rowRounded &&
          '[&_td:first-child]:rounded-s-lg [&_td:last-child]:rounded-e-lg',
        props.tableClassNames?.body,
      )}
    >
      {children}
    </tbody>
  );
}

function DataGridTableBodyRowSkeleton({ children }: { children: ReactNode }) {
  'use no memo';

  const { table, props } = useDataGrid();

  return (
    <tr
      className={cn(
        'hover:bg-muted/40 data-[state=selected]:bg-muted/50',
        props.onRowClick && 'cursor-pointer',
        !props.tableLayout?.stripped &&
          props.tableLayout?.rowBorder &&
          'border-border border-b [&:not(:last-child)>td]:border-b',
        props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
        props.tableLayout?.stripped &&
          'odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted',
        table.options.enableRowSelection && '[&_>:first-child]:relative',
        props.tableClassNames?.bodyRow,
      )}
    >
      {children}
    </tr>
  );
}

function DataGridTableBodyRowSkeletonCell<TData>({
  children,
  column,
}: {
  children: ReactNode;
  column: Column<TData>;
}) {
  'use no memo';

  const { props, table } = useDataGrid();
  const bodyCellSpacing = bodyCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  });

  return (
    <td
      className={cn(
        'align-middle',
        bodyCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        column.columnDef.meta?.cellClassName,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          'data-pinned:bg-background/90 data-pinned:backdrop-blur-xs" [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border',
        column.getIndex() === 0 ||
          column.getIndex() === table.getVisibleFlatColumns().length - 1
          ? props.tableClassNames?.edgeCell
          : '',
      )}
    >
      {children}
    </td>
  );
}

function DataGridTableBodyRow<TData>({
  children,
  row,
  dndRef,
  dndStyle,
}: {
  children: ReactNode;
  row: Row<TData>;
  dndRef?: React.Ref<HTMLTableRowElement>;
  dndStyle?: CSSProperties;
}) {
  'use no memo';

  const { props, table } = useDataGrid();

  return (
    <tr
      className={cn(
        'hover:bg-muted/40 data-[state=selected]:bg-muted/50',
        props.onRowClick && 'cursor-pointer',
        !props.tableLayout?.stripped &&
          props.tableLayout?.rowBorder &&
          'border-border border-b [&:not(:last-child)>td]:border-b',
        props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
        props.tableLayout?.stripped &&
          'odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted',
        table.options.enableRowSelection && '[&_>:first-child]:relative',
        props.tableClassNames?.bodyRow,
      )}
      data-state={
        table.options.enableRowSelection && row.getIsSelected()
          ? 'selected'
          : undefined
      }
      onClick={() => props.onRowClick?.(row.original)}
      ref={dndRef}
      style={{ ...(dndStyle ? dndStyle : null) }}
    >
      {children}
    </tr>
  );
}

function DataGridTableBodyRowExpandded<TData>({ row }: { row: Row<TData> }) {
  'use no memo';

  const { props, table } = useDataGrid();

  return (
    <tr
      className={cn(
        props.tableLayout?.rowBorder && '[&:not(:last-child)>td]:border-b',
      )}
    >
      <td colSpan={row.getVisibleCells().length}>
        {table
          .getAllColumns()
          .find((column) => column.columnDef.meta?.expandedContent)
          ?.columnDef.meta?.expandedContent?.(row.original)}
      </td>
    </tr>
  );
}

function DataGridTableBodyRowCell<TData>({
  children,
  cell,
  dndRef,
  dndStyle,
}: {
  children: ReactNode;
  cell: Cell<TData, unknown>;
  dndRef?: React.Ref<HTMLTableCellElement>;
  dndStyle?: CSSProperties;
}) {
  'use no memo';

  const { props } = useDataGrid();

  const { column, row } = cell;
  const isPinned = column.getIsPinned();
  const isLastLeftPinned =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned =
    isPinned === 'right' && column.getIsFirstColumn('right');
  const bodyCellSpacing = bodyCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  });

  return (
    <td
      key={cell.id}
      ref={dndRef}
      {...(props.tableLayout?.columnsDraggable && !isPinned ? { cell } : {})}
      className={cn(
        'align-middle',
        bodyCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        cell.column.columnDef.meta?.cellClassName,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          'data-pinned:bg-background/90 data-pinned:backdrop-blur-xs" [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border',
        column.getIndex() === 0 ||
          column.getIndex() === row.getVisibleCells().length - 1
          ? props.tableClassNames?.edgeCell
          : '',
      )}
      data-last-col={
        isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined
      }
      data-pinned={isPinned || undefined}
      style={{
        ...(props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          getPinningStyles(column)),
        ...(dndStyle ? dndStyle : null),
      }}
    >
      {children}
    </td>
  );
}

function DataGridTableEmpty() {
  'use no memo';

  const { table, props } = useDataGrid();
  const totalColumns = table.getAllColumns().length;

  return (
    <tr>
      <td
        className="py-6 text-center text-muted-foreground"
        colSpan={totalColumns}
      >
        {props.emptyMessage || 'No data available'}
      </td>
    </tr>
  );
}

function DataGridTableLoader() {
  const { props } = useDataGrid();

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex items-center gap-2 rounded-md border bg-card px-4 py-2 font-medium text-muted-foreground text-sm leading-none shadow-xs">
        <svg
          className="-ml-1 h-5 w-5 animate-spin text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
        {props.loadingMessage || 'Loading...'}
      </div>
    </div>
  );
}

function DataGridTableRowSelect<TData>({
  row,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  size,
}: {
  row: Row<TData>;
  size?: 'sm' | 'md' | 'lg';
}) {
  'use no memo';

  return (
    <>
      <div
        className={cn(
          'absolute start-0 top-0 bottom-0 hidden w-[2px] bg-primary',
          row.getIsSelected() && 'block',
        )}
      />
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="align-[inherit]"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        // size={size ?? 'sm'}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DataGridTableRowSelectAll({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  'use no memo';

  const { table, recordCount, isLoading } = useDataGrid();

  return (
    <Checkbox
      aria-label="Select all"
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      className="align-[inherit]"
      disabled={isLoading || recordCount === 0}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      // size={size}
    />
  );
}

function DataGridTable<TData>() {
  'use no memo';

  const { table, isLoading, props } = useDataGrid();
  const pagination = table.getState().pagination;

  return (
    <DataGridTableBase>
      <DataGridTableHead>
        {table
          .getHeaderGroups()
          .map((headerGroup: HeaderGroup<TData>, index) => {
            return (
              <DataGridTableHeadRow headerGroup={headerGroup} key={index}>
                {headerGroup.headers.map((header, index) => {
                  const { column } = header;

                  return (
                    <DataGridTableHeadRowCell header={header} key={index}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {props.tableLayout?.columnsResizable &&
                        column.getCanResize() && (
                          <DataGridTableHeadRowCellResize header={header} />
                        )}
                    </DataGridTableHeadRowCell>
                  );
                })}
              </DataGridTableHeadRow>
            );
          })}
      </DataGridTableHead>

      {(props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && (
        <DataGridTableRowSpacer />
      )}

      <DataGridTableBody>
        {props.loadingMode === 'skeleton' &&
        isLoading &&
        pagination?.pageSize ? (
          Array.from({ length: pagination.pageSize }).map((_, rowIndex) => (
            <DataGridTableBodyRowSkeleton key={rowIndex}>
              {table.getVisibleFlatColumns().map((column, colIndex) => {
                return (
                  <DataGridTableBodyRowSkeletonCell
                    column={column}
                    key={colIndex}
                  >
                    {column.columnDef.meta?.skeleton}
                  </DataGridTableBodyRowSkeletonCell>
                );
              })}
            </DataGridTableBodyRowSkeleton>
          ))
        ) : table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row: Row<TData>, index) => {
            return (
              <Fragment key={row.id}>
                <DataGridTableBodyRow key={index} row={row}>
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<TData, unknown>, colIndex) => {
                      return (
                        <DataGridTableBodyRowCell cell={cell} key={colIndex}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </DataGridTableBodyRowCell>
                      );
                    })}
                </DataGridTableBodyRow>
                {row.getIsExpanded() && (
                  <DataGridTableBodyRowExpandded row={row} />
                )}
              </Fragment>
            );
          })
        ) : (
          <DataGridTableEmpty />
        )}
      </DataGridTableBody>
    </DataGridTableBase>
  );
}

export {
  DataGridTable,
  DataGridTableBase,
  DataGridTableBody,
  DataGridTableBodyRow,
  DataGridTableBodyRowCell,
  DataGridTableBodyRowExpandded,
  DataGridTableBodyRowSkeleton,
  DataGridTableBodyRowSkeletonCell,
  DataGridTableEmpty,
  DataGridTableHead,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableHeadRowCellResize,
  DataGridTableLoader,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  DataGridTableRowSpacer,
};
