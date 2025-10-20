import { H2 } from '../h2';
import { OperationSelectorDemo } from '../operation-selector-demo';
import { Tick } from '../tick';

export const ToolkitSuite = () => (
  <section className="relative px-4 py-24 sm:px-8">
    <Tick position={['bottom-right']} />
    <div className="space-y-12">
      <div className="space-y-3 text-center">
        <H2>Multi-purposes Features And Endpoints</H2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          Not only does it include enhanced commonly used tools, but there are
          also many more planned features coming soon!
        </p>
      </div>
      <OperationSelectorDemo />
    </div>
  </section>
);
