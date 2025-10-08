import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
} from '@deepcrawl/ui/components/reui/card';
import { DataGridPagination } from '@deepcrawl/ui/components/reui/data-grid-pagination';
import { DataGridTable } from '@deepcrawl/ui/components/reui/data-grid-table';
import { ScrollArea, ScrollBar } from '@deepcrawl/ui/components/ui/scroll-area';

interface LogsDataGridCardProps {
  children: React.ReactNode;
}

export function LogsDataGridCard({ children }: LogsDataGridCardProps) {
  return (
    <Card className="rounded-none border-none bg-transparent">
      <CardHeader className="w-full px-0 py-4">{children}</CardHeader>
      <CardTable>
        <ScrollArea className="w-full overflow-x-hidden">
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardTable>
      <CardFooter>
        <DataGridPagination />
      </CardFooter>
    </Card>
  );
}
