import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';

export default async function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <PageContainer>
        <PageTitle title="Overview" titleSize="2xl" />
      </PageContainer>
    </>
  );
}
