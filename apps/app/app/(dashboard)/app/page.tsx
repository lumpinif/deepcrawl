import {
  PageContainer,
  // PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { TaskInput } from '@/components/playground/task-input';

export default async function DashboardPage() {
  return (
    <>
      {/* <PageHeader title="Dashboard" /> */}
      <PageContainer className="mt-40">
        <PageTitle
          className="mx-auto w-full text-center"
          description="API Playground for Deepcrawl"
          title="What would you like to see?"
          titleSize="3xl"
        />
        <TaskInput />
      </PageContainer>
    </>
  );
}
