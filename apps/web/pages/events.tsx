export default function Events(){
  return <main style={{padding:24}}>
    <h2>Events / Ranked Matches</h2>
    <p>Entries are consumed from your active passes. If exhausted, you'll see a Top-Up popup.</p>
    <ul>
      <li>Sarp Niti — 1v1 — Starts soon — <button onClick={()=>alert('Entry consumed (demo)')}>Join</button></li>
      <li>Climb Ladder — FFA — Starts soon — <button onClick={()=>alert('Entry consumed (demo)')}>Join</button></li>
    </ul>
  </main>;
}
