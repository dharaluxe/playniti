import React, { useEffect, useRef } from "react";

type Props = {
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  className?: string;
};

export default function GameCanvas({ draw, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ✅ Disable scrolling / pull-to-refresh on mobile while touching canvas
    const blockTouch = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", blockTouch, { passive: false });

    // Resize canvas to parent container
    const resize = () => {
      const DPR = Math.max(1, window.devicePixelRatio || 1);
      const parent = canvas.parentElement;
      const w = Math.round(parent?.clientWidth ?? 640);
      const h = Math.round(Math.max(360, w * 0.56));
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const loop = (t: number) => {
      draw(ctx, (t - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("touchmove", blockTouch);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [draw]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 900,
        borderRadius: 12,
        overflow: "hidden",
        touchAction: "none", // ✅ Prevent default browser gestures
      }}
    >
      <canvas ref={ref} />
    </div>
  );
}
