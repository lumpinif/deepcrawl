import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import { PGResponseArea } from '@/components/playground/response-area/pg-response-area';
import { PlaygroundProvider } from '@/hooks/playground/playground-context';

export default function DashboardPage() {
  return (
    <PlaygroundProvider>
      <PlaygroundOperationClientContent />
      <PGResponseArea />
    </PlaygroundProvider>
  );
}
