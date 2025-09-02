import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { seed?: string; onEnd?: (score: number) => void };

function hashSeed(s: string){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19);} return (h>>>0)||123456789; }
function mulberry32(a:number){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }

export default function Whackmole({ seed="playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  const grid = { cols: 3, rows: 4, pad: 24 };
  const active = useRef<{ idx:number; life:number }[]>([]);
  const lastW = useRef(0), lastH = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(id); onEnd?.(score); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  const cellRects = useRef<{x:number;y:number;w:number;h:number;cx:number;cy:number;r:number}[]>([]);
  const computeGrid = (width:number, height:number) => {
    const W = width - grid.pad*2, H = height - grid.pad*2;
    const cw = W / grid.cols, ch = H / grid.rows;
    const r = Math.min(cw, ch) * 0.28;
    const arr = [];
    for (let rI=0;rI<grid.rows;rI++){
      for (let cI=0;cI<grid.cols;cI++){
        const x = grid.pad + cI*cw, y = grid.pad + rI*ch;
        arr.push({ x, y, w:cw, h:ch, cx: x + cw/2, cy: y + ch/2, r });
      }
    }
    cellRects.current = arr;
  };

  const spawn = useCallback(() => {
    // limit max 3 moles
    if (active.current.length >= 3) return;
    const idx = Math.floor(rand() * cellRects.current.length);
    // avoid same index duplicates
    if (active.current.some(a=>a.idx===idx)) return;
    active.current.push({ idx, life: 0.9 + rand()*0.9 });
  }, [rand]);

  const wrapRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p = "touches" in ev ? ev.touches[0] || (ev as TouchEvent).changedTouches[0] : (ev as MouseEvent);
      const x = p.clientX - rect.left, y = p.clientY - rect.top;
      for (let i=active.current.length-1;i>=0;i--){
        const a = active.current[i];
        const c = cellRects.current[a.idx];
        const dx=x-c.cx, dy=y-c.cy;
        if (dx*dx + dy*dy <= (c.r+10)*(c.r+10)) {
          active.current.splice(i,1);
          setScore(s=>s+1);
          break;
        }
      }
    };
    const el = wrapRef.current!;
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onClick, { passive: true });
    return () => { el.removeEventListener("click", onClick); el.removeEventListener("touchstart", onClick); };
  }, [time]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t:number) => {
    const DPR = ctx.getTransform().a||1;
    const width = Math.round(ctx.canvas.width / DPR);
    const height = Math.round(ctx.canvas.height / DPR);

    if (width !== lastW.current || height !== lastH.current) {
      lastW.current = width; lastH.current = height; computeGrid(width, height);
    }

    const dt = (t - (draw as any)._lastT || 0);
    (draw as any)._lastT = t;

    if (time > 0) {
      // tick existing
      active.current.forEach(a => a.life -= dt);
      const missed = active.current.filter(a => a.life <= 0).length;
      if (missed) setScore(s=>Math.max(0, s - missed));
      active.current = active.current.filter(a => a.life > 0);

      // probabilistic spawn
      if (rand() < 0.04) spawn();
      if (active.current.length === 0) spawn();
    }

    // bg
    ctx.fillStyle="#0b1224"; ctx.fillRect(0,0,width,height);

    // holes
    cellRects.current.forEach(c=>{
      ctx.fillStyle="rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(Math.round(c.x)+0.5, Math.round(c.y)+0.5, Math.round(c.w)-1, Math.round(c.h)-1, 12); ctx.fill();
    });

    // moles
    active.current.forEach(a=>{
      const c = cellRects.current[a.idx];
      const p = Math.max(0, Math.min(1, a.life / 1.8));
      const R = c.r * (0.8 + 0.2*p);
      // body
      ctx.beginPath(); ctx.arc(c.cx, c.cy, R, 0, Math.PI*2);
      ctx.fillStyle="#7cf6a2"; ctx.fill();
      // eyes
      ctx.fillStyle="#0b1224"; ctx.beginPath(); ctx.arc(c.cx-6, c.cy-4, 3, 0, Math.PI*2); ctx.arc(c.cx+6, c.cy-4, 3, 0, Math.PI*2); ctx.fill();
    });

    // HUD
    ctx.fillStyle="#fff"; ctx.font="20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);

    if (time<=0) {
      ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#fff"; ctx.textAlign="center";
      ctx.font="28px ui-sans-serif, system-ui"; ctx.fillText("Time up!", width/2, height/2-8);
      ctx.font="18px ui-sans-serif, system-ui"; ctx.fillText(`Final Score: ${score}`, width/2, height/2+20);
      ctx.textAlign="start";
    }
  }, [time, score, spawn]);

  return <div ref={wrapRef}><GameCanvas draw={draw} aspectRatio={16/9} /></div>;
}
