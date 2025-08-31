import type { FastifyInstance } from "fastify";
import { z } from "zod";

export function registerRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => ({ ok: true }));

  app.get("/api/ads/config", async () => ({
    bannerId: process.env.ADS_BANNER_ID || "demo-banner",
    interstitialId: process.env.ADS_INTERSTITIAL_ID || "demo-inter",
    rewardedId: process.env.ADS_REWARDED_ID || "demo-rewarded"
  }));

  // Pass listing
  app.get("/api/pass/list", async () => ([
    { id: "weekly", name:"Weekly Pass", priceINR:49, entries:7, validityDays:7 },
    { id: "mega", name:"Mega Pass", priceINR:499, entries:30, validityDays:30 }
  ]));

  // Dummy purchase endpoint (server should validate with real PG in production)
  app.post("/api/pass/purchase", async (req, reply) => {
    return { status: "ok", message: "Pass purchased (demo)" };
  });

  // Access consume
  app.post("/api/access/consume", async (req, reply) => {
    return { status: "ok", remaining: 6 };
  });

  // Events & lobbies
  app.get("/api/event/list", async () => ([
    { id:"evt1", game:"sarpniti", mode:"1v1", startsAt:new Date().toISOString() },
    { id:"evt2", game:"climb", mode:"ffa", startsAt:new Date().toISOString() }
  ]));

  app.get("/api/lobby/list", async () => ([
    { id:"roomA", code:"ABCD12", players:2, capacity:4 },
    { id:"roomB", code:"PQRS45", players:1, capacity:2 }
  ]));

  // Creator tournament endpoints (stubs)
  app.post("/api/creator/tourney/create", async () => ({ status:"ok" }));
  app.post("/api/creator/tourney/escrow", async () => ({ status:"ok", locked:1000 }));
  app.post("/api/creator/tourney/entry", async () => ({ status:"ok" }));

  // Wallet/Redemption (stubs)
  app.get("/api/wallet", async () => ({ coin_balance: 1200, locked_balance: 0 }));
  app.post("/api/redeem/voucher", async () => {
    // Simulate stockout protection
    return { status:"queued", note:"Admin will generate voucher if stock allows" };
  });

  // Admin (stubs)
  app.get("/api/admin/metrics", async () => ({
    dau: 1200, mau: 15000, vouchersRedeemed: 340, nitiDistributed: 120000
  }));
  app.post("/api/admin/voucher/generate", async () => ({ status:"ok", code:"VCHR-TEST-1234" }));
}
