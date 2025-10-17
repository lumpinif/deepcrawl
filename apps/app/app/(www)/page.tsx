import { FlickeringGrid } from '@/components/home/flickering-grid';

export default function IndexPage() {
  return (
    <div className="size-full">
      <div className="container flex size-full items-center justify-center md:border">
        <h1 className="font-bold text-4xl tracking-tighter sm:hidden">
          Hi, Deepcrawl
        </h1>
        <div className="relative z-0 mt-24 hidden h-48 w-full sm:block md:h-64">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-60% from-transparent to-background" />
          <div className="absolute inset-0">
            <FlickeringGrid
              className="h-full w-full"
              color="#6B7280"
              flickerChance={0.1}
              fontSize={90}
              gridGap={3}
              maxOpacity={0.3}
              squareSize={2}
              text="Hello, Deepcrawl"
            />
          </div>
        </div>
      </div>
      {/* <footer>
        <div className="relative z-0 mt-24 h-48 w-full md:h-64">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-40% from-transparent to-background" />
          <div className="absolute inset-0 mx-6">
            <FlickeringGrid
              className="h-full w-full"
              color="#6B7280"
              flickerChance={0.1}
              fontSize={90}
              gridGap={3}
              maxOpacity={0.3}
              squareSize={2}
              text="Deepcrawl"
            />
          </div>
        </div>
      </footer> */}
    </div>
  );
}
