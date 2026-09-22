# Lenzooka2 · generated circuit register

Generated from `data/lens.json`. Original historical register: `docs/register-original.md`.

## Objects

| ID | Fuji name / label | Compartment | Status | Notes |
| --- | --- | --- | --- | --- |
| B1 | ±13V REG | DOOR-L | GUESS | Relays RL1/RL2 (7921), diodes D1-D8, 4x 100uF, two TO-220. |
| B10 | TURRET MOTOR ASSY | BAY-F | GUESS | Not yet identified in photos. Suggests ES variant with 2x extender turret. |
| B11 | IRIS MOTOR ASSY | BAY-F | PHOTO | Brass motor at the bottom of the zoom barrel (photo 065307). |
| B12 | TURRET AUTO-MANU SW | BAY-R | GUESS | May be the EXT AUTO-MANU toggle on the power unit. |
| B13 | P.J ENABLE SW | BAY-R | GUESS | May be the LAMP ON-OFF toggle on the power unit. |
| B2 | IRIS AMP | DOOR-L | GUESS | JRC 4558D, quad op-amp, VR1-4, two TO-220 outputs. |
| B20 | LENS / CAMERA switch board | BAY-F | PHOTO | IC1, D1-D4, R1-R3, VR1, toggle LENS/CAMERA (photo 065307). |
| B21 | Barrel sensor board | BAY-F | PHOTO | Long narrow board beside the zoom barrel (photo 065246). |
| B3 | EXT SET SIG GEN | DOOR-L | GUESS | 12 CMOS DIPs (MC14011B, MC14001B, MC14002B, CD4071BE). Board-number assignment is a hypothesis; confirm from stencil at card edge. |
| B4 | DIGITAL CMPR | DOOR-L | GUESS | CMOS + trimpots VR1-3 (MC14070B, MC14016B). |
| B5 | SYSTEM BOARD | BAY-L | PHOTO | OP-05 cans, OP-02, AD7512DIKN, VR1-VR17, T1-T32. Blue/red edge connector = CN105. |
| B6 | POWER REG PC BOARD | BAY-L | PHOTO | Small board on 5403.793 socket, 4 trimpots, two 14-pin DIPs. |
| B6.edge | B6 card edge (5403.793) | BAY-L | PHOTO | 15 fingers. |
| B7 | TERMINAL BOARD | BAY-L | PHOTO | Pads labelled with the camera interface signals (photo 065258). |
| B8 | POWER TR ASSY | BAY-L | PHOTO | Four screw-mounted transistors on black heatsink block. |
| B9 | POWER TR ASSY | BAY-L | GUESS | Location unconfirmed. |
| CAM50 | Rear 50-pin camera connector | BODY | PHOTO | Pinout unknown. Number pins with keyway at 12 o'clock, rows top to bottom, left to right; record the scheme used. |
| CN101 | CN101 | BAY-L | GUESS | On silkscreen map near CN112 and CN105; location not yet found. |
| CN102 | CN102 | BAY-L | GUESS |  |
| CN103 | CN103 | BAY-L | GUESS |  |
| CN104 | CN104 | BAY-L | GUESS | Near B6 on map. |
| CN105 | System board edge connector (blue/red) | BAY-L | PHOTO | About 36 positions, double-sided. |
| CN106 | Door card edge under B1 | DOOR-L | GUESS | 5409.78 socket; 15 numbered + A-S lettered fingers. Board-to-CN mapping from silkscreen map, GUESS. |
| CN107 | Door card edge under B2 | DOOR-L | GUESS |  |
| CN108 | Door card edge under B3 | DOOR-L | GUESS |  |
| CN109 | Door card edge under B4 | DOOR-L | GUESS |  |
| CN110 | CN110 | BAY-L | GUESS | At terminal-board end on map. |
| CN111 | CN111 | BOTTOM | GUESS | Not on the map; possibly on the bottom. |
| CN112 | CN112 | BAY-L | GUESS |  |
| J101 | J101 | BAY-L | GUESS |  |
| J102 | J102 | BAY-L | GUESS |  |
| J103 | J103 | BAY-L | GUESS |  |
| PU | POWER UNIT 110A | BAY-R | PHOTO | Toroid, fuses, cans, 1.8 ohm 2XL resistor, feed-through terminals. |

