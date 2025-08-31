import React, { useCallback } from "react";
import GameCanvas from "./GameCanvas";

export default function Sarpniti() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = "#0b1224"; ctx.fillRect(0, 0, width, height);       // bg
    const x = (Math.sin(t) * 0.45 + 0.5) * (width - 120);               // moving square
    const y = (Math.cos(t * 0.8) * 0.45 + 0.5) * (height - 120);
    ctx.fillStyle = "#ff4d4f"; ctx.fillRect(x, y, 120, 120);
    ctx.strokeStyle = "#79ffe1"; ctx.lineWidth = 4; ctx.strokeRect(2,2,width-4,height-4); // border
  }, []);
  return <GameCanvas draw={draw} />;
}
