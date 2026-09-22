# Lenzooka register (first pass from photos, 2026-09-21)

Status tags: PHOTO / MEAS / GUESS / CONFLICT. See conventions.md.

## Identity labels

| Item | Reading | Status |
|---|---|---|
| System unit plate | SYSTEM UNIT, ASSY No 338A 2428710, SERIAL No 53326, Fuji Photo Optical Co., Ltd. | PHOTO 060524 |
| Power unit plate | POWER UNIT, ASSY No 110A 2975240, SERIAL No 50326 | PHOTO 065738 |
| Asset tag | COMPACT VIDEO SYSTEMS, INC. T-826 (metal tag on DOOR-L). Compact Video Systems was a Burbank mobile-production company, which fits the Apex Surplus provenance and the CAM 3 label. Worth a search. | PHOTO 060524 |
| IC date codes | 7910, 7912, 7921, 7922, 7841, 7999 (Motorola CMOS), 7922 (OP-05 cans) | PHOTO 065524, 065441 |
| Card-edge socket markings | 5409.78 (door boards), 5403.793 (small board in BAY-L) | PHOTO |

## Silkscreen map on DOOR-L (photo 065635)

Numbered list, verbatim: 1 ±13V REG, 2 IRIS AMP, 3 EXT SET SIG GEN, 4 DIGITAL CMPR, 5 SYSTEM BOARD, 6 POWER REG PC BOARD, 7 TERMINAL BOARD, 8 POWER TR ASSY, 9 POWER TR ASSY, 10 TURRET MOTOR ASSY, 11 IRIS MOTOR ASSY, 12 TURRET AUTO-MANU SW, 13 P.J ENABLE SW.

Connectors drawn on the map: CN101, CN102, CN103, CN104, CN105, CN106, CN107, CN108, CN109, CN110, CN112, J101, J102, J103. CN106/CN107 sit under boards 1/2 and CN109/CN108 under boards 4/3, so those are the four door-board card edges. CN105 is the long one beside board 5 (the blue/red edge connector on the system board). CN110 is at the terminal-board end. CN111 is not drawn; it may be the rear CAM50 or the front bay.

Note the map was photographed upside-down relative to the boards (photo 065650), so rotate it 180 degrees when matching to the physical door.

## Boards

