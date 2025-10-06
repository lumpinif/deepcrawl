import { useDataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { Column } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  Check,
  ChevronsUpDown,
  PinOff,
  Settings2,
} from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

interface DataGridColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title?: string;
  icon?: ReactNode;
  pinnable?: boolean;
  filter?: ReactNode;
  visibility?: boolean;
}

function DataGridColumnHeader<TData, TValue>({
  column,
  title = '',
  icon,
  className,
  filter,
  visibility = false,
}: DataGridColumnHeaderProps<TData, TValue>) {
  const { isLoading, table, props, recordCount } = useDataGrid();

  const moveColumn = (direction: 'left' | 'right') => {
    const currentOrder = [...table.getState().columnOrder]; // Get current column order
    const currentIndex = currentOrder.indexOf(column.id); // Get current index of the column

    if (direction === 'left' && currentIndex > 0) {
      // Move column left
      const newOrder = [...currentOrder];
      const [movedColumn] = newOrder.splice(currentIndex, 1);
      newOrder.splice(currentIndex - 1, 0, movedColumn as string);
      table.setColumnOrder(newOrder); // Update column order
    }

    if (direction === 'right' && currentIndex < currentOrder.length - 1) {
      // Move column right
      const newOrder = [...currentOrder];
      const [movedColumn] = newOrder.splice(currentIndex, 1);
      newOrder.splice(currentIndex + 1, 0, movedColumn as string);
      table.setColumnOrder(newOrder); // Update column order
    }
  };

  const canMove = (direction: 'left' | 'right'): boolean => {
    const currentOrder = table.getState().columnOrder;
    const currentIndex = currentOrder.indexOf(column.id);
    if (direction === 'left') {
      return currentIndex > 0;
    }
    return currentIndex < currentOrder.length - 1;
  };

  const headerLabel = () => {
    return (
      <div
        className={cn(
          'inline-flex h-full items-center gap-1.5 font-normal text-[0.8125rem] text-secondary-foreground/80 leading-[calc(1.125/0.8125)] [&_svg]:size-3.5 [&_svg]:opacity-60',
          className,
        )}
      >
        {icon && icon}
        {title}
      </div>
    );
  };

  const headerButton = () => {
    return (
      <Button
        className={cn(
          '-ms-2 h-7 rounded-md px-2 font-normal text-secondary-foreground/80 hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground',
          className,
        )}
        disabled={isLoading || recordCount === 0}
        onClick={() => {
          const isSorted = column.getIsSorted();
          if (isSorted === 'asc') {
            column.toggleSorting(true);
          } else if (isSorted === 'desc') {
            column.clearSorting();
          } else {
            column.toggleSorting(false);
          }
        }}
        variant="ghost"
      >
        {icon && icon}
        {title}

        {column.getCanSort() &&
          (column.getIsSorted() === 'desc' ? (
            <ArrowDown className="mt-px size-[0.7rem]!" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="mt-px size-[0.7rem]!" />
          ) : (
            <ChevronsUpDown className="mt-px size-[0.7rem]!" />
          ))}
      </Button>
    );
  };

  const headerPin = () => {
    return (
      <Button
        aria-label={`Unpin ${title} column`}
        className="-me-1 size-7 rounded-md"
        onClick={() => column.pin(false)}
        size="sm"
        title={`Unpin ${title} column`}
        variant="ghost"
      >
        <PinOff aria-hidden="true" className="size-3.5! opacity-50!" />
      </Button>
    );
  };

  const headerControls = () => {
    return (
      <div className="flex h-full items-center justify-between gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{headerButton()}</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {filter && <DropdownMenuLabel>{filter}</DropdownMenuLabel>}

            {filter &&
              (column.getCanSort() || column.getCanPin() || visibility) && (
                <DropdownMenuSeparator />
              )}

            {column.getCanSort() && (
              <>
                <DropdownMenuItem
                  disabled={!column.getCanSort()}
                  onClick={() => {
                    if (column.getIsSorted() === 'asc') {
                      column.clearSorting();
                    } else {
                      column.toggleSorting(false);
                    }
                  }}
                >
                  <ArrowUp className="size-3.5!" />
                  <span className="grow">Asc</span>
                  {column.getIsSorted() === 'asc' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!column.getCanSort()}
                  onClick={() => {
                    if (column.getIsSorted() === 'desc') {
                      column.clearSorting();
                    } else {
                      column.toggleSorting(true);
                    }
                  }}
                >
                  <ArrowDown className="size-3.5!" />
                  <span className="grow">Desc</span>
                  {column.getIsSorted() === 'desc' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
              </>
            )}

            {(filter || column.getCanSort()) &&
              (column.getCanSort() || column.getCanPin() || visibility) && (
                <DropdownMenuSeparator />
              )}

            {props.tableLayout?.columnsPinnable && column.getCanPin() && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(column.getIsPinned() === 'left' ? false : 'left')
                  }
                >
                  <ArrowLeftToLine aria-hidden="true" className="size-3.5!" />
                  <span className="grow">Pin to left</span>
                  {column.getIsPinned() === 'left' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(
                      column.getIsPinned() === 'right' ? false : 'right',
                    )
                  }
                >
                  <ArrowRightToLine aria-hidden="true" className="size-3.5!" />
                  <span className="grow">Pin to right</span>
                  {column.getIsPinned() === 'right' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
              </>
            )}

            {props.tableLayout?.columnsMovable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!canMove('left') || column.getIsPinned() !== false}
                  onClick={() => moveColumn('left')}
                >
                  <ArrowLeft aria-hidden="true" className="size-3.5!" />
                  <span>Move to Left</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canMove('right') || column.getIsPinned() !== false}
                  onClick={() => moveColumn('right')}
                >
                  <ArrowRight aria-hidden="true" className="size-3.5!" />
                  <span>Move to Right</span>
                </DropdownMenuItem>
              </>
            )}

            {props.tableLayout?.columnsVisibility &&
              visibility &&
              (column.getCanSort() || column.getCanPin() || filter) && (
                <DropdownMenuSeparator />
              )}

            {props.tableLayout?.columnsVisibility && visibility && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="size-3.5!" />
                  <span>Columns</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {table
                      .getAllColumns()
                      .filter(
                        (col) =>
                          typeof col.accessorFn !== 'undefined' &&
                          col.getCanHide(),
                      )
                      .map((col) => {
                        return (
                          <DropdownMenuCheckboxItem
                            checked={col.getIsVisible()}
                            className="capitalize"
                            key={col.id}
                            onCheckedChange={(value) =>
                              col.toggleVisibility(!!value)
                            }
                            onSelect={(event) => event.preventDefault()}
                          >
                            {col.columnDef.meta?.headerTitle || col.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          column.getIsPinned() &&
          headerPin()}
      </div>
    );
  };

  if (
    props.tableLayout?.columnsMovable ||
    (props.tableLayout?.columnsVisibility && visibility) ||
    (props.tableLayout?.columnsPinnable && column.getCanPin()) ||
    filter
  ) {
    return headerControls();
  }

  if (
    column.getCanSort() ||
    (props.tableLayout?.columnsResizable && column.getCanResize())
  ) {
    return <div className="flex h-full items-center">{headerButton()}</div>;
  }

  return headerLabel();
}

export { DataGridColumnHeader, type DataGridColumnHeaderProps };
