# Lenzooka: a 3D bench log and exhibit for reverse-engineering a 1979 Fujinon broadcast box lens

You are building a web app for Alex (GitHub: wareabouts). He is reverse-engineering the electronics of a Fujinon P14x16.5 studio zoom lens (1979, Fuji Photo Optical) so he can adapt it to a Sony A7C II, and he is documenting it for his YouTube channel, Wareabouts. He works with Claude in a separate chat; Claude reads and writes the same data file this app edits, so the data file is a shared workspace between a person at a bench with a multimeter and an AI that can only read text and photos.

The app has two jobs with one data model. Bench mode: Alex places boards and connectors in a rough 3D model of the lens, pins photos to them, and logs multimeter results by clicking pins, the way he probes with the meter. Exhibit mode: the same scene, read-only, published on GitHub Pages so viewers can explore the lens.

Read `docs/conventions.md` and `docs/register.md` first. They define every ID in the seed data and the vocabulary Alex and Claude use. Look at the five photos in `docs/photos/` so you know what a "board", "card edge", "terminal board" and "compartment" look like in this object. Do not rename anything Fuji named.

## Stack and repo

- Vite + React + TypeScript, React Three Fiber, @react-three/drei (OrbitControls, TransformControls, Html, useTexture, Line), zustand for state. No UI framework required; plain CSS modules or Tailwind, your choice, keep it light.
- Repo: `wareabouts/lenzooka`, public. GitHub Action builds on push to `main` and deploys `dist/` to GitHub Pages. Set Vite `base` accordingly. The static build is exhibit mode by default and loads `data/lens.json` from the repo.
- Dev server has one job beyond serving: persist. Add a Vite plugin (dev only) exposing `POST /api/save` (writes `data/lens.json`, pretty-printed, stable key order so git diffs stay readable) and `POST /api/photo` (multipart, writes into `public/photos/`, returns the path). Autosave on every mutation, debounced 500 ms, with a visible "saved / unsaved" indicator. Never lose an hour of probing to a closed tab.
- Desktop Chrome only. No mobile or touch work.
- Keyboard-first at the bench. Alex has one hand on a probe.

## Data model: `data/lens.json` is the single source of truth

Everything the app shows is a rendering of this file. Claude edits it directly (adds measurements, renames nets, appends view requests), so the schema must be plain, human-readable JSON with stable IDs. Write a TypeScript type file `src/schema.ts` and a runtime validator (zod is fine); refuse to load a file that fails validation and show why.

Coordinate frame ("operator frame"): millimetres. Origin at the centre of the rear camera-mount face. +Z points forward toward the front glass, +Y up (the carrying handle side), +X to the operator's right when standing behind the lens looking forward. Every pose is `{ position: [x,y,z], rotation: [rx,ry,rz] (radians, XYZ order), scale: [sx,sy,sz] }`.

Top-level shape:

```
{
  "meta": { "schemaVersion": 1, "units": "mm", "frame": "operator: origin rear mount, +Z front, +Y up, +X operator right", "updated": ISO string },
  "compartments": [ Compartment ],
  "objects":      [ Obj ],
  "pins":         [ Pin ],
  "components":   [ Component ],
  "measurements": [ Measurement ],
  "nets":         [ Net ],
  "photos":       [ Photo ],
  "viewRequests": [ ViewRequest ]
}
```

Entities (all IDs are strings, unique across the file; `status` is one of `PHOTO | MEAS | GUESS | CONFLICT`, see conventions.md):

