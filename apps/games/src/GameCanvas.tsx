import React, { useEffect, useRef } from "react";

type Props = {
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  aspectRatio?: number;     // e.g. 16/9, 4/3
  className?: string;
};

export default function GameCanvas({ draw, aspectRatio = 16 / 9, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>();

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const blockTouch = (e: TouchEvent) => { if (e.target === canvas) e.preventDefault(); };
    document.addEventListener("touchmove", blockTouch, { passive: false });

    // Resize with devicePixelRatio using actual CSS size from getBoundingClientRect
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(rect.width * DPR);
      canvas.height = Math.floor(rect.height * DPR);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const start = performance.now();
    const loop = (t: number) => {
      draw(ctx, (t - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      ro.disconnect();
      document.removeEventListener("touchmove", blockTouch);
    };
  }, [draw]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: "100%",
        maxWidth: 900,
        aspectRatio,               // ✅ perfect frame
        borderRadius: 14,
        border: "2px solid #79ffe1",
        overflow: "hidden",
        position: "relative",
        background: "#0b1224",     // panel bg (so draw me border ki jarurat nahi)
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,               // fill container exactly
          display: "block",
        }}
      />
    </div>
  );
}
