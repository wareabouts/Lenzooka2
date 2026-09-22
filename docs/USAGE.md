# Lenzooka2 field guide

## Start at the bench

Run `npm ci`, then `npm run dev -- --port 5174` and open http://127.0.0.1:5174. The published GitHub Pages site is an exhibit: it cannot save to your local files. `?mode=exhibit` previews that read-only experience locally. Production builds always remain read-only, even if a different mode is requested in the URL.

Select a board or connector in the explorer. The 3D atlas locates it and the focused face below the probe station offers larger, precise targets. Double-click an explorer item or use Focus to fly to it. The supplied geometry, board assignments and CAM50 numbering are provisional; no hypothetical measurements have been added.

## Probe

Click endpoint A, then B. Press B for a continuity beep or O for open. Both results are recorded. P toggles sticky mode: select your anchor once, then each other endpoint records the chosen continuity result. Hold B or O to override the selected result during a sweep. Esc releases the anchor. The optional wire palette, route field and reference photo persist between readings.

V selects resistance; D selects diode. Enter a non-negative reading and press Enter. A is the red probe for diode readings. These are unpowered measurements, as specified by the seed protocol. The software does not establish that the physical instrument is safe to power.

Named networks derive from continuity only. Names beginning `N_` are automatic; use another name for a manual signal name. Differently named networks that a beep would merge remain separate and turn CONFLICT. Inspect the source readings in Log; delete or correct the disputed reading, or give both nets the same name after confirming they are the same physical network. Undo reverses accidental changes.

## Placement, photos and endpoints

Tab enters placement mode. G/R/S choose move/rotate/scale; X/Y/Z constrain the gizmo. Drag its handles. Hold Ctrl for 10 mm translation or 15-degree rotation snapping. Numeric placement fields use millimetres and XYZ Euler radians. Shift D duplicates the selected spatial item; Delete opens a dependency-aware confirmation. Ctrl Z / Ctrl Shift Z undo and redo up to 75 in-memory changes.

Drop a JPEG onto the selected face or 3D scene, or click Attach JPEG. The original stays under `public/photos/`; 3D textures are capped at 2048 px in memory. Photo IDs preserve the six-digit filename ID where available; collisions get a suffix, never overwrite an original. Rotate and flip the face texture using its toolbar. Reference photos open in a lightbox and can be assigned to objects from the inspector.

Shift-click a face to add a pin; Alt-click to add a component. The focused face also has explicit Pin, Row and Component controls. Row adds 2–100 numbered endpoints between two clicks using your chosen prefix. Arrange lets you drag existing pin/component markers to correct their rough positions and edit pin labels/notes. Component pins appear around the marker and are measurement endpoints.

Coordinates: object and compartment poses are absolute in the operator frame; compartment membership is organizational, not transform parenting. Object faces are local +Z. Textured pins use UV across the original source photo, origin top-left, before flip/rotation. The image is aspect-fit to the board. Rotating or flipping a texture moves its UV markers with it. Untextured UV spans the board face. `localSpace: mm` is centred local XY. Component local coordinates are UV. Additional object fields `textureRotation` (degrees) and `textureFlip` record display orientation. Scaling a compartment changes its shell, not the contained objects.

## Save and collaborate

Every mutation saves to `data/lens.json` after 500 ms. The header reports Unsaved, Saving or Saved. A browser recovery copy is written immediately and offered after a failed/unfinished session. On disk failure the app retains your session, offers Retry and lets you download a JSON backup. Photos and JSON remain your files.

As requested, avoid simultaneous edits between Claude and the app. Finish saving, let Claude edit `data/lens.json`, then click Reload JSON. Reloading with unsaved changes offers a backup first. There is no automatic merge. Invalid data is rejected with validation details; fix the cited ID/field in JSON and reload. Unknown entity fields are preserved. Entity arrays are sorted by stable ID on save for readable diffs.

The Notes tab opens saved views and highlights their objects. Answer a question there, or create one from the current camera and selection. Seven exhibit tour views use only descriptions from the supplied materials; they are narration, not new evidence. The original three open questions remain open.

## Keys

| Key | Action |
| --- | --- |
| / | Search |
| Home | Reset camera |
| L | Net lines |
| Tab | Placement mode |
| G / R / S | Move / rotate / scale |
| X / Y / Z | Constrain axis |
| Ctrl | Snap during transform |
| Esc / Enter | Cancel / confirm transform |
| Shift D | Duplicate |
| Delete | Delete confirmation |
| Ctrl Z / Ctrl Shift Z | Undo / redo |
| P | Sticky probe |
| B / O | Beep / open |
| V / D | Resistance / diode |
| 1–9 / 0 | WH, YE, RD, BN, OG, BU, BK, GN, VT, GY |
| Left / Right | Exhibit tour |
| ? | Keyboard guide |

## Export and publish

`npm run export` writes `docs/register.md` and one `wireviz/*.yml` per connected connector pair. The historical notes remain in `docs/register-original.md`. Conflicting nets are excluded from WireViz. WireViz and KiCad remain external tools; this app does not synthesize internal PCB traces from photos.

Push to `main` runs tests and builds/deploys GitHub Pages. The separate repository and base path are `wareabouts/Lenzooka2` and `/Lenzooka2/`. The public exhibit includes only repository data; local readings appear there after you commit and push them.