| ID | Fuji name | Where | What is on it (PHOTO) | Function reading (GUESS) |
|---|---|---|---|---|
| B1 | ±13V REG | DOOR-L bottom-right | 2 relays marked 7921 (RL1, RL2), diodes D1-D8, 4x 100uF 25V Nichicon, 2 TO-220 on the bottom heatsink bar, edge fingers A-S | Local regulated rails from the raw supply; relays likely switch power to motor amps or select LENS/CAMERA control |
| B2 | IRIS AMP | DOOR-L bottom-left | JRC 4558D dual op-amp (IC2), a 14-pin quad op-amp (RC4136?), 4 trimpots VR1-4, Q1/Q2 TO-220 output pair, 1uF/47uF caps, board number 110B1612030 | Iris servo error amp and driver; VR1-4 are gain/offset/limit trims |
| B3 | EXT SET SIG GEN | DOOR-L top-left | 12 DIP CMOS: MC14011B, MC14001B x3, MC14002B x2, CD4071BE (RCA), MC14093?, plus small transistors and a 22uF cap | Extender (turret) set signal generator: logic that sequences the 2x extender turret |
| B4 | DIGITAL CMPR | DOOR-L top-right | CD4071BE, MC14070B, MC14002B x2, MC14016B (analog switch), MC14001B, MC14013?, 3 trimpots VR1-3, green 0.1uF caps, resistor ladder | Digital comparator: compares a position code against a setpoint, probably for the turret |
| B5 | SYSTEM BOARD | BAY-L, behind door | Large green board, many yellow jumper links, ~10 red trimpots VR1-VR17, TO-99 op-amp cans OP-05 CJ 7922 (several), OP-02 CJ 7841, AD7512DIKN (dual CMOS analog switch, IC5 area), 14-pin DIPs, ~30 transistors T1-T32, diodes D1-D32, MFM 10k resistor network, blue/red edge connector (CN105), board number 110B24...12 | Zoom and focus servo loops: rate command in, tacho/pot feedback, error amps, current drive to the power transistors |
| B6 | POWER REG PC BOARD | BAY-L, small board on 5403.793 socket | 2x 14-pin DIP (label reads SG1501AJ or similar), 4 trimpots, 0.20uF and 0.2uF metal-cased caps, 4 small blue electrolytics, red thermistor-looking part | Regulator control for the ±15V rails or the motor supply |
| B7 | TERMINAL BOARD | BAY-L top (photo 065258) | Pads labelled: -SIG HT (-15V), SIG COM (0V), +SIG HT (+15V), IRIS CONT, ZOOM RATE, ZOOM IND, FOCUS RATE; -POWER HT (-15V), POWER RET (0V), +POWER HT (+15V), IRIS RESET, ZOOM RESET, FOCUS RESET, FOCUS POS. Also R1-R8 and Q2 pads and a 4x3 pad block lettered C, D, E. Board number 110B25...70 | This is the lens-to-camera signal interface. SIG rails feed the small-signal electronics, POWER rails feed the motor amps. RATE = velocity command, IND/POS = position readback, RESET = return-to-preset |
| B8, B9 | POWER TR ASSY | BAY-L, black heatsink block, 4 screw-mounted transistors | four TO-220/TO-3P devices | Motor output stages (zoom, focus) |
| B10 | TURRET MOTOR ASSY | not yet photographed clearly | | Drives the extender turret |
| B11 | IRIS MOTOR ASSY | BAY-F / BAY-L junction | brass motor with gear at the bottom of the zoom barrel (photo 065307) | Iris drive |
| B12 | TURRET AUTO-MANU SW | | | |
| B13 | P.J ENABLE SW | | | Pattern projector (diascope) enable |
| B20 | LENS / CAMERA switch board | BAY-F, small board with toggle (photo 065307) | IC1 (8-pin), D1-D4, R1-R3, VR1, toggle labelled LENS / CAMERA, board 110B... | Selects whether servo commands come from the lens's own controls or the camera CCU |
| B21 | Barrel sensor board | BAY-F, long narrow board beside the zoom barrel (photo 065246) | pad rows, several resistors | Zoom position pickup / end-stop switches |
| PU | POWER UNIT 110A | BAY-R | fuses F1 1A, F2 3A, F3 3A, F4 0.5A + 3 spares; toggles EXT AUTO-MANU, LAMP ON-OFF; toroid marked 16V, 240V E, 25V; two large can caps; 1.8 ohm 2XL wirewound (bleeder or inrush); two shielded cans (relay or filter); 7 feed-through terminals; a small lamp socket at top (projector lamp?) | The lens has its own mains-derived supply. 240V on the toroid needs checking: it may be a 240V-primary tap, a 120/240 dual primary, or a secondary for something else. Do not apply mains until the primary wiring is confirmed. |

## Connectors

| ID | Where | Pins | Notes | Status |
|---|---|---|---|---|
| CAM50 | rear casting | ~50 | pinout unknown; anchor the first continuity session here | PHOTO |
| CN105 | B5 edge (blue/red) | ~36 double-sided (label "36B" seen) | white harness | PHOTO |
| CN106-109 | door board card edges | 15 numbered + A-S lettered | white harness laced along the door | PHOTO |
| 5403.793 socket | B6 edge | 15 | | PHOTO |
| TB pads | B7 | 14 named + spare block | see B7 row | PHOTO |

## Open questions

1. Is this the ES version (turret with 2x extender)? The map lists TURRET MOTOR ASSY and P.J ENABLE, both ES features per the 1980 ad.
2. Where does mains enter? Look for an AC inlet or for mains pins on CAM50 (studio cameras of the era often fed lens AC through the cable).
3. Which door board is which number: confirm from the stencils near the card edges.
4. CN111 location.
