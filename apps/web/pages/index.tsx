import Link from "next/link";
import { useEffect, useState } from "react";

type Metrics = { dau:number, mau:number, vouchersRedeemed:number, nitiDistributed:number };

export default function Home(){
  const [m, setM] = useState<Metrics|null>(null);
  useEffect(()=>{
    fetch("http://localhost:4000/api/admin/metrics").then(r=>r.json()).then(setM).catch(()=>{});
  },[]);

  return <div className="container">
    <div className="hero">
      <span className="badge">v6 • One‑Minute Esports • 5 Flagship Games</span>
      <h1>Playniti</h1>
      <p className="sub">Multiplayer, event & tournament ready. Freeplay (ads), ranked with subscription entries, creator rooms with escrowed NitiCoins, and voucher‑only redemptions (no cashout).</p>
      <div className="ctas">
        <Link className="btn primary" href="/freeplay">▶ Play Free</Link>
        <Link className="btn" href="/events">🏆 Events</Link>
        <Link className="btn" href="/wallet">💎 Wallet</Link>
      </div>
    </div>

    <div className="grid">
      <div className="card">
        <h3>🚀 Flagship Games</h3>
        <p>Sarp Niti, Climb Ladder, ColorMatch, TargetTaps, WhackMole. 1v1, FFA, 2v2, and 100‑player tournaments.</p>
      </div>
      <div className="card">
        <h3>🛡️ Compliance</h3>
        <p>Prizes in NitiCoins → vouchers only. Cash entries/cashouts banned (India). Account closure retains 500 coins until voucher issue.</p>
      </div>
      <div className="card">
        <h3>🧭 Modes</h3>
        <p>Freeplay with ads (no prizes), Ranked via Weekly/Mega Pass, Creator‑hosted tournaments with escrowed pools.</p>
      </div>
    </div>

    <div className="kpis">
      <div className="kpi"><span>DAU</span><strong>{m?.dau ?? '—'}</strong></div>
      <div className="kpi"><span>MAU</span><strong>{m?.mau ?? '—'}</strong></div>
      <div className="kpi"><span>Vouchers</span><strong>{m?.vouchersRedeemed ?? '—'}</strong></div>
      <div className="kpi"><span>Niti Distributed</span><strong>{m?.nitiDistributed ?? '—'}</strong></div>
    </div>

    <div className="footer">© Playniti • v6 • Authoritative server • Seeded RNG • Disconnect grace 5s</div>
  </div>;
}
