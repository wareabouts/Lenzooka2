import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createServer, type ViteDevServer } from "vite";
let server: ViteDevServer, root: string, url: string, seed: string;
const project = process.cwd();
before(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "lenzooka2-persistence-"));
  await fs.mkdir(path.join(root, "data"));
  await fs.mkdir(path.join(root, "public/photos"), { recursive: true });
  seed = await fs.readFile(path.join(project, "data/lens.json"), "utf8");
  await fs.writeFile(path.join(root, "data/lens.json"), seed);
  server = await createServer({
    root,
    configFile: path.join(project, "vite.config.ts"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer!.address() as { port: number };
  url = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await server?.close();
  if (root) await fs.rm(root, { recursive: true, force: true });
});
test("invalid upload is recoverable and does not interrupt the server", async () => {
  const form = new FormData();
  form.append(
    "photo",
    new Blob(["invalid jpeg"], { type: "image/jpeg" }),
    "123456.jpg",
  );
  const r = await fetch(url + "/api/photo", { method: "POST", body: form });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /JPEG/);
  const next = await fetch(url + "/data/lens.json?t=1");
  assert.equal(next.status, 200);
  assert.equal((await next.json()).pins.length, 184);
});
test("photo uploads preserve originals and avoid collisions", async () => {
  const photo = await fs.readFile(
    path.join(project, "public/photos/065258.jpg"),
  );
  const ids = [];
  for (let i = 0; i < 2; i++) {
    const form = new FormData();
    form.append(
      "photo",
      new Blob([photo], { type: "image/jpeg" }),
      "065258.jpg",
    );
    const r = await fetch(url + "/api/photo", { method: "POST", body: form });
    assert.equal(r.status, 200);
    const p = await r.json();
    ids.push(p.id);
    assert.deepEqual(
      await fs.readFile(path.join(root, "public", p.file)),
      photo,
    );
  }
  assert.deepEqual(ids, ["065258", "065258-1"]);
});
test("invalid save preserves disk, valid save persists atomically", async () => {
  const bad = await fetch(url + "/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"meta":{}}',
  });
  assert.equal(bad.status, 400);
  assert.equal(
    await fs.readFile(path.join(root, "data/lens.json"), "utf8"),
    seed,
  );
  const d = JSON.parse(seed);
  d.objects[0].notes = "Persistence test only";
  const good = await fetch(url + "/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  assert.equal(good.status, 200);
  const saved = JSON.parse(
    await fs.readFile(path.join(root, "data/lens.json"), "utf8"),
  );
  assert.equal(
    saved.objects.find((o: { id: string }) => o.id === d.objects[0].id).notes,
    "Persistence test only",
  );
});
