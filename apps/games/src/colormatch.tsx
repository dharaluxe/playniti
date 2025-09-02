import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { seed?: string; onEnd?: (score: number) => void };

function hashSeed(s: string){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19);} return (h>>>0)||123456789; }
function mulberry32(a:number){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }

const COLORS = [
  { name: "RED",    hex: "#ff4d4f" },
  { name: "GREEN",  hex: "#2ecc71" },
  { name: "BLUE",   hex: "#3498db" },
  { name: "YELLOW", hex: "#f1c40f" },
  { name: "PURPLE", hex: "#9b59b6" },
  { name: "CYAN",   hex: "#1abc9c" },
];

export default function ColorMatch({ seed="playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  type Bubble = { x:number;y:number;r:number; color:number };
  const bubbles = useRef<Bubble[]>([]);
  const target = useRef<number>(0);

  // make puzzle
  const reshuffle = useCallback((width:number, height:number) => {
    target.current = Math.floor(rand() * COLORS.length);
    const r = Math.min(width, height) / 9;
    const cx = [width*0.25, width*0.5, width*0.75, width*0.25, width*0.5, width*0.75];
    const cy = [height*0.35, height*0.35, height*0.35, height*0.70, height*0.70, height*0.70];
    // pick 4 unique colors (ensure target included)
    const chosen = new Set<number>([target.current]);
    while (chosen.size < 4) chosen.add(Math.floor(rand() * COLORS.length));
    const arr = Array.from(chosen);
    // place four bubbles
    bubbles.current = arr.map((c,i)=>({ x: cx[i], y: cy[i], r, color: c }));
  }, [rand]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(id); onEnd?.(score); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  // click/tap handling
  const wrapRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p = "touches" in ev ? ev.touches[0] || (ev as TouchEvent).changedTouches[0] : (ev as MouseEvent);
      const x = p.clientX - rect.left, y = p.clientY - rect.top;
      for (const b of bubbles.current) {
        const dx = x - b.x, dy = y - b.y;
        if (dx*dx + dy*dy <= b.r*b.r) {
          if (b.color === target.current) setScore(s=>s+1);
          else setScore(s=>Math.max(0,s-1));
          reshuffle(rect.width, rect.height);
          break;
        }
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

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const DPR = ctx.getTransform().a||1;
    const width = Math.round(ctx.canvas.width / DPR);
    const height = Math.round(ctx.canvas.height / DPR);

    if (bubbles.current.length === 0) reshuffle(width, height);

    // bg
    ctx.fillStyle="#0b1224"; ctx.fillRect(0,0,width,height);

    // HUD
    ctx.fillStyle="#fff"; ctx.font="20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);

    // target label
    const tgt = COLORS[target.current];
    ctx.font="22px ui-sans-serif, system-ui";
    ctx.fillStyle="#A8C5FF";
    ctx.fillText("Tap color:", width/2 - 60, 28);
    ctx.fillStyle=tgt.hex;
    ctx.fillText(tgt.name, width/2 + 30, 28);

    // bubbles
    bubbles.current.forEach(b=>{
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = COLORS[b.color].hex; ctx.fill();
      ctx.lineWidth=4; ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.stroke();
    });

    if (time<=0) {
      ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#fff"; ctx.textAlign="center";
      ctx.font="28px ui-sans-serif, system-ui"; ctx.fillText("Time up!", width/2, height/2-8);
      ctx.font="18px ui-sans-serif, system-ui"; ctx.fillText(`Final Score: ${score}`, width/2, height/2+20);
      ctx.textAlign="start";
    }
  }, [score, time, reshuffle]);

  return <div ref={wrapRef}><GameCanvas draw={draw} aspectRatio={16/9} /></div>;
}
