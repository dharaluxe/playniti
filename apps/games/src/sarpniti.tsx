import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

/**
 * Sarp Niti – Snake (60s), keyboard + swipe controls, seeded RNG
 * - Arrow keys / WASD
 * - Swipe on mobile
 * - 60s timer; apple = +1 score; self/wall hit = small penalty + shrink (keeps you playing)
 * - Deterministic apples via seed (if provided)
 */

type Props = { seed?: string; onEnd?: (score: number) => void };

type Vec = { x: number; y: number };

// tiny seeded PRNG (mulberry32)
function hashSeed(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 123456789;
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Sarpniti({ seed = "playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);

  // world/grid config (fixed logical grid; canvas scales)
  const GRID = { cols: 28, rows: 16 }; // ~16:9
  const STEP_MS = 120; // snake speed
  const CELL_PAD = 2;

  // PRNG
  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  // game refs (not causing re-renders)
  const dirRef = useRef<Vec>({ x: 1, y: 0 });
  const nextDirRef = useRef<Vec>({ x: 1, y: 0 });
  const snakeRef = useRef<Vec[]>([
    { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 },
  ]);
  const appleRef = useRef<Vec>({ x: 12, y: 8 });
  const accMs = useRef(0);
  const ended = useRef(false);

  // place apple at empty cell
  const placeApple = useCallback(() => {
    while (true) {
      const x = Math.floor(rand() * GRID.cols);
      const y = Math.floor(rand() * GRID.rows);
      if (!snakeRef.current.some(s => s.x === x && s.y === y)) {
        appleRef.current = { x, y };
        return;
      }
    }
  }, [GRID.cols, GRID.rows, rand]);

  // countdown
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!ended.current) { ended.current = true; onEnd?.(score); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  // controls: keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const d = nextDirRef.current;
      if (k === "arrowup" || k === "w")      { if (d.y !== 1)  nextDirRef.current = { x: 0, y: -1 }; }
      else if (k === "arrowdown" || k === "s"){ if (d.y !== -1) nextDirRef.current = { x: 0, y: 1 }; }
      else if (k === "arrowleft" || k === "a"){ if (d.x !== 1)  nextDirRef.current = { x: -1, y: 0 }; }
      else if (k === "arrowright" || k === "d"){ if (d.x !== -1) nextDirRef.current = { x: 1, y: 0 }; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // controls: swipe
  const swipeRef = useRef<{x:number;y:number}|null>(null);
  const swipeBind = useCallback((root: HTMLElement | null) => {
    if (!root) return;
    const start = (e: TouchEvent) => {
      const t = e.touches[0]; swipeRef.current = { x: t.clientX, y: t.clientY };
    };
    const end = (e: TouchEvent) => {
      if (!swipeRef.current) return;
      const t = (e.changedTouches && e.changedTouches[0]) || e.touches[0];
      if (!t) return;
      const dx = t.clientX - swipeRef.current.x;
      const dy = t.clientY - swipeRef.current.y;
      swipeRef.current = null;
      const d = nextDirRef.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 10 && d.x !== -1) nextDirRef.current = { x: 1, y: 0 };
        else if (dx < -10 && d.x !== 1) nextDirRef.current = { x: -1, y: 0 };
      } else {
        if (dy > 10 && d.y !== -1) nextDirRef.current = { x: 0, y: 1 };
        else if (dy < -10 && d.y !== 1) nextDirRef.current = { x: 0, y: -1 };
      }
    };
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchend", end, { passive: true });
    return () => {
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchend", end);
    };
  }, []);

  // game step update
  const step = useCallback(() => {
    // apply buffered dir (1 turn per step)
    dirRef.current = nextDirRef.current;

    const head = snakeRef.current[0];
    const nx = head.x + dirRef.current.x;
    const ny = head.y + dirRef.current.y;

    // wall / self: penalty + shrink instead of hard reset
    const hitWall = nx < 0 || ny < 0 || nx >= GRID.cols || ny >= GRID.rows;
    const hitSelf = snakeRef.current.some((s, i) => i > 0 && s.x === nx && s.y === ny);

    if (hitWall || hitSelf) {
      // remove last 2 segments if possible (soft punishment)
      snakeRef.current = snakeRef.current.slice(0, Math.max(2, snakeRef.current.length - 2));
      setScore((s) => Math.max(0, s - 1));
      // bounce direction (simple)
      if (hitWall) {
        if (nx < 0 || nx >= GRID.cols) nextDirRef.current = { x: -dirRef.current.x, y: dirRef.current.y };
        if (ny < 0 || ny >= GRID.rows) nextDirRef.current = { x: dirRef.current.x, y: -dirRef.current.y };
      } else {
        // self-hit → rotate right
        nextDirRef.current = { x: -dirRef.current.y, y: dirRef.current.x };
      }
      dirRef.current = nextDirRef.current;
    } else {
      // normal move
      snakeRef.current = [{ x: nx, y: ny }, ...snakeRef.current];
      // apple?
      if (nx === appleRef.current.x && ny === appleRef.current.y) {
        setScore((s) => s + 1);
        placeApple();
      } else {
        snakeRef.current.pop();
      }
    }
  }, [GRID.cols, GRID.rows, placeApple]);

  // draw frame
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const W = ctx.canvas.width;  // device px
    const H = ctx.canvas.height;
    // convert to CSS logical pixels via current transform (we set transform to DPR in GameCanvas)
    const { a } = ctx.getTransform(); // a = DPR
    const width = Math.round(W / a);
    const height = Math.round(H / a);

    // cell size (fit to smallest side)
    const cell = Math.floor(Math.min(width / GRID.cols, height / GRID.rows));

    // advance accumulator
    accMs.current += (t - (draw as any)._lastT || 0) * 1000;
    (draw as any)._lastT = t;
    while (accMs.current >= STEP_MS) {
      step();
      accMs.current -= STEP_MS;
    }

    // clear
    ctx.fillStyle = "#0b1224";
    ctx.fillRect(0, 0, width, height);

    // subtle grid
    ctx.strokeStyle = "rgba(120,150,220,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID.cols; x++) {
      const px = Math.floor(x * cell) + 0.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, GRID.rows * cell); ctx.stroke();
    }
    for (let y = 0; y <= GRID.rows; y++) {
      const py = Math.floor(y * cell) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(GRID.cols * cell, py); ctx.stroke();
    }

    // apple
    ctx.fillStyle = "#ff4d4f";
    const ax = appleRef.current.x * cell + CELL_PAD;
    const ay = appleRef.current.y * cell + CELL_PAD;
    ctx.beginPath();
    ctx.roundRect(ax, ay, cell - CELL_PAD * 2, cell - CELL_PAD * 2, 6);
    ctx.fill();

    // snake
    ctx.fillStyle = "#7cf6a2";
    snakeRef.current.forEach((s, i) => {
      const sx = s.x * cell + CELL_PAD;
      const sy = s.y * cell + CELL_PAD;
      const r = i === 0 ? 8 : 4;
      ctx.beginPath();
      ctx.roundRect(sx, sy, cell - CELL_PAD * 2, cell - CELL_PAD * 2, r);
      ctx.fill();
    });

    // HUD
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);
  }, [GRID.cols, GRID.rows, STEP_MS, score, time, step]);

  // mount: first apple randomized away from snake
  useEffect(() => { placeApple(); }, [placeApple]);

  // wrapper so we can attach swipe listeners cleanly
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => swipeBind(wrapRef.current), [swipeBind]);

  return (
    <div ref={wrapRef}>
      {/* perfect frame; same GameCanvas as before */}
      <GameCanvas draw={draw} aspectRatio={16 / 9} />
    </div>
  );
}
