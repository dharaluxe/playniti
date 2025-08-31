import { z } from "zod";

export const GameId = z.enum(["sarpniti","climb","colormatch","targettaps","whackmole"]);
export type GameId = z.infer<typeof GameId>;

export const Mode = z.enum(["1v1","ffa","2v2","tournament"]);
export type Mode = z.infer<typeof Mode>;

export const PrizeEntry = z.object({ rank:z.number(), amount:z.number() });
export type PrizeEntry = z.infer<typeof PrizeEntry>;

export const PrizeTable = z.object({ game: GameId, mode: Mode, entries: z.array(PrizeEntry) });
export type PrizeTable = z.infer<typeof PrizeTable>;

export interface MatchResult {
  roomId: string;
  winnerUserId: string;
  scores: Record<string, number>;
}
