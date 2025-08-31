import { WebSocketServer, WebSocket } from "ws";
import seedrandom from "seedrandom";

type Client = WebSocket & { userId?: string, roomId?: string, lastSeen?: number };

interface Room {
  id: string;
  code: string;
  maxPlayers: number;
  players: Set<Client>;
  game: "sarpniti"|"climb"|"colormatch"|"targettaps"|"whackmole";
  state: "lobby"|"running"|"ended";
  seed: string;
  startedAt?: number;
  scores: Map<string, number>;
}

const wss = new WebSocketServer({ port: parseInt(process.env.REALTIME_PORT||"4100") });
const rooms = new Map<string, Room>();

function makeCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }

function createRoom(game: Room["game"], maxPlayers: number) {
  const id = crypto.randomUUID();
  const code = makeCode();
  const room: Room = { id, code, game, maxPlayers, players: new Set(), state: "lobby", seed: id, scores: new Map() };
  rooms.set(id, room);
  return room;
}

// bootstrap a few rooms for dev
createRoom("sarpniti", 4);
createRoom("climb", 2);

function safeSend(ws: WebSocket, data: any) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
}

function endRoom(room: Room) {
  room.state = "ended";
  // choose winner by highest score; if tie, earliest score timestamp not tracked -> random by seed
  let top: {uid:string, score:number} | null = null;
  for (const p of room.players) {
    const s = room.scores.get(p.userId||"") || 0;
    if (!top || s > top.score) top = { uid: p.userId||"", score: s };
  }
  for (const p of room.players) safeSend(p, { type:"END", winnerUserId: top?.uid, scores: Object.fromEntries(room.scores) });
}

wss.on("connection", (ws: Client) => {
  ws.lastSeen = Date.now();
  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "HELLO") {
        ws.userId = msg.userId;
        safeSend(ws, { type:"HELLO_ACK" });
      }
      if (msg.type === "JOIN") {
        const room = [...rooms.values()].find(r => r.code === msg.code) || createRoom(msg.game, msg.capacity||4);
        room.players.add(ws);
        ws.roomId = room.id;
        room.scores.set(ws.userId||"", 0);
        for (const p of room.players) safeSend(p, { type:"LOBBY", code: room.code, players: room.players.size, capacity: room.maxPlayers });
        if (room.players.size >= Math.min(3, room.maxPlayers)) { // auto start for demo when >=3
          room.state = "running";
          room.startedAt = Date.now();
          for (const p of room.players) safeSend(p, { type:"START", seed: room.seed, durationSec: 60 });
          setTimeout(() => endRoom(room), 60_000);
        }
      }
      if (msg.type === "INPUT") {
        const room = rooms.get(ws.roomId||"");
        if (!room || room.state!=="running") return;
        // authoritative scoring: simple +1 per valid input
        const prev = room.scores.get(ws.userId||"")||0;
        room.scores.set(ws.userId||"", prev+1);
        for (const p of room.players) safeSend(p, { type:"TICK", uid: ws.userId, score: room.scores.get(ws.userId||"") });
      }
      if (msg.type === "PING") {
        ws.lastSeen = Date.now();
        safeSend(ws, { type:"PONG" });
      }
    } catch (e) {}
  });
  ws.on("close", () => {
    // grace timer for rejoin not tracked per-user in this demo
  });
});

console.log("Realtime server listening on", process.env.REALTIME_PORT||"4100");
