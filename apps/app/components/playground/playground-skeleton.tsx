import { DeepcrawlLogoText } from '../deepcrawl-logo';
import { LoadingSpinner } from '../loading-spinner';
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

export function DashboardLayoutSkeleton() {
  return (
    <div className="container relative flex size-full h-svh items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center gap-4 max-sm:mb-16">
        <LoadingSpinner size={25} />
        <DeepcrawlLogoText className="animate-pulse text-center text-lg sm:text-2xl">
          Deepcrawl Dashboard is loading
        </DeepcrawlLogoText>
      </div>
    </div>
  );
}
