import { PageContainer, PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';

export default function PlaygroundPage() {
  return (
    <>
      <PageHeader title="Playground" />
      <PageContainer>
        <PlaygroundClient />
      </PageContainer>
    </>
  );
}
