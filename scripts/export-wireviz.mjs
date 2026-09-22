import fs from "node:fs";
import { pathToFileURL } from "node:url";
export const safeNote = (v) =>
  String(v ?? "")
    .replaceAll("->", " to ")
    .replace(/[<>&]/g, " ")
    .replaceAll("\n", " ");
export function wireviz(d) {
  const files = {};
  const connectors = new Set(
    d.objects.filter((o) => o.kind === "connector").map((o) => o.id),
  );
  const pins = new Map(d.pins.map((p) => [p.id, p]));
  const groups = new Map();
  for (const net of d.nets) {
    if (net.status === "CONFLICT") continue;
    const members = net.members
      .map((id) => pins.get(id))
      .filter((p) => p && connectors.has(p.object));
    for (let i = 0; i < members.length; i++)
      for (let j = i + 1; j < members.length; j++) {
        let a = members[i],
          b = members[j];
        if (a.object === b.object) continue;
        if (a.object > b.object) [a, b] = [b, a];
        const key = a.object + "__" + b.object;
        const m = d.measurements.find(
          (m) =>
            net.derivedFrom.includes(m.id) &&
            m.result === "beep" &&
            ((m.a === a.id && m.b === b.id) || (m.a === b.id && m.b === a.id)),
        );
        groups.set(key, [
          ...(groups.get(key) || []),
          { a, b, net, wire: m?.wireColor },
        ]);
      }
  }
  const q = JSON.stringify;
  for (const [name, rows] of groups) {
    const a = rows[0].a.object,
      b = rows[0].b.object;
    const ap = [...new Set(rows.map((r) => r.a.label))],
      bp = [...new Set(rows.map((r) => r.b.label))];
    files[name + ".yml"] =
      `connectors:\n  ${q(a)}:\n    pinlabels: ${q(ap)}\n  ${q(b)}:\n    pinlabels: ${q(bp)}\ncables:\n  W1:\n    wirecount: ${rows.length}\n${rows.every((r) => r.wire) ? `    colors: ${q(rows.map((r) => r.wire))}\n` : ""}    notes: ${q(safeNote("Electrical continuity only; physical harness route unverified. " + rows.map((r) => r.net.name).join(", ")))}\nconnections:\n  - - ${q(a)}: ${q(rows.map((r) => ap.indexOf(r.a.label) + 1))}\n    - W1: ${q(rows.map((_, i) => i + 1))}\n    - ${q(b)}: ${q(rows.map((r) => bp.indexOf(r.b.label) + 1))}\n`;
  }
  return files;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const d = JSON.parse(fs.readFileSync("data/lens.json", "utf8"));
  fs.mkdirSync("wireviz", { recursive: true });
  for (const [file, body] of Object.entries(wireviz(d)))
    fs.writeFileSync("wireviz/" + file, body);
  console.log("Wrote WireViz connector-pair exports");
}
