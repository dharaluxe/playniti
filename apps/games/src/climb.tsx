import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = { seed?: string; onEnd?: (score: number) => void };
type Ob = { x: number; w: number; h: number; scored?: boolean };

function hashSeed(s: string){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19);} return (h>>>0)||123456789; }
function mulberry32(a:number){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }

export default function Climb({ seed="playniti", onEnd }: Props) {
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);

  const rand = useMemo(() => mulberry32(hashSeed(seed)), [seed]);

  // physics
  const player = useRef({ x: 120, y: 0, vy: 0, size: 46, onGround: true });
  const groundY = useRef(0);
  const obstacles = useRef<Ob[]>([]);
  const speed = useRef(260); // px/s
  const acc = useRef(0);
  const jumpRequested = useRef(false);

  // timer
  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(id); onEnd?.(score); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onEnd, score]);

  // controls: space/W/ArrowUp or tap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k===" " || k==="arrowup" || k==="w") jumpRequested.current = true;
    };
    const onTouch = () => { jumpRequested.current = true; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("mousedown", onTouch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("mousedown", onTouch);
    };
  }, []);

  // update + draw
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const DPR = ctx.getTransform().a||1;
    const width = Math.round(ctx.canvas.width / DPR);
    const height = Math.round(ctx.canvas.height / DPR);

    // init ground
    groundY.current = height - 60;

    const dt = (t - (draw as any)._lastT || 0);
    (draw as any)._lastT = t;
    const playing = time > 0;

    if (playing) {
      // spawn obstacles
      if (obstacles.current.length < 4) {
        const lastX = obstacles.current.reduce((m,o)=>Math.max(m,o.x), 0);
        const gap = 220 + Math.floor(rand()*200);
        const w = 30 + Math.floor(rand()*30);
        const h = 40 + Math.floor(rand()*60);
        obstacles.current.push({ x: Math.max(width+50, lastX + gap), w, h });
      }

      // move obstacles
      obstacles.current.forEach(o => o.x -= speed.current * dt);
      obstacles.current = obstacles.current.filter(o => o.x + o.w > -10);

      // physics
      if (jumpRequested.current && player.current.onGround) {
        player.current.vy = -520; // jump impulse
        player.current.onGround = false;
      }
      jumpRequested.current = false;

      player.current.vy += 1500 * dt; // gravity
      player.current.y += player.current.vy * dt;
      const floor = groundY.current - player.current.size;
      if (player.current.y > floor) { player.current.y = floor; player.current.vy = 0; player.current.onGround = true; }

      // score when passing obstacles
      obstacles.current.forEach(o => {
        if (!o.scored && o.x + o.w < player.current.x) { o.scored = true; setScore(s=>s+1); }
      });

      // collision
      obstacles.current.forEach(o => {
        const px = player.current.x, py = player.current.y, ps = player.current.size;
        if (!(px+ps < o.x || px > o.x+o.w || py+ps < groundY.current - o.h || py > groundY.current)) {
          // hit → small penalty & push back a bit
          setScore(s => Math.max(0, s - 1));
          player.current.x = Math.max(60, player.current.x - 24);
        }
      });
    }

    // bg
    ctx.fillStyle="#0b1224"; ctx.fillRect(0,0,width,height);

    // ground
    ctx.strokeStyle="rgba(121,255,225,0.9)";
    ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(20, groundY.current+0.5); ctx.lineTo(width-20, groundY.current+0.5); ctx.stroke();

    // obstacles
    ctx.fillStyle="#ff4d4f";
    obstacles.current.forEach(o=>{
      ctx.fillRect(Math.round(o.x), Math.round(groundY.current - o.h), o.w, o.h);
    });

    // player
    ctx.fillStyle="#7cf6a2";
    ctx.beginPath(); ctx.roundRect(Math.round(player.current.x), Math.round(player.current.y), player.current.size, player.current.size, 8); ctx.fill();

    // HUD
    ctx.fillStyle="#fff"; ctx.font="20px ui-sans-serif, system-ui";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Time: ${time}`, 16, 56);

    if (!playing) {
      ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#fff"; ctx.textAlign="center";
      ctx.font="28px ui-sans-serif, system-ui"; ctx.fillText("Time up!", width/2, height/2-8);
      ctx.font="18px ui-sans-serif, system-ui"; ctx.fillText(`Final Score: ${score}`, width/2, height/2+20);
      ctx.textAlign="start";
    }
  }, [time, score, rand]);

  return <GameCanvas draw={draw} aspectRatio={16/9} />;
}
