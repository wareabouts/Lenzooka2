import { test } from "node:test";
import assert from "node:assert/strict";
import { facePoint, faceUV, faceSize } from "../src/faceGeometry";
import type { Obj } from "../src/schema";
const o: Obj = {
  id: "B1",
  label: "test",
  kind: "board",
  compartment: "BODY",
  status: "GUESS",
  size: [200, 50, 2],
  pose: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
};
test("photo stays aspect-fit inside board bounds", () => {
  assert.deepEqual(faceSize(o, 2), [100, 50]);
  assert.deepEqual(faceSize({ ...o, textureRotation: 90 }, 2), [50, 25]);
});
test("UV and local points round-trip for every photo orientation", () => {
  for (const rotation of [0, 90, 180, 270])
    for (const flip of [false, true]) {
      const obj = { ...o, textureRotation: rotation, textureFlip: flip };
      for (const uv of [
        [0.2, 0.7],
        [0.5, 0.5],
        [0, 1],
      ]) {
        const p = facePoint(obj, uv, "uv", 1.3),
          round = faceUV(obj, p[0], p[1], 1.3);
        assert.ok(Math.abs(round[0] - uv[0]) < 1e-10);
        assert.ok(Math.abs(round[1] - uv[1]) < 1e-10);
      }
    }
});
