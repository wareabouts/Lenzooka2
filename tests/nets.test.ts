import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveNets } from "../src/nets";
import { lensSchema, type Measurement } from "../src/schema";
import fs from "node:fs";
const m = (
  a: string,
  b: string,
  result: Measurement["result"] = "beep",
): Measurement => ({
  id: a + b,
  a,
  b,
  type: "continuity",
  result,
  powered: false,
  by: "alex",
  ts: new Date().toISOString(),
});
test("transitive continuity creates one net; open is excluded", () => {
  const nets = deriveNets([m("a", "b"), m("b", "c"), m("c", "d", "open")], []);
  assert.equal(nets.length, 1);
  assert.deepEqual(nets[0].members, ["a", "b", "c"]);
});
test("manual name and ID survive extending a net", () => {
  const old = deriveNets([m("a", "b")], []);
  old[0].name = "ZOOM_RATE";
  const n = deriveNets([m("a", "b"), m("b", "c")], old);
  assert.equal(n[0].name, "ZOOM_RATE");
  assert.equal(n[0].id, old[0].id);
});
test("two different manual names conflict without joining", () => {
  const ms = [m("a", "b"), m("c", "d")];
  const old = deriveNets(ms, []);
  old[0].name = "SIG";
  old[1].name = "POWER";
  const nets = deriveNets([...ms, m("b", "c")], old);
  assert.equal(nets.length, 2);
  assert.ok(nets.every((n) => n.status === "CONFLICT"));
});
test("same manual name may merge; deleting bridge splits", () => {
  const ms = [m("a", "b"), m("c", "d")];
  const old = deriveNets(ms, []);
  old.forEach((n) => (n.name = "SIG"));
  const merged = deriveNets([...ms, m("b", "c")], old);
  assert.equal(merged.length, 1);
  const split = deriveNets(ms, merged);
  assert.equal(split.length, 2);
  assert.equal(new Set(split.map((n) => n.id)).size, 2);
});
test("seed validates, duplicate IDs and invalid endpoints are rejected", () => {
  const d = JSON.parse(fs.readFileSync("data/lens.json", "utf8"));
  assert.ok(lensSchema.safeParse(d).success);
  d.pins.push(d.pins[0]);
  assert.equal(lensSchema.safeParse(d).success, false);
  d.pins.pop();
  d.measurements.push(m("missing", "other"));
  assert.equal(lensSchema.safeParse(d).success, false);
});
