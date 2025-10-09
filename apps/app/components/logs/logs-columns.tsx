import type { GetManyLogsResponse } from '@deepcrawl/contracts';
import type { ExportFormat } from '@deepcrawl/types/routers/logs';
import { DataGridColumnHeader } from '@deepcrawl/ui/components/reui/data-grid-column-header';
// import {
//   DataGridTableRowSelect,
//   DataGridTableRowSelectAll,
// } from '@deepcrawl/ui/components/reui/data-grid-table';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Download, Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { exportLogResponse } from '@/query/logs-query.client';
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
  return log.requestTimestamp;
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

/**
 * Get available export formats based on the activity log path
 */
function getAvailableExportFormats(log: ActivityLogEntry): ExportFormat[] {
  switch (log.path) {
    case 'read-getMarkdown':
      return ['json', 'markdown'];
    case 'read-readUrl':
      return ['json', 'markdown'];
    case 'links-getLinks':
    case 'links-extractLinks':
      return ['json', 'links'];
    default:
      return ['json'];
  }
}

/**
 * Get user-friendly label for export format
 */
function getExportFormatLabel(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'JSON';
    case 'markdown':
      return 'Markdown';
    case 'links':
      return 'Links Tree';
    default:
      return format;
  }
}

function ActionsCell({ row }: { row: Row<ActivityLogEntry> }) {
  const [isExporting, setIsExporting] = useState(false);
  const log = row.original;
  const availableFormats = getAvailableExportFormats(log);

  const handleCopyId = () => {
    copyToClipboard(log.id);
    toast.success('Request ID successfully copied');
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const exportedData = await exportLogResponse({
        id: log.id,
        format,
      });

      const formattedData =
        typeof exportedData === 'string'
          ? exportedData
          : JSON.stringify(exportedData, null, 2);

      // Determine file extension based on format
      const fileExtension = format === 'markdown' ? 'md' : 'json';
      const fileName = `${log.path}_${log.id}_${format}.${fileExtension}`;

      // Create blob and trigger download
      const blob = new Blob([formattedData], {
        type: format === 'markdown' ? 'text/markdown' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported as ${getExportFormatLabel(format)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export response';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" disabled={isExporting} variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        {availableFormats.map((format) => (
          <DropdownMenuItem
            disabled={isExporting}
            key={format}
            onClick={() => handleExport(format)}
          >
            <Download className="mr-2 size-4" />
            {getExportFormatLabel(format)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const activityLogsColumns: ColumnDef<ActivityLogEntry>[] = [
  // {
  //   accessorKey: 'id',
  //   id: 'id',
  //   header: () => <DataGridTableRowSelectAll />,
  //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
  //   size: 48,
  //   enableSorting: false,
  //   enableHiding: false,
  //   meta: {
  //     headerClassName: '',
  //     cellClassName: '',
  //     skeleton: <Skeleton className="h-4 w-4 rounded" />,
  //   },
  //   enableResizing: false,
  // },
  {
    accessorKey: 'path',
    id: 'path',
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Path" visibility />
    ),
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm">{getValue<string>()}</span>
    ),
    size: 140,
    minSize: 120,
    maxSize: 200,
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
    size: 400,
    minSize: 200,
    maxSize: 600,
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
    size: 160,
    minSize: 140,
    maxSize: 180,
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
    size: 100,
    minSize: 90,
    maxSize: 120,
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
    size: 50,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: {
      skeleton: <Skeleton className="h-7 w-7 rounded" />,
    },
  },
];
