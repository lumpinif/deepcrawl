'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import React, { useEffect, useState } from 'react';

type Vector3 = [number, number, number];
type VertexIndex = 0 | 1 | 2 | 3 | 4;
type FaceId = 0 | 1 | 2 | 3;
type FaceBufferValue = FaceId | -1 | -2;
type AxisChoice = 'x' | 'y' | 'z';

const W = 80;
const H = 40;

const FACE_IDS: FaceId[] = [0, 1, 2, 3];

const faceSymbol: Record<FaceId, string> = {
  0: '@',
  1: '#',
  2: '$',
  3: '*',
};

const faceColor: Record<FaceId, string> = {
  0: '#e53935',
  1: '#43a047',
  2: '#fbc02d',
  3: '#1e88e5',
};

const SCALE = 2;
const DESIRED_DIST = 4.5;

const V: Record<VertexIndex, Vector3> = {
  0: [0, SCALE, 0],
  1: [-SCALE, -SCALE, -SCALE],
  2: [SCALE, -SCALE, -SCALE],
  3: [SCALE, -SCALE, SCALE],
  4: [-SCALE, -SCALE, SCALE],
};

const F: Record<FaceId, [VertexIndex, VertexIndex, VertexIndex]> = {
  0: [0, 1, 2],
  1: [0, 2, 3],
  2: [0, 3, 4],
  3: [0, 4, 1],
};

const DU = 0.01;
const DV = 0.01;

const EDGE_LIST: Array<[VertexIndex, VertexIndex]> = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
];

const sub3 = (a: Vector3, b: Vector3): Vector3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

const cross3 = (a: Vector3, b: Vector3): Vector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const norm3 = (v: Vector3): Vector3 => {
  const r = Math.hypot(v[0], v[1], v[2]);
  if (r === 0) {
    return [0, 0, 0];
  }
  return [v[0] / r, v[1] / r, v[2] / r];
};

