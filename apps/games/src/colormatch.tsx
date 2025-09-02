import React, { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type ColorDef = { name: string; hex: string };

const COLORS: ColorDef[] = [
  { name: "RED", hex: "#ff4d4f" },
  { name: "GREEN", hex: "#2ecc71" },
  { name: "BLUE", hex: "#3498db" },
  { name: "YELLOW", hex: "#f1c40f" },
];

type Props = { onEnd?: (score: number) => void };

export default function ColorMatch({ onEnd }: Props) {
  const [time, setTime] = useState<number>(60);
  const [score, setScore] = useState<number>(0);

  const target = useRef<ColorDef>({ name: "RED", hex: "#ff4d4f" });
  const wordColor = useRef<string>("#ff4d4f");
  const buttons = useRef<ColorDef[]>([]);

  const reshuffle = useCallback(() => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
    target.current = word;
    wordColor.current = color;
    buttons.current = [...COLORS].sort(() => Math.random() - 0.5);
  }, []);

  // timer
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

      // target word
      ctx.fillStyle = wordColor.current;
      ctx.font = "48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(target.current.name, width / 2, height / 3);

      // answer buttons
      ctx.textAlign = "center";
      ctx.font = "24px sans-serif";
      buttons.current.forEach((b, i) => {
        ctx.fillStyle = b.hex;
        ctx.fillText(b.name, width / 2, height / 2 + i * 40);
      });

      // HUD
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${score}`, 16, 28);
      ctx.textAlign = "right";
      ctx.fillText(`Time: ${time}`, width - 16, 28);
      ctx.textAlign = "start";
    },
    [time, score]
  );

  // input handler
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p =
        "touches" in ev
          ? (ev as TouchEvent).changedTouches[0] || (ev as TouchEvent).touches[0]
          : (ev as MouseEvent);
      if (!p) return;
      const y = p.clientY - rect.top;
      const choiceIndex = Math.floor((y - rect.height / 2) / 40);
      const btn = buttons.current[choiceIndex];
      if (btn) {
        if (btn.hex === wordColor.current) {
          setScore((s) => s + 1);
        } else {
          setScore((s) => Math.max(0, s - 1));
        }
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
