import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore JS exporter is also used by the CLI
import { wireviz, safeNote } from "../scripts/export-wireviz.mjs";
// @ts-ignore JS exporter is also used by the CLI
import { register } from "../scripts/export-register.mjs";
const d = {
  objects: [
    { id: "CN1", kind: "connector", label: "one", status: "PHOTO" },
    { id: "CN2", kind: "connector", label: "two", status: "GUESS" },
  ],
  pins: [
    { id: "CN1.1", object: "CN1", label: "1" },
    { id: "CN2.2", object: "CN2", label: "2" },
  ],
  nets: [
    {
      id: "n",
      name: "A -> B & <C>",
      members: ["CN1.1", "CN2.2"],
      derivedFrom: ["m"],
      status: "MEAS",
    },
  ],
  measurements: [
    {
      id: "m",
      a: "CN1.1",
      b: "CN2.2",
      result: "beep",
      wireColor: "RD",
      type: "continuity",
    },
  ],
};
test("connector pair export has real pin mapping and safe notes", () => {
  const out = wireviz(d);
  assert.deepEqual(Object.keys(out), ["CN1__CN2.yml"]);
  assert.match(out["CN1__CN2.yml"], /wirecount: 1/);
  assert.match(out["CN1__CN2.yml"], /RD/);
  assert.doesNotMatch(out["CN1__CN2.yml"], /->|[<>&]/);
  assert.equal(safeNote("A->B & C"), "A to B   C");
});
test("conflicting nets are not exported as wires", () => {
  assert.deepEqual(
    wireviz({ ...d, nets: [{ ...d.nets[0], status: "CONFLICT" }] }),
    {},
  );
});
test("register includes objects, measurements and status", () => {
  const out = register(d);
  assert.match(out, /## Objects/);
  assert.match(out, /## Measurements/);
  assert.match(out, /GUESS/);
  assert.match(out, /CN2.2/);
});
