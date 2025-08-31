import type { PrizeTable } from "./types";

export const DEFAULT_PRIZES: PrizeTable[] = [
  { game:"sarpniti", mode:"1v1", entries:[{rank:1,amount:100}] },
  { game:"sarpniti", mode:"ffa", entries:[{rank:1,amount:100},{rank:2,amount:50},{rank:3,amount:25}] },
  { game:"sarpniti", mode:"2v2", entries:[{rank:1,amount:200}] },
];
