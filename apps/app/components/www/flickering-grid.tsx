'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import * as Color from 'color-bits';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Helper function to convert any CSS color to rgba
export const getRGBA = (
  cssColor: React.CSSProperties['color'],
  fallback = 'rgba(180, 180, 180)',
): string => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  if (!cssColor) {
    return fallback;
  }

  try {
    // Handle CSS variables
    if (typeof cssColor === 'string' && cssColor.startsWith('var(')) {
      const element = document.createElement('div');
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch {
    return fallback;
  }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith('rgb')) {
    return color;
  }
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string; // Can be any valid CSS color including hex, rgb, rgba, hsl, var(--color)
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textOffsetY?: number; // Vertical offset in pixels (positive = down, negative = up)
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = '#B4B4B4',
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = '',
  fontSize = 140,
  fontWeight = 600,
  textOffsetY = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Convert any CSS color to rgba for optimal canvas performance
  const memoizedColor = useMemo(() => {
    return getRGBA(color);
  }, [color]);

  // Memoized text mask - only recompute when text properties change
  const textMaskRef = useRef<Uint8ClampedArray | null>(null);
  const textMaskParamsRef = useRef({ width: 0, height: 0, dpr: 0 });

  const createTextMask = useCallback(
    (width: number, height: number, dpr: number) => {
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!maskCtx) {
        return null;
      }

      // Draw text on mask canvas
      if (text) {
        maskCtx.save();
        maskCtx.scale(dpr, dpr);
        maskCtx.fillStyle = 'white';
        maskCtx.font = `${fontWeight} ${fontSize}px "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        maskCtx.textAlign = 'center';
        maskCtx.textBaseline = 'middle';
        maskCtx.fillText(
          text,
          width / (2 * dpr),
          height / (2 * dpr) + textOffsetY,
        );
        maskCtx.restore();
      }

      // Get the full image data once
      return maskCtx.getImageData(0, 0, width, height).data;
    },
    [text, fontSize, fontWeight, textOffsetY],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      // Only recreate mask if dimensions or text changed
      const maskParams = textMaskParamsRef.current;
      if (
        !textMaskRef.current ||
        maskParams.width !== width ||
        maskParams.height !== height ||
        maskParams.dpr !== dpr
      ) {
        textMaskRef.current = createTextMask(width, height, dpr);
        textMaskParamsRef.current = { width, height, dpr };
      }

      const maskData = textMaskRef.current;
      const squareWidth = squareSize * dpr;
      const squareHeight = squareSize * dpr;

      // Draw flickering squares with optimized RGBA colors
      for (let i = 0; i < cols; i++) {
        const x = i * (squareSize + gridGap) * dpr;
        for (let j = 0; j < rows; j++) {
          const y = j * (squareSize + gridGap) * dpr;

          // Check if this square intersects with text by sampling the mask
          let hasText = false;
          if (maskData && text) {
            const centerX = Math.floor(x + squareWidth / 2);
            const centerY = Math.floor(y + squareHeight / 2);
            const pixelIndex = (centerY * width + centerX) * 4;
            hasText = (maskData[pixelIndex] ?? 0) > 0;
          }

          const opacity = squares[i * rows + j];
          const finalOpacity = hasText
            ? Math.min(1, (opacity ?? 0) * 3 + 0.4)
            : opacity;

          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity ?? 0);
          ctx.fillRect(x, y, squareWidth, squareHeight);
        }
      }
    },
    [memoizedColor, squareSize, gridGap, text, createTextMask],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.ceil(width / (squareSize + gridGap));
      const rows = Math.ceil(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!(canvas && container)) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    let frameCount = 0;
    const TARGET_FPS = 30; // Reduce FPS for better performance
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const animate = (time: number) => {
      if (!isInView) {
        return;
      }

      const deltaTime = time - lastTime;

      // Throttle to target FPS
      if (deltaTime < FRAME_INTERVAL) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      lastTime = time - (deltaTime % FRAME_INTERVAL);
      frameCount++;

      // Update squares every frame
      updateSquares(gridParams.squares, deltaTime / 1000);

      // Draw every frame
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    // Debounce resize updates for better performance
    let resizeTimeout: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCanvasSize();
      }, 100);
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      className={cn(`h-full w-full ${className}`)}
      ref={containerRef}
      {...props}
    >
      <canvas
        className="pointer-events-none"
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};
