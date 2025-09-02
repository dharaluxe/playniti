import React, { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { onEnd?: (score: number) => void };

export default function Whackmole({ onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // ✅ अब एक समय में सिर्फ 1 mole
  const MAX_CONCURRENT = 1;
  const MOLE_LIFE_SEC = 1.1;      // कितनी देर तक दिखे
  const COOLDOWN_MIN = 250;       // अगला mole कब तक न आए (ms)
  const COOLDOWN_MAX = 450;

  const grid = { cols: 3, rows: 3 };
  const active = useRef<{ idx: number; life: number }[]>([]);
  const nextAllowedAt = useRef<number>(0); // spawn cooldown

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
    (ctx: CanvasRenderingContext2D) => {
      const DPR = ctx.getTransform().a || 1;
      const width = ctx.canvas.width / DPR;
      const height = ctx.canvas.height / DPR;
      const cellW = width / grid.cols;
      const cellH = height / grid.rows;

      // ⏱️ life tick
      active.current.forEach((a) => (a.life -= 0.016));
      // miss penalty: jo mole expire ho gaya us पर streak reset
      const before = active.current.length;
      active.current = active.current.filter((a) => a.life > 0);
      if (before > 0 && active.current.length === 0 && time > 0) {
        // अगर time चल रहा था और miss हुआ, streak टूटेगी
        setStreak((s) => 0);
      }

      // 🟢 spawn logic: एक समय में सिर्फ 1, और cooldown के बाद ही
      const now = performance.now();
      if (
        time > 0 &&
        active.current.length < MAX_CONCURRENT &&
        now >= nextAllowedAt.current
      ) {
        const idx = Math.floor(Math.random() * grid.cols * grid.rows);
        active.current = [{ idx, life: MOLE_LIFE_SEC }]; // ensure single
        const cd = COOLDOWN_MIN + Math.random() * (COOLDOWN_MAX - COOLDOWN_MIN);
        nextAllowedAt.current = now + cd;
      }

      // bg
      ctx.fillStyle = "#0b1224";
      ctx.fillRect(0, 0, width, height);

      // holes
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          ctx.fillRect(x + 6, y + 6, cellW - 12, cellH - 12);
        }
      }

      // mole render (bounce-in / bounce-out)
      active.current.forEach((a) => {
        const r = Math.floor(a.idx / grid.cols);
        const c = a.idx % grid.cols;
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;
        const t = Math.min(1, Math.max(0, 1 - (MOLE_LIFE_SEC - a.life))); // 0→1
        const scale = t < 0.3 ? t / 0.3 : 1 - Math.max(0, t - 0.7) / 0.3;   // ease in/out
        const radius = (Math.min(cellW, cellH) / 3) * Math.max(0.001, scale);

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

  // 👆 tap to hit
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p =
        "touches" in ev
          ? ev.touches[0] || (ev as TouchEvent).changedTouches[0]
          : (ev as MouseEvent);
      const x = p.clientX - rect.left;
      const y = p.clientY - rect.top;
      const cellW = rect.width / grid.cols;
      const cellH = rect.height / grid.rows;
      const c = Math.floor(x / cellW);
      const r = Math.floor(y / cellH);
      const idx = r * grid.cols + c;

      const target = active.current[0];
      if (target && target.idx === idx) {
        active.current = []; // mole down
        setScore((s) => s + 1 + streak * 0.5);
        setStreak((s) => s + 1);
        // छोटा cooldown ताकि तुरंत अगला ना आजाए
        nextAllowedAt.current = performance.now() + 180;
      } else {
        setStreak(0);
      }
    };

    const el = wrapRef.current!;
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onClick, { passive: true });
    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchstart", onClick);
    };
  }, [time, streak]);

  return (
    <div ref={wrapRef}>
      <GameCanvas draw={draw} aspectRatio={1} />
    </div>
  );
}
