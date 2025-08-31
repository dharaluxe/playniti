import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { seed?: string; onEnd?: (score: number) => void };
type Vec = { x: number; y: number };

function hashSeed(s: string){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19);} return (h>>>0)||123456789; }
function mulberry32(a:number){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }

export default function Sarpniti({ seed="playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const GRID = { cols: 28, rows: 16 };
  const STEP_MS = 120;
  const CELL_PAD = 2;

  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  const dirRef = useRef<Vec>({ x: 1, y: 0 });
  const nextDirRef = useRef<Vec>({ x: 1, y: 0 });
  const snakeRef = useRef<Vec[]>([{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }]);
  const appleRef = useRef<Vec>({ x: 12, y: 8 });
  const accMs = useRef(0);
  const ended = useRef(false);

  const placeApple = useCallback(() => {
    while (true) {
      const x = Math.floor(rand() * GRID.cols);
      const y = Math.floor(rand() * GRID.rows);
      if (!snakeRef.current.some(s => s.x === x && s.y === y)) { appleRef.current = { x, y }; return; }
    }
  }, [GRID.cols, GRID.rows, rand]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(id);
          if (!ended.current) { ended.current = true; onEnd?.(score); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); const d = nextDirRef.current;
      if (k==="arrowup"||k==="w"){ if (d.y!==1) nextDirRef.current={x:0,y:-1}; }
      else if (k==="arrowdown"||k==="s"){ if (d.y!==-1) nextDirRef.current={x:0,y:1}; }
      else if (k==="arrowleft"||k==="a"){ if (d.x!==1) nextDirRef.current={x:-1,y:0}; }
      else if (k==="arrowright"||k==="d"){ if (d.x!==-1) nextDirRef.current={x:1,y:0}; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const swipeRef = useRef<{x:number;y:number}|null>(null);
  const swipeBind = useCallback((root: HTMLElement | null) => {
    if (!root) return;
    const start = (e: TouchEvent) => { const t=e.touches[0]; swipeRef.current={x:t.clientX,y:t.clientY}; };
    const end = (e: TouchEvent) => {
      if (!swipeRef.current) return;
      const t=(e.changedTouches&&e.changedTouches[0])||e.touches[0]; if (!t) return;
      const dx=t.clientX-swipeRef.current.x, dy=t.clientY-swipeRef.current.y; swipeRef.current=null;
      const d=nextDirRef.current;
      if (Math.abs(dx)>Math.abs(dy)) { if (dx>10&&d.x!==-1) nextDirRef.current={x:1,y:0}; else if (dx<-10&&d.x!==1) nextDirRef.current={x:-1,y:0}; }
      else { if (dy>10&&d.y!==-1) nextDirRef.current={x:0,y:1}; else if (dy<-10&&d.y!==1) nextDirRef.current={x:0,y:-1}; }
    };
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchend", end, { passive: true });
    return () => { root.removeEventListener("touchstart", start); root.removeEventListener("touchend", end); };
  }, []);

  const step = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const nx = head.x + dirRef.current.x, ny = head.y + dirRef.current.y;
    const hitWall = nx<0||ny<0||nx>=GRID.cols||ny>=GRID.rows;
    const hitSelf = snakeRef.current.some((s,i)=>i>0&&s.x===nx&&s.y===ny);
    if (hitWall||hitSelf) {
      snakeRef.current = snakeRef.current.slice(0, Math.max(2, snakeRef.current.length-2));
    } else {
      snakeRef.current = [{x:nx,y:ny}, ...snakeRef.current];
      if (nx===appleRef.current.x && ny===appleRef.current.y) { setScore(s=>s+1); placeApple(); }
      else snakeRef.current.pop();
    }
  }, [GRID.cols, GRID.rows, placeApple]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const W = ctx.canvas.width, H = ctx.canvas.height, DPR = ctx.getTransform().a||1;
    const width = Math.round(W / DPR), height = Math.round(H / DPR);
    const cell = Math.floor(Math.min(width/GRID.cols, height/GRID.rows));

    // ⛔ if time is over: just render last state (NO step), plus overlay
    const canAdvance = time > 0;

    // advance accumulator only if playing
    if (canAdvance) {
      accMs.current += (t - (draw as any)._lastT || 0) * 1000;
      (draw as any)._lastT = t;
      while (accMs.current >= STEP_MS) { step(); accMs.current -= STEP_MS; }
    }

    // clear
    ctx.fillStyle = "#0b1224"; ctx.fillRect(0,0,width,height);

    // subtle grid
    ctx.strokeStyle = "rgba(120,150,220,0.08)"; ctx.lineWidth=1;
    for (let x=0;x<=GRID.cols;x++){ const px=Math.floor(x*cell)+0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,GRID.rows*cell); ctx.stroke(); }
    for (let y=0;y<=GRID.rows;y++){ const py=Math.floor(y*cell)+0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(GRID.cols*cell,py); ctx.stroke(); }

    // apple
    ctx.fillStyle="#ff4d4f";
    const ax=appleRef.current.x*cell+CELL_PAD, ay=appleRef.current.y*cell+CELL_PAD;
    ctx.beginPath(); ctx.roundRect(ax,ay,cell-CELL_PAD*2,cell-CELL_PAD*2,6); ctx.fill();

    // snake
    ctx.fillStyle="#7cf6a2";
    snakeRef.current.forEach((s,i)=>{ const sx=s.x*cell+CELL_PAD, sy=s.y*cell+CELL_PAD; ctx.beginPath(); ctx.roundRect(sx,sy,cell-CELL_PAD*2,cell-CELL_PAD*2,i===0?8:4); ctx.fill(); });

    // HUD
    ctx.fillStyle="#fff"; ctx.font="20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);

    // time-up overlay
    if (!canAdvance) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#fff";
      ctx.font = "28px ui-sans-serif, system-ui";
      ctx.textAlign="center";
      ctx.fillText("Time up!", width/2, height/2 - 8);
      ctx.font = "18px ui-sans-serif, system-ui";
      ctx.fillText(`Final Score: ${score}`, width/2, height/2 + 20);
      ctx.textAlign="start";
    }
  }, [GRID.cols, GRID.rows, STEP_MS, score, time, step]);

  useEffect(() => { placeApple(); }, [placeApple]);

  const wrapRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => swipeBind(wrapRef.current), [swipeBind]);

  return (
    <div ref={wrapRef}>
      <GameCanvas draw={draw} aspectRatio={16/9} />
    </div>
  );
}
