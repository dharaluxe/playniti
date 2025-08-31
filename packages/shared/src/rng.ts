import seedrandom from "seedrandom";
export function rng(seed: string) {
  return seedrandom(seed);
}
export function seededInt(seed: string, min: number, max: number) {
  const r = rng(seed)();
  return Math.floor(min + r*(max-min+1));
}
