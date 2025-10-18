import { cn } from '@deepcrawl/ui/lib/utils';
import { type BorderEdge, BorderShader } from './border-shader';
import { FlickeringGrid } from './flickering-grid';
import { Installer } from './installer';

const COLUMNS = 12;
const LAST_COLUMN = COLUMNS - 1;

function Row({
  boxNumber,
  className,
  borderEdges = [],
}: {
  boxNumber?: number | number[];
  className?: string;
  borderEdges?: BorderEdge[];
}) {
  return (
    <div className={cn('hidden grid-cols-12 divide-x sm:grid', className)}>
      {new Array(COLUMNS)
        .fill(0)
        .map((_, index) =>
          (Array.isArray(boxNumber)
            ? boxNumber.includes(index)
            : index === boxNumber) && boxNumber !== undefined ? (
            <BorderShader
              borderEdges={borderEdges}
              borderStripWidth={3}
              className="text-border/30 transition-colors duration-100 ease-out hover:text-border sm:col-span-1"
              key={index}
              showBorderStrips={true}
            />
          ) : (
            <div
              className={cn(
                'aspect-square',
                index === LAST_COLUMN && 'border-r-0',
              )}
              key={index}
            />
          ),
        )}
    </div>
  );
}

export const Hero = () => (
  <section className="relative">
    {/* <Row /> */}
    <div className="relative sm:grid sm:grid-cols-12 sm:divide-x">
      {/* <BorderShader
        borderEdges={['top', 'right', 'bottom']}
        borderStripWidth={10}
        className="text-border/30 transition-colors duration-100 ease-out hover:text-border sm:col-span-1"
        showBorderStrips={true}
      /> */}
      <div className="relative col-span-12 space-y-4 overflow-hidden px-4 py-52 text-center sm:px-8">
        <div className="absolute inset-0 z-[-10] size-full">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-30% from-transparent to-background" />
          <FlickeringGrid
            className="h-full w-full"
            color="#6B7280"
            flickerChance={0.15}
            fontSize={100}
            gridGap={9}
            maxOpacity={0.15}
            squareSize={3}
            text="npm i deepcrawl"
            textOffsetY={250}
          />
        </div>
        <h1 className="-translate-y-12 font-semibold text-5xl leading-tight tracking-tighter md:text-6xl lg:text-7xl 2xl:text-8xl">
          Deepcrawl
        </h1>
        <p className="-translate-y-12 mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-2xl">
          Free and open-source agentic toolkit that makes any website data AI
          ready
        </p>
        <div className="-translate-y-12 mx-auto flex w-fit flex-col items-center gap-8 pt-4">
          <Installer />
        </div>
      </div>
      {/* <div className="border-r-0 sm:col-span-1" /> */}
      {/* <BorderShader
        borderEdges={['top', 'left', 'bottom']}
        borderStripWidth={10}
        className="text-border/30 transition-colors duration-100 ease-out hover:text-border sm:col-span-1"
        showBorderStrips={true}
      /> */}
    </div>
    {/* <Row /> */}
  </section>
);
