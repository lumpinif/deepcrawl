import { cn } from '@deepcrawl/ui/lib/utils';

export type BorderEdge = 'top' | 'right' | 'bottom' | 'left';

interface BorderShaderProps {
  className?: string;
  angle?: number; // Angle in degrees (default: 315 for top-left to bottom-right)
  size?: number; // Size of the pattern in pixels (default: 10)
  color?: string; // CSS color variable or color (default: 'currentColor')
  lineWidth?: number; // Width of the diagonal lines in pixels (default: 1)
  showBorderStrips?: boolean; // Show filled border strips along edges (default: false)
  borderStripWidth?: number; // Width/height of border strips in pixels (default: 2)
  borderStripColor?: string; // Color of border strips (default: same as color)
  borderEdges?: BorderEdge[]; // Which edges to show border strips (default: all)
}

export const BorderShader: React.FC<BorderShaderProps> = ({
  className,
  angle = 315,
  size = 10,
  color = 'currentColor',
  lineWidth = 1,
  showBorderStrips = false,
  borderStripWidth = 2,
  borderStripColor,
  borderEdges = ['top', 'right', 'bottom', 'left'],
}) => {
  const backgroundStyle = {
    backgroundSize: `${size}px ${size}px`,
    backgroundImage: `repeating-linear-gradient(${angle}deg, ${color} 0 ${lineWidth}px, transparent 0 50%)`,
  };

  const finalBorderColor = borderStripColor || color;

  return (
    <div
      className={cn('relative text-border', className)}
      style={backgroundStyle}
    >
      {showBorderStrips && (
        <>
          {borderEdges.includes('top') && (
            <div
              className="absolute top-0 right-0 left-0"
              style={{
                height: `${borderStripWidth}px`,
                backgroundColor: finalBorderColor,
              }}
            />
          )}
          {borderEdges.includes('right') && (
            <div
              className="absolute top-0 right-0 bottom-0"
              style={{
                width: `${borderStripWidth}px`,
                backgroundColor: finalBorderColor,
              }}
            />
          )}
          {borderEdges.includes('bottom') && (
            <div
              className="absolute right-0 bottom-0 left-0"
              style={{
                height: `${borderStripWidth}px`,
                backgroundColor: finalBorderColor,
              }}
            />
          )}
          {borderEdges.includes('left') && (
            <div
              className="absolute top-0 bottom-0 left-0"
              style={{
                width: `${borderStripWidth}px`,
                backgroundColor: finalBorderColor,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
