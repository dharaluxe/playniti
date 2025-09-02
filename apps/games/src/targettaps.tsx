import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { seed?: string; onEnd?: (score: number) => void };
type Target = { x:number;y:number;r:number; life:number; id:number };

function hashSeed(s: string){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19);} return (h>>>0)||123456789; }
function mulberry32(a:number){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }

export default function Targettaps({ seed="playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  const targets = useRef<Target[]>([]);
  const nextId = useRef(1);
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

  const spawn = useCallback((width:number, height:number) => {
    lastW.current = width; lastH.current = height;
    const r = 18 + Math.floor(rand()*16);
    const x = 40 + Math.floor(rand()*(width-80));
    const y = 80 + Math.floor(rand()*(height-120));
    targets.current.push({ x, y, r, life: 1.8 + rand()*1.2, id: nextId.current++ });
  }, [rand]);

  const wrapRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    const onClick = (ev: MouseEvent | TouchEvent) => {
      if (time <= 0) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const p = "touches" in ev ? ev.touches[0] || (ev as TouchEvent).changedTouches[0] : (ev as MouseEvent);
      const x = p.clientX - rect.left, y = p.clientY - rect.top;
      // find hit
      for (let i=targets.current.length-1;i>=0;i--){
        const t = targets.current[i], dx=x-t.x, dy=y-t.y;
        if (dx*dx + dy*dy <= (t.r+6)*(t.r+6)) {
          targets.current.splice(i,1);
          setScore(s=>s+1);
          spawn(rect.width, rect.height);
          break;
        }
      }
    };
    const el = wrapRef.current!;
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onClick, { passive: true });
    return () => { el.removeEventListener("click", onClick); el.removeEventListener("touchstart", onClick); };
  }, [time, spawn]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t:number) => {
    const DPR = ctx.getTransform().a||1;
    const width = Math.round(ctx.canvas.width / DPR);
    const height = Math.round(ctx.canvas.height / DPR);

    // spawn baseline
    if (targets.current.length < 4) spawn(width, height);

    // dt
    const dt = (t - (draw as any)._lastT || 0);
    (draw as any)._lastT = t;

    if (time > 0) {
      // tick lifetimes
      targets.current.forEach(tr => tr.life -= dt);
      // remove expired
      const before = targets.current.length;
      targets.current = targets.current.filter(tr => tr.life > 0);
      if (targets.current.length < before) setScore(s=>Math.max(0, s - (before - targets.current.length))); // miss penalty
      while (targets.current.length < 4) spawn(width, height);
    }

    // bg
    ctx.fillStyle="#0b1224"; ctx.fillRect(0,0,width,height);

    // draw targets (with radial ring)
    targets.current.forEach(tr=>{
      const p = Math.max(0, Math.min(1, tr.life / 2.5));
      ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI*2);
      ctx.fillStyle = "#7cf6a2"; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(121,255,225,0.25)"; ctx.stroke();

      // shrinking inner ring indicating lifetime
      ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r * p, 0, Math.PI*2);
      ctx.strokeStyle = "#ff4d4f"; ctx.lineWidth = 3; ctx.stroke();
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
