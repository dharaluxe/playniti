import React, { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { onEnd?: (score: number) => void };

export default function Sarpniti({ onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const ended = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        const nt = t - 1;
        if (nt <= 0 && !ended.current) {
          ended.current = true;
          clearInterval(id);
          onEnd?.(score);
          return 0;
        }
        return nt;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const { width, height } = ctx.canvas;
    // clear bg (container already dark, but keep to avoid trails)
    ctx.fillStyle = "#0b1224";
    ctx.fillRect(0, 0, width, height);

    // moving target
    const x = (Math.sin(t) * 0.45 + 0.5) * (width - 120);
    const y = (Math.cos(t * 0.8) * 0.45 + 0.5) * (height - 120);
    ctx.fillStyle = "#ff4d4f";
    ctx.fillRect(x, y, 120, 120);

    // HUD (top-left)
    ctx.fillStyle = "#fff";
    ctx.font = "20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);
  }, [score, time]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const inc = () => setScore((s) => s + 1);
    el.addEventListener("click", inc);
    el.addEventListener("touchstart", inc, { passive: true });
    return () => {
      el.removeEventListener("click", inc);
      el.removeEventListener("touchstart", inc);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* aspectRatio prop se frame control: 16/9 ya 4/3 try kar sakte ho */}
      <GameCanvas draw={draw} aspectRatio={16 / 9} />
    </div>
  );
}
