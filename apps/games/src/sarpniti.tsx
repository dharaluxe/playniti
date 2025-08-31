import React, { useCallback, useRef, useEffect } from "react";
import GameCanvas from "./GameCanvas";

export default function Sarpniti() {
  const once = useRef(false);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const { width, height } = ctx.canvas;

    // 🔎 first frame: log canvas size (should be > 0)
    if (!once.current) {
      // eslint-disable-next-line no-console
      console.log("SARP canvas size:", { width, height, t });
      once.current = true;
    }

    // background
    ctx.save();
    ctx.fillStyle = "#0b1224";
    ctx.fillRect(0, 0, width, height);

    // cross-hair
    ctx.strokeStyle = "#384b81";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // center text
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px ui-sans-serif, system-ui, -apple-system";
    ctx.textAlign = "center";
    ctx.fillText("DRAW LOOP OK", width / 2, height / 2 - 40);

    // moving RED square (very obvious)
    const x = (Math.sin(t) * 0.45 + 0.5) * (width - 160);
    const y = (Math.cos(t * 0.8) * 0.45 + 0.5) * (height - 160);
    ctx.fillStyle = "rgb(255, 77, 79)";
    ctx.fillRect(x, y, 160, 160);

    // border to show canvas bounds
    ctx.strokeStyle = "#79ffe1";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    ctx.restore();
  }, []);

  return <GameCanvas draw={draw} />;
}
