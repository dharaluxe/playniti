import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

const COLORS = [
  { name: "RED", hex: "#ff4d4f" },
  { name: "GREEN", hex: "#2ecc71" },
  { name: "BLUE", hex: "#3498db" },
  { name: "YELLOW", hex: "#f1c40f" },
];

export default function ColorMatch({ onEnd }: { onEnd?: (score: number) => void }) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);

  const target = useRef<{ word: string; color: string }>({ word: "RED", color: "#ff4d4f" });
  const buttons = useRef<{ word: string; color: string }[]>([]);

  const reshuffle = useCallback(() => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)].name;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
    target.current = { word, color };
    buttons.current = COLORS.sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    reshuffle();
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
  }, [onEnd, score, reshuffle]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const DPR = ctx.getTransform().a || 1;
      const width = ctx.canvas.width / DPR;
      const height = ctx.canvas.height / DPR;

      ctx.fillStyle = "#0b1224";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = target.current.color;
      ctx.font = "48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(target.current.word, width / 2, height / 3);

      ctx.textAlign = "center";
      ctx.font = "24px sans-serif";
      buttons.current.forEach((b, i) => {
        ctx.fillStyle = b.hex;
        ctx.fillText(b.name, width / 2, height / 2 + i * 40);
      });

      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`Score: ${score}`, 80, 40);
      ctx.fillText(`Time: ${time}`, width - 100, 40);
    },
    [time, score]
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
      const y = p.clientY - rect.top;
      const choice = Math.floor((y - rect.height / 2) / 40);
      const btn = buttons.current[choice];
      if (btn) {
        if (btn.hex === target.current.color) setScore((s) => s + 1);
        else setScore((s) => Math.max(0, s - 1));
        reshuffle();
      }
    };
    const el = wrapRef.current!;
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onClick, { passive: true });
    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchstart", onClick);
    };
  }, [time, reshuffle]);

  return (
    <div ref={wrapRef}>
      <GameCanvas draw={draw} aspectRatio={9 / 16} />
    </div>
  );
}
