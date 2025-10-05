import {
  ExtractLinksGridIcon,
  GetMarkdownGridIcon,
  ReadUrlGridIcon,
} from '@/components/animate-ui/components/grid-icons';
import type { DeepcrawlOperations } from '@/hooks/playground/types';

export interface OperationConfig {
  operation: DeepcrawlOperations;
  label: string;
  icon: React.ElementType;
  endpoint: string;
  method: string;
  description: string;
}

// Operations configuration - matches playground-client pattern
export const DeepcrawlFeatures: OperationConfig[] = [
  {
    label: 'Get Markdown',
    operation: 'getMarkdown',
    icon: GetMarkdownGridIcon,
    endpoint: '/read',
    method: 'GET',
    description: 'Turn URL into LLM-friendly markdown',
  },
  {
    label: 'Read URL',
    operation: 'readUrl',
    icon: ReadUrlGridIcon,
    endpoint: '/read',
    method: 'POST',
    description: 'Return Agent-ready page context with markdown',
  },
  {
    label: 'Extract Links',
    operation: 'extractLinks',
    icon: ExtractLinksGridIcon,
    endpoint: '/links',
    method: 'POST',
    description: 'Extract links tree map for AI Agents',
  },
] as const;

export function getOperationConfig(
  operation: DeepcrawlOperations,
): OperationConfig {
  return (
    DeepcrawlFeatures.find((feat) => feat.operation === operation) ||
    (DeepcrawlFeatures[0] as OperationConfig)
  );
}
