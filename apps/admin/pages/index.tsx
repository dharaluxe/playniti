import Link from "next/link";

export default function Home(){
  return <div className="container">
    <div className="hero">
      <span className="badge">Admin • Live Ops</span>
      <h1>Playniti Control</h1>
      <p className="sub">Configure passes, vouchers, prize tables and compliance. Monitor metrics and manage redemptions.</p>
      <div className="ctas">
        <Link className="btn primary" href="/metrics">📊 Metrics</Link>
        <Link className="btn" href="/vouchers">🎟️ Vouchers</Link>
        <Link className="btn" href="/passes">🎫 Passes</Link>
        <Link className="btn" href="/prizes">🏅 Prizes</Link>
        <Link className="btn" href="/compliance">🛡️ Compliance</Link>
        <Link className="btn" href="/redemptions">💳 Redemptions</Link>
      </div>
    </div>
  </div>;
}
