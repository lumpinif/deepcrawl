import { DataGridColumnHeader } from '@deepcrawl/ui/components/reui/data-grid-column-header';
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@deepcrawl/ui/components/reui/data-grid-table';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import type { GetManyLogsResponse } from 'deepcrawl';
import { Ellipsis } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';

export type ActivityLogEntry = GetManyLogsResponse['logs'][number];

export function getLogUrl(log: ActivityLogEntry): string {
  return log.requestOptions.url;
}

export function getLogStatus(log: ActivityLogEntry): string {
  if (typeof log.success === 'boolean') {
    return log.success ? 'success' : 'failed';
  }

  return 'failed';
}

export function getLogTimestamp(log: ActivityLogEntry): string | undefined {
  if (log.path === 'read-getMarkdown') {
    return log.requestTimestamp;
  }

  const response = (log as { response?: unknown }).response;

  if (response && typeof response === 'object' && 'timestamp' in response) {
    const timestamp = (response as { timestamp?: unknown }).timestamp;
    if (typeof timestamp === 'string') {
      return timestamp;
    }
  }

  return;
}

export function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return '--';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return formatDate(date, 'MMM d, yyyy HH:mm');
}

function ActionsCell({ row }: { row: Row<ActivityLogEntry> }) {
  const handleCopyId = () => {
    copyToClipboard(row.original.id);
    const message = 'Request ID successfully copied';
    toast.success(message);
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}} variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const activityLogsColumns: ColumnDef<ActivityLogEntry>[] = [
  {
    accessorKey: 'id',
    id: 'id',
    header: () => <DataGridTableRowSelectAll />,
    cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: {
      headerClassName: '',
      cellClassName: '',
      skeleton: <Skeleton className="h-4 w-4 rounded" />,
    },
    enableResizing: false,
  },
  {
    accessorKey: 'path',
    id: 'path',
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Path" visibility />
    ),
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm">{getValue<string>()}</span>
    ),
    size: 200,
    minSize: 160,
    maxSize: 320,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-5 w-32" />,
    },
  },
  {
    accessorFn: (log) => getLogUrl(log),
    id: 'url',
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="URL" visibility />
    ),
    cell: ({ row }) => {
      const url = getLogUrl(row.original);

      return <span className="truncate text-primary text-sm">{url}</span>;
    },
    size: 320,
    minSize: 220,
    maxSize: 420,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-5 w-48" />,
    },
  },
  {
    accessorFn: (log) => getLogTimestamp(log) ?? '',
    id: 'timestamp',
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Request Time" visibility />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatTimestamp(getLogTimestamp(row.original))}
      </span>
    ),
    size: 200,
    minSize: 180,
    maxSize: 260,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-5 w-28" />,
    },
  },
  {
    accessorFn: (log) => getLogStatus(log),
    id: 'status',
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Status" visibility />
    ),
    cell: ({ row }) => {
      const status = getLogStatus(row.original);

      return (
        <Badge
          className="capitalize"
          variant={status === 'success' ? 'outline' : 'destructive'}
        >
          {status}
        </Badge>
      );
    },
    size: 120,
    minSize: 100,
    maxSize: 160,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      skeleton: <Skeleton className="h-6 w-16" />,
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell row={row} />,
    size: 72,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: {
      skeleton: <Skeleton className="h-7 w-7 rounded" />,
    },
  },
];
