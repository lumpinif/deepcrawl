import { PageContainer, PageTitle } from '../page-elements';

export function PlaygroundSkeleton() {
  return (
    <PageContainer className="h-full">
      <PageTitle
        className="mx-auto mt-28 mb-10 w-full text-center md:mt-[13svh]"
        description="Make any website data AI-ready for agents"
        desPos="bottom"
        title="What would you like to see?"
        titleClassName="mb-2"
        titleSize="3xl"
      >
        <span className="text-muted-foreground">
          API Playground for Deepcrawl
        </span>
      </PageTitle>
    </PageContainer>
  );
}
