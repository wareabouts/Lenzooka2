# Lenzooka reverse-engineering conventions

How Alex and Claude record the Fujinon P14x16.5 electronics so both can read, write, and check each other's work. Rule zero: Fuji already named almost everything (board numbers, CN numbers, silkscreen refdes, signal names on the terminal board). We use their names, never invent parallel ones.

## 1. The three layers, and one tool per layer

| Layer | What it captures | Format | Who edits | Render / check |
|---|---|---|---|---|
| Register | every board, connector, part, net, and its evidence status | Markdown tables in `register.md` | both, in any text editor | none needed, it is the source of truth |
| Interconnect | which connector pin goes to which, wire colours, harness routing | WireViz YAML (`wireviz/*.yml`) | both | `wireviz file.yml` gives PNG/SVG/HTML/BOM |
| Board schematics | the circuit on each PCB | KiCad 7 (`kicad/board-N.kicad_sch`), one sheet per Fuji board number | Alex in the KiCad GUI, Claude by editing the text file | `kicad-cli sch export svg` and `sch export netlist` |

Why this split: the harness (connector to connector) is 80 percent of what the multimeter session will produce, and WireViz is a plain-text format that renders a readable diagram in one command. Board schematics need real symbols and a GUI for Alex to tweak, and KiCad's file is plain s-expression text, so Claude can read it, patch it, re-render it, and diff it. Both toolchains are installed and tested in the session (WireViz 0.4.1, KiCad 7.0.11 CLI, Graphviz).

Gotcha already hit: WireViz notes go through Graphviz HTML labels, so no `->`, `<`, `>` or `&` in note strings. Write "to" instead of an arrow.

## 2. Global ID grammar

Everything gets one ID, built from Fuji's own labels:

- Board: `B<n>` using the silkscreen map numbers: B1 ±13V REG, B2 IRIS AMP, B3 EXT SET SIG GEN, B4 DIGITAL CMPR, B5 SYSTEM BOARD, B6 POWER REG PC BOARD, B7 TERMINAL BOARD, B8 and B9 POWER TR ASSY, B10 TURRET MOTOR ASSY, B11 IRIS MOTOR ASSY, B12 TURRET AUTO-MANU SW, B13 P.J ENABLE SW. Extra items not on the map get the next numbers with a note (e.g. B20 LENS/CAMERA switch board, B21 zoom-barrel sensor board, PU = power unit 110A).
- Part on a board: `B2.IC2`, `B5.VR14`, `B1.RL2`. Refdes exactly as silkscreened.
- Connector: Fuji's `CN101` to `CN112`, `J101` to `J103`, plus `CAM50` for the rear 50-pin. Pin: `CN105.7`. Card-edge fingers on the door boards have a letter side and a number side, so `B2.edge.A` and `B2.edge.7`.
- Terminal board pad: `TB.ZOOM_RATE`, using the silkscreen name in caps with underscores.
- Net: the signal name if Fuji gave one (`ZOOM_RATE`, `+SIG_HT`, `POWER_RET`), otherwise `N_<board>_<something>` until it earns a real name.
- Wire: colour code from the WireViz list (WH, YE, RD, BN, OG, BU, BK, GN, VT, GY), plus a stripe if any (`WH-RD`).
- Photo: the six digits after the underscore in the filename, e.g. `photo 065258` for `PXL_20260922_065258248.jpg`. Add a crop hint when useful: `photo 065258, bottom row, 5th pad`.

## 3. Spatial grammar (how we talk about 3D without 3D)

The circuit is a graph, so we never need coordinates to describe it. We only need location to find things, and Fuji's compartments do that. Frame of reference is the operator's: FRONT is the glass, REAR is the camera mount, LEFT and RIGHT as seen standing behind the lens looking forward, TOP is the handle.

Compartments, as named from the photos:

- `DOOR-L` (hinged panel carrying the SYSTEM UNIT label, ASSY 338A, serial 53326): boards B1 to B4 on card-edge sockets marked 5409.78. Board layout on the door, as photographed with the door open, is: top-left B3 EXT SET SIG GEN (12 CMOS ICs), top-right B4 DIGITAL CMPR (CMOS plus three trimpots VR1-3), bottom-left B2 IRIS AMP (4558 and quad op-amp, four trimpots, two TO-220 devices), bottom-right B1 ±13V REG (two relays, diode bridge, four 100uF caps, two TO-220 devices). Note the silkscreen map on the door reads upside down in that photo, so the map is rotated 180 degrees relative to the photo. This board-to-number assignment is a hypothesis from component types; confirm by reading the small board-number stencil near each card edge.
- `BAY-L` (the chassis cavity behind DOOR-L): B5 SYSTEM BOARD (large green board with yellow jumpers, blue/red edge connector), a small op-amp board on a 5403.793 edge connector, B7 TERMINAL BOARD at the top, four TO-3/TO-220 power transistors on a heatsink block (B8/B9), the iris motor, and a large white laced harness.
- `BAY-R` / `PU` (opposite side, POWER UNIT label, ASSY 110A, serial 50326): seven fuse holders (F1 1A, F2 3A, F3 3A, F4 0.5A, spares 1A, 3A, 0.5A), EXT AUTO-MANU and LAMP ON-OFF toggles, two shielded relay/filter cans, a toroidal transformer hand-marked 16V / 240V / 25V, two large can capacitors, a 1.8 ohm 2XL wirewound resistor, and a row of six or seven feed-through terminals.
- `BAY-F` (front cavity, behind the removable side panel, photo 065246): the zoom cam barrel with the 16.5 / 170 / 230 scale, a brass motor and gear train, position pots, the LENS/CAMERA toggle board, and the sensor board with the terminal-board signal names.

When a location is not obvious, say it as: compartment, then landmark, then relative direction. Example: "BAY-L, below the 5403.793 socket, left of the harness trunk."

## 4. Evidence status, on every line

Each net, pin assignment and part value carries one tag:

- `PHOTO` read off silkscreen or a label in a photo (cite the photo)
- `MEAS` confirmed with the meter (continuity, resistance, or voltage, say which)
- `GUESS` inferred from circuit logic or component type
- `CONFLICT` two sources disagree, note both

Nothing goes into a KiCad sheet as a plain wire until it is MEAS. GUESS items go in as a dashed-line note or a `?` label.

## 5. Bench protocol for a continuity session

1. Power off, caps discharged (there are two large cans in the power unit and 100uF caps on B1; check them).
2. Pick one connector as the anchor (the terminal board pads are ideal: they are labelled and accessible).
3. For each anchor pad, beep to: every pin of CAM50, every card-edge finger of B1 to B4, every TB pad. Log hits as `TB.ZOOM_RATE -> CAM50.23 MEAS` in the day's bench sheet.
4. Photograph anything you desolder or unplug before you do it, with the photo ID written in the log.
5. Hand the bench sheet to Claude; Claude updates `register.md` and the WireViz YAML, renders, and returns the diagram for a visual check.

## 6. What Claude can and cannot do from photos

Can: read labels and refdes, read IC part numbers and date codes, count pins, propose board function, write and re-render all three formats, diff what changed, spot inconsistencies between the register and the diagrams.

Cannot reliably: follow a trace under a component, tell which of two adjacent pads a wire lands on, or resolve depth. For those, a straight-down, evenly lit photo of the bare board side with a ruler in frame is worth more than ten angled shots. A phone tripod and a piece of white paper as a bounce make a big difference.