## Pins

| ID | Object | Label | Evidence |
| --- | --- | --- | --- |
| TB.-SIG_HT | B7 | -SIG_HT | GUESS (position / assignment unverified) |
| TB.SIG_COM | B7 | SIG_COM | GUESS (position / assignment unverified) |
| TB.+SIG_HT | B7 | +SIG_HT | GUESS (position / assignment unverified) |
| TB.IRIS_CONT | B7 | IRIS_CONT | GUESS (position / assignment unverified) |
| TB.ZOOM_RATE | B7 | ZOOM_RATE | GUESS (position / assignment unverified) |
| TB.ZOOM_IND | B7 | ZOOM_IND | GUESS (position / assignment unverified) |
| TB.FOCUS_RATE | B7 | FOCUS_RATE | GUESS (position / assignment unverified) |
| TB.-POWER_HT | B7 | -POWER_HT | GUESS (position / assignment unverified) |
| TB.POWER_RET | B7 | POWER_RET | GUESS (position / assignment unverified) |
| TB.+POWER_HT | B7 | +POWER_HT | GUESS (position / assignment unverified) |
| TB.IRIS_RESET | B7 | IRIS_RESET | GUESS (position / assignment unverified) |
| TB.ZOOM_RESET | B7 | ZOOM_RESET | GUESS (position / assignment unverified) |
| TB.FOCUS_RESET | B7 | FOCUS_RESET | GUESS (position / assignment unverified) |
| TB.FOCUS_POS | B7 | FOCUS_POS | GUESS (position / assignment unverified) |
| CAM50.1 | CAM50 | 1 | GUESS (position / assignment unverified) |
| CAM50.2 | CAM50 | 2 | GUESS (position / assignment unverified) |
| CAM50.3 | CAM50 | 3 | GUESS (position / assignment unverified) |
| CAM50.4 | CAM50 | 4 | GUESS (position / assignment unverified) |
| CAM50.5 | CAM50 | 5 | GUESS (position / assignment unverified) |
| CAM50.6 | CAM50 | 6 | GUESS (position / assignment unverified) |
| CAM50.7 | CAM50 | 7 | GUESS (position / assignment unverified) |
| CAM50.8 | CAM50 | 8 | GUESS (position / assignment unverified) |
| CAM50.9 | CAM50 | 9 | GUESS (position / assignment unverified) |
| CAM50.10 | CAM50 | 10 | GUESS (position / assignment unverified) |
| CAM50.11 | CAM50 | 11 | GUESS (position / assignment unverified) |
| CAM50.12 | CAM50 | 12 | GUESS (position / assignment unverified) |
| CAM50.13 | CAM50 | 13 | GUESS (position / assignment unverified) |
| CAM50.14 | CAM50 | 14 | GUESS (position / assignment unverified) |
| CAM50.15 | CAM50 | 15 | GUESS (position / assignment unverified) |
| CAM50.16 | CAM50 | 16 | GUESS (position / assignment unverified) |
| CAM50.17 | CAM50 | 17 | GUESS (position / assignment unverified) |
| CAM50.18 | CAM50 | 18 | GUESS (position / assignment unverified) |
| CAM50.19 | CAM50 | 19 | GUESS (position / assignment unverified) |
| CAM50.20 | CAM50 | 20 | GUESS (position / assignment unverified) |
| CAM50.21 | CAM50 | 21 | GUESS (position / assignment unverified) |
| CAM50.22 | CAM50 | 22 | GUESS (position / assignment unverified) |
| CAM50.23 | CAM50 | 23 | GUESS (position / assignment unverified) |
| CAM50.24 | CAM50 | 24 | GUESS (position / assignment unverified) |
| CAM50.25 | CAM50 | 25 | GUESS (position / assignment unverified) |
| CAM50.26 | CAM50 | 26 | GUESS (position / assignment unverified) |
| CAM50.27 | CAM50 | 27 | GUESS (position / assignment unverified) |
| CAM50.28 | CAM50 | 28 | GUESS (position / assignment unverified) |
| CAM50.29 | CAM50 | 29 | GUESS (position / assignment unverified) |
| CAM50.30 | CAM50 | 30 | GUESS (position / assignment unverified) |
| CAM50.31 | CAM50 | 31 | GUESS (position / assignment unverified) |
| CAM50.32 | CAM50 | 32 | GUESS (position / assignment unverified) |
| CAM50.33 | CAM50 | 33 | GUESS (position / assignment unverified) |
| CAM50.34 | CAM50 | 34 | GUESS (position / assignment unverified) |
| CAM50.35 | CAM50 | 35 | GUESS (position / assignment unverified) |
| CAM50.36 | CAM50 | 36 | GUESS (position / assignment unverified) |
| CAM50.37 | CAM50 | 37 | GUESS (position / assignment unverified) |
| CAM50.38 | CAM50 | 38 | GUESS (position / assignment unverified) |
| CAM50.39 | CAM50 | 39 | GUESS (position / assignment unverified) |
| CAM50.40 | CAM50 | 40 | GUESS (position / assignment unverified) |
| CAM50.41 | CAM50 | 41 | GUESS (position / assignment unverified) |
| CAM50.42 | CAM50 | 42 | GUESS (position / assignment unverified) |
| CAM50.43 | CAM50 | 43 | GUESS (position / assignment unverified) |
| CAM50.44 | CAM50 | 44 | GUESS (position / assignment unverified) |
| CAM50.45 | CAM50 | 45 | GUESS (position / assignment unverified) |
| CAM50.46 | CAM50 | 46 | GUESS (position / assignment unverified) |
| CAM50.47 | CAM50 | 47 | GUESS (position / assignment unverified) |
| CAM50.48 | CAM50 | 48 | GUESS (position / assignment unverified) |
| CAM50.49 | CAM50 | 49 | GUESS (position / assignment unverified) |
| CAM50.50 | CAM50 | 50 | GUESS (position / assignment unverified) |
| CN106.1 | CN106 | 1 | GUESS (position / assignment unverified) |
| CN106.2 | CN106 | 2 | GUESS (position / assignment unverified) |
| CN106.3 | CN106 | 3 | GUESS (position / assignment unverified) |
| CN106.4 | CN106 | 4 | GUESS (position / assignment unverified) |
| CN106.5 | CN106 | 5 | GUESS (position / assignment unverified) |
| CN106.6 | CN106 | 6 | GUESS (position / assignment unverified) |
| CN106.7 | CN106 | 7 | GUESS (position / assignment unverified) |
| CN106.8 | CN106 | 8 | GUESS (position / assignment unverified) |
| CN106.9 | CN106 | 9 | GUESS (position / assignment unverified) |
| CN106.10 | CN106 | 10 | GUESS (position / assignment unverified) |
| CN106.11 | CN106 | 11 | GUESS (position / assignment unverified) |
| CN106.12 | CN106 | 12 | GUESS (position / assignment unverified) |
| CN106.13 | CN106 | 13 | GUESS (position / assignment unverified) |
| CN106.14 | CN106 | 14 | GUESS (position / assignment unverified) |
| CN106.15 | CN106 | 15 | GUESS (position / assignment unverified) |
| CN106.A | CN106 | A | GUESS (position / assignment unverified) |
| CN106.B | CN106 | B | GUESS (position / assignment unverified) |
| CN106.C | CN106 | C | GUESS (position / assignment unverified) |
| CN106.D | CN106 | D | GUESS (position / assignment unverified) |
| CN106.E | CN106 | E | GUESS (position / assignment unverified) |
| CN106.F | CN106 | F | GUESS (position / assignment unverified) |
| CN106.H | CN106 | H | GUESS (position / assignment unverified) |
| CN106.J | CN106 | J | GUESS (position / assignment unverified) |
| CN106.K | CN106 | K | GUESS (position / assignment unverified) |
| CN106.L | CN106 | L | GUESS (position / assignment unverified) |
| CN106.M | CN106 | M | GUESS (position / assignment unverified) |
| CN106.N | CN106 | N | GUESS (position / assignment unverified) |
| CN106.P | CN106 | P | GUESS (position / assignment unverified) |
| CN106.R | CN106 | R | GUESS (position / assignment unverified) |
| CN106.S | CN106 | S | GUESS (position / assignment unverified) |
| CN107.1 | CN107 | 1 | GUESS (position / assignment unverified) |
| CN107.2 | CN107 | 2 | GUESS (position / assignment unverified) |
| CN107.3 | CN107 | 3 | GUESS (position / assignment unverified) |
| CN107.4 | CN107 | 4 | GUESS (position / assignment unverified) |
| CN107.5 | CN107 | 5 | GUESS (position / assignment unverified) |
| CN107.6 | CN107 | 6 | GUESS (position / assignment unverified) |
| CN107.7 | CN107 | 7 | GUESS (position / assignment unverified) |
| CN107.8 | CN107 | 8 | GUESS (position / assignment unverified) |
| CN107.9 | CN107 | 9 | GUESS (position / assignment unverified) |
| CN107.10 | CN107 | 10 | GUESS (position / assignment unverified) |
| CN107.11 | CN107 | 11 | GUESS (position / assignment unverified) |
| CN107.12 | CN107 | 12 | GUESS (position / assignment unverified) |
| CN107.13 | CN107 | 13 | GUESS (position / assignment unverified) |
| CN107.14 | CN107 | 14 | GUESS (position / assignment unverified) |
| CN107.15 | CN107 | 15 | GUESS (position / assignment unverified) |
| CN107.A | CN107 | A | GUESS (position / assignment unverified) |
| CN107.B | CN107 | B | GUESS (position / assignment unverified) |
| CN107.C | CN107 | C | GUESS (position / assignment unverified) |
| CN107.D | CN107 | D | GUESS (position / assignment unverified) |
| CN107.E | CN107 | E | GUESS (position / assignment unverified) |
| CN107.F | CN107 | F | GUESS (position / assignment unverified) |
| CN107.H | CN107 | H | GUESS (position / assignment unverified) |
| CN107.J | CN107 | J | GUESS (position / assignment unverified) |
| CN107.K | CN107 | K | GUESS (position / assignment unverified) |
| CN107.L | CN107 | L | GUESS (position / assignment unverified) |
| CN107.M | CN107 | M | GUESS (position / assignment unverified) |
| CN107.N | CN107 | N | GUESS (position / assignment unverified) |
| CN107.P | CN107 | P | GUESS (position / assignment unverified) |
| CN107.R | CN107 | R | GUESS (position / assignment unverified) |
| CN107.S | CN107 | S | GUESS (position / assignment unverified) |
| CN108.1 | CN108 | 1 | GUESS (position / assignment unverified) |
| CN108.2 | CN108 | 2 | GUESS (position / assignment unverified) |
| CN108.3 | CN108 | 3 | GUESS (position / assignment unverified) |
| CN108.4 | CN108 | 4 | GUESS (position / assignment unverified) |
| CN108.5 | CN108 | 5 | GUESS (position / assignment unverified) |
| CN108.6 | CN108 | 6 | GUESS (position / assignment unverified) |
| CN108.7 | CN108 | 7 | GUESS (position / assignment unverified) |
| CN108.8 | CN108 | 8 | GUESS (position / assignment unverified) |
| CN108.9 | CN108 | 9 | GUESS (position / assignment unverified) |
| CN108.10 | CN108 | 10 | GUESS (position / assignment unverified) |
| CN108.11 | CN108 | 11 | GUESS (position / assignment unverified) |
| CN108.12 | CN108 | 12 | GUESS (position / assignment unverified) |
| CN108.13 | CN108 | 13 | GUESS (position / assignment unverified) |
| CN108.14 | CN108 | 14 | GUESS (position / assignment unverified) |
| CN108.15 | CN108 | 15 | GUESS (position / assignment unverified) |
| CN108.A | CN108 | A | GUESS (position / assignment unverified) |
| CN108.B | CN108 | B | GUESS (position / assignment unverified) |
| CN108.C | CN108 | C | GUESS (position / assignment unverified) |
| CN108.D | CN108 | D | GUESS (position / assignment unverified) |
| CN108.E | CN108 | E | GUESS (position / assignment unverified) |
| CN108.F | CN108 | F | GUESS (position / assignment unverified) |
| CN108.H | CN108 | H | GUESS (position / assignment unverified) |
| CN108.J | CN108 | J | GUESS (position / assignment unverified) |
| CN108.K | CN108 | K | GUESS (position / assignment unverified) |
| CN108.L | CN108 | L | GUESS (position / assignment unverified) |
| CN108.M | CN108 | M | GUESS (position / assignment unverified) |
| CN108.N | CN108 | N | GUESS (position / assignment unverified) |
| CN108.P | CN108 | P | GUESS (position / assignment unverified) |
| CN108.R | CN108 | R | GUESS (position / assignment unverified) |
| CN108.S | CN108 | S | GUESS (position / assignment unverified) |
| CN109.1 | CN109 | 1 | GUESS (position / assignment unverified) |
| CN109.2 | CN109 | 2 | GUESS (position / assignment unverified) |
| CN109.3 | CN109 | 3 | GUESS (position / assignment unverified) |
| CN109.4 | CN109 | 4 | GUESS (position / assignment unverified) |
| CN109.5 | CN109 | 5 | GUESS (position / assignment unverified) |
| CN109.6 | CN109 | 6 | GUESS (position / assignment unverified) |
| CN109.7 | CN109 | 7 | GUESS (position / assignment unverified) |
| CN109.8 | CN109 | 8 | GUESS (position / assignment unverified) |
| CN109.9 | CN109 | 9 | GUESS (position / assignment unverified) |
| CN109.10 | CN109 | 10 | GUESS (position / assignment unverified) |
| CN109.11 | CN109 | 11 | GUESS (position / assignment unverified) |
| CN109.12 | CN109 | 12 | GUESS (position / assignment unverified) |
| CN109.13 | CN109 | 13 | GUESS (position / assignment unverified) |
| CN109.14 | CN109 | 14 | GUESS (position / assignment unverified) |
| CN109.15 | CN109 | 15 | GUESS (position / assignment unverified) |
| CN109.A | CN109 | A | GUESS (position / assignment unverified) |
| CN109.B | CN109 | B | GUESS (position / assignment unverified) |
| CN109.C | CN109 | C | GUESS (position / assignment unverified) |
| CN109.D | CN109 | D | GUESS (position / assignment unverified) |
| CN109.E | CN109 | E | GUESS (position / assignment unverified) |
| CN109.F | CN109 | F | GUESS (position / assignment unverified) |
| CN109.H | CN109 | H | GUESS (position / assignment unverified) |
| CN109.J | CN109 | J | GUESS (position / assignment unverified) |
| CN109.K | CN109 | K | GUESS (position / assignment unverified) |
| CN109.L | CN109 | L | GUESS (position / assignment unverified) |
| CN109.M | CN109 | M | GUESS (position / assignment unverified) |
| CN109.N | CN109 | N | GUESS (position / assignment unverified) |
| CN109.P | CN109 | P | GUESS (position / assignment unverified) |
| CN109.R | CN109 | R | GUESS (position / assignment unverified) |
| CN109.S | CN109 | S | GUESS (position / assignment unverified) |

## Nets

| ID | Name | Members | Status |
| --- | --- | --- | --- |


## Measurements

| ID | A | B | Type | Result | Wire | Status |
| --- | --- | --- | --- | --- | --- | --- |


