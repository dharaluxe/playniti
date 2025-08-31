import React, { useEffect, useRef, useState } from "react";

type Props = { onEnd?: (score:number)=>void, seed?: string };

export default function Whackmole({ onEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  useEffect(() => {
    const id = setInterval(() => setTime(t => {
      if (t<=1) { clearInterval(id); onEnd?.(score); }
      return t-1;
    }), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    let raf:number;
    function draw(){
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.fillText("Score: "+score, 20, 30);
      ctx.fillText("Time: "+time, 20, 60);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return ()=> cancelAnimationFrame(raf);
  }, [score, time]);
  return <canvas ref={canvasRef} width={600} height={360} onClick={()=>setScore(s=>s+1)} />;
}
