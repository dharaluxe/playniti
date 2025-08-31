import React, { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { onEnd?: (score: number) => void; seed?: string };

export default function Sarpniti({ onEnd }: Props) {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const ended = useRef(false);

  // 60s timer + onEnd callback
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

  // draw loop (simple smoke test visual)
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, t: number) => {
      const { width, height } = ctx.canvas;
      ctx.fillStyle = "#0b1224";
      ctx.fillRect(0, 0, width, height);

      // moving dot (snake head placeholder)
      const x = (Math.sin(t) * 0.4 + 0.5) * (width - 60) + 30;
      const y = (Math.cos(t * 0.8) * 0.4 + 0.5) * (height - 60) + 30;
      ctx.fillStyle = "#79ffe1";
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      // HUD
      ctx.fillStyle = "#fff";
      ctx.font = "20px ui-sans-serif, system-ui";
      ctx.fillText(`Score: ${score}`, 20, 30);
      ctx.fillText(`Time: ${time}`, 20, 60);
    },
    [score, time]
  );

  // tap/click to increase score
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
      <GameCanvas draw={draw} />
    </div>
  );
}
