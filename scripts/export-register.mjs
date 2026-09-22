import fs from "node:fs";
import { pathToFileURL } from "node:url";
const clean = (v) =>
  String(v ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
export function register(d) {
  let out =
    "# Lenzooka2 · generated circuit register\n\nGenerated from `data/lens.json`. Original historical register: `docs/register-original.md`.\n\n";
  const table = (title, headers, rows) => {
    out += `## ${title}\n\n| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map((r) => "| " + r.map(clean).join(" | ") + " |").join("\n")}\n\n`;
  };
  table(
    "Objects",
    ["ID", "Fuji name / label", "Compartment", "Status", "Notes"],
    d.objects.map((o) => [
      o.id,
      o.fujiName || o.label,
      o.compartment,
      o.status,
      o.notes,
    ]),
  );
  table(
    "Pins",
    ["ID", "Object", "Label", "Evidence"],
    d.pins.map((p) => [
      p.id,
      p.object,
      p.label,
      d.measurements.some((m) => m.a === p.id || m.b === p.id)
        ? "MEAS"
        : "GUESS (position / assignment unverified)",
    ]),
  );
  table(
    "Nets",
    ["ID", "Name", "Members", "Status"],
    d.nets.map((n) => [n.id, n.name, n.members.join(", "), n.status]),
  );
  table(
    "Measurements",
    ["ID", "A", "B", "Type", "Result", "Wire", "Status"],
    d.measurements.map((m) => [
      m.id,
      m.a,
      m.b,
      m.type,
      `${m.result} ${m.unit || ""}`,
      m.wireColor,
      "MEAS",
    ]),
  );
  return out;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const d = JSON.parse(fs.readFileSync("data/lens.json", "utf8"));
  fs.writeFileSync("docs/register.md", register(d));
  console.log("Wrote docs/register.md");
}
