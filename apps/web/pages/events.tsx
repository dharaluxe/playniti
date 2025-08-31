import { useEffect, useState } from "react";

const USER_ID = "00000000-0000-0000-0000-000000000003"; // demo

export default function Events() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function consume() {
    setError(undefined);
    const res = await fetch("/api/access/consume", {
      method: "POST",
      headers: { "x-user-id": USER_ID, "content-type": "application/json" },
    }).then((r) => r.json());

    if (res.error) {
      setError(res.error);
      return;
    }
    setRemaining(res.remaining);

    if (res.status === "exhausted") {
      alert("Entries exhausted! Choose a Top-Up.");
      // simple Top-Up flow
      const passId = confirm(
        "Buy Mega Pass (₹499 for 30 entries)? Click OK for Mega, Cancel for Weekly (₹49 for 7)."
      )
        ? "mega"
        : "weekly";
      await fetch("/api/pass/purchase", {
        method: "POST",
        headers: { "x-user-id": USER_ID, "content-type": "application/json" },
        body: JSON.stringify({ passId }),
      });
      alert("Top-Up added. Try joining again!");
    } else {
      alert("Entry consumed. Joining event...");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Events / Ranked Matches</h2>
      {/* Escape apostrophes to satisfy react/no-unescaped-entities */}
      <p>
        Entries are consumed from your active passes. If exhausted, you&apos;ll
        see a Top-Up popup.
      </p>
      <button onClick={consume}>Join Sarp Niti 1v1 (demo)</button>
      {remaining !== null && <p>Remaining entries: {remaining}</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
    </main>
  );
}
