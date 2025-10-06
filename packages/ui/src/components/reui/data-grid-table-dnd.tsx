import { useDataGrid } from '@deepcrawl/ui/components/reui/data-grid.js';
import {
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
  DataGridTableRowSpacer,
} from '@deepcrawl/ui/components/reui/data-grid-table.js';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type Cell,
  flexRender,
  type Header,
  type HeaderGroup,
  type Row,
} from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import { type CSSProperties, Fragment, useId } from 'react';

function DataGridTableDndHeader<TData>({
  header,
}: {
  header: Header<TData, unknown>;
}) {
  const { props } = useDataGrid();
  const { column } = header;

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <DataGridTableHeadRowCell
      dndRef={setNodeRef}
      dndStyle={style}
      header={header}
    >
      <div className="flex items-center justify-start gap-0.5">
        <Button
          className="-ms-2 size-6"
          size="sm"
          variant="ghost"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical aria-hidden="true" className="opacity-50" />
        </Button>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {props.tableLayout?.columnsResizable && column.getCanResize() && (
          <DataGridTableHeadRowCellResize header={header} />
        )}
      </div>
    </DataGridTableHeadRowCell>
  );
}

function DataGridTableDndCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <DataGridTableBodyRowCell cell={cell} dndRef={setNodeRef} dndStyle={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </DataGridTableBodyRowCell>
  );
}

function DataGridTableDnd<TData>({
  handleDragEnd,
}: {
  handleDragEnd: (event: DragEndEvent) => void;
}) {
  const { table, isLoading, props } = useDataGrid();
  const pagination = table.getState().pagination;

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      id={useId()}
      modifiers={[restrictToParentElement]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="relative">
        <DataGridTableBase>
          <DataGridTableHead>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<TData>, index) => {
                console.log(
                  'table.getState().columnOrder:',
                  table.getState().columnOrder,
                );

                return (
                  <DataGridTableHeadRow headerGroup={headerGroup} key={index}>
                    <SortableContext
                      items={table.getState().columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header, index) => (
                        <DataGridTableDndHeader header={header} key={index} />
                      ))}
                    </SortableContext>
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
                        .map((cell: Cell<TData, unknown>) => {
                          return (
                            <SortableContext
                              items={table.getState().columnOrder}
                              key={cell.id}
                              strategy={horizontalListSortingStrategy}
                            >
                              <DataGridTableDndCell cell={cell} />
                            </SortableContext>
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
      </div>
    </DndContext>
  );
}

export { DataGridTableDnd };
