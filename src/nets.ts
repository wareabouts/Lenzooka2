import type { Measurement, Net } from "./schema";
export function deriveNets(
  measurements: Measurement[],
  previous: Net[],
): Net[] {
  const parent = new Map<string, string>();
  const names = new Map<string, Set<string>>();
  const conflict = new Set<string>();
  const find = (x: string): string => {
    if (!parent.has(x)) {
      parent.set(x, x);
      names.set(
        x,
        new Set(
          previous
            .filter(
              (n) =>
                n.name && !n.name.startsWith("N_") && n.members.includes(x),
            )
            .map((n) => n.name),
        ),
      );
    }
    const p = parent.get(x)!;
    if (p !== x) parent.set(x, find(p));
    return parent.get(x)!;
  };
  const beeps = measurements.filter(
    (m) => m.type === "continuity" && m.result === "beep",
  );
  for (const m of beeps) {
    let a = find(m.a),
      b = find(m.b);
    if (a === b) continue;
    const labels = new Set([...names.get(a)!, ...names.get(b)!]);
    if (labels.size > 1) {
      conflict.add(m.a);
      conflict.add(m.b);
      continue;
    }
    parent.set(b, a);
    names.set(a, labels);
  }
  const groups = new Map<string, string[]>();
  for (const p of parent.keys()) {
    const r = find(p);
    groups.set(r, [...(groups.get(r) || []), p]);
  }
  const used = new Set<string>();
  return [...groups.values()].map((members) => {
    members.sort();
    const matches = previous
      .map((n) => ({
        n,
        overlap: n.members.filter((x) => members.includes(x)).length,
      }))
      .filter((x) => x.overlap && !used.has(x.n.id))
      .sort((a, b) => b.overlap - a.overlap);
    const old = matches[0]?.n;
    let id = old?.id || "net-" + members[0];
    while (used.has(id)) id += "-1";
    used.add(id);
    const labels = names.get(find(members[0]))!;
    return {
      id,
      name:
        [...labels][0] || old?.name || "N_" + members[0].replaceAll(".", "_"),
      members,
      status: members.some((m) => conflict.has(m)) ? "CONFLICT" : "MEAS",
      derivedFrom: beeps
        .filter((m) => members.includes(m.a) && members.includes(m.b))
        .map((m) => m.id),
      ...(old?.notes ? { notes: old.notes } : {}),
    } as Net;
  });
}
