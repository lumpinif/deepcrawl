import {
  PageContainer,
  // PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { PlaygroundOperationClient } from '@/components/playground/playground-operation-client';

export default async function DashboardPage() {
  return (
    <>
      {/* <PageHeader title="Dashboard" /> */}
      <PageContainer className="mt-28">
        <PageTitle
          className="mx-auto w-full text-center"
          description="API Playground for Deepcrawl"
          title="What would you like to see?"
          titleSize="3xl"
        />
        <PlaygroundOperationClient />
      </PageContainer>
    </>
  );
}
