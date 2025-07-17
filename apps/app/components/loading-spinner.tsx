import { cn } from '@deepcrawl/ui/lib/utils';

const bars = Array(12).fill(0);

type LoadingSpinnerProps = { size?: number; className?: string };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 20,
}) => {
  return (
    <div
      className={cn(
        'relative h-[var(--spinner-size)] w-[var(--spinner-size)]',
        className,
      )}
      style={
        {
          '--spinner-size': `${size}px`,
        } as React.CSSProperties
      }
    >
      <div className="absolute top-1/2 left-1/2 h-[var(--spinner-size)] w-[var(--spinner-size)]">
        {bars.map((_, i) => (
          <div
            className={
              'absolute top-[-3.9%] left-[-10%] h-[8%] w-[24%] animate-spinner rounded-md bg-muted-foreground'
            }
            key={`spinner-bar-${i}`}
            style={{
              animationDelay: `-${1.2 - i * 0.1}s`,
              transform: `rotate(${i * 30}deg) translate(146%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