- Compartment: `{ id, label, pose, size: [w,h,d], color?, notes?, status }`. Translucent shells for the lens body: `BODY`, `OPTICS` (cylinder, use `shape: "cylinder"`), `DOOR-L`, `BAY-L`, `BAY-R`, `BAY-F`, `BOTTOM` (unknown yet, Alex will place it).
- Obj: `{ id, kind: "board" | "connector" | "assembly" | "switch" | "psu" | "other", label, fujiName?, compartment, pose, size: [w,h,thickness], faceTexture?: photoId, notes?, status }`. Boards are thin boxes; the front face (+Z local, or whichever you standardise, document it) can carry a photo texture.
- Pin: `{ id, object: objId, label, local: [u,v] (0..1 across the face texture, or mm if no texture, say which via `localSpace`), side?: "A" | "B", notes? }`. IDs follow conventions: `CN105.7`, `B2.edge.A`, `TB.ZOOM_RATE`, `CAM50.23`.
- Component: `{ id ("B2.IC2"), object, label, part?, local: [u,v], pins?: [ { id: "B2.IC2.4", label: "4" } ], notes?, status }`. Component markers sit on a board face and their pins are valid measurement endpoints.
- Measurement: `{ id, a: pinOrComponentPinId, b: pinOrComponentPinId, type: "continuity" | "resistance" | "diode", result: "beep" | "open" | number, unit?: "ohm" | "V", polarity?: "a+" | "b+", wireColor?: "WH" | "YE" | "RD" | "BN" | "OG" | "BU" | "BK" | "GN" | "VT" | "GY" | "WH-RD" etc, route?: free text, photo?: photoId, note?, powered: false, by: "alex" | "claude", ts: ISO }`. Open results are logged too; they rule things out.
- Net: `{ id, name, members: [pinIds], status, derivedFrom: [measurementIds], notes? }`. Nets are derived from continuity beeps by union-find, then named by a person (Fuji's names where they exist: `ZOOM_RATE`, `+SIG_HT`, `POWER_RET`). A manual rename must survive re-derivation; store it as `name` on the net and re-attach by member overlap. If two beeps would merge two nets that both have manual names, do not merge; mark both `CONFLICT` and surface it.
- Photo: `{ id ("065258", the six digits after the underscore in the original filename), file: "photos/065258.jpg", object?: objId, note?, taken?: ISO }`.
- ViewRequest: `{ id, from: "claude" | "alex", camera: { position: [x,y,z], target: [x,y,z] }, highlight: [ids], question, answer?, status: "open" | "answered", created, answered? }`. Claude appends these by editing the file. The app shows open ones as cards; clicking a card flies the camera and highlights the IDs; typing an answer stores it and marks it answered.

Seed data: `data/lens.json` is provided in this package with compartments, objects, pins for the terminal board and CAM50, and photos already filled from Alex's register. Poses are rough guesses. That is fine because of edit mode (below). Do not hand-tune the seed; ship it and let Alex fix placement in the app.

## Bench mode features (v1)

1. Scene. Compartments as translucent shells, objects as boxes with labels (drei `Html`), the optics as a cylinder. Orbit, pan, zoom. A small axis triad and a "reset view" key. Hover shows ID and label; click selects and opens the inspector panel.

2. Edit mode (key `Tab` toggles). Select any compartment or object and get drei `TransformControls`. Blender-style keys: `G` move, `R` rotate, `S` scale, `X`/`Y`/`Z` constrain to an axis, `Esc` cancel, `Enter` confirm; snapping with `Ctrl` held (10 mm, 15 degrees). Numeric fields in the inspector for exact values. Duplicate (`Shift+D`) and delete with confirmation. New object / compartment from a small palette with sensible default sizes. Everything saved to the JSON. This is how Alex corrects Claude's rough placement without a back-and-forth, so it must be smooth and forgiving (undo/redo, `Ctrl+Z` / `Ctrl+Shift+Z`, at least 50 steps, in-memory is fine).

3. Photos. Drag a JPG from the file system onto a board: the dev server stores it under `public/photos/`, the app downsizes to 2048 px max for the texture (keep the original), creates the Photo record with the six-digit ID, sets it as `faceTexture`. A board with a texture renders the photo on its face, correctly aspect-fit, with a manual flip/rotate control because half of Alex's photos are upside-down relative to the map. A photo can also be pinned to an object without being its texture. Selecting an object lists its photos and opens them in a lightbox.

4. Pins and components on a face. With a board selected and its face in view, `Shift+click` on the face adds a pin at that (u,v); it prompts for an ID with the object prefix prefilled (`CN105.`). A "row" tool adds N evenly spaced pins between two clicks (card edges are 15 numbered fingers plus a lettered side; the CAM50 is a grid). `Alt+click` adds a component marker (`B2.IC2`) with an optional pin count that lays out numbered sub-pins around it. Pins render as small discs on the face, labelled on hover, coloured by whether they belong to a named net.

5. Probe flow. This is the core interaction and it must mirror a multimeter. Two modes, `P` toggles, mode shown in a persistent HUD:
   - Two-click: click endpoint A, click endpoint B, press `B` (beep) or `O` (open). The pair is logged, both endpoints flash, the HUD clears for the next pair.
   - Sticky: click A once; it stays lit. Every subsequent click on another endpoint logs a result immediately with the currently selected result key held (`B` or `O` as a modifier, or a toggle in the HUD), so sweeping a 50-pin connector against one pad is 50 clicks, not 150. `Esc` releases A.
   - Resistance: press `V` to switch the pending result to a value; a number field appears; Enter logs it. Diode mode `D` with polarity chosen by click order (A is red probe).
   - Every logged measurement can carry wire colour (one-key palette: `1..9,0`), a route note, and a photo reference. These fields are optional and must never slow down the two-key rhythm.
   - Beep results feed net derivation live: after each beep the affected net re-colours in the scene, and lines are drawn between pins of the same net (drei `Line`, thin, coloured per net, toggleable with `L`). A net panel lists nets, members, and lets Alex rename them.

6. Inspector panel. Selected entity's fields, editable. For a net: members, measurements that built it, rename. For a measurement: edit or delete. For a photo: pin to object, set as texture.

7. View requests. Open requests show as cards in a side column. Click flies the camera (animate over ~600 ms) and highlights the listed IDs (dim everything else). A text box records the answer and marks it answered. Alex can also create a view request himself (from the current camera and selection) to leave a question for Claude.

8. Search. `/` focuses a search box; typing an ID or label lists matches; Enter flies to it and selects it.

9. Exporters, runnable as `npm run export`: `scripts/export-wireviz.mjs` writes one WireViz YAML per pair of connectors that share a net (WireViz notes must not contain `->`, `<`, `>`, `&`); `scripts/export-register.mjs` regenerates `docs/register.md` tables from the JSON (objects, pins, nets, measurements, with status tags). Keep these simple; they exist so the older text formats never go stale.

## Exhibit mode

Same scene, read-only. Chosen by `?mode=exhibit` or by the production build default. Hover labels, click to open a card with the object's photos, notes, and connected nets. A "tour" of 6 to 8 view requests flagged `tour: true` in the JSON, stepped with arrow keys. Net lines toggle. No editing UI rendered at all, not merely hidden.

## Visual direction

Clean, light, product-page feel. White or very pale background, soft shadows, sans-serif labels, generous whitespace in panels. Colour is reserved for meaning: evidence status (PHOTO, MEAS, GUESS, CONFLICT) on badges and outlines, and one colour per net for pins and lines. The lens shells are pale grey, translucent, with a thin edge line. Nothing neon, nothing dark-mode by default. Alex is a designer and will restyle details; make the structure and spacing sound so that restyling is CSS, not refactoring.

## Non-goals for v1

- No in-browser schematic rendering. KiCad and WireViz handle diagrams outside the app.
- No auth, accounts, or multi-user. Git is the collaboration layer.
- No mobile or touch.
- No glTF import yet, but structure the scene so a compartment can later swap its primitive for a glTF mesh whose node names equal register IDs.
- Do not build a server beyond the two dev-only endpoints.

## Working style

- Ship in this order, each as a commit Alex can run: (1) scene + seed load + edit mode + save; (2) photos as textures + pins + rows; (3) probe flow + nets + lines; (4) inspector, view requests, search; (5) exhibit mode + Pages deploy + exporters. Stop after (5) and write a short `docs/USAGE.md` with the key map.
- Keep `data/lens.json` diffs readable: pretty-print, two-space indent, arrays of entities sorted by id, no reordering of untouched entries.
- Do not invent lens facts. Where the seed says GUESS, keep it GUESS. If a schema decision is ambiguous, pick the option that keeps the JSON simplest for a human to edit by hand, and note it in `docs/USAGE.md`.
- Write a handful of unit tests for net derivation (union-find, manual-name survival, conflict on merging two named nets) and for the exporters. No end-to-end tests needed.
