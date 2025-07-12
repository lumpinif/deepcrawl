import { type Frames, MotionGrid, type MotionGridProps } from './motion-grid';

const getMarkdownFrames = [
  [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
    [0, 0],
    [4, 0],
  ],
  [
    [0, 0],
    [4, 0],
  ],
  [
    [0, 0],
    [4, 0],
  ],
  [
    [0, 0],
    [4, 0],
    [3, 0],
    [1, 0],
  ],
  [
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
    [0, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
  ],
  [
    [3, 3],
    [2, 3],
    [0, 3],
    [1, 3],
    [4, 3],
  ],
  [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
  ],
] as Frames;

const readUrlFrames = [
  [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 3],
    [0, 1],
    [4, 1],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 3],
    [4, 1],
    [4, 3],
    [4, 4],
    [0, 4],
    [0, 0],
    [4, 0],
    [0, 1],
  ],
  [
    [4, 4],
    [4, 0],
    [0, 0],
    [0, 4],
  ],
] as Frames;

const extractLinksFrames = [
  [[1, 1]],
  [
    [1, 1],
    [3, 1],
  ],
  [
    [1, 1],
    [3, 1],
    [3, 3],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
    [2, 2],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
    [2, 2],
    [3, 2],
    [2, 1],
    [1, 2],
    [2, 3],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
    [2, 2],
    [3, 2],
    [2, 1],
    [1, 2],
    [2, 3],
    [4, 1],
    [4, 2],
    [4, 3],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 3],
    [0, 2],
    [0, 1],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [1, 1],
    [3, 3],
    [1, 3],
    [3, 1],
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
    [3, 2],
    [2, 1],
    [1, 2],
    [2, 3],
    [4, 1],
    [4, 2],
    [4, 3],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 3],
    [0, 2],
    [0, 1],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 3],
    [0, 2],
    [0, 1],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [4, 0],
    [4, 4],
    [0, 4],
    [0, 0],
  ],
  [[1, 1]],
] as Frames;

const grids = {
  getMarkdown: {
    frames: getMarkdownFrames,
  },
  readUrl: {
    frames: readUrlFrames,
  },
  extractLinks: {
    frames: extractLinksFrames,
  },
};

export function GetMarkdownGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      gridSize={gridSize || [5, 5]}
      frames={grids.getMarkdown.frames}
      {...props}
    />
  );
}

export function ReadUrlGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      gridSize={gridSize || [5, 5]}
      frames={grids.readUrl.frames}
      {...props}
    />
  );
}

export function ExtractLinksGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      gridSize={gridSize || [5, 5]}
      frames={grids.extractLinks.frames}
      {...props}
    />
  );
}
