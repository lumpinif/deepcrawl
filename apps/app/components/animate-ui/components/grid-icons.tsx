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

const getLinksFrames = [
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [2, 2],
    [1, 2],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [3, 3],
    [4, 3],
    [2, 3],
    [1, 3],
    [0, 3],
  ],
  [
    [0, 0],
    [1, 0],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [3, 3],
    [4, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 1],
    [1, 1],
    [0, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [2, 3],
    [1, 3],
    [0, 3],
    [2, 4],
    [1, 4],
    [0, 4],
    [3, 2],
    [3, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [0, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [2, 3],
    [1, 3],
    [0, 3],
    [2, 4],
    [1, 4],
    [0, 4],
    [3, 4],
    [4, 4],
    [3, 3],
    [3, 2],
  ],
] as Frames;

const listLogsFrames = [
  [
    [0, 0],
    [1, 0],
    [3, 1],
    [4, 1],
    [1, 2],
    [0, 2],
    [4, 3],
    [3, 3],
    [0, 4],
    [1, 4],
    [2, 0],
  ],
  [
    [3, 4],
    [4, 4],
    [1, 3],
    [0, 3],
    [3, 2],
    [4, 2],
    [1, 1],
    [0, 1],
    [3, 0],
    [4, 0],
    [2, 1],
  ],
  [
    [3, 3],
    [4, 3],
    [0, 4],
    [1, 4],
    [1, 2],
    [0, 2],
    [4, 1],
    [3, 1],
    [1, 0],
    [0, 0],
    [2, 2],
  ],
  [
    [3, 4],
    [4, 4],
    [1, 3],
    [0, 3],
    [4, 2],
    [3, 2],
    [0, 1],
    [1, 1],
    [4, 0],
    [3, 0],
    [2, 3],
  ],
  [
    [1, 4],
    [0, 4],
    [3, 3],
    [4, 3],
    [1, 2],
    [0, 2],
    [3, 1],
    [4, 1],
    [1, 0],
    [0, 0],
    [2, 4],
  ],
] as Frames;

const exportResponseFrames = [
  [[2, 0]],
  [
    [2, 0],
    [2, 1],
    [1, 0],
    [3, 0],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [1, 1],
    [0, 0],
    [3, 1],
    [4, 0],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [1, 2],
    [0, 1],
    [3, 2],
    [4, 1],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [1, 3],
    [0, 2],
    [3, 3],
    [4, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [4, 3],
    [0, 3],
    [3, 4],
    [1, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [0, 4],
    [4, 4],
  ],
  [
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [2, 3],
    [2, 4],
  ],
  [[2, 4]],
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
  getLinks: {
    frames: getLinksFrames,
  },
  listLogs: {
    frames: listLogsFrames,
  },
  exportResponse: {
    frames: exportResponseFrames,
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
      frames={grids.getMarkdown.frames}
      gridSize={gridSize || [5, 5]}
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
      frames={grids.readUrl.frames}
      gridSize={gridSize || [5, 5]}
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
      frames={grids.extractLinks.frames}
      gridSize={gridSize || [5, 5]}
      {...props}
    />
  );
}

export function GetLinksGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      frames={grids.getLinks.frames}
      gridSize={gridSize || [5, 5]}
      {...props}
    />
  );
}

export function ListLogsGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      frames={grids.listLogs.frames}
      gridSize={gridSize || [5, 5]}
      {...props}
    />
  );
}

export function ExportResponseGridIcon({
  gridSize,
  duration,
  animate,
  ...props
}: Omit<Partial<MotionGridProps>, 'frames'>) {
  return (
    <MotionGrid
      animate={animate}
      duration={duration || 100}
      frames={grids.exportResponse.frames}
      gridSize={gridSize || [5, 5]}
      {...props}
    />
  );
}