export default function PyramidAnimation({
  wireframe = false,
  color = true,
  speed = 0.03,
  axis = 'y',
  edges = true,
  className,
}: {
  wireframe?: boolean;
  color?: boolean;
  speed?: number;
  axis?: AxisChoice;
  edges?: boolean;
  className?: string;
}) {
  const [frame, setFrame] = useState<React.ReactElement[]>([]);
  const [theta, setTheta] = useState(0);

  useEffect(() => {
    const renderFrame = () => {
      const faceBuf = new Array<FaceBufferValue>(W * H).fill(
        -1 as FaceBufferValue,
      );
      const lumBuf = new Array<number>(W * H).fill(0);
      const zBuf = new Array<number>(W * H).fill(0);

      const centroidModel: Vector3 = [0, 0, 0];
      for (const vertex of Object.values(V)) {
        centroidModel[0] += vertex[0];
        centroidModel[1] += vertex[1];
        centroidModel[2] += vertex[2];
      }
      centroidModel[0] *= 0.2;
      centroidModel[1] *= 0.2;
      centroidModel[2] *= 0.2;

      const fnorm: Record<FaceId, Vector3> = {
        0: [0, 0, 0],
        1: [0, 0, 0],
        2: [0, 0, 0],
        3: [0, 0, 0],
      };
      for (const faceId of FACE_IDS) {
        const [i0, i1, i2] = F[faceId];
        const e1 = sub3(V[i1], V[i0]);
        const e2 = sub3(V[i2], V[i0]);
        fnorm[faceId] = norm3(cross3(e1, e2));
      }

      const light = norm3([0, 1, -1] as Vector3);

      let c = 1;
      let s = 0;
      if (axis === 'y') {
        c = Math.cos(theta);
        s = Math.sin(theta);
      } else if (axis === 'x') {
        c = Math.cos(theta);
        s = Math.sin(theta);
      } else if (axis === 'z') {
        c = Math.cos(theta);
        s = Math.sin(theta);
      }

      const cz = -centroidModel[0] * s + centroidModel[2] * c;
      const offset = DESIRED_DIST - cz;

      const X_SCALE = 36;
      const Y_SCALE = 18;
      const Y_OFFSET = -4;

      if (!wireframe) {
        for (const faceId of FACE_IDS) {
          const [i0, i1, i2] = F[faceId];
          const v0 = V[i0];
          const v1 = V[i1];
          const v2 = V[i2];
          for (let u = 0; u <= 1; u += DU) {
            for (let v = 0; u + v <= 1; v += DV) {
              const w = 1 - u - v;
              const x = w * v0[0] + u * v1[0] + v * v2[0];
              const y = w * v0[1] + u * v1[1] + v * v2[1];
              const z = w * v0[2] + u * v1[2] + v * v2[2];

              let x2 = x;
              let y2 = y;
              let z2 = z;
              if (axis === 'y') {
                x2 = x * c + z * s;
                z2 = -x * s + z * c;
              } else if (axis === 'x') {
                y2 = y * c - z * s;
                z2 = y * s + z * c;
              } else if (axis === 'z') {
                x2 = x * c - y * s;
                y2 = x * s + y * c;
              }

              const z2Translated = z2 + offset;
              if (z2Translated <= 0) {
                continue;
              }
              const invz = 1 / z2Translated;

              const px = Math.floor(W / 2 + X_SCALE * x2 * invz);
              const py = Math.floor(H / 2 - Y_SCALE * y2 * invz + Y_OFFSET);
              if (px < 0 || px >= W || py < 0 || py >= H) {
                continue;
              }
              const idx = px + py * W;

              const currentZ = zBuf[idx] ?? 0;
              if (invz <= currentZ) {
                continue;
              }
              zBuf[idx] = invz;

              const normal = fnorm[faceId];
              let nx = normal[0];
              let ny = normal[1];
              let nz = normal[2];
              if (axis === 'y') {
                nx = normal[0] * c + normal[2] * s;
                nz = -normal[0] * s + normal[2] * c;
              } else if (axis === 'x') {
                ny = normal[1] * c - normal[2] * s;
                nz = normal[1] * s + normal[2] * c;
              } else if (axis === 'z') {
                nx = normal[0] * c - normal[1] * s;
                ny = normal[0] * s + normal[1] * c;
              }
              let L = nx * light[0] + ny * light[1] + nz * light[2];
              if (L < 0) {
                L = 0;
              }
              lumBuf[idx] = L;
              faceBuf[idx] = faceId;
            }
          }
        }
      }

      if (edges) {
        for (const [a, b] of EDGE_LIST) {
          const [x0, y0, z0] = V[a];
          const [x1, y1, z1] = V[b];
          for (let t = 0; t <= 1; t += 0.002) {
            const x = x0 + (x1 - x0) * t;
            const y = y0 + (y1 - y0) * t;
            const z = z0 + (z1 - z0) * t;
            let x2 = x;
            let y2 = y;
            let z2 = z;
            if (axis === 'y') {
              x2 = x * c + z * s;
              z2 = -x * s + z * c;
            } else if (axis === 'x') {
              y2 = y * c - z * s;
              z2 = y * s + z * c;
            } else if (axis === 'z') {
              x2 = x * c - y * s;
              y2 = x * s + y * c;
            }
            const z2Translated = z2 + offset;
            if (z2Translated <= 0) {
              continue;
            }
            const invz = 1 / z2Translated;
            const px = Math.floor(W / 2 + X_SCALE * x2 * invz);
            const py = Math.floor(H / 2 - Y_SCALE * y2 * invz - 4);
            if (px < 0 || px >= W || py < 0 || py >= H) {
              continue;
            }
            const idx = px + py * W;
            const currentZ = zBuf[idx] ?? 0;
            if (invz > currentZ) {
              zBuf[idx] = invz + 1e-6;
              faceBuf[idx] = -2;
            }
          }
        }
      }

      const frameLines: React.ReactElement[] = [];
      for (let y = 0; y < H; y++) {
        const line: React.ReactElement[] = [];
        for (let x = 0; x < W; x++) {
          const i = x + y * W;
          const faceValue = faceBuf[i] ?? -1;
          if (faceValue === -2) {
            line.push(
              <span key={x} style={{ color: '#fff', fontWeight: 'bold' }}>
                +
              </span>,
            );
          } else if (faceValue === -1) {
            line.push(<span key={x}> </span>);
          } else {
            const L = lumBuf[i] ?? 0;
            const colorVal = color ? faceColor[faceValue] : '#fff';
            const fontWeight = L > 0.6 ? 'bold' : 'normal';
            line.push(
              <span key={x} style={{ color: colorVal, fontWeight }}>
                {faceSymbol[faceValue]}
              </span>,
            );
          }
        }
        frameLines.push(<div key={y}>{line}</div>);
      }
      setFrame(frameLines);
    };

    const interval = setInterval(() => {
      setTheta((prev) => prev + speed);
      renderFrame();
    }, 30);

    return () => clearInterval(interval);
  }, [theta, wireframe, color, speed, axis, edges]);

  return (
    <pre
      className={cn(
        'select-none whitespace-pre text-center font-mono text-xs leading-none',
        className,
      )}
    >
      {frame}
    </pre>
  );
}
