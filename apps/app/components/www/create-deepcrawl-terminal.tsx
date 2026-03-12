'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type LineTone = 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'logo';

type TerminalLine = {
  text: string;
  delay: number;
  preserveWhitespace?: boolean;
  tone?: LineTone;
};

type CreateDeepcrawlTerminalProps = {
  isVisible: boolean;
  onReplay?: () => void;
};

const COMMAND = 'npm create deepcrawl';
const LIFT_DURATION_SECONDS = 1.48;
const LIFT_DURATION_MS = LIFT_DURATION_SECONDS * 1000;
// With an ease-out curve, this starts typing when the card is visually
// close to its resting position rather than after it fully settles.
const COMMAND_START_PROGRESS = 0.62;
const COMMAND_START_DELAY_MS = Math.round(
  LIFT_DURATION_MS * COMMAND_START_PROGRESS,
);
const COMMAND_TYPE_DELAY_MS = 14;
const ACTIVE_GLOW_SHADOW =
  '0 0 0 1px rgba(103,232,249,0.16), 0 0 44px rgba(103,232,249,0.3), 0 0 120px rgba(103,232,249,0.2), 0 0 180px rgba(103,232,249,0.12)';
const IDLE_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.18)';

const TERMINAL_LINES: TerminalLine[] = [
  { text: '', delay: 90 },
  {
    text: [
      '╔╦╗╔═╗╔═╗╔═╗╔═╗╦═╗╔═╗╦ ╦╦',
      ' ║║║╣ ║╣ ╠═╝║  ╠╦╝╠═╣║║║║',
      '═╩╝╚═╝╚═╝╩  ╚═╝╩╚═╩ ╩╚╩╝╩═╝',
    ].join('\n'),
    delay: 140,
    preserveWhitespace: true,
    tone: 'logo',
  },
  { text: '', delay: 100 },
  {
    text: '◇ What should we call your Deepcrawl project?',
    delay: 120,
    tone: 'default',
  },
  { text: '│ Faircrawl', delay: 140, tone: 'accent' },
  { text: '', delay: 90 },
  { text: '◇ Choose what to deploy', delay: 120, tone: 'default' },
  { text: '│ V0 API Worker only', delay: 140, tone: 'accent' },
  { text: '', delay: 90 },
  { text: '◇ Pick auth', delay: 120, tone: 'default' },
  { text: '│ JWT', delay: 140, tone: 'accent' },
  { text: '', delay: 90 },
  { text: 'wait... creating your project', delay: 180, tone: 'muted' },
  {
    text: '🎉 Your Faircrawl is ready. Do you want to test your API now?',
    delay: 120,
    tone: 'accent',
  },
];

function getToneClassName(tone?: LineTone): string {
  switch (tone) {
    case 'muted':
      return 'text-zinc-400';
    case 'accent':
      return 'text-cyan-300';
    case 'success':
      return 'text-emerald-300';
    case 'warning':
      return 'text-amber-300';
    case 'logo':
      return 'text-zinc-100';
    default:
      return 'text-foreground';
  }
}

type TerminalCardProps = {
  onReplay: () => void;
};

function CreateDeepcrawlTerminalCard({ onReplay }: TerminalCardProps) {
  const [typedCommand, setTypedCommand] = useState('');
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const commandStartDelayMs = prefersReducedMotion ? 0 : COMMAND_START_DELAY_MS;

  useEffect(() => {
    // This reset effect only runs on mount/remount; timer scheduling lives in
    // the next effect so replay timing stays driven by commandStartDelayMs.
    timersRef.current = [];
    setTypedCommand('');
    setVisibleLineCount(0);
    setIsComplete(false);

    return () => {
      for (const timer of timersRef.current) {
        clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const node = outputRef.current;
    if (!node) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [visibleLineCount]);

  useEffect(() => {
    const revealLine = (index: number) => {
      if (index >= TERMINAL_LINES.length) {
        setIsComplete(true);
        return;
      }

      setVisibleLineCount(index + 1);
      const timer = setTimeout(
        () => revealLine(index + 1),
        TERMINAL_LINES[index]?.delay ?? 120,
      );
      timersRef.current.push(timer);
    };

    const typeCommand = (index: number) => {
      if (index < COMMAND.length) {
        setTypedCommand(COMMAND.slice(0, index + 1));
        const timer = setTimeout(
          () => typeCommand(index + 1),
          COMMAND_TYPE_DELAY_MS,
        );
        timersRef.current.push(timer);
        return;
      }

      revealLine(0);
    };

    const startTimer = setTimeout(() => {
      typeCommand(0);
    }, commandStartDelayMs);

    timersRef.current.push(startTimer);

    return () => {
      for (const timer of timersRef.current) {
        clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, [commandStartDelayMs]);

  return (
    <div className="absolute inset-0">
      <motion.div
        animate={{
          y: 0,
          boxShadow: ACTIVE_GLOW_SHADOW,
          borderColor: 'rgba(103,232,249,0.28)',
        }}
        className="pointer-events-none absolute inset-x-6 top-6 bottom-10 z-0 rounded-[1px] will-change-transform"
        initial={{
          y: prefersReducedMotion ? 0 : '75%',
          boxShadow: IDLE_SHADOW,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: LIFT_DURATION_SECONDS,
                ease: [0.16, 1, 0.3, 1],
              }
        }
      />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: 0 }}
          className={cn(
            'absolute inset-0 px-6 pt-6 pb-10 will-change-transform',
          )}
          initial={{ y: prefersReducedMotion ? 0 : '75%' }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: LIFT_DURATION_SECONDS,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-white/10 border-b px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-300" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-muted-foreground text-xs">
                  create-deepcrawl
                </span>
              </div>

              <button
                className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
                onClick={onReplay}
                type="button"
              >
                Replay
              </button>
            </div>

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-emerald-300">$</span>
                <span className="min-w-0 break-all text-foreground">
                  {typedCommand}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block h-5 w-2 animate-pulse rounded-[2px] bg-cyan-300"
                />
              </div>

              <div
                className="mt-4 min-h-0 flex-1 space-y-1.5 overflow-y-auto font-mono text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                ref={outputRef}
              >
                {TERMINAL_LINES.slice(0, visibleLineCount).map(
                  (line, index) => (
                    <div
                      className={cn(
                        // Tailwind CSS v4 keeps wrap-break-word for overflow-wrap.
                        'wrap-break-word',
                        line.tone === 'logo' && 'leading-none',
                        line.preserveWhitespace
                          ? 'whitespace-pre'
                          : 'whitespace-pre-wrap',
                        getToneClassName(line.tone),
                      )}
                      key={`${index}-${line.text}`}
                    >
                      {line.text || '\u00A0'}
                    </div>
                  ),
                )}

                {isComplete ? (
                  <div className="flex items-center gap-2 pt-1 font-mono text-sm">
                    <span className="text-emerald-300">$</span>
                    <span
                      aria-hidden="true"
                      className="inline-block h-5 w-2 animate-pulse rounded-[2px] bg-cyan-300"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function CreateDeepcrawlTerminal({
  isVisible,
  onReplay,
}: CreateDeepcrawlTerminalProps) {
  const [playbackId, setPlaybackId] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setPlaybackId((current) => current + 1);
  }, [isVisible]);

  return (
    <div className="relative h-108 overflow-visible sm:h-116 lg:h-124">
      {playbackId > 0 ? (
        <CreateDeepcrawlTerminalCard
          key={playbackId}
          onReplay={() => {
            onReplay?.();
            setPlaybackId((current) => current + 1);
          }}
        />
      ) : null}
    </div>
  );
}
