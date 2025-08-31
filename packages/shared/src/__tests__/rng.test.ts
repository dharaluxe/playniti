import { seededInt } from "../rng";
import assert from "node:assert";

assert.equal(seededInt("a", 0, 10), seededInt("a", 0, 10));
