import { z } from "zod";
const id = z.string().min(1),
  v3 = z.tuple([z.number(), z.number(), z.number()]),
  v2 = z.tuple([z.number(), z.number()]);
export const status = z.enum(["PHOTO", "MEAS", "GUESS", "CONFLICT"]);
const pose = z.object({ position: v3, rotation: v3, scale: v3 });
const spatial = {
  id,
  label: z.string(),
  pose,
  size: v3,
  status,
  notes: z.string().optional(),
};
const compartment = z
  .object({
    ...spatial,
    shape: z.enum(["box", "cylinder"]).optional(),
    color: z.string().optional(),
  })
  .passthrough();
const object = z
  .object({
    ...spatial,
    kind: z.enum(["board", "connector", "assembly", "switch", "psu", "other"]),
    compartment: id,
    fujiName: z.string().optional(),
    faceTexture: id.optional(),
    textureRotation: z.number().optional(),
    textureFlip: z.boolean().optional(),
  })
  .passthrough();
const pin = z
  .object({
    id,
    object: id,
    label: z.string(),
    local: v2,
    localSpace: z.enum(["uv", "mm"]).optional(),
    side: z.enum(["A", "B"]).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const component = z
  .object({
    id,
    object: id,
    label: z.string(),
    part: z.string().optional(),
    local: v2,
    pins: z.array(z.object({ id, label: z.string() })).optional(),
    notes: z.string().optional(),
    status,
  })
  .passthrough();
const measurement = z
  .object({
    id,
    a: id,
    b: id,
    type: z.enum(["continuity", "resistance", "diode"]),
    result: z.union([z.enum(["beep", "open"]), z.number().nonnegative()]),
    unit: z.enum(["ohm", "V"]).optional(),
    polarity: z.enum(["a+", "b+"]).optional(),
    wireColor: z.string().optional(),
    route: z.string().optional(),
    photo: id.optional(),
    note: z.string().optional(),
    powered: z.literal(false),
    by: z.enum(["alex", "claude"]),
    ts: z.string(),
  })
  .passthrough();
const net = z
  .object({
    id,
    name: z.string(),
    members: z.array(id),
    status,
    derivedFrom: z.array(id),
    notes: z.string().optional(),
  })
  .passthrough();
const photo = z
  .object({
    id,
    file: z.string().regex(/^photos\/[a-zA-Z0-9_.-]+$/),
    object: id.optional(),
    note: z.string().optional(),
    taken: z.string().optional(),
  })
  .passthrough();
const request = z
  .object({
    id,
    from: z.enum(["claude", "alex"]),
    camera: z.object({ position: v3, target: v3 }),
    highlight: z.array(id),
    question: z.string(),
    answer: z.string().optional(),
    status: z.enum(["open", "answered"]),
    created: z.string(),
    answered: z.string().optional(),
    tour: z.boolean().optional(),
  })
  .passthrough();
export const lensSchema = z
  .object({
    meta: z
      .object({
        schemaVersion: z.literal(1),
        units: z.literal("mm"),
        frame: z.string(),
        updated: z.string(),
      })
      .passthrough(),
    compartments: z.array(compartment),
    objects: z.array(object),
    pins: z.array(pin),
    components: z.array(component),
    measurements: z.array(measurement),
    nets: z.array(net),
    photos: z.array(photo),
    viewRequests: z.array(request),
  })
  .superRefine((d, c) => {
    const all = [
      ...d.compartments,
      ...d.objects,
      ...d.pins,
      ...d.components,
      ...d.components.flatMap((x) => x.pins || []),
      ...d.measurements,
      ...d.nets,
      ...d.photos,
      ...d.viewRequests,
    ];
    const seen = new Set<string>();
    for (const x of all) {
      if (seen.has(x.id))
        c.addIssue({ code: "custom", message: `Duplicate ID: ${x.id}` });
      seen.add(x.id);
    }
    const objs = new Set(d.objects.map((x) => x.id)),
      comps = new Set(d.compartments.map((x) => x.id)),
      photos = new Set(d.photos.map((x) => x.id)),
      endpoints = new Set([
        ...d.pins.map((x) => x.id),
        ...d.components.flatMap((x) => (x.pins || []).map((p) => p.id)),
      ]);
    const check = (ok: boolean, msg: string) => {
      if (!ok) c.addIssue({ code: "custom", message: msg });
    };
    d.objects.forEach((x) => {
      check(
        comps.has(x.compartment),
        `${x.id}: unknown compartment ${x.compartment}`,
      );
      if (x.faceTexture)
        check(
          photos.has(x.faceTexture),
          `${x.id}: missing photo ${x.faceTexture}`,
        );
    });
    [...d.pins, ...d.components].forEach((x) =>
      check(objs.has(x.object), `${x.id}: missing object ${x.object}`),
    );
    d.measurements.forEach((x) => {
      check(
        endpoints.has(x.a) && endpoints.has(x.b),
        `${x.id}: missing measurement endpoint`,
      );
      check(x.a !== x.b, `${x.id}: endpoints must differ`);
    });
    d.nets.forEach((x) => {
      x.members.forEach((p) =>
        check(endpoints.has(p), `${x.id}: missing pin ${p}`),
      );
      x.derivedFrom.forEach((m) =>
        check(
          d.measurements.some((v) => v.id === m),
          `${x.id}: missing source measurement ${m}`,
        ),
      );
    });
    d.photos.forEach((p) => {
      if (p.object)
        check(
          objs.has(p.object) || comps.has(p.object),
          `${p.id}: missing photo attachment ${p.object}`,
        );
    });
    d.measurements.forEach((m) => {
      if (m.photo)
        check(
          photos.has(m.photo),
          `${m.id}: missing reference photo ${m.photo}`,
        );
      check(
        m.type === "continuity"
          ? typeof m.result === "string"
          : typeof m.result === "number",
        `${m.id}: ${m.type} result has the wrong type`,
      );
    });
    d.viewRequests.forEach((r) =>
      r.highlight.forEach((id) =>
        check(seen.has(id), `${r.id}: missing highlighted item ${id}`),
      ),
    );
  });
export type Lens = z.infer<typeof lensSchema>;
export type Obj = z.infer<typeof object>;
export type Compartment = z.infer<typeof compartment>;
export type Pose = z.infer<typeof pose>;
export type Measurement = z.infer<typeof measurement>;
export type Net = z.infer<typeof net>;
export type Pin = z.infer<typeof pin>;
export type ViewRequest = z.infer<typeof request>;
