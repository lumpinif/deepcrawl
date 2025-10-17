'use client';

import { useIsMobile } from '@deepcrawl/ui/hooks/use-mobile';
import { FlickeringGrid } from './flickering-grid';

export const Header = () => {
  const isMobile = useIsMobile();

  return (
    <div className="relative z-0 mt-12 h-28 w-full md:h-36">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-50% from-transparent to-background" />
      <div className="absolute inset-0">
        <FlickeringGrid
          className="h-full w-full"
          color="#6B7280"
          flickerChance={0.1}
          fontSize={isMobile ? 40 : 120}
          gridGap={isMobile ? 1 : 6.5}
          maxOpacity={0.25}
          squareSize={isMobile ? 1 : 1.5}
          text="npm i deepcrawl"
          textOffsetY={isMobile ? 0 : 10}
        />
      </div>
    </div>
  );
};
