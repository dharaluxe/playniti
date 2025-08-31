import { Sarpniti, Climb, Colormatch, Targettaps, Whackmole } from "@playniti/games";
import { useState } from "react";

export default function Freeplay(){
  const [game, setGame] = useState("sarpniti");
  return <main style={{padding:24}}>
    <h2>Freeplay (Ads enabled, no prizes)</h2>
    <select onChange={e=>setGame(e.target.value)} value={game}>
      <option value="sarpniti">Sarp Niti</option>
      <option value="climb">Climb Ladder</option>
      <option value="colormatch">ColorMatch</option>
      <option value="targettaps">TargetTaps</option>
      <option value="whackmole">WhackMole</option>
    </select>
    <div style={{marginTop:16}}>
      {game==="sarpniti" && <Sarpniti />}
      {game==="climb" && <Climb />}
      {game==="colormatch" && <Colormatch />}
      {game==="targettaps" && <Targettaps />}
      {game==="whackmole" && <Whackmole />}
    </div>
  </main>;
}
