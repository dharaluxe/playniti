import dynamic from "next/dynamic";
import { useState } from "react";

// Lazy load each game only on client
const Sarpniti   = dynamic(() => import("@playniti/games").then(m => m.Sarpniti), { ssr: false });
const Climb      = dynamic(() => import("@playniti/games").then(m => m.ClimbLadder), { ssr: false });
const Colormatch = dynamic(() => import("@playniti/games").then(m => m.ColorMatch), { ssr: false });
const Targettaps = dynamic(() => import("@playniti/games").then(m => m.TargetTaps), { ssr: false });
const Whackmole  = dynamic(() => import("@playniti/games").then(m => m.WhackMole), { ssr: false });

export default function Freeplay() {
  const [game, setGame] = useState("sarpniti");

  return (
    <main style={{ padding: 24 }}>
      <h2>Freeplay (Ads enabled, no prizes)</h2>
      <select onChange={(e) => setGame(e.target.value)} value={game}>
        <option value="sarpniti">Sarp Niti</option>
        <option value="climb">Climb Ladder</option>
        <option value="colormatch">ColorMatch</option>
        <option value="targettaps">TargetTaps</option>
        <option value="whackmole">WhackMole</option>
      </select>

      <div style={{ marginTop: 16 }}>
        {game === "sarpniti"   && <Sarpniti />}
        {game === "climb"      && <Climb />}
        {game === "colormatch" && <Colormatch />}
        {game === "targettaps" && <Targettaps />}
        {game === "whackmole"  && <Whackmole />}
      </div>
    </main>
  );
}
