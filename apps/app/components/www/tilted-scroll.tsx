import { cn } from '@deepcrawl/ui/lib/utils';

interface TiltedScrollItem {
  id: string;
  text: string;
}

interface TiltedScrollProps {
  items?: TiltedScrollItem[];
  className?: string;
}

export function TiltedScroll({
  items = defaultItems,
  className,
}: TiltedScrollProps) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center',
        'fade-in-0 will-change size-full transform-gpu animate-in overflow-hidden rounded-xl opacity-100 transition-opacity duration-700',
        className,
      )}
    >
      <div className="relative overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)]">
        <div className="grid h-[300px] w-[350px] animate-skew-scroll grid-cols-1 gap-5">
          {items.map((item) => (
            <div
              className="group flex cursor-pointer items-center gap-2 rounded-md border border-border/40 bg-gradient-to-b from-background/80 to-muted/80 p-4 shadow-md transition-all duration-300 ease-in-out hover:-translate-x-1 hover:-translate-y-1 hover:scale-105 hover:shadow-xl dark:border-border"
              key={item.id}
            >
              <CheckCircleIcon className="mr-2 h-6 w-6 stroke-foreground/40 transition-colors group-hover:stroke-foreground" />
              <p className="text-foreground/80 transition-colors group-hover:text-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const defaultItems: TiltedScrollItem[] = [
  { id: '3', text: '📦 @packages/types' },
  { id: '2', text: '🔗 ExtractLinksOptions' },
  { id: '6', text: '💾 @packages/db' },
  { id: '7', text: ' ▲ @packages/ui' },
  { id: '1', text: '📄 GetMarkdownResponse' },
  { id: '4', text: '📦 @packages/contracts' },
  { id: '8', text: '📝 ListLogsResponse' },
  { id: '5', text: '🛡️ @packages/auth' },
];
