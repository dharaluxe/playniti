import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { onEnd?: (score: number) => void };

export default function Whackmole({ onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const grid = { cols: 3, rows: 3 };
  const active = useRef<{ idx: number; life: number; popped: boolean }[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          onEnd?.(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, t: number) => {
      const DPR = ctx.getTransform().a || 1;
      const width = ctx.canvas.width / DPR;
      const height = ctx.canvas.height / DPR;
      const cellW = width / grid.cols;
      const cellH = height / grid.rows;

      // spawn new mole randomly
      if (time > 0 && active.current.length < 3 && Math.random() < 0.04) {
        const idx = Math.floor(Math.random() * grid.cols * grid.rows);
        if (!active.current.find((a) => a.idx === idx)) {
          active.current.push({ idx, life: 1.5, popped: false });
        }
      }

      // tick
      active.current.forEach((a) => (a.life -= 0.016));
      active.current = active.current.filter((a) => a.life > 0);

      ctx.fillStyle = "#0b1224";
      ctx.fillRect(0, 0, width, height);

      // draw grid holes
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          ctx.fillRect(x + 6, y + 6, cellW - 12, cellH - 12);
        }
      }

      // draw moles
      active.current.forEach((a) => {
        const r = Math.floor(a.idx / grid.cols);
        const c = a.idx % grid.cols;
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;
        const scale = Math.min(1, Math.max(0, 1 - (1.5 - a.life)));
        const radius = (cellW / 3) * scale;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#7cf6a2";
        ctx.fill();
      });

      // HUD
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`Score: ${score}`, 16, 28);
      ctx.fillText(`Time: ${time}`, 16, 56);
      ctx.fillText(`Streak: ${streak}`, 16, 84);

      if (time <= 0) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "28px sans-serif";
        ctx.fillText("Time up!", width / 2, height / 2 - 8);
        ctx.font = "18px sans-serif";
        ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 20);
        ctx.textAlign = "start";
      }
    },
    [time, score, streak]
  );

  const handleHit = useCallback(
    (x: number, y: number, rect: DOMRect) => {
      const cellW = rect.width / grid.cols;
      const cellH = rect.height / grid.rows;
      const c = Math.floor(x / cellW);
      const r = Math.floor(y / cellH);
      const idx = r * grid.cols + c;

      const target = active.current.find((a) => a.idx === idx);
      if (target) {
        active.current = active.current.filter((a) => a !== target);
        setScore((s) => s + 1 + streak * 0.5); // streak bonus
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [streak]
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p =
        "touches" in ev
          ? ev.touches[0] || (ev as TouchEvent).changedTouches[0]
          : (ev as MouseEvent);
      handleHit(p.clientX - rect.left, p.clientY - rect.top, rect);
    };
    const el = wrapRef.current!;
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onClick, { passive: true });
    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchstart", onClick);
    };
  }, [time, handleHit]);

  return (
    <div ref={wrapRef}>
      <GameCanvas draw={draw} aspectRatio={1} />
    </div>
  );
}
