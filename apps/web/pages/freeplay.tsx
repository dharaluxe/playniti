import dynamic from "next/dynamic";
import { useState } from "react";

const Sarpniti   = dynamic(() => import("@playniti/games").then(m => m.Sarpniti),   { ssr: false });
const Climb      = dynamic(() => import("@playniti/games").then(m => m.Climb),      { ssr: false });
const Colormatch = dynamic(() => import("@playniti/games").then(m => m.Colormatch), { ssr: false });
const Targettaps = dynamic(() => import("@playniti/games").then(m => m.Targettaps), { ssr: false });
const Whackmole  = dynamic(() => import("@playniti/games").then(m => m.Whackmole),  { ssr: false });

export default function Freeplay() {
  const [game, setGame] = useState("sarpniti");
  const View = game==="sarpniti"?Sarpniti:game==="climb"?Climb:game==="colormatch"?Colormatch:game==="targettaps"?Targettaps:Whackmole;

  return (
    <main style={{ padding: 24 }}>
      <h2>Freeplay (Ads enabled, no prizes)</h2>
      <select value={game} onChange={(e)=>setGame(e.target.value)}>
        <option value="sarpniti">Sarp Niti</option>
        <option value="climb">Climb</option>
        <option value="colormatch">Colormatch</option>
        <option value="targettaps">TargetTaps</option>
        <option value="whackmole">WhackMole</option>
      </select>
      <div style={{ marginTop: 16 }}>
        <View />
      </div>
    </main>
  );
}
