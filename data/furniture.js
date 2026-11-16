/**
 * furniture.js - Canonical 3D B-Rep Furniture & Cabinet Database
 *
 * Coordinate System (Right-Handed 3D Architectural / BIM Convention):
 * - X axis: East -> West horizontal axis in millimeters (Axis 6 = 0 mm; Kitchen North Wall spans X = 6,515..11,915 mm)
 * - Y axis: North -> South horizontal axis in millimeters (Axis A = 0 mm; Kitchen North Wall interior face = 3,170 mm)
 * - Z axis: Vertical height / elevation in millimeters (Finished Ground Floor = 0 mm)
 *
 * Every cabinet object in this database is composed of two explicit 3D parts:
 * 1. `skeleton`: Structural carcass panels (18 mm side/bottom/back/top/divider boards), recessed plinth (cokół), and 30 mm worktop (blat) for base units.
 * 2. `fronts`: Removable exterior drawer/door front panels (wood-tone), integrated handle rails/bars, and built-in appliance fronts (Oven / Piekarnik & Microwave / Mikrofala).
 */
(function (root, factory) {
    const data = factory();
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = data;
    } else {
        root.DEFAULT_FURNITURE_DATA = data;
        root.FURNITURE_DATABASE = data;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const Y_WALL = 3170;         // Kitchen North Wall (EW_NORTH_RECESSED) interior South face
    const Y_PLINTH_FRONT = 3710; // 150 mm plinth recessed 60 mm from front face (depth 540 mm)
    const Y_CARCASS_FRONT = 3750;// 580 mm deep carcass skeleton
    const Y_FRONT_FACE = 3770;   // 20 mm thick front panels (total cabinet depth = 600 mm)
    const BOARD_MM = 18;         // 18 mm structural carcass board thickness

    const COLOR_PLINTH = [0.29, 0.23, 0.20];         // #4A3B32 dark plinth (cokół)
    const COLOR_CARCASS_SIDE = [0.94, 0.91, 0.85];   // Warm light melamine side panels
    const COLOR_CARCASS_BACK = [0.91, 0.88, 0.81];   // Rear backing panel
    const COLOR_CARCASS_SHELF = [0.93, 0.90, 0.84];  // Horizontal carcass shelves/bottom/top
    const COLOR_WORKTOP = [0.91, 0.86, 0.77];        // #E8DCC4 30 mm stone/composite worktop (blat)
    const COLOR_WOOD_FRONT = [0.63, 0.48, 0.38];     // #A17A62 warm oak veneer front
    const COLOR_ALU_RAIL = [0.82, 0.84, 0.86];       // #D1D5DB recessed Gola aluminum rail
    const COLOR_DARK_HANDLE = [0.29, 0.23, 0.20];    // #4A3B32 vertical bar handle on tall units
    const COLOR_APPLIANCE_BODY = [0.11, 0.12, 0.13]; // #1A1A1A black glass/steel oven & microwave front
    const COLOR_APPLIANCE_GLASS = [0.22, 0.24, 0.26];// #333333 oven & microwave viewing window

    const COLOR_SINK_STEEL_RIM = [0.78, 0.80, 0.83];   // #C7CCD4 brushed stainless steel top rim & faucet chrome
    const COLOR_SINK_STEEL_WALL = [0.66, 0.69, 0.73];  // #A8B0BA brushed stainless steel interior basin walls
    const COLOR_SINK_STEEL_FLOOR = [0.72, 0.75, 0.78]; // #B8BFC7 brushed stainless steel basin floor
    const COLOR_SINK_DRAIN_DARK = [0.22, 0.24, 0.27];  // #383D45 dark strainer basket holes & overflow slot
    const COLOR_FAUCET_CHROME = [0.84, 0.87, 0.90];    // #D6DEE6 polished chrome faucet body & spring arch

    /**
     * Build standard base carcass skeleton (150 mm plinth + 720 mm carcass box = 870 mm; shared 30 mm countertop is KITCHEN_COUNTERTOP).
     */
    function buildBaseSkeleton(idPrefix, x0, x1, includeMidDrawerShelf, plinthX1Override) {
        const px1 = (typeof plinthX1Override === 'number') ? plinthX1Override : x1;
        const parts = [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${px1 - x0}×540×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: x0, x1: px1,
                y0: Y_WALL, y1: Y_PLINTH_FRONT,
                z0: 0, z1: 150
            },
            {
                id: `${idPrefix}_EAST_PANEL`,
                name: 'Right/East Side Carcass Panel (18×580×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x0, x1: x0 + BOARD_MM,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_WEST_PANEL`,
                name: 'Left/West Side Carcass Panel (18×580×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x1 - BOARD_MM, x1: x1,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_BACK_PANEL`,
                name: `Rear Carcass Backing Panel (${x1 - x0 - 2 * BOARD_MM}×18×720 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL, y1: Y_WALL + BOARD_MM,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Carcass Panel (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 150 + BOARD_MM
            }
        ];

        if (includeMidDrawerShelf) {
            parts.push({
                id: `${idPrefix}_MID_SHELF`,
                name: `Middle Drawer Divider Shelf (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: 501, z1: 519
            });
        }

        parts.push({
            id: `${idPrefix}_TOP_PANEL`,
            name: `Top Carcass Panel (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
            role: 'carcass_panel',
            material: 'carcass_melamine',
            colorRgb: COLOR_CARCASS_SHELF,
            x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
            y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
            z0: 870 - BOARD_MM, z1: 870
        });

        return parts;
    }

    /**
     * Build 900 mm Sink Base Cabinet skeleton (CAB_KITCHEN_N2) with a wide open top (864 × 454 mm clear opening)
     * to receive the 90 cm undermount stainless steel kitchen sink bowl, plus front/rear top stretcher rails
     * and a lower rear plumbing service panel.
     */
    function buildSinkBaseSkeleton(idPrefix, x0, x1) {
        const innerW = x1 - x0 - 2 * BOARD_MM;
        return [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${x1 - x0}×540×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: x0, x1: x1,
                y0: Y_WALL, y1: Y_PLINTH_FRONT,
                z0: 0, z1: 150
            },
            {
                id: `${idPrefix}_EAST_PANEL`,
                name: 'Right/East Side Carcass Panel (18×580×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x0, x1: x0 + BOARD_MM,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_WEST_PANEL`,
                name: 'Left/West Side Carcass Panel (18×580×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x1 - BOARD_MM, x1: x1,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_BACK_LOWER_PANEL`,
                name: `Lower Rear Plumbing Service Panel (${innerW}×18×330 mm, open above for sink plumbing)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL, y1: Y_WALL + BOARD_MM,
                z0: 150, z1: 480
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Carcass Panel (${innerW}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 150 + BOARD_MM
            },
            {
                id: `${idPrefix}_TOP_REAR_RAIL`,
                name: `Top Rear Sink Support Stretcher Rail (${innerW}×50×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_WALL + BOARD_MM + 50,
                z0: 870 - BOARD_MM, z1: 870
            },
            {
                id: `${idPrefix}_TOP_FRONT_RAIL`,
                name: `Top Front Sink Support Stretcher Rail (${innerW}×58×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_CARCASS_FRONT - 58, y1: Y_CARCASS_FRONT,
                z0: 870 - BOARD_MM, z1: 870
            }
        ];
    }

    /**
     * Build 2-drawer fronts (2 × 330 mm wood drawer fronts + 2 × 30 mm Gola aluminum handle rails).
     */
    function buildTwoDrawerFronts(idPrefix, x0, x1) {
        const w = x1 - x0;
        return [
            {
                id: `${idPrefix}_FRONT_LOWER`,
                name: `Lower Drawer Wood Front (${w - 4}×20×328 mm)`,
                role: 'drawer_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: x0 + 2, x1: x1 - 2,
                y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                z0: 152, z1: 480
            },
            {
                id: `${idPrefix}_RAIL_LOWER`,
                name: `Lower Recessed Aluminum Handle Rail (${w}×22×30 mm)`,
                role: 'handle_rail',
                material: 'aluminum_rail',
                colorRgb: COLOR_ALU_RAIL,
                x0: x0, x1: x1,
                y0: Y_CARCASS_FRONT - 4, y1: Y_FRONT_FACE - 2,
                z0: 480, z1: 510
            },
            {
                id: `${idPrefix}_FRONT_UPPER`,
                name: `Upper Drawer Wood Front (${w - 4}×20×328 mm)`,
                role: 'drawer_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: x0 + 2, x1: x1 - 2,
                y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                z0: 512, z1: 840
            },
            {
                id: `${idPrefix}_RAIL_UPPER`,
                name: `Upper Recessed Aluminum Handle Rail (${w}×22×30 mm)`,
                role: 'handle_rail',
                material: 'aluminum_rail',
                colorRgb: COLOR_ALU_RAIL,
                x0: x0, x1: x1,
                y0: Y_CARCASS_FRONT - 4, y1: Y_FRONT_FACE - 2,
                z0: 840, z1: 870
            }
        ];
    }

    /**
     * Build full-height single-door base front (690 mm wood front + 30 mm top Gola aluminum handle rail).
     */
    function buildFullHeightBaseFront(idPrefix, x0, x1, labelPrefix) {
        const w = x1 - x0;
        return [
            {
                id: `${idPrefix}_FRONT_MAIN`,
                name: `${labelPrefix} Full-Height Wood Front (${w - 4}×20×688 mm)`,
                role: 'door_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: x0 + 2, x1: x1 - 2,
                y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                z0: 152, z1: 840
            },
            {
                id: `${idPrefix}_RAIL_TOP`,
                name: `Top Recessed Aluminum Handle Rail (${w}×22×30 mm)`,
                role: 'handle_rail',
                material: 'aluminum_rail',
                colorRgb: COLOR_ALU_RAIL,
                x0: x0, x1: x1,
                y0: Y_CARCASS_FRONT - 4, y1: Y_FRONT_FACE - 2,
                z0: 840, z1: 870
            }
        ];
    }

    /**
     * Build tall 2,700 mm cabinet carcass skeleton (150 mm plinth + 2,550 mm carcass with horizontal shelves at zShelves).
     */
    function buildTallSkeleton(idPrefix, x0, x1, zShelves) {
        const parts = [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${x1 - x0}×540×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: x0, x1: x1,
                y0: Y_WALL, y1: Y_PLINTH_FRONT,
                z0: 0, z1: 150
            },
            {
                id: `${idPrefix}_EAST_PANEL`,
                name: 'Right/East Tall Side Carcass Panel (18×580×2550 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x0, x1: x0 + BOARD_MM,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_WEST_PANEL`,
                name: 'Left/West Tall Side Carcass Panel (18×580×2550 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: x1 - BOARD_MM, x1: x1,
                y0: Y_WALL, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_BACK_PANEL`,
                name: `Rear Tall Backing Panel (${x1 - x0 - 2 * BOARD_MM}×18×2550 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL, y1: Y_WALL + BOARD_MM,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Carcass Panel (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: 150, z1: 150 + BOARD_MM
            }
        ];

        (zShelves || []).forEach((zBoundary, idx) => {
            parts.push({
                id: `${idPrefix}_SHELF_${idx + 1}`,
                name: `Horizontal Carcass Shelf at Z=${zBoundary} mm (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: zBoundary - Math.floor(BOARD_MM / 2),
                z1: zBoundary + Math.ceil(BOARD_MM / 2)
            });
        });

        parts.push({
            id: `${idPrefix}_TOP_PANEL`,
            name: `Top Carcass Panel at Z=2,700 mm (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
            role: 'carcass_panel',
            material: 'carcass_melamine',
            colorRgb: COLOR_CARCASS_SHELF,
            x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
            y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
            z0: 2700 - BOARD_MM, z1: 2700
        });

        return parts;
    }

    const X_WEST_WALL = 11915;          // Kitchen West Wall (GW_3) interior East face
    const X_WEST_PLINTH_FRONT = 11375;  // 150 mm plinth recessed 60 mm from East front face (depth 540 mm)
    const X_WEST_CARCASS_FRONT = 11335; // 580 mm deep carcass skeleton for West Wall base/tall units
    const X_WEST_FRONT_FACE = 11315;    // 20 mm thick front panels at East face (total depth = 600 mm)

    const X_WEST_UPPER_CARCASS_FRONT = 11625; // 290 mm deep carcass skeleton for West Wall upper units
    const X_WEST_UPPER_FRONT_FACE = 11605;    // 20 mm thick front panels for West Wall upper units (total depth = 310 mm)

    // Dining Room side of West Wall (GW_3, South section Y = 6,620..8,570 mm): 300 mm (30 cm) total depth
    const X_DINING_PLINTH_FRONT = 11675;      // 150 mm plinth recessed 60 mm from front face (depth 240 mm)
    const X_DINING_CARCASS_FRONT = 11635;     // 280 mm deep carcass skeleton (X = 11,635..11,915 mm)
    const X_DINING_FRONT_FACE = 11615;        // 20 mm thick front panels (total cabinet depth = 300 mm, X = 11,615..11,915 mm)

    const COLOR_VITRINE_FRAME = [0.56, 0.42, 0.28];  // #8E6B47 bronze/oak frame around vitrine glass doors
    const COLOR_VITRINE_GLASS = [0.55, 0.82, 0.96];  // #E0F2FE / #38BDF8 translucent vitrine showcase glass

    /**
     * Build West Wall (GW_3) standard base carcass skeleton facing East ([-1, 0, 0]):
     * 150 mm plinth + 720 mm carcass box (X = 11,335..11,915 mm) + 30 mm worktop blat (X = 11,315..11,915 mm).
     */
    function buildWestBaseSkeleton(idPrefix, y0, y1, includeMidDrawerShelf, plinthY0Override, plinthY1Override) {
        const w = y1 - y0;
        const py0 = (typeof plinthY0Override === 'number') ? plinthY0Override : y0;
        const py1 = (typeof plinthY1Override === 'number') ? plinthY1Override : y1;
        const parts = [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${py1 - py0}×540×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: X_WEST_PLINTH_FRONT, x1: X_WEST_WALL,
                y0: py0, y1: py1,
                z0: 0, z1: 150
            },
            {
                id: `${idPrefix}_NORTH_PANEL`,
                name: 'Left/North Side Carcass Panel (580×18×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y0, y1: y0 + BOARD_MM,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_SOUTH_PANEL`,
                name: 'Right/South Side Carcass Panel (580×18×720 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y1 - BOARD_MM, y1: y1,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_BACK_PANEL`,
                name: `Rear Carcass Backing Panel (18×${w - 2 * BOARD_MM}×720 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: X_WEST_WALL - BOARD_MM, x1: X_WEST_WALL,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 150, z1: 870
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Carcass Panel (562×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 150, z1: 150 + BOARD_MM
            }
        ];

        if (includeMidDrawerShelf) {
            parts.push({
                id: `${idPrefix}_MID_SHELF`,
                name: `Middle Drawer Divider Shelf (562×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 501, z1: 519
            });
        }

        parts.push({
            id: `${idPrefix}_TOP_PANEL`,
            name: `Top Carcass Panel (562×${w - 2 * BOARD_MM}×18 mm)`,
            role: 'carcass_panel',
            material: 'carcass_melamine',
            colorRgb: COLOR_CARCASS_SHELF,
            x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
            y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
            z0: 870 - BOARD_MM, z1: 870
        });

        return parts;
    }

    /**
     * Build the single continuous L-shaped 30 mm (3 cm) stone countertop (Z = 870..900 mm)
     * spanning all North Wall base cabinets (N1..N5, X = 8,335..11,915 mm, Y = 3,170..3,770 mm)
     * and all West Wall base cabinets (W1..W5, X = 11,315..11,915 mm, Y = 3,170..6,170 mm),
     * with a wide 820 × 400 mm sink cutout opening over CAB_KITCHEN_N2 (X = 10,155..10,975 mm, Y = 3,290..3,690 mm).
     */
    function buildKitchenCountertopPart() {
        const z0 = 870, z1 = 900;
        const xEast = 8335, xWest = 11915, xCornerInner = 11315;
        const yNorth = 3170, yCornerInner = 3770, ySouth = 6170;
        // Wide 90cm-cabinet sink cutout over CAB_KITCHEN_N2 (X = 10,115..11,015 mm)
        const sx0 = 10155, sx1 = 10975; // 820 mm wide opening
        const sy0 = 3290, sy1 = 3690;   // 400 mm front-to-back opening

        // 5 non-overlapping convex rectangles tiling the L-shape minus the sink hole
        const subRects = [
            [xEast, yNorth, sx0, yCornerInner],         // 1. East of sink cutout (N5, N4, N3 + 40mm of N2)
            [sx0, yNorth, sx1, sy0],                    // 2. Rear faucet deck behind sink cutout
            [sx0, sy1, sx1, yCornerInner],              // 3. Front rim in front of sink cutout
            [sx1, yNorth, xWest, yCornerInner],         // 4. West of sink cutout (40mm of N2 + N1 + W1 NW corner)
            [xCornerInner, yCornerInner, xWest, ySouth] // 5. West Wall arm (W2..W5)
        ];

        const faces3D = [];
        const slicePolygons2D = [];

        subRects.forEach(r => {
            const rx0 = r[0], ry0 = r[1], rx1 = r[2], ry1 = r[3];
            slicePolygons2D.push([[rx0, ry0], [rx1, ry0], [rx1, ry1], [rx0, ry1]]);
            // Top face (+Z)
            faces3D.push({
                side: 'top',
                normal: [0, 0, 1],
                noWireframe: true,
                loop3D: [[rx0, ry0, z1], [rx1, ry0, z1], [rx1, ry1, z1], [rx0, ry1, z1]]
            });
            // Bottom face (-Z)
            faces3D.push({
                side: 'bottom',
                normal: [0, 0, -1],
                noWireframe: true,
                loop3D: [[rx0, ry1, z0], [rx1, ry1, z0], [rx1, ry0, z0], [rx0, ry0, z0]]
            });
        });

        // 6 Outer vertical perimeter faces of the L-shaped countertop
        const outerEdges = [
            { p0: [xWest, yNorth], p1: [xEast, yNorth], normal: [0, -1, 0] },             // North wall face
            { p0: [xEast, yNorth], p1: [xEast, yCornerInner], normal: [-1, 0, 0] },       // East end against Fridge N6
            { p0: [xEast, yCornerInner], p1: [xCornerInner, yCornerInner], normal: [0, 1, 0] }, // North arm front face
            { p0: [xCornerInner, yCornerInner], p1: [xCornerInner, ySouth], normal: [-1, 0, 0] }, // West arm front face
            { p0: [xCornerInner, ySouth], p1: [xWest, ySouth], normal: [0, 1, 0] },       // South end of West arm
            { p0: [xWest, ySouth], p1: [xWest, yNorth], normal: [1, 0, 0] }               // West wall face
        ];

        outerEdges.forEach(e => {
            faces3D.push({
                side: 'outer_edge',
                normal: e.normal,
                noWireframe: true,
                loop3D: [
                    [e.p0[0], e.p0[1], z0],
                    [e.p1[0], e.p1[1], z0],
                    [e.p1[0], e.p1[1], z1],
                    [e.p0[0], e.p0[1], z1]
                ]
            });
        });

        // 4 Inner vertical faces of the 820 × 400 mm sink cutout hole
        const holeEdges = [
            { p0: [sx0, sy0], p1: [sx1, sy0], normal: [0, 1, 0] },  // Cutout North edge (faces South into hole)
            { p0: [sx1, sy0], p1: [sx1, sy1], normal: [-1, 0, 0] }, // Cutout West edge (faces East into hole)
            { p0: [sx1, sy1], p1: [sx0, sy1], normal: [0, -1, 0] }, // Cutout South edge (faces North into hole)
            { p0: [sx0, sy1], p1: [sx0, sy0], normal: [1, 0, 0] }   // Cutout East edge (faces West into hole)
        ];

        holeEdges.forEach(e => {
            faces3D.push({
                side: 'cutout_edge',
                normal: e.normal,
                noWireframe: true,
                loop3D: [
                    [e.p0[0], e.p0[1], z0],
                    [e.p1[0], e.p1[1], z0],
                    [e.p1[0], e.p1[1], z1],
                    [e.p0[0], e.p0[1], z1]
                ]
            });
        });

        const outerLoop2D = [
            [xEast, yNorth],
            [xWest, yNorth],
            [xWest, ySouth],
            [xCornerInner, ySouth],
            [xCornerInner, yCornerInner],
            [xEast, yCornerInner]
        ];

        const holeLoop2D = [
            [sx0, sy0],
            [sx1, sy0],
            [sx1, sy1],
            [sx0, sy1]
        ];

        const wireframeLines3D = [
            // Outer top & bottom L-shape loops
            outerLoop2D.concat([outerLoop2D[0]]).map(p => [p[0], p[1], z1]),
            outerLoop2D.concat([outerLoop2D[0]]).map(p => [p[0], p[1], z0]),
            // Outer vertical corners
            ...outerLoop2D.map(p => [[p[0], p[1], z0], [p[0], p[1], z1]]),
            // Sink cutout top & bottom loops
            holeLoop2D.concat([holeLoop2D[0]]).map(p => [p[0], p[1], z1]),
            holeLoop2D.concat([holeLoop2D[0]]).map(p => [p[0], p[1], z0]),
            // Sink cutout vertical corners
            ...holeLoop2D.map(p => [[p[0], p[1], z0], [p[0], p[1], z1]])
        ];

        return {
            id: 'KITCHEN_COUNTERTOP_SLAB',
            name: 'Continuous L-Shaped 30mm Stone Countertop with 820×400mm Sink Cutout (Z=870..900 mm)',
            role: 'worktop',
            material: 'stone_worktop',
            colorRgb: COLOR_WORKTOP,
            x0: xEast, x1: xWest,
            y0: yNorth, y1: ySouth,
            z0: z0, z1: z1,
            footprint2D: outerLoop2D,
            slicePolygons2D: slicePolygons2D,
            faces3D: faces3D,
            wireframeLines3D: wireframeLines3D
        };
    }

    /**
     * Build 3D B-Rep parts for KITCHEN_SINK_N2 (90 cm Undermount Stainless Steel Single-Bowl Kitchen Sink
     * + Basket Strainer Drain + Rear Overflow Badge + Tall Chrome Pull-Down Spring-Coil Faucet).
     */
    function buildKitchenSinkParts() {
        const sx0 = 10155, sx1 = 10975; // 820 mm inner bowl width
        const sy0 = 3290, sy1 = 3690;   // 400 mm inner bowl front-to-back depth
        const wallT = 6;                // 6 mm stainless steel wall thickness
        const zFloorBot = 664, zFloorTop = 670, zRimTop = 872;
        const cx = 10565, cyDrain = 3490; // Center of sink bowl & circular drain

        /**
         * Helper: Build a smooth-shaded 3D tubular / lathe B-Rep part along an arbitrary 3D spine
         * spine = [[x, y, z, r], ...]
         */
        function buildSmoothTubePart(opts) {
            const spine = opts.spine || [];
            const numSegs = opts.numSegs || 24;
            const faces3D = [];
            const wireframeLines3D = opts.wireframeLines3D ? opts.wireframeLines3D.slice() : [];

            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;
            let minZ = Infinity, maxZ = -Infinity;

            // Compute unit tangent T at each spine node
            const tangents = [];
            for (let i = 0; i < spine.length; i++) {
                let iPrev = i;
                while (iPrev > 0 && Math.hypot(spine[i][0] - spine[iPrev][0], spine[i][1] - spine[iPrev][1], spine[i][2] - spine[iPrev][2]) < 0.05) {
                    iPrev--;
                }
                let iNext = i;
                while (iNext < spine.length - 1 && Math.hypot(spine[iNext][0] - spine[i][0], spine[iNext][1] - spine[i][1], spine[iNext][2] - spine[i][2]) < 0.05) {
                    iNext++;
                }
                let tx = spine[iNext][0] - spine[iPrev][0];
                let ty = spine[iNext][1] - spine[iPrev][1];
                let tz = spine[iNext][2] - spine[iPrev][2];
                const len = Math.hypot(tx, ty, tz) || 1;
                tangents.push([tx / len, ty / len, tz / len]);
            }

            // Build rings of 3D points and smooth radial normals
            const rings = [];
            for (let i = 0; i < spine.length; i++) {
                const [px, py, pz, r] = spine[i];
                const T = tangents[i];
                // Choose stable reference vector perpendicular to T
                const ref = (Math.abs(T[0]) < 0.85) ? [1, 0, 0] : [0, 1, 0];
                // V = normalize(cross(T, ref))
                let vx = T[1] * ref[2] - T[2] * ref[1];
                let vy = T[2] * ref[0] - T[0] * ref[2];
                let vz = T[0] * ref[1] - T[1] * ref[0];
                const vLen = Math.hypot(vx, vy, vz) || 1;
                vx /= vLen; vy /= vLen; vz /= vLen;
                // U = normalize(cross(V, T))
                let ux = vy * T[2] - vz * T[1];
                let uy = vz * T[0] - vx * T[2];
                let uz = vx * T[1] - vy * T[0];
                const uLen = Math.hypot(ux, uy, uz) || 1;
                ux /= uLen; uy /= uLen; uz /= uLen;

                const ringPts = [];
                const ringNormals = [];
                for (let k = 0; k < numSegs; k++) {
                    const ang = (k / numSegs) * Math.PI * 2;
                    const ca = Math.cos(ang);
                    const sa = Math.sin(ang);
                    const nx = ca * ux + sa * vx;
                    const ny = ca * uy + sa * vy;
                    const nz = ca * uz + sa * vz;
                    const vx3 = Math.round((px + r * nx) * 100) / 100;
                    const vy3 = Math.round((py + r * ny) * 100) / 100;
                    const vz3 = Math.round((pz + r * nz) * 100) / 100;
                    ringPts.push([vx3, vy3, vz3]);
                    ringNormals.push([nx, ny, nz]);
                    if (vx3 < minX) minX = vx3;
                    if (vx3 > maxX) maxX = vx3;
                    if (vy3 < minY) minY = vy3;
                    if (vy3 > maxY) maxY = vy3;
                    if (vz3 < minZ) minZ = vz3;
                    if (vz3 > maxZ) maxZ = vz3;
                }
                rings.push({ pts: ringPts, normals: ringNormals, T, r });
            }

            // Connect adjacent rings with smooth-shaded quad faces (including conical/annular slope normal)
            for (let i = 0; i + 1 < rings.length; i++) {
                const rA = rings[i];
                const rB = rings[i + 1];
                const distCenters = Math.hypot(
                    spine[i + 1][0] - spine[i][0],
                    spine[i + 1][1] - spine[i][1],
                    spine[i + 1][2] - spine[i][2]
                );
                const dr = rB.r - rA.r;
                if (distCenters < 0.02 && Math.abs(dr) < 0.02) continue;

                const hyp = Math.hypot(distCenters, dr) || 1;
                const wRad = distCenters / hyp;
                const wTan = -dr / hyp;

                for (let k = 0; k < numSegs; k++) {
                    const kNext = (k + 1) % numSegs;
                    const p00 = rA.pts[k];
                    const p10 = rA.pts[kNext];
                    const p11 = rB.pts[kNext];
                    const p01 = rB.pts[k];
                    const n00 = [
                        rA.normals[k][0] * wRad + rA.T[0] * wTan,
                        rA.normals[k][1] * wRad + rA.T[1] * wTan,
                        rA.normals[k][2] * wRad + rA.T[2] * wTan
                    ];
                    const n10 = [
                        rA.normals[kNext][0] * wRad + rA.T[0] * wTan,
                        rA.normals[kNext][1] * wRad + rA.T[1] * wTan,
                        rA.normals[kNext][2] * wRad + rA.T[2] * wTan
                    ];
                    const n11 = [
                        rB.normals[kNext][0] * wRad + rB.T[0] * wTan,
                        rB.normals[kNext][1] * wRad + rB.T[1] * wTan,
                        rB.normals[kNext][2] * wRad + rB.T[2] * wTan
                    ];
                    const n01 = [
                        rB.normals[k][0] * wRad + rB.T[0] * wTan,
                        rB.normals[k][1] * wRad + rB.T[1] * wTan,
                        rB.normals[k][2] * wRad + rB.T[2] * wTan
                    ];
                    const avgNx = (n00[0] + n10[0] + n11[0] + n01[0]) / 4;
                    const avgNy = (n00[1] + n10[1] + n11[1] + n01[1]) / 4;
                    const avgNz = (n00[2] + n10[2] + n11[2] + n01[2]) / 4;
                    const avgLen = Math.hypot(avgNx, avgNy, avgNz) || 1;
                    faces3D.push({
                        side: 'curved',
                        noWireframe: true,
                        normal: [avgNx / avgLen, avgNy / avgLen, avgNz / avgLen],
                        vertexNormals3D: [n00, n10, n11, n01],
                        loop3D: [p00, p10, p11, p01]
                    });
                }
            }

            if (opts.capStart && rings.length > 0 && rings[0].r > 0.2) {
                const T0 = rings[0].T;
                faces3D.push({
                    side: 'cap_start',
                    noWireframe: true,
                    normal: [-T0[0], -T0[1], -T0[2]],
                    loop3D: rings[0].pts.slice().reverse()
                });
            }
            if (opts.capEnd && rings.length > 0 && rings[rings.length - 1].r > 0.2) {
                const TN = rings[rings.length - 1].T;
                faces3D.push({
                    side: 'cap_end',
                    noWireframe: true,
                    normal: [TN[0], TN[1], TN[2]],
                    loop3D: rings[rings.length - 1].pts.slice()
                });
            }

            (opts.ringWireframeIndices || []).forEach(idx => {
                if (rings[idx]) {
                    wireframeLines3D.push(rings[idx].pts.concat([rings[idx].pts[0]]));
                }
            });

            return {
                id: opts.id,
                name: opts.name,
                role: opts.role || 'sink_faucet',
                material: opts.material || 'chrome',
                colorRgb: opts.colorRgb || COLOR_FAUCET_CHROME,
                x0: Math.floor(minX), x1: Math.ceil(maxX),
                y0: Math.floor(minY), y1: Math.ceil(maxY),
                z0: Math.floor(minZ), z1: Math.ceil(maxZ),
                faces3D: faces3D,
                wireframeLines3D: wireframeLines3D
            };
        }

        // 1. Stainless Steel Basin Floor (Z = 664..672 mm) with 4 Pitched Triangular Facets & X-Drainage Grooves
        const drainR = 57;
        const zEdgeFloor = 672;
        const zCenterFloor = 668;
        const floorPart = {
            id: 'KITCHEN_SINK_N2_BASIN_FLOOR',
            name: 'Brushed Stainless Steel Pitched Sink Basin Floor with X-Drainage Grooves (832×412 mm, Z=664..672 mm)',
            role: 'sink_basin',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_FLOOR,
            x0: sx0 - wallT, x1: sx1 + wallT,
            y0: sy0 - wallT, y1: sy1 + wallT,
            z0: zFloorBot, z1: zEdgeFloor,
            faces3D: [
                // North pitched triangle
                {
                    side: 'top_north',
                    noWireframe: true,
                    normal: [0, 0.025, 0.9997],
                    loop3D: [[sx0, sy0, zEdgeFloor], [sx1, sy0, zEdgeFloor], [cx, cyDrain, zCenterFloor]]
                },
                // South pitched triangle
                {
                    side: 'top_south',
                    noWireframe: true,
                    normal: [0, -0.025, 0.9997],
                    loop3D: [[sx1, sy1, zEdgeFloor], [sx0, sy1, zEdgeFloor], [cx, cyDrain, zCenterFloor]]
                },
                // East pitched triangle
                {
                    side: 'top_east',
                    noWireframe: true,
                    normal: [0.015, 0, 0.9999],
                    loop3D: [[sx0, sy1, zEdgeFloor], [sx0, sy0, zEdgeFloor], [cx, cyDrain, zCenterFloor]]
                },
                // West pitched triangle
                {
                    side: 'top_west',
                    noWireframe: true,
                    normal: [-0.015, 0, 0.9999],
                    loop3D: [[sx1, sy0, zEdgeFloor], [sx1, sy1, zEdgeFloor], [cx, cyDrain, zCenterFloor]]
                },
                // Underside of basin floor
                {
                    side: 'bottom',
                    noWireframe: true,
                    normal: [0, 0, -1],
                    loop3D: [
                        [sx0 - wallT, sy1 + wallT, zFloorBot],
                        [sx1 + wallT, sy1 + wallT, zFloorBot],
                        [sx1 + wallT, sy0 - wallT, zFloorBot],
                        [sx0 - wallT, sy0 - wallT, zFloorBot]
                    ]
                }
            ],
            wireframeLines3D: [
                [[sx0 + 4, sy0 + 4, zEdgeFloor + 0.3], [cx - drainR * 0.72, cyDrain - drainR * 0.72, zCenterFloor + 0.8]],
                [[sx1 - 4, sy0 + 4, zEdgeFloor + 0.3], [cx + drainR * 0.72, cyDrain - drainR * 0.72, zCenterFloor + 0.8]],
                [[sx1 - 4, sy1 - 4, zEdgeFloor + 0.3], [cx + drainR * 0.72, cyDrain + drainR * 0.72, zCenterFloor + 0.8]],
                [[sx0 + 4, sy1 - 4, zEdgeFloor + 0.3], [cx - drainR * 0.72, cyDrain + drainR * 0.72, zCenterFloor + 0.8]]
            ]
        };

        // 2. Four Brushed Stainless Steel Vertical Basin Walls (Z = 670..872 mm)
        const northWallPart = {
            id: 'KITCHEN_SINK_N2_WALL_NORTH',
            name: 'Sink Basin North (Rear) Stainless Steel Wall (832×6×202 mm)',
            role: 'sink_basin',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_WALL,
            x0: sx0 - wallT, x1: sx1 + wallT,
            y0: sy0 - wallT, y1: sy0,
            z0: zFloorTop, z1: zRimTop
        };
        const southWallPart = {
            id: 'KITCHEN_SINK_N2_WALL_SOUTH',
            name: 'Sink Basin South (Front) Stainless Steel Wall (832×6×202 mm)',
            role: 'sink_basin',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_WALL,
            x0: sx0 - wallT, x1: sx1 + wallT,
            y0: sy1, y1: sy1 + wallT,
            z0: zFloorTop, z1: zRimTop
        };
        const eastWallPart = {
            id: 'KITCHEN_SINK_N2_WALL_EAST',
            name: 'Sink Basin East (Right) Stainless Steel Wall (6×400×202 mm)',
            role: 'sink_basin',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_WALL,
            x0: sx0 - wallT, x1: sx0,
            y0: sy0, y1: sy1,
            z0: zFloorTop, z1: zRimTop
        };
        const westWallPart = {
            id: 'KITCHEN_SINK_N2_WALL_WEST',
            name: 'Sink Basin West (Left) Stainless Steel Wall (6×400×202 mm)',
            role: 'sink_basin',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_WALL,
            x0: sx1, x1: sx1 + wallT,
            y0: sy0, y1: sy1,
            z0: zFloorTop, z1: zRimTop
        };

        // 3. Smooth Circular Stainless Steel Basket Strainer Drain (Ø 114 mm at X=10,565, Y=3,490)
        const drainFlangePart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_DRAIN_FLANGE',
            name: 'Circular Brushed Stainless Steel Drain Bezel (Ø114 mm)',
            role: 'sink_drain',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_STEEL_RIM,
            numSegs: 28,
            spine: [
                [cx, cyDrain, 668.5, 57],
                [cx, cyDrain, 670.5, 57],
                [cx, cyDrain, 670.5, 38],
                [cx, cyDrain, 669.0, 36]
            ],
            capEnd: false,
            ringWireframeIndices: [1, 2]
        });

        const drainBasketPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_DRAIN_BASKET',
            name: 'Recessed Stainless Steel Basket Strainer & Center Stopper Pin (Ø76 mm)',
            role: 'sink_drain',
            material: 'stainless_steel',
            colorRgb: COLOR_SINK_DRAIN_DARK,
            numSegs: 24,
            spine: [
                [cx, cyDrain, 669.2, 36],
                [cx, cyDrain, 669.5, 11],
                [cx, cyDrain, 672.0, 9],
                [cx, cyDrain, 673.2, 12],
                [cx, cyDrain, 673.6, 0.5]
            ],
            capEnd: true
        });

        // 4. Rear Overflow Chrome Escutcheon Plate on North Basin Wall (X=10,536..10,594, Y=3,290..3,294, Z=820..838 mm)
        const overflowBezelPart = {
            id: 'KITCHEN_SINK_N2_OVERFLOW_BEZEL',
            name: 'Rear Overflow Brushed Chrome Escutcheon Bezel (58×3×18 mm, Z=820..838 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            x0: cx - 29, x1: cx + 29,
            y0: sy0, y1: sy0 + 3,
            z0: 820, z1: 838
        };
        const overflowSlotPart = {
            id: 'KITCHEN_SINK_N2_OVERFLOW_SLOT',
            name: 'Rear Overflow Recessed Slot (44×4×8 mm, Z=825..833 mm)',
            role: 'sink_drain',
            material: 'dark_handle',
            colorRgb: COLOR_SINK_DRAIN_DARK,
            x0: cx - 22, x1: cx + 22,
            y0: sy0, y1: sy0 + 4,
            z0: 825, z1: 833
        };

        // =====================================================================
        // 5. PROFESSIONAL SMOOTH-SHADED 3D PULL-DOWN SPRING GOOSENECK FAUCET
        //    Deck-mounted at X = 10,565 mm, Y = 3,235 mm, Z = 900..1,330 mm
        // =====================================================================
        const fyBase = 3235;
        const fyNozzle = 3435; // 200 mm spout reach to center of sink bowl

        // 5a. Turned-Lathe Chrome Base Escutcheon, Cylindrical Mixer Column & Conical Riser Transition
        const faucetColumnPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_COLUMN',
            name: 'Polished Chrome Cylindrical Mixer Column & Base Escutcheon (Ø52→Ø40→Ø24 mm, Z=900..1,106 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 28,
            spine: [
                [cx, fyBase, 900, 26],
                [cx, fyBase, 905, 26],
                [cx, fyBase, 908, 20.5],
                [cx, fyBase, 1082, 20.5],
                [cx, fyBase, 1094, 15],
                [cx, fyBase, 1106, 12]
            ],
            capStart: false,
            capEnd: true,
            ringWireframeIndices: [0, 2]
        });

        // 5b. Right-Side (-X / East) Horizontal Cylindrical Mixer Valve Cartridge Hub
        const faucetValveHubPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_HUB',
            name: 'Side Cylindrical Mixer Valve Cartridge Hub (Ø26 mm, X=10,518..10,552, Z=965 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 20,
            spine: [
                [cx - 12, fyBase, 965, 13],
                [cx - 44, fyBase, 965, 13],
                [cx - 47, fyBase, 965, 10.5],
                [cx - 48, fyBase, 965, 0.5]
            ],
            capEnd: true
        });

        // 5c. Sleek Vertical Cylindrical Pin Lever Handle
        const faucetLeverPinPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_LEVER',
            name: 'Cylindrical Chrome Pin Mixer Lever Handle (Ø9 mm, Z=972..1,064 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 16,
            spine: [
                [cx - 35, fyBase, 972, 4.6],
                [cx - 35, fyBase, 1058, 4.2],
                [cx - 35, fyBase, 1062, 3.0],
                [cx - 35, fyBase, 1064, 0.5]
            ],
            capEnd: true
        });

        // 5d. Horizontal Tubular Swivel Docking Arm & Magnetic Docking Collar Ring
        const faucetSupportArmPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_SUPPORT_ARM',
            name: 'Horizontal Tubular Chrome Sprayer Docking Arm (Ø13 mm, Y=3,245..3,425, Z=1,068 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 18,
            spine: [
                [cx, fyBase + 10, 1068, 6.5],
                [cx, fyNozzle - 12, 1068, 6.5]
            ]
        });

        const faucetDockCollarPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_DOCK_COLLAR',
            name: 'Magnetic Spray Head Docking Collar Ring (Ø34 mm, Y=3,435, Z=1,060..1,076 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 24,
            spine: [
                [cx, fyNozzle, 1060, 15.5],
                [cx, fyNozzle, 1063, 17.0],
                [cx, fyNozzle, 1073, 17.0],
                [cx, fyNozzle, 1076, 15.5]
            ],
            capStart: true,
            capEnd: true
        });

        // 5e. Continuous Swept Gooseneck Inner Flexible Hose + Helical Chrome Spring Coils
        const archCy = (fyBase + fyNozzle) / 2; // 3,335 mm
        const archCz = 1210;
        const archRy = (fyNozzle - fyBase) / 2; // 100 mm
        const archRz = 104;                     // Crown centerline at Z = 1,314 mm
        const numArchSteps = 28;

        const hoseSpine = [
            [cx, fyBase, 1102, 8.5],
            [cx, fyBase, 1155, 8.5]
        ];
        for (let i = 0; i <= numArchSteps; i++) {
            const theta = Math.PI - (i / numArchSteps) * Math.PI;
            const py = archCy + archRy * Math.cos(theta);
            const pz = archCz + archRz * Math.sin(theta);
            hoseSpine.push([cx, py, pz, 8.5]);
        }
        hoseSpine.push([cx, fyNozzle, 1155, 8.5]);
        hoseSpine.push([cx, fyNozzle, 1085, 8.5]);

        const faucetArchHosePart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_ARCH_HOSE',
            name: 'Continuous Swept Gooseneck Flexible Inner Hose (Ø17 mm, Z=1,085..1,322 mm)',
            role: 'sink_faucet',
            material: 'dark_handle',
            colorRgb: [0.25, 0.28, 0.32],
            numSegs: 18,
            spine: hoseSpine
        });

        // Build tangent-aligned chrome spring-coil rings along the entire gooseneck arch
        const coilSpine = [];
        // Sample 26 evenly spaced stations along the gooseneck path
        const pathSamples = [];
        // Rear vertical segment (Z = 1110 -> 1210, length = 100 mm)
        for (let z = 1112; z < 1208; z += 14) {
            pathSamples.push({ y: fyBase, z: z, ty: 0, tz: 1 });
        }
        // 180-degree arch (arc length ~ 320 mm -> 22 coils)
        const numArchCoils = 22;
        for (let i = 0; i <= numArchCoils; i++) {
            const theta = Math.PI - (i / numArchCoils) * Math.PI;
            const py = archCy + archRy * Math.cos(theta);
            const pz = archCz + archRz * Math.sin(theta);
            // Derivative wrt (-theta): dy = archRy * sin(theta), dz = -archRz * cos(theta)
            let ty = archRy * Math.sin(theta);
            let tz = -archRz * Math.cos(theta);
            const tLen = Math.hypot(ty, tz) || 1;
            ty /= tLen; tz /= tLen;
            pathSamples.push({ y: py, z: pz, ty, tz });
        }
        // Front vertical drop segment (Z = 1200 -> 1094)
        for (let z = 1196; z >= 1096; z -= 14) {
            pathSamples.push({ y: fyNozzle, z: z, ty: 0, tz: -1 });
        }

        pathSamples.forEach(s => {
            const halfW = 4.2;
            const bevelW = 2.6;
            coilSpine.push([cx, s.y - s.ty * halfW, s.z - s.tz * halfW, 9.2]);
            coilSpine.push([cx, s.y - s.ty * bevelW, s.z - s.tz * bevelW, 13.5]);
            coilSpine.push([cx, s.y + s.ty * bevelW, s.z + s.tz * bevelW, 13.5]);
            coilSpine.push([cx, s.y + s.ty * halfW, s.z + s.tz * halfW, 9.2]);
        });

        const faucetSpringCoilPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_SPRING_COIL',
            name: 'Stainless Steel Helical Spring-Coil Gooseneck Shroud (Ø27 mm, 36 Coils, Z=1,092..1,328 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 20,
            spine: coilSpine
        });

        // 5f. Ergonomic Tapered Pull-Down Spray Head (Chrome Neck + Matte Anthracite Flared Wand + Aerator)
        const faucetSprayerNeckPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_SPRAYER_NECK',
            name: 'Pull-Down Spray Wand Chrome Connector Neck (Ø24→Ø29 mm, Z=1,052..1,092 mm)',
            role: 'sink_faucet',
            material: 'chrome',
            colorRgb: COLOR_FAUCET_CHROME,
            numSegs: 24,
            spine: [
                [cx, fyNozzle, 1092, 11.5],
                [cx, fyNozzle, 1076, 13.5],
                [cx, fyNozzle, 1052, 14.5]
            ]
        });

        const faucetSprayerBodyPart = buildSmoothTubePart({
            id: 'KITCHEN_SINK_N2_FAUCET_SPRAYER',
            name: 'Pull-Down Ergonomic Tapered Spray Nozzle Head (Ø29→Ø39 mm, Z=996..1,052 mm)',
            role: 'sink_faucet',
            material: 'dark_handle',
            colorRgb: [0.18, 0.20, 0.23],
            numSegs: 24,
            spine: [
                [cx, fyNozzle, 1052, 14.6],
                [cx, fyNozzle, 1035, 16.2],
                [cx, fyNozzle, 1002, 19.5],
                [cx, fyNozzle, 996, 19.0]
            ],
            capEnd: true,
            ringWireframeIndices: [0, 3]
        });

        return [
            floorPart,
            northWallPart,
            southWallPart,
            eastWallPart,
            westWallPart,
            drainFlangePart,
            drainBasketPart,
            overflowBezelPart,
            overflowSlotPart,
            faucetColumnPart,
            faucetValveHubPart,
            faucetLeverPinPart,
            faucetSupportArmPart,
            faucetDockCollarPart,
            faucetArchHosePart,
            faucetSpringCoilPart,
            faucetSprayerNeckPart,
            faucetSprayerBodyPart
        ];
    }

    /**
     * Build West Wall (GW_3) 2-drawer fronts facing East ([-1, 0, 0]):
     * 2 × 330 mm wood drawer fronts + 2 × 30 mm Gola aluminum handle rails at X = 11,315..11,335 mm.
     */
    function buildWestTwoDrawerFronts(idPrefix, y0, y1) {
        const w = y1 - y0;
        return [
            {
                id: `${idPrefix}_FRONT_LOWER`,
                name: `Lower Drawer Wood Front (20×${w - 4}×328 mm)`,
                role: 'drawer_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: X_WEST_FRONT_FACE, x1: X_WEST_CARCASS_FRONT,
                y0: y0 + 2, y1: y1 - 2,
                z0: 152, z1: 480
            },
            {
                id: `${idPrefix}_RAIL_LOWER`,
                name: `Lower Recessed Aluminum Handle Rail (22×${w}×30 mm)`,
                role: 'handle_rail',
                material: 'aluminum_rail',
                colorRgb: COLOR_ALU_RAIL,
                x0: X_WEST_FRONT_FACE + 2, x1: X_WEST_CARCASS_FRONT + 4,
                y0: y0, y1: y1,
                z0: 480, z1: 510
            },
            {
                id: `${idPrefix}_FRONT_UPPER`,
                name: `Upper Drawer Wood Front (20×${w - 4}×328 mm)`,
                role: 'drawer_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: X_WEST_FRONT_FACE, x1: X_WEST_CARCASS_FRONT,
                y0: y0 + 2, y1: y1 - 2,
                z0: 512, z1: 840
            },
            {
                id: `${idPrefix}_RAIL_UPPER`,
                name: `Upper Recessed Aluminum Handle Rail (22×${w}×30 mm)`,
                role: 'handle_rail',
                material: 'aluminum_rail',
                colorRgb: COLOR_ALU_RAIL,
                x0: X_WEST_FRONT_FACE + 2, x1: X_WEST_CARCASS_FRONT + 4,
                y0: y0, y1: y1,
                z0: 840, z1: 870
            }
        ];
    }

    /**
     * Build Dining Room (GW_3 South side) tall 2,700 mm cabinet carcass skeleton (300 mm total depth: 280 mm carcass + 20 mm front) facing East ([-1, 0, 0]).
     */
    function buildWestTallSkeleton(idPrefix, y0, y1, zShelves) {
        const w = y1 - y0;
        const parts = [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${w}×240×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: X_DINING_PLINTH_FRONT, x1: X_WEST_WALL,
                y0: y0, y1: y1,
                z0: 0, z1: 150
            },
            {
                id: `${idPrefix}_NORTH_PANEL`,
                name: 'Left/North Tall Side Carcass Panel (280×18×2550 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_DINING_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y0, y1: y0 + BOARD_MM,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_SOUTH_PANEL`,
                name: 'Right/South Tall Side Carcass Panel (280×18×2550 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_DINING_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y1 - BOARD_MM, y1: y1,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_BACK_PANEL`,
                name: `Rear Tall Backing Panel (18×${w - 2 * BOARD_MM}×2550 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: X_WEST_WALL - BOARD_MM, x1: X_WEST_WALL,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 150, z1: 2700
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Carcass Panel (262×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_DINING_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 150, z1: 150 + BOARD_MM
            }
        ];

        (zShelves || []).forEach((zBoundary, idx) => {
            parts.push({
                id: `${idPrefix}_SHELF_${idx + 1}`,
                name: `Horizontal Carcass Shelf at Z=${zBoundary} mm (262×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_DINING_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: zBoundary - Math.floor(BOARD_MM / 2),
                z1: zBoundary + Math.ceil(BOARD_MM / 2)
            });
        });

        parts.push({
            id: `${idPrefix}_TOP_PANEL`,
            name: `Top Carcass Panel at Z=2,700 mm (262×${w - 2 * BOARD_MM}×18 mm)`,
            role: 'carcass_panel',
            material: 'carcass_melamine',
            colorRgb: COLOR_CARCASS_SHELF,
            x0: X_DINING_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
            y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
            z0: 2700 - BOARD_MM, z1: 2700
        });

        return parts;
    }

    /**
     * Build Dining Room (GW_3 South side) glazed showcase vitrine door front (Z = 150..2,700 mm, X = 11,615..11,635 mm):
     * 42 mm bronze/oak perimeter frame + translucent glass center pane.
     */
    function buildWestVitrineFronts(idPrefix, y0, y1) {
        const frameW = 42;
        return [
            {
                id: `${idPrefix}_FRAME_LEFT`,
                name: 'Vitrine Door Left/North Frame Stile (20×42×2546 mm)',
                role: 'vitrine_frame',
                material: 'vitrine_wood_frame',
                colorRgb: COLOR_VITRINE_FRAME,
                x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                y0: y0 + 2, y1: y0 + 2 + frameW,
                z0: 152, z1: 2698
            },
            {
                id: `${idPrefix}_FRAME_RIGHT`,
                name: 'Vitrine Door Right/South Frame Stile (20×42×2546 mm)',
                role: 'vitrine_frame',
                material: 'vitrine_wood_frame',
                colorRgb: COLOR_VITRINE_FRAME,
                x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                y0: y1 - 2 - frameW, y1: y1 - 2,
                z0: 152, z1: 2698
            },
            {
                id: `${idPrefix}_FRAME_BOTTOM`,
                name: `Vitrine Door Bottom Frame Rail (20×${(y1 - y0) - 4 - 2 * frameW}×42 mm)`,
                role: 'vitrine_frame',
                material: 'vitrine_wood_frame',
                colorRgb: COLOR_VITRINE_FRAME,
                x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                y0: y0 + 2 + frameW, y1: y1 - 2 - frameW,
                z0: 152, z1: 152 + frameW
            },
            {
                id: `${idPrefix}_FRAME_TOP`,
                name: `Vitrine Door Top Frame Rail (20×${(y1 - y0) - 4 - 2 * frameW}×42 mm)`,
                role: 'vitrine_frame',
                material: 'vitrine_wood_frame',
                colorRgb: COLOR_VITRINE_FRAME,
                x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                y0: y0 + 2 + frameW, y1: y1 - 2 - frameW,
                z0: 2698 - frameW, z1: 2698
            },
            {
                id: `${idPrefix}_GLASS_PANE`,
                name: `Vitrine Showcase Glass Pane (8×${(y1 - y0) - 4 - 2 * frameW}×${2546 - 2 * frameW} mm)`,
                role: 'vitrine_glass',
                material: 'vitrine_glass',
                colorRgb: COLOR_VITRINE_GLASS,
                x0: X_DINING_FRONT_FACE + 6, x1: X_DINING_FRONT_FACE + 14,
                y0: y0 + 2 + frameW, y1: y1 - 2 - frameW,
                z0: 152 + frameW, z1: 2698 - frameW
            }
        ];
    }

    /**
     * Build quarter-arc / circular corner floating wood shelf (skeleton + curved front oak edge band)
     * anchored at the 90° corner (X_WEST_WALL = 11,915 mm, y0 = 7,970 mm) where wall GW_3 meets CAB_DINING_ROOM_W8.
     * - Straight edge 1 (against wall GW_3, X = 11,915 mm): Y = y0..y1 (600 mm)
     * - Straight edge 2 (against south side of CAB_DINING_ROOM_W8, Y = 7,970 mm): X = 11,615..11,915 mm (300 mm)
     * - Quarter-arc curved front edge: connects (11,615, 7,970) smoothly to (11,915, 8,570).
     */
    function buildDiningCurvedShelfPair(idPrefix, label, y0, y1, z0, z1) {
        const xWall = X_WEST_WALL; // 11,915
        const rxOut = 300;         // 300 mm total depth at Y = y0 (X = 11,615..11,915)
        const ryOut = y1 - y0;     // 600 mm total width along wall X = 11,915 (Y = 7,970..8,570)
        const edgeBandMm = 20;     // 20 mm curved front oak edge band
        const rxIn = rxOut - edgeBandMm; // 280 mm inner carcass depth
        const ryIn = ryOut - edgeBandMm; // 580 mm inner carcass width
        const numSegs = 24;

        const ptsIn = [];
        const ptsOut = [];
        for (let k = 0; k <= numSegs; k++) {
            const theta = (k / numSegs) * (Math.PI / 2);
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            ptsIn.push([
                Math.round((xWall - rxIn * cosT) * 10) / 10,
                Math.round((y0 + ryIn * sinT) * 10) / 10
            ]);
            ptsOut.push([
                Math.round((xWall - rxOut * cosT) * 10) / 10,
                Math.round((y0 + ryOut * sinT) * 10) / 10
            ]);
        }

        // 1. SKELETON PART: Inner quarter-arc wood shelf body (rxIn = 280 mm, ryIn = 580 mm)
        // CCW 2D footprint starting at 90° corner [xWall, y0] -> [xWall, y0+ryIn] (k=numSegs) -> ... -> [xWall-rxIn, y0] (k=0)
        const skelFootprint2D = [[xWall, y0]];
        for (let k = numSegs; k >= 0; k--) {
            skelFootprint2D.push(ptsIn[k]);
        }

        const skelTopLoop3D = skelFootprint2D.map(p => [p[0], p[1], z1]);
        const skelBotLoop3D = [[xWall, y0, z0]];
        for (let k = 0; k <= numSegs; k++) {
            skelBotLoop3D.push([ptsIn[k][0], ptsIn[k][1], z0]);
        }

        const skelFaces3D = [
            // Top (+Z) convex fan from 90° corner [xWall, y0, z1]
            {
                side: 'top',
                normal: [0, 0, 1],
                loop3D: skelTopLoop3D
            },
            // Bottom (-Z) convex fan from 90° corner [xWall, y0, z0]
            {
                side: 'bottom',
                normal: [0, 0, -1],
                loop3D: skelBotLoop3D
            },
            // West Wall back face (X = xWall, Y = y0 .. y0+ryIn)
            {
                side: 'west',
                normal: [1, 0, 0],
                loop3D: [
                    [xWall, y0 + ryIn, z0],
                    [xWall, y0, z0],
                    [xWall, y0, z1],
                    [xWall, y0 + ryIn, z1]
                ]
            },
            // North cabinet-adjacent face (Y = y0, X = xWall-rxIn .. xWall)
            {
                side: 'north',
                normal: [0, -1, 0],
                loop3D: [
                    [xWall, y0, z0],
                    [xWall - rxIn, y0, z0],
                    [xWall - rxIn, y0, z1],
                    [xWall, y0, z1]
                ]
            }
        ];

        // Curved inner vertical facets (noWireframe: true so smooth curve has no vertical facet stripes)
        for (let k = numSegs; k >= 1; k--) {
            const pA = ptsIn[k];
            const pB = ptsIn[k - 1];
            const dx = pB[0] - pA[0];
            const dy = pB[1] - pA[1];
            const len = Math.hypot(dx, dy) || 1;
            const nx = Math.round((dy / len) * 1000) / 1000;
            const ny = Math.round((-dx / len) * 1000) / 1000;
            skelFaces3D.push({
                side: 'curved_inner',
                normal: [nx, ny, 0],
                noWireframe: true,
                loop3D: [
                    [pA[0], pA[1], z0],
                    [pB[0], pB[1], z0],
                    [pB[0], pB[1], z1],
                    [pA[0], pA[1], z1]
                ]
            });
        }

        const skeletonPart = {
            id: `${idPrefix}_BODY`,
            name: `${label} Quarter-Circle Shelf Body (${rxIn}×${ryIn}×${z1 - z0} mm, Z=${z0}..${z1} mm)`,
            role: 'carcass_panel',
            material: 'wood_tone',
            colorRgb: COLOR_WOOD_FRONT,
            x0: xWall - rxIn, x1: xWall,
            y0: y0, y1: y0 + ryIn,
            z0: z0, z1: z1,
            footprint2D: skelFootprint2D,
            faces3D: skelFaces3D
        };

        // 2. FRONTS PART: 20 mm Curved Oak Front Edge Band between ptsIn and ptsOut
        const frontFootprint2D = [];
        for (let k = 0; k <= numSegs; k++) frontFootprint2D.push(ptsOut[k]);
        for (let k = numSegs; k >= 0; k--) frontFootprint2D.push(ptsIn[k]);

        const frontSlicePolygons2D = [];
        const frontFaces3D = [];

        for (let k = 0; k < numSegs; k++) {
            const in0 = ptsIn[k];
            const in1 = ptsIn[k + 1];
            const out0 = ptsOut[k];
            const out1 = ptsOut[k + 1];

            frontSlicePolygons2D.push([in0, in1, out1, out0]);

            // Top quad (+Z)
            frontFaces3D.push({
                side: 'top',
                normal: [0, 0, 1],
                noWireframe: true,
                loop3D: [
                    [in0[0], in0[1], z1],
                    [in1[0], in1[1], z1],
                    [out1[0], out1[1], z1],
                    [out0[0], out0[1], z1]
                ]
            });

            // Bottom quad (-Z)
            frontFaces3D.push({
                side: 'bottom',
                normal: [0, 0, -1],
                noWireframe: true,
                loop3D: [
                    [in0[0], in0[1], z0],
                    [out0[0], out0[1], z0],
                    [out1[0], out1[1], z0],
                    [in1[0], in1[1], z0]
                ]
            });

            // Outer curved vertical quad
            const dx = out0[0] - out1[0];
            const dy = out0[1] - out1[1];
            const len = Math.hypot(dx, dy) || 1;
            const nx = Math.round((dy / len) * 1000) / 1000;
            const ny = Math.round((-dx / len) * 1000) / 1000;

            frontFaces3D.push({
                side: 'curved_outer',
                normal: [nx, ny, 0],
                noWireframe: true,
                loop3D: [
                    [out1[0], out1[1], z0],
                    [out0[0], out0[1], z0],
                    [out0[0], out0[1], z1],
                    [out1[0], out1[1], z1]
                ]
            });

            // Inner curved vertical quad
            frontFaces3D.push({
                side: 'curved_inner',
                normal: [-nx, -ny, 0],
                noWireframe: true,
                loop3D: [
                    [in0[0], in0[1], z0],
                    [in1[0], in1[1], z0],
                    [in1[0], in1[1], z1],
                    [in0[0], in0[1], z1]
                ]
            });
        }

        // North end-cap at Y = y0 (X = 11,615..11,635 mm)
        frontFaces3D.push({
            side: 'north',
            normal: [0, -1, 0],
            loop3D: [
                [ptsIn[0][0], ptsIn[0][1], z0],
                [ptsOut[0][0], ptsOut[0][1], z0],
                [ptsOut[0][0], ptsOut[0][1], z1],
                [ptsIn[0][0], ptsIn[0][1], z1]
            ]
        });

        // South end-cap at X = xWall (Y = y1-20..y1 mm)
        frontFaces3D.push({
            side: 'west',
            normal: [1, 0, 0],
            loop3D: [
                [ptsOut[numSegs][0], ptsOut[numSegs][1], z0],
                [ptsIn[numSegs][0], ptsIn[numSegs][1], z0],
                [ptsIn[numSegs][0], ptsIn[numSegs][1], z1],
                [ptsOut[numSegs][0], ptsOut[numSegs][1], z1]
            ]
        });

        const wireframeLines3D = [
            ptsOut.map(p => [p[0], p[1], z1]),
            ptsOut.map(p => [p[0], p[1], z0]),
            ptsIn.map(p => [p[0], p[1], z1]),
            ptsIn.map(p => [p[0], p[1], z0])
        ];

        const frontPart = {
            id: `${idPrefix}_EDGE`,
            name: `${label} Curved Front Oak Edge Band (20×${ryOut}×${z1 - z0} mm, Z=${z0}..${z1} mm)`,
            role: 'door_front',
            material: 'wood_tone',
            colorRgb: COLOR_WOOD_FRONT,
            x0: xWall - rxOut, x1: xWall,
            y0: y0, y1: y1,
            z0: z0, z1: z1,
            footprint2D: frontFootprint2D,
            slicePolygons2D: frontSlicePolygons2D,
            faces3D: frontFaces3D,
            wireframeLines3D: wireframeLines3D
        };

        // Full outer quarter-arc 2D footprint for parent furniture object
        const fullFootprint2D = [[xWall, y0]];
        for (let k = numSegs; k >= 0; k--) {
            fullFootprint2D.push(ptsOut[k]);
        }

        return {
            skeletonPart,
            frontPart,
            fullFootprint2D
        };
    }

    /**
     * Build West Wall (GW_3) 2-tier Upper Wall Cabinet (600 × 310 × 1,200 mm, Z = 1,500..2,700 mm):
     * - Skeleton: 290 mm deep carcass (X = 11,625..11,915 mm) with middle divider at Z = 2,100 mm + internal shelves at Z = 1,800 & 2,400 mm.
     * - Fronts: Two 600 × 600 mm wood door fronts at X = 11,605..11,625 mm (Z = 1,502..2,098 mm and Z = 2,102..2,698 mm).
     */
    function buildWestUpperSkeleton(idPrefix, y0, y1) {
        const w = y1 - y0;
        return [
            {
                id: `${idPrefix}_NORTH_PANEL`,
                name: 'Left/North Upper Carcass Panel (290×18×1200 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y0, y1: y0 + BOARD_MM,
                z0: 1500, z1: 2700
            },
            {
                id: `${idPrefix}_SOUTH_PANEL`,
                name: 'Right/South Upper Carcass Panel (290×18×1200 mm)',
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SIDE,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL,
                y0: y1 - BOARD_MM, y1: y1,
                z0: 1500, z1: 2700
            },
            {
                id: `${idPrefix}_BACK_PANEL`,
                name: `Rear Upper Backing Panel (18×${w - 2 * BOARD_MM}×1200 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_BACK,
                x0: X_WEST_WALL - BOARD_MM, x1: X_WEST_WALL,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 1500, z1: 2700
            },
            {
                id: `${idPrefix}_BOTTOM_PANEL`,
                name: `Bottom Upper Carcass Panel at Z=1,500 mm (272×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 1500, z1: 1500 + BOARD_MM
            },
            {
                id: `${idPrefix}_LOWER_TIER_SHELF`,
                name: `Lower Tier Internal Shelf at Z=1,800 mm (272×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 1791, z1: 1809
            },
            {
                id: `${idPrefix}_MID_DIVIDER`,
                name: `Middle Tier Divider Panel at Z=2,100 mm (272×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 2091, z1: 2109
            },
            {
                id: `${idPrefix}_UPPER_TIER_SHELF`,
                name: `Upper Tier Internal Shelf at Z=2,400 mm (272×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 2391, z1: 2409
            },
            {
                id: `${idPrefix}_TOP_PANEL`,
                name: `Top Upper Carcass Panel at Z=2,700 mm (272×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_UPPER_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 2700 - BOARD_MM, z1: 2700
            }
        ];
    }

    function buildWestUpperFronts(idPrefix, y0, y1) {
        const w = y1 - y0;
        return [
            {
                id: `${idPrefix}_FRONT_LOWER`,
                name: `Lower Tier Upper Cabinet Wood Door Front (20×${w - 4}×596 mm, Z=1,500..2,100 mm)`,
                role: 'door_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: X_WEST_UPPER_FRONT_FACE, x1: X_WEST_UPPER_CARCASS_FRONT,
                y0: y0 + 2, y1: y1 - 2,
                z0: 1502, z1: 2098
            },
            {
                id: `${idPrefix}_FRONT_UPPER`,
                name: `Upper Tier Upper Cabinet Wood Door Front (20×${w - 4}×596 mm, Z=2,100..2,700 mm)`,
                role: 'door_front',
                material: 'wood_tone',
                colorRgb: COLOR_WOOD_FRONT,
                x0: X_WEST_UPPER_FRONT_FACE, x1: X_WEST_UPPER_CARCASS_FRONT,
                y0: y0 + 2, y1: y1 - 2,
                z0: 2102, z1: 2698
            }
        ];
    }

    const defaultFurniture = [
        // =====================================================================
        // 1. CAB_KITCHEN_N1: 300 mm Base 2-Drawer Cabinet (Left of Zlew)
        //    Local X = 600..900 mm from GW_3 (X = 11,915 mm) -> X = 11,015..11,315 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N1',
            name: 'CAB_KITCHEN_N1 — Base 2-Drawer Cabinet 300mm (Left of Zlew)',
            shortName: 'Base 2-Drawer 300mm (Left of Zlew)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 11015,
            x2: 11315,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 870,
            widthMm: 300,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '300 × 600 × 870 mm (150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; X = 11,015..11,315 mm)',
            description: 'Narrow 300 mm 2-drawer base cabinet on the Kitchen North Wall between the North-West corner cabinet and the 900 mm sink cabinet (Zlew), topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N1', 11015, 11315, true, X_WEST_PLINTH_FRONT),
            fronts: buildTwoDrawerFronts('CAB_KITCHEN_N1', 11015, 11315)
        },

        // =====================================================================
        // 2. CAB_KITCHEN_N2: 900 mm Sink Base Cabinet (Zlew)
        //    Local X = 900..1,800 mm from GW_3 -> X = 10,115..11,015 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N2',
            name: 'CAB_KITCHEN_N2 — Sink Base Cabinet 900mm (Zlew)',
            shortName: 'Sink Base Cabinet 900mm (Zlew)',
            category: 'cabinet',
            subtype: 'sink_base_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 10115,
            x2: 11015,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 870,
            widthMm: 900,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '900 × 600 × 870 mm (150 mm plinth + 720 mm open-top sink carcass with 864×454 mm top sink opening; full-height 690 mm wood front + 30 mm top handle rail)',
            description: '900 mm wide sink base cabinet (Zlew) on the Kitchen North Wall with a wide 864 × 454 mm top opening (front and rear top stretcher rails instead of a solid top board) and an open upper rear plumbing bay to receive the 90 cm undermount kitchen sink (KITCHEN_SINK_N2), paired with a full-height pull-out wood front and top Gola handle rail.',
            skeleton: buildSinkBaseSkeleton('CAB_KITCHEN_N2', 10115, 11015),
            fronts: buildFullHeightBaseFront('CAB_KITCHEN_N2', 10115, 11015, 'Sink (Zlew)')
        },

        // =====================================================================
        // 3. CAB_KITCHEN_N3: 600 mm Dishwasher Cabinet (Zmywarka)
        //    Local X = 1,800..2,400 mm from GW_3 -> X = 9,515..10,115 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N3',
            name: 'CAB_KITCHEN_N3 — Dishwasher Base Cabinet 600mm (Zmywarka)',
            shortName: 'Dishwasher Cabinet 600mm (Zmywarka)',
            category: 'cabinet',
            subtype: 'dishwasher_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 9515,
            x2: 10115,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 870,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 870 mm (150 mm plinth + 720 mm dishwasher bay; topped by unified 30 mm KITCHEN_COUNTERTOP; full-height 690 mm wood front + 30 mm top handle rail)',
            description: '600 mm wide integrated dishwasher cabinet (Zmywarka) on the Kitchen North Wall with removable full-height wood furniture front and top aluminum handle rail, topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N3', 9515, 10115, false),
            fronts: buildFullHeightBaseFront('CAB_KITCHEN_N3', 9515, 10115, 'Dishwasher (Zmywarka)')
        },

        // =====================================================================
        // 4. CAB_KITCHEN_N4 (alias CAB_KITCHEN_1): 590 mm (59 cm) Base 2-Drawer Cabinet (Right of Zmywarka)
        //    Local X = 2,400..2,990 mm from GW_3 -> X = 8,925..9,515 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N4',
            aliasIds: ['CAB_KITCHEN_1'],
            name: 'CAB_KITCHEN_N4 — Base 2-Drawer Cabinet 590mm (Right of Zmywarka)',
            shortName: 'Base 2-Drawer 590mm (Right of Zmywarka)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 8925,
            x2: 9515,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 870,
            widthMm: 590,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '590 × 600 × 870 mm (59 cm width; 150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: '590 mm (59 cm) 2-drawer base cabinet on the Kitchen North Wall immediately to the right of Zmywarka (under Window O1), reduced from 60 cm to 59 cm for 2 cm plaster clearance, topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N4', 8925, 9515, true),
            fronts: buildTwoDrawerFronts('CAB_KITCHEN_N4', 8925, 9515)
        },

        // =====================================================================
        // 5. CAB_KITCHEN_N5: 590 mm (59 cm) Base 2-Drawer Cabinet (Left of Lodówka)
        //    Local X = 2,990..3,580 mm from GW_3 -> X = 8,335..8,925 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N5',
            name: 'CAB_KITCHEN_N5 — Base 2-Drawer Cabinet 590mm (Left of Lodówka)',
            shortName: 'Base 2-Drawer 590mm (Left of Lodówka)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 8335,
            x2: 8925,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 870,
            widthMm: 590,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '590 × 600 × 870 mm (59 cm width; 150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: '590 mm (59 cm) 2-drawer base cabinet on the Kitchen North Wall immediately to the left of the tall fridge cabinet (Lodówka), reduced from 60 cm to 59 cm for 2 cm plaster clearance, topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N5', 8335, 8925, true),
            fronts: buildTwoDrawerFronts('CAB_KITCHEN_N5', 8335, 8925)
        },

        // =====================================================================
        // 6. CAB_KITCHEN_N6: 600 mm Tall Fridge Cabinet (Lodówka, Z = 0..2,700 mm)
        //    Local X = 3,580..4,180 mm from GW_3 -> X = 7,735..8,335 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N6',
            name: 'CAB_KITCHEN_N6 — Tall Fridge Cabinet 600mm (Lodówka)',
            shortName: 'Tall Fridge Cabinet 600×2700mm (Lodówka)',
            category: 'cabinet',
            subtype: 'tall_fridge_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 7735,
            x2: 8335,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 2700,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 2,700 mm (150 mm plinth + 1,950 mm fridge door Z=150..2,100 mm + 600 mm top storage door Z=2,100..2,700 mm)',
            description: 'Full-height 2,700 mm built-in refrigerator tower (Lodówka) on the Kitchen North Wall with a 1,950 mm lower wood door (with vertical handle bar) and a 600 mm top storage cabinet door.',
            skeleton: buildTallSkeleton('CAB_KITCHEN_N6', 7735, 8335, [2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N6_FRONT_FRIDGE',
                    name: 'Fridge Main Wood Door Front (596×20×1946 mm, Lodówka)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7737, x1: 8333,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N6_HANDLE_BAR',
                    name: 'Vertical Dark Bar Handle (10×12×200 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: 8305, x1: 8315,
                    y0: Y_FRONT_FACE, y1: Y_FRONT_FACE + 12,
                    z0: 700, z1: 900
                },
                {
                    id: 'CAB_KITCHEN_N6_FRONT_TOP',
                    name: 'Top Over-Fridge Wood Door Front (596×20×596 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7737, x1: 8333,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // 7. CAB_KITCHEN_N7: 600 mm Tall Oven & Microwave Tower (Piekarnik & Mikrofala)
        //    Local X = 4,180..4,780 mm from GW_3 -> X = 7,135..7,735 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N7',
            name: 'CAB_KITCHEN_N7 — Tall Oven & Microwave Tower 600mm (Piekarnik & Mikrofala)',
            shortName: 'Tall Oven & Microwave Tower 600×2700mm',
            category: 'cabinet',
            subtype: 'tall_oven_microwave_tower',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 7135,
            x2: 7735,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 2700,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 2,700 mm (150 mm plinth + 450 mm lower door + 600 mm Piekarnik front + 450 mm Mikrofala front + 450 mm upper-mid door + 600 mm top door)',
            description: 'Full-height 2,700 mm appliance tower on the Kitchen North Wall housing the built-in Oven (Piekarnik, Z=600..1,200 mm) and Microwave (Mikrofala, Z=1,200..1,650 mm). Both the wood doors and the Oven/Microwave appliance fascias belong to the removable Fronts group, while the 5-bay carcass and shelves form the Skeleton.',
            skeleton: buildTallSkeleton('CAB_KITCHEN_N7', 7135, 7735, [600, 1200, 1650, 2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N7_FRONT_BOTTOM',
                    name: 'Bottom Cabinet Wood Door Front (596×20×446 mm, Z=150..600 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7137, x1: 7733,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 598
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_OVEN_FRAME',
                    name: 'Oven (Piekarnik) Black Glass Fascia Front (596×20×596 mm, Z=600..1,200 mm)',
                    role: 'appliance_front',
                    material: 'appliance_black_glass',
                    colorRgb: COLOR_APPLIANCE_BODY,
                    x0: 7137, x1: 7733,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 602, z1: 1198
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_OVEN_WINDOW',
                    name: 'Oven (Piekarnik) Viewing Glass Window (500×6×400 mm, Z=750..1,150 mm)',
                    role: 'appliance_window',
                    material: 'appliance_window_glass',
                    colorRgb: COLOR_APPLIANCE_GLASS,
                    x0: 7185, x1: 7685,
                    y0: Y_FRONT_FACE - 2, y1: Y_FRONT_FACE + 4,
                    z0: 750, z1: 1150
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MW_FRAME',
                    name: 'Microwave (Mikrofala) Black Glass Fascia Front (596×20×446 mm, Z=1,200..1,650 mm)',
                    role: 'appliance_front',
                    material: 'appliance_black_glass',
                    colorRgb: COLOR_APPLIANCE_BODY,
                    x0: 7137, x1: 7733,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 1202, z1: 1648
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MW_WINDOW',
                    name: 'Microwave (Mikrofala) Viewing Glass Window (500×6×250 mm, Z=1,350..1,600 mm)',
                    role: 'appliance_window',
                    material: 'appliance_window_glass',
                    colorRgb: COLOR_APPLIANCE_GLASS,
                    x0: 7185, x1: 7685,
                    y0: Y_FRONT_FACE - 2, y1: Y_FRONT_FACE + 4,
                    z0: 1350, z1: 1600
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MID_UPPER',
                    name: 'Middle-Upper Wood Door Front Above Microwave (596×20×446 mm, Z=1,650..2,100 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7137, x1: 7733,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 1652, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_TOP',
                    name: 'Top Cabinet Wood Door Front (596×20×596 mm, Z=2,100..2,700 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7137, x1: 7733,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // 8. CAB_KITCHEN_N8: 600 mm Tall Pantry Cabinet (Right End of North Wall)
        //    Local X = 4,780..5,380 mm from GW_3 -> X = 6,535..7,135 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N8',
            name: 'CAB_KITCHEN_N8 — Tall Pantry Cabinet 600mm (Right End)',
            shortName: 'Tall Pantry Cabinet 600×2700mm (Right End)',
            category: 'cabinet',
            subtype: 'tall_pantry_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 6535,
            x2: 7135,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 2700,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 2,700 mm (150 mm plinth + 1,950 mm lower pantry door Z=150..2,100 mm + 600 mm top storage door Z=2,100..2,700 mm)',
            description: 'Full-height 2,700 mm tall pantry storage cabinet at the eastern end of the Kitchen North Wall (adjacent to Spiżarnia wall GW_13), featuring a 1,950 mm lower wood door (with vertical handle bar) and a 600 mm top cabinet door.',
            skeleton: buildTallSkeleton('CAB_KITCHEN_N8', 6535, 7135, [2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N8_FRONT_MAIN',
                    name: 'Lower Tall Pantry Wood Door Front (596×20×1946 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 6537, x1: 7133,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N8_HANDLE_BAR',
                    name: 'Vertical Dark Bar Handle (10×12×200 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: 7105, x1: 7115,
                    y0: Y_FRONT_FACE, y1: Y_FRONT_FACE + 12,
                    z0: 700, z1: 900
                },
                {
                    id: 'CAB_KITCHEN_N8_FRONT_TOP',
                    name: 'Top Pantry Wood Door Front (596×20×596 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 6537, x1: 7133,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // KITCHEN WEST WALL (GW_3, "2. Left Wall Elevation (Width: 5400)")
        // When facing the West Wall (looking West, +X) from inside the kitchen:
        // - LEFT side of elevation (x_svg = 0) is SOUTH (Y = 8,570 mm)
        // - RIGHT side of elevation (x_svg = 540) is NORTH-WEST CORNER (Y = 3,170 mm)
        // Formula: Y_mm = 8,570 - 10 * x_svg
        // =====================================================================

        // =====================================================================
        // 9–10. CAB_KITCHEN_W1 (merged W1 + W2): 1,200 mm NW Blind-Corner Base Unit (x_svg = 420..540)
        //       Y = 3,170..4,370 mm, X = 11,315..11,915 mm, Z = 0..870 mm (Empty inside)
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W1',
            aliasIds: ['CAB_KITCHEN_W1', 'CAB_KITCHEN_W2'],
            name: 'CAB_KITCHEN_W1 — NW Corner & West Base Cabinet 1200mm (W1+W2, Y=3170..4370)',
            shortName: 'NW Corner Base Unit 1200mm (W1+W2)',
            category: 'cabinet',
            subtype: 'corner_base_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 3170,
            y2: 4370,
            zBottom: 0,
            zTop: 870,
            widthMm: 1200,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '1,200 × 600 × 870 mm (150 mm plinth + 720 mm unified W1+W2 corner carcass without internal shelves or center divider; topped by unified 30 mm KITCHEN_COUNTERTOP; X = 11,315..11,915 mm, Y = 3,170..4,370 mm)',
            description: 'Unified 1,200 mm North-West blind-corner base cabinet combining W1 and W2 (1,200 × 600 × 870 mm, x_svg = 420..540, Y = 3,170..4,370 mm) with an open, empty interior cavity (no internal shelves or middle divider panel), topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W1', 3170, 4370, false, 3170, 4370),
            fronts: [
                {
                    id: 'CAB_KITCHEN_W1_CORNER_FASCIA',
                    name: 'NW Corner Base Wood Junction Fascia (20×596×716 mm, Y=3170..3770 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: X_WEST_FRONT_FACE, x1: X_WEST_CARCASS_FRONT,
                    y0: 3172, y1: 3768,
                    z0: 152, z1: 868
                },
                ...buildWestTwoDrawerFronts('CAB_KITCHEN_W2', 3770, 4370)
            ]
        },

        // =====================================================================
        // 11. CAB_KITCHEN_W3: 600 mm Base 2-Drawer Cabinet (Cab 2, x_svg = 360..420)
        //     Y = 4,370..4,970 mm, X = 11,315..11,915 mm, Z = 0..870 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W3',
            name: 'CAB_KITCHEN_W3 — West Base 2-Drawer Cabinet 600mm (Cab 2, Y=4370..4970)',
            shortName: 'West Base 2-Drawer 600mm (Cab 2)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 4370,
            y2: 4970,
            zBottom: 0,
            zTop: 870,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 870 mm (150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Second 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 2, x_svg = 360..420, Y = 4,370..4,970 mm), topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W3', 4370, 4970, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W3', 4370, 4970)
        },

        // =====================================================================
        // 12. CAB_KITCHEN_W4: 600 mm Base 2-Drawer Cabinet (Cab 3, x_svg = 300..360)
        //     Y = 4,970..5,570 mm, X = 11,315..11,915 mm, Z = 0..870 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W4',
            name: 'CAB_KITCHEN_W4 — West Base 2-Drawer Cabinet 600mm (Cab 3, Y=4970..5570)',
            shortName: 'West Base 2-Drawer 600mm (Cab 3)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 4970,
            y2: 5570,
            zBottom: 0,
            zTop: 870,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 870 mm (150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Third 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 3, x_svg = 300..360, Y = 4,970..5,570 mm), topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W4', 4970, 5570, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W4', 4970, 5570)
        },

        // =====================================================================
        // 13. CAB_KITCHEN_W5: 600 mm Base 2-Drawer Cabinet (Cab 4, x_svg = 240..300)
        //     Y = 5,570..6,170 mm, X = 11,315..11,915 mm, Z = 0..870 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W5',
            name: 'CAB_KITCHEN_W5 — West Base 2-Drawer Cabinet 600mm (Cab 4, Y=5570..6170)',
            shortName: 'West Base 2-Drawer 600mm (Cab 4)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 5570,
            y2: 6170,
            zBottom: 0,
            zTop: 870,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 0,
            heightMm: 870,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 870 mm (150 mm plinth + 720 mm 2-drawer carcass; topped by unified 30 mm KITCHEN_COUNTERTOP; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Fourth 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 4, x_svg = 240..300, Y = 5,570..6,170 mm, immediately north of the 540 mm niche), topped by the unified L-shaped stone countertop (KITCHEN_COUNTERTOP).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W5', 5570, 6170, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W5', 5570, 6170)
        },

        // (Note: Y = 6,170..6,710 mm is the 540 mm Open Niche / Gap between Kitchen Base Cabinets and Dining Room Tall Units)

        // =====================================================================
        // 14. CAB_DINING_ROOM_W6: 450 × 300 × 2,700 mm Tall 3-Door Storage Cabinet
        //     Y = 6,710..7,160 mm, X = 11,615..11,915 mm, Z = 0..2,700 mm
        //     Doors: Lower 720 mm (Z=150..870) + Middle 1,230 mm (Z=870..2,100) + Top 600 mm (Z=2,100..2,700)
        // =====================================================================
        {
            id: 'CAB_DINING_ROOM_W6',
            aliasIds: ['CAB_KITCHEN_W6', 'CAB_DINING_ROOM_1'],
            name: 'CAB_DINING_ROOM_W6 — Tall 3-Door Storage Cabinet (450×300×2700mm, Y=6710..7160)',
            shortName: 'Dining Tall 3-Door Storage (450×300×2700mm)',
            category: 'cabinet',
            subtype: 'tall_pantry_cabinet',
            floor: 'ground',
            room: '0.14 Salon + Jadalnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_DINING_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 6710,
            y2: 7160,
            zBottom: 0,
            zTop: 2700,
            widthMm: 450,
            depthMm: 300,
            carcassDepthMm: 280,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '450 × 300 × 2,700 mm (150 mm plinth + 280 mm carcass + 20 mm fronts: 720 mm lower door Z=150..870 + 1,230 mm middle door Z=870..2,100 + 600 mm top door Z=2,100..2,700)',
            description: '450 mm wide, 300 mm (30 cm) deep full-height 3-door storage cabinet on the Dining Room (South) side of West Wall GW_3 (Y = 6,710..7,160 mm, X = 11,615..11,915 mm), with 3 wood doors and 2 vertical bar handles in the fronts.',
            skeleton: buildWestTallSkeleton('CAB_DINING_ROOM_W6', 6710, 7160, [510, 870, 1485, 2100]),
            fronts: [
                {
                    id: 'CAB_DINING_ROOM_W6_FRONT_LOWER',
                    name: 'Lower Wood Door Front (20×446×716 mm, Z=150..870 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                    y0: 6712, y1: 7158,
                    z0: 152, z1: 868
                },
                {
                    id: 'CAB_DINING_ROOM_W6_HANDLE_LOWER',
                    name: 'Lower Door Vertical Dark Bar Handle (12×10×200 mm, Z=600..800 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: X_DINING_FRONT_FACE - 12, x1: X_DINING_FRONT_FACE,
                    y0: 7130, y1: 7140,
                    z0: 600, z1: 800
                },
                {
                    id: 'CAB_DINING_ROOM_W6_FRONT_MIDDLE',
                    name: 'Middle Wood Door Front (20×446×1226 mm, Z=870..2,100 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                    y0: 6712, y1: 7158,
                    z0: 872, z1: 2098
                },
                {
                    id: 'CAB_DINING_ROOM_W6_HANDLE_MIDDLE',
                    name: 'Middle Door Vertical Dark Bar Handle (12×10×200 mm, Z=940..1,140 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: X_DINING_FRONT_FACE - 12, x1: X_DINING_FRONT_FACE,
                    y0: 7130, y1: 7140,
                    z0: 940, z1: 1140
                },
                {
                    id: 'CAB_DINING_ROOM_W6_FRONT_TOP',
                    name: 'Top Wood Door Front (20×446×596 mm, Z=2,100..2,700 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: X_DINING_FRONT_FACE, x1: X_DINING_CARCASS_FRONT,
                    y0: 6712, y1: 7158,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // 15. CAB_DINING_ROOM_W7: 450 × 300 × 2,700 mm Tall Glass Display Vitrine 2
        //     Y = 7,160..7,610 mm, X = 11,615..11,915 mm, Z = 0..2,700 mm
        // =====================================================================
        {
            id: 'CAB_DINING_ROOM_W7',
            aliasIds: ['CAB_KITCHEN_W7', 'CAB_DINING_ROOM_2'],
            name: 'CAB_DINING_ROOM_W7 — Tall Glass Display Vitrine 2 (450×300×2700mm, Y=7160..7610)',
            shortName: 'Dining Tall Glass Vitrine 2 (450×300×2700mm)',
            category: 'cabinet',
            subtype: 'tall_glass_vitrine',
            floor: 'ground',
            room: '0.14 Salon + Jadalnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_DINING_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 7160,
            y2: 7610,
            zBottom: 0,
            zTop: 2700,
            widthMm: 450,
            depthMm: 300,
            carcassDepthMm: 280,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '450 × 300 × 2,700 mm (150 mm plinth + 280 mm deep shelved carcass + 20 mm bronze/oak-framed glass vitrine door)',
            description: 'Inner 450 mm wide, 300 mm (30 cm) deep full-height glass display vitrine cabinet on the Dining Room (South) side of West Wall GW_3 (Y = 7,160..7,610 mm, X = 11,615..11,915 mm) with 4 interior display shelves in the skeleton and a wood-framed translucent glass showcase door in the fronts.',
            skeleton: buildWestTallSkeleton('CAB_DINING_ROOM_W7', 7160, 7610, [660, 1170, 1680, 2190]),
            fronts: buildWestVitrineFronts('CAB_DINING_ROOM_W7', 7160, 7610)
        },

        // =====================================================================
        // 16. CAB_DINING_ROOM_W8: 450 × 300 × 2,700 mm Tall Glass Display Vitrine 1
        //     Y = 7,610..8,060 mm, X = 11,615..11,915 mm, Z = 0..2,700 mm
        // =====================================================================
        {
            id: 'CAB_DINING_ROOM_W8',
            aliasIds: ['CAB_KITCHEN_W8', 'CAB_DINING_ROOM_3'],
            name: 'CAB_DINING_ROOM_W8 — Tall Glass Display Vitrine 1 (450×300×2700mm, Y=7610..8060)',
            shortName: 'Dining Tall Glass Vitrine 1 (450×300×2700mm)',
            category: 'cabinet',
            subtype: 'tall_glass_vitrine',
            floor: 'ground',
            room: '0.14 Salon + Jadalnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_DINING_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 7610,
            y2: 8060,
            zBottom: 0,
            zTop: 2700,
            widthMm: 450,
            depthMm: 300,
            carcassDepthMm: 280,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 2550,
            heightMm: 2700,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '450 × 300 × 2,700 mm (150 mm plinth + 280 mm deep shelved carcass + 20 mm bronze/oak-framed glass vitrine door)',
            description: 'Outer 450 mm wide, 300 mm (30 cm) deep full-height glass display vitrine cabinet on the Dining Room (South) side of West Wall GW_3 (Y = 7,610..8,060 mm, X = 11,615..11,915 mm) with 4 interior display shelves in the skeleton and a wood-framed translucent glass showcase door in the fronts.',
            skeleton: buildWestTallSkeleton('CAB_DINING_ROOM_W8', 7610, 8060, [660, 1170, 1680, 2190]),
            fronts: buildWestVitrineFronts('CAB_DINING_ROOM_W8', 7610, 8060)
        },

        // =====================================================================
        // 17. CAB_DINING_ROOM_W9: 300 × 300 mm Quarter-Circle Floating Wood Shelves
        //     Y = 8,060..8,360 mm (aligned flush with South end of wall GW_3 at Y = 8,360 mm)
        //     X = 11,615..11,915 mm, Z = 390..2,070 mm
        // =====================================================================
        (function () {
            const lowShelf = buildDiningCurvedShelfPair('CAB_DINING_ROOM_W9_SHELF_LOW', 'Lower Quarter-Circle Floating Shelf', 8060, 8360, 390, 420);
            const midShelf = buildDiningCurvedShelfPair('CAB_DINING_ROOM_W9_SHELF_MID', 'Middle Quarter-Circle Floating Shelf', 8060, 8360, 840, 870);
            const highShelf = buildDiningCurvedShelfPair('CAB_DINING_ROOM_W9_SHELF_HIGH', 'Upper Quarter-Circle Floating Shelf', 8060, 8360, 2040, 2070);
            return {
                id: 'CAB_DINING_ROOM_W9',
                aliasIds: ['CAB_KITCHEN_W9', 'CAB_DINING_ROOM_4'],
                name: 'CAB_DINING_ROOM_W9 — Dining Quarter-Circle Floating Shelves (300×300mm, Y=8060..8360)',
                shortName: 'Dining 3 Quarter-Circle Shelves (300×300mm)',
                category: 'cabinet',
                subtype: 'open_floating_shelves',
                floor: 'ground',
                room: '0.14 Salon + Jadalnia',
                hostWallId: 'GW_3',
                viewId: 'kitchen_west_wall',
                x1: X_DINING_FRONT_FACE,
                x2: X_WEST_WALL,
                y1: 8060,
                y2: 8360,
                zBottom: 390,
                zTop: 2070,
                widthMm: 300,
                depthMm: 300,
                carcassDepthMm: 280,
                frontThicknessMm: 20,
                plinthHeightMm: 0,
                plinthRecessMm: 0,
                bodyHeightMm: 1680,
                heightMm: 1680,
                boardThicknessMm: 30,
                normal: [-1, 0, 0],
                footprint2D: lowShelf.fullFootprint2D,
                specs: '300 × 300 × 1,680 mm (3 quarter-circle R=300 mm, 30 mm thick floating wood shelves at Z = 390..420, 840..870, and 2,040..2,070 mm; aligned with South end of GW_3 at Y = 8,360 mm)',
                description: 'Three 30 × 30 cm (R = 300 mm) quarter-circle floating wood shelves at the South end of West Wall GW_3 (Y = 8,060..8,360 mm, flush with the South end of GW_3 at Y = 8,360 mm). Each shelf has two 300 mm straight perpendicular edges (along GW_3 at X = 11,915 mm and flush against CAB_DINING_ROOM_W8 at Y = 8,060 mm) and a circular front arc of radius 300 mm from (11,615, 8,060) to (11,915, 8,360).',
                skeleton: [
                    lowShelf.skeletonPart,
                    midShelf.skeletonPart,
                    highShelf.skeletonPart
                ],
                fronts: [
                    lowShelf.frontPart,
                    midShelf.frontPart,
                    highShelf.frontPart
                ]
            };
        }()),

        // =====================================================================
        // 18..22. FIVE 2-TIER UPPER WALL CABINETS ON WEST WALL (CAB_KITCHEN_W_UP1..UP5)
        //         Spanning x_svg = 240..540 -> Y = 3,170..6,170 mm, X = 11,605..11,915 mm, Z = 1,500..2,700 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W_UP1',
            name: 'CAB_KITCHEN_W_UP1 — West Upper 2-Tier Wall Cabinet 1 (600×310×1200mm, NW Corner Y=3170..3770)',
            shortName: 'West Upper 2-Tier Cabinet 1 (Y=3170..3770)',
            category: 'cabinet',
            subtype: 'upper_wall_cabinet_2_tier',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_UPPER_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 3170,
            y2: 3770,
            zBottom: 1500,
            zTop: 2700,
            widthMm: 600,
            depthMm: 310,
            carcassDepthMm: 290,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 1200,
            heightMm: 1200,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 310 × 1,200 mm (Z = 1,500..2,700 mm; 290 mm carcass + 2 × 600×600 mm stacked wood door fronts)',
            description: 'First 600 mm two-tier upper wall cabinet at the North-West corner of the Kitchen West Wall above CAB_KITCHEN_W1 (x_svg = 480..540, Y = 3,170..3,770 mm, Z = 1,500..2,700 mm).',
            skeleton: buildWestUpperSkeleton('CAB_KITCHEN_W_UP1', 3170, 3770),
            fronts: buildWestUpperFronts('CAB_KITCHEN_W_UP1', 3170, 3770)
        },
        {
            id: 'CAB_KITCHEN_W_UP2',
            name: 'CAB_KITCHEN_W_UP2 — West Upper 2-Tier Wall Cabinet 2 (600×310×1200mm, Y=3770..4370)',
            shortName: 'West Upper 2-Tier Cabinet 2 (Y=3770..4370)',
            category: 'cabinet',
            subtype: 'upper_wall_cabinet_2_tier',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_UPPER_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 3770,
            y2: 4370,
            zBottom: 1500,
            zTop: 2700,
            widthMm: 600,
            depthMm: 310,
            carcassDepthMm: 290,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 1200,
            heightMm: 1200,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 310 × 1,200 mm (Z = 1,500..2,700 mm; 290 mm carcass + 2 × 600×600 mm stacked wood door fronts)',
            description: 'Second 600 mm two-tier upper wall cabinet on the Kitchen West Wall above CAB_KITCHEN_W2 (x_svg = 420..480, Y = 3,770..4,370 mm, Z = 1,500..2,700 mm).',
            skeleton: buildWestUpperSkeleton('CAB_KITCHEN_W_UP2', 3770, 4370),
            fronts: buildWestUpperFronts('CAB_KITCHEN_W_UP2', 3770, 4370)
        },
        {
            id: 'CAB_KITCHEN_W_UP3',
            name: 'CAB_KITCHEN_W_UP3 — West Upper 2-Tier Wall Cabinet 3 (600×310×1200mm, Y=4370..4970)',
            shortName: 'West Upper 2-Tier Cabinet 3 (Y=4370..4970)',
            category: 'cabinet',
            subtype: 'upper_wall_cabinet_2_tier',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_UPPER_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 4370,
            y2: 4970,
            zBottom: 1500,
            zTop: 2700,
            widthMm: 600,
            depthMm: 310,
            carcassDepthMm: 290,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 1200,
            heightMm: 1200,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 310 × 1,200 mm (Z = 1,500..2,700 mm; 290 mm carcass + 2 × 600×600 mm stacked wood door fronts)',
            description: 'Third 600 mm two-tier upper wall cabinet on the Kitchen West Wall above CAB_KITCHEN_W3 (x_svg = 360..420, Y = 4,370..4,970 mm, Z = 1,500..2,700 mm).',
            skeleton: buildWestUpperSkeleton('CAB_KITCHEN_W_UP3', 4370, 4970),
            fronts: buildWestUpperFronts('CAB_KITCHEN_W_UP3', 4370, 4970)
        },
        {
            id: 'CAB_KITCHEN_W_UP4',
            name: 'CAB_KITCHEN_W_UP4 — West Upper 2-Tier Wall Cabinet 4 (600×310×1200mm, Y=4970..5570)',
            shortName: 'West Upper 2-Tier Cabinet 4 (Y=4970..5570)',
            category: 'cabinet',
            subtype: 'upper_wall_cabinet_2_tier',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_UPPER_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 4970,
            y2: 5570,
            zBottom: 1500,
            zTop: 2700,
            widthMm: 600,
            depthMm: 310,
            carcassDepthMm: 290,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 1200,
            heightMm: 1200,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 310 × 1,200 mm (Z = 1,500..2,700 mm; 290 mm carcass + 2 × 600×600 mm stacked wood door fronts)',
            description: 'Fourth 600 mm two-tier upper wall cabinet on the Kitchen West Wall above CAB_KITCHEN_W4 (x_svg = 300..360, Y = 4,970..5,570 mm, Z = 1,500..2,700 mm).',
            skeleton: buildWestUpperSkeleton('CAB_KITCHEN_W_UP4', 4970, 5570),
            fronts: buildWestUpperFronts('CAB_KITCHEN_W_UP4', 4970, 5570)
        },
        {
            id: 'CAB_KITCHEN_W_UP5',
            name: 'CAB_KITCHEN_W_UP5 — West Upper 2-Tier Wall Cabinet 5 (600×310×1200mm, Y=5570..6170)',
            shortName: 'West Upper 2-Tier Cabinet 5 (Y=5570..6170)',
            category: 'cabinet',
            subtype: 'upper_wall_cabinet_2_tier',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_UPPER_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 5570,
            y2: 6170,
            zBottom: 1500,
            zTop: 2700,
            widthMm: 600,
            depthMm: 310,
            carcassDepthMm: 290,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 1200,
            heightMm: 1200,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 310 × 1,200 mm (Z = 1,500..2,700 mm; 290 mm carcass + 2 × 600×600 mm stacked wood door fronts)',
            description: 'Fifth 600 mm two-tier upper wall cabinet on the Kitchen West Wall above CAB_KITCHEN_W5 (x_svg = 240..300, Y = 5,570..6,170 mm, Z = 1,500..2,700 mm).',
            skeleton: buildWestUpperSkeleton('CAB_KITCHEN_W_UP5', 5570, 6170),
            fronts: buildWestUpperFronts('CAB_KITCHEN_W_UP5', 5570, 6170)
        },

        // =====================================================================
        // 23. KITCHEN_COUNTERTOP: Single Unified L-Shaped 30 mm Stone Countertop
        //     Spans all North Wall base cabinets (CAB_KITCHEN_N1..N5, X = 8,335..11,915 mm)
        //     and all West Wall base cabinets (CAB_KITCHEN_W1..W5, Y = 3,170..6,170 mm)
        //     at Z = 870..900 mm, with an 820 × 400 mm sink cutout over CAB_KITCHEN_N2.
        // =====================================================================
        {
            id: 'KITCHEN_COUNTERTOP',
            name: 'KITCHEN_COUNTERTOP — Unified L-Shaped Kitchen Stone Worktop Slab (30mm, Z=870..900mm)',
            shortName: 'Unified L-Shaped Countertop (30mm)',
            category: 'countertop',
            subtype: 'l_shaped_worktop',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 8335,
            x2: 11915,
            y1: 3170,
            y2: 6170,
            zBottom: 870,
            zTop: 900,
            widthMm: 3580,
            depthMm: 3000,
            carcassDepthMm: 600,
            frontThicknessMm: 0,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 30,
            worktopThicknessMm: 30,
            heightMm: 30,
            boardThicknessMm: 30,
            normal: [0, 0, 1],
            footprint2D: [
                [8335, 3170],
                [11915, 3170],
                [11915, 6170],
                [11315, 6170],
                [11315, 3770],
                [8335, 3770]
            ],
            specs: 'L-shaped 30 mm stone slab (Z = 870..900 mm): North wing 3,580 × 600 mm (X = 8,335..11,915 mm, Y = 3,170..3,770 mm) + West wing 600 × 3,000 mm (X = 11,315..11,915 mm, Y = 3,170..6,170 mm), with 820 × 400 mm undermount sink cutout over CAB_KITCHEN_N2 (X = 10,155..10,975 mm, Y = 3,290..3,690 mm)',
            description: 'Single continuous L-shaped 30 mm kitchen stone countertop (Blat, Z = 870..900 mm) spanning all 10 base cabinets across the Kitchen North Wall (CAB_KITCHEN_N1..N5) and Kitchen West Wall (CAB_KITCHEN_W1..W5), featuring a precision 820 × 400 mm rectangular cutout opening over CAB_KITCHEN_N2 for the 90 cm undermount kitchen sink (KITCHEN_SINK_N2).',
            skeleton: [
                buildKitchenCountertopPart()
            ],
            fronts: []
        },

        // =====================================================================
        // 23b. KITCHEN_SPLASHBACK_GLASS: 5 mm Tempered Glass Backsplash Pane (Lacobel)
        //      Mounted on Kitchen West Wall (GW_3, X = 11,910..11,915 mm) above Countertop (Z = 900 mm)
        //      and below Upper Wall Cabinets CAB_KITCHEN_W_UP1..W_UP5 (Z = 1,500 mm), Y = 3,170..6,170 mm.
        // =====================================================================
        {
            id: 'KITCHEN_SPLASHBACK_GLASS',
            name: 'KITCHEN_SPLASHBACK_GLASS — Kitchen West Wall 5mm Tempered Glass Backsplash Pane (3000×5×600mm, Z=900..1500mm)',
            shortName: '5mm Glass Backsplash Pane (West Wall, Z=900..1500)',
            category: 'backsplash',
            subtype: 'glass_backsplash_5mm',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: 11910,
            x2: 11915,
            y1: 3170,
            y2: 6170,
            zBottom: 900,
            zTop: 1500,
            widthMm: 3000,
            depthMm: 5,
            carcassDepthMm: 5,
            frontThicknessMm: 0,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 600,
            heightMm: 600,
            boardThicknessMm: 5,
            normal: [-1, 0, 0],
            specs: '3,000 × 5 × 600 mm tempered Lacobel glass pane (X = 11,910..11,915 mm, Y = 3,170..6,170 mm, Z = 900..1,500 mm) mounted on Kitchen West Wall GW_3 between stone countertop (Z = 900 mm) and upper wall cabinets (Z = 1,500 mm). Configurable material: White Glass / Black Glass.',
            description: 'Fixed-position 5 mm tempered glass backsplash panel (Lacobel) spanning the full 3,000 mm Kitchen West Wall run (Y = 3,170..6,170 mm) directly above the 30 mm stone countertop (Z = 900 mm) and below the upper wall cabinets CAB_KITCHEN_W_UP1..W_UP5 (Z = 1,500 mm). Finishing material is configurable between White Glass and Black Glass in materials.html.',
            skeleton: [
                {
                    id: 'KITCHEN_SPLASHBACK_GLASS_PANE',
                    name: '5mm Tempered Lacobel Glass Backsplash Pane (5×3000×600 mm, Z=900..1500 mm)',
                    role: 'backsplash_glass',
                    material: 'white_glass',
                    colorRgb: [0.95, 0.98, 1.00],
                    x0: 11910, x1: 11915,
                    y0: 3170, y1: 6170,
                    z0: 900, z1: 1500
                }
            ],
            fronts: []
        },

        // =====================================================================
        // 23c. KITCHEN_SPLASHBACK_GLASS_NORTH: U-Shaped 5 mm Tempered Glass Backsplash Panel
        //      Mounted on Kitchen Back/North Wall (EW_NORTH_RECESSED, Y = 3,170..3,175 mm)
        //      spanning X = 8,335..11,910 mm above Countertop (Z = 900 mm) up to Z = 1,500 mm
        //      with a precision U-shaped cutout under Window O1 (X = 8,480..10,580 mm, Z = 900..1,100 mm).
        // =====================================================================
        (function buildKitchenNorthSplashbackItem() {
            const x0 = 8335;
            const x1 = 8480;
            const x2 = 10580;
            const x3 = 11910;
            const y0 = 3170;
            const y1 = 3175;
            const z0 = 900;
            const z1 = 1100;
            const z2 = 1500;
            const b = 14;

            const faces3D = [
                // Front U-shaped surface decomposed into 3 seamless convex quads (normal [0, 1, 0])
                { side: 'south_east_wing', normal: [0, 1, 0], noWireframe: true, loop3D: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z2], [x0, y1, z2]] },
                { side: 'south_window_sill', normal: [0, 1, 0], noWireframe: true, loop3D: [[x1, y1, z0], [x2, y1, z0], [x2, y1, z1], [x1, y1, z1]] },
                { side: 'south_west_wing', normal: [0, 1, 0], noWireframe: true, loop3D: [[x2, y1, z0], [x3, y1, z0], [x3, y1, z2], [x2, y1, z2]] },
                // Back U-shaped surface against wall (normal [0, -1, 0])
                { side: 'north_east_wing', normal: [0, -1, 0], noWireframe: true, loop3D: [[x1, y0, z0], [x0, y0, z0], [x0, y0, z2], [x1, y0, z2]] },
                { side: 'north_window_sill', normal: [0, -1, 0], noWireframe: true, loop3D: [[x2, y0, z0], [x1, y0, z0], [x1, y0, z1], [x2, y0, z1]] },
                { side: 'north_west_wing', normal: [0, -1, 0], noWireframe: true, loop3D: [[x3, y0, z0], [x2, y0, z0], [x2, y0, z2], [x3, y0, z2]] },
                // 8 perimeter 5 mm thickness rim quads
                { side: 'bottom', normal: [0, 0, -1], noWireframe: true, loop3D: [[x0, y0, z0], [x3, y0, z0], [x3, y1, z0], [x0, y1, z0]] },
                { side: 'east_outer', normal: [-1, 0, 0], noWireframe: true, loop3D: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z2], [x0, y0, z2]] },
                { side: 'top_east', normal: [0, 0, 1], noWireframe: true, loop3D: [[x0, y1, z2], [x1, y1, z2], [x1, y0, z2], [x0, y0, z2]] },
                { side: 'notch_east', normal: [1, 0, 0], noWireframe: true, loop3D: [[x1, y1, z1], [x1, y0, z1], [x1, y0, z2], [x1, y1, z2]] },
                { side: 'top_sill', normal: [0, 0, 1], noWireframe: true, loop3D: [[x1, y1, z1], [x2, y1, z1], [x2, y0, z1], [x1, y0, z1]] },
                { side: 'notch_west', normal: [-1, 0, 0], noWireframe: true, loop3D: [[x2, y0, z1], [x2, y1, z1], [x2, y1, z2], [x2, y0, z2]] },
                { side: 'top_west', normal: [0, 0, 1], noWireframe: true, loop3D: [[x2, y1, z2], [x3, y1, z2], [x3, y0, z2], [x2, y0, z2]] },
                { side: 'west_outer', normal: [1, 0, 0], noWireframe: true, loop3D: [[x3, y1, z0], [x3, y0, z0], [x3, y0, z2], [x3, y1, z2]] }
            ];

            const wireframeLines3D = [
                // Continuous 8-corner U-shaped outer boundary loop
                [
                    [x0, y1 + 0.2, z0],
                    [x3, y1 + 0.2, z0],
                    [x3, y1 + 0.2, z2],
                    [x2, y1 + 0.2, z2],
                    [x2, y1 + 0.2, z1],
                    [x1, y1 + 0.2, z1],
                    [x1, y1 + 0.2, z2],
                    [x0, y1 + 0.2, z2],
                    [x0, y1 + 0.2, z0]
                ],
                // Continuous 8-corner U-shaped inner diamond-polished bevel loop
                [
                    [x0 + b, y1 + 0.3, z0 + b],
                    [x3 - b, y1 + 0.3, z0 + b],
                    [x3 - b, y1 + 0.3, z2 - b],
                    [x2 + b, y1 + 0.3, z2 - b],
                    [x2 + b, y1 + 0.3, z1 - b],
                    [x1 - b, y1 + 0.3, z1 - b],
                    [x1 - b, y1 + 0.3, z2 - b],
                    [x0 + b, y1 + 0.3, z2 - b],
                    [x0 + b, y1 + 0.3, z0 + b]
                ]
            ];

            return {
                id: 'KITCHEN_SPLASHBACK_GLASS_NORTH',
                name: 'KITCHEN_SPLASHBACK_GLASS_NORTH — Kitchen Back Wall U-Shaped 5mm Tempered Glass Backsplash Panel (3575×5×600/200mm around Window O1)',
                shortName: '5mm Glass Backsplash U-Panel (Back Wall around O1)',
                category: 'backsplash',
                subtype: 'glass_backsplash_5mm',
                floor: 'ground',
                room: '0.13 Kuchnia',
                hostWallId: 'EW_NORTH_RECESSED',
                viewId: 'kitchen_north_wall',
                x1: x0,
                x2: x3,
                y1: y0,
                y2: y1,
                zBottom: z0,
                zTop: z2,
                widthMm: x3 - x0,
                depthMm: 5,
                carcassDepthMm: 5,
                frontThicknessMm: 0,
                plinthHeightMm: 0,
                plinthRecessMm: 0,
                bodyHeightMm: 600,
                heightMm: 600,
                boardThicknessMm: 5,
                normal: [0, 1, 0],
                specs: '3,575 × 5 × 600 mm U-shaped tempered Lacobel glass panel (X = 8,335..11,910 mm, Y = 3,170..3,175 mm, Z = 900..1,500 mm with 2,100 × 400 mm window cutout at X = 8,480..10,580 mm, Z = 1,100..1,500 mm under Window O1). Configurable material: White Glass / Black Glass.',
                description: 'U-shaped 5 mm tempered glass backsplash panel mounted on the Kitchen Back (North) Wall (EW_NORTH_RECESSED) from the West Wall corner (X = 11,910 mm) to the Tall Fridge Cabinet (X = 8,335 mm), rising 600 mm (Z = 900..1,500 mm) on both sides of Window O1 and 200 mm (Z = 900..1,100 mm) beneath the Window O1 sill.',
                skeleton: [
                    {
                        id: 'KITCHEN_SPLASHBACK_GLASS_NORTH_PANE',
                        name: 'U-Shaped 5mm Tempered Glass Backsplash Pane around Window O1 (3575×5×600/200 mm, Z=900..1500 mm)',
                        role: 'backsplash_glass',
                        material: 'white_glass',
                        colorRgb: [0.95, 0.98, 1.00],
                        x0: x0, x1: x3,
                        y0: y0, y1: y1,
                        z0: z0, z1: z2,
                        faces3D: faces3D,
                        wireframeLines3D: wireframeLines3D
                    }
                ],
                fronts: []
            };
        })(),

        // =====================================================================
        // 24. KITCHEN_SINK_N2: 90 cm Undermount Stainless Steel Kitchen Sink & Spring Faucet (Zlew)
        //     Mounted inside the wide top opening of CAB_KITCHEN_N2 and the cutout of KITCHEN_COUNTERTOP
        // =====================================================================
        {
            id: 'KITCHEN_SINK_N2',
            aliasIds: ['KITCHEN_SINK'],
            name: 'KITCHEN_SINK_N2 — 90cm Undermount Stainless Steel Kitchen Sink & Pull-Down Spring Faucet (Zlew)',
            shortName: '90cm Kitchen Sink & Faucet (Zlew)',
            category: 'fixture',
            subtype: 'kitchen_sink_undermount',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 10149,
            x2: 10981,
            y1: 3210,
            y2: 3696,
            zBottom: 664,
            zTop: 1340,
            widthMm: 832,
            depthMm: 486,
            carcassDepthMm: 412,
            frontThicknessMm: 0,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 676,
            heightMm: 676,
            boardThicknessMm: 6,
            normal: [0, 1, 0],
            specs: '820 × 400 × 200 mm interior brushed stainless steel single-bowl undermount basin (Z = 664..872 mm, X = 10,155..10,975 mm, Y = 3,290..3,690 mm) with X-grooved pitched floor, Ø 112 mm perforated basket strainer drain, rear overflow escutcheon, and 440 mm tall chrome pull-down spring gooseneck mixer faucet (Z = 900..1,340 mm)',
            description: '90 cm commercial-style brushed stainless steel undermount single-bowl kitchen sink (Zlew) installed inside the wide top cavity of CAB_KITCHEN_N2 beneath the KITCHEN_COUNTERTOP cutout, complete with X-shaped drainage creases on the basin floor, circular perforated basket strainer drain, rear overflow escutcheon, and a tall pull-down spring-coil gooseneck mixer faucet with spray head docking bracket and side lever handle.',
            skeleton: buildKitchenSinkParts(),
            fronts: []
        },

        // =====================================================================
        // 25. KITCHEN_ISLAND: Freestanding 2,400 × 1,000 × 920 mm Waterfall Kitchen Island
        //     with 80 mm Stone Waterfall Countertop & Side Legs, 20 mm Wood Fillers,
        //     Stacked-Drawer Carcasses (600 + 1,000 + 600 mm on North side, 2,240 mm on South side),
        //     and 900 mm Flush Induction Hob (Indukcja). Fronts left empty ([]) for later design.
        // =====================================================================
        {
            id: 'KITCHEN_ISLAND',
            aliasIds: ['ISLAND', 'CAB_KITCHEN_ISLAND'],
            name: 'KITCHEN_ISLAND — Freestanding Waterfall Kitchen Island & 90cm Induction Hob (2400×1000×920mm)',
            shortName: 'Kitchen Island (2400×1000×920mm)',
            category: 'island',
            subtype: 'kitchen_island_waterfall',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_island_front',
            x1: 7715,
            x2: 10115,
            y1: 5420,
            y2: 6420,
            zBottom: 0,
            zTop: 927,
            widthMm: 2400,
            depthMm: 1000,
            carcassDepthMm: 980,
            frontThicknessMm: 20,
            plinthHeightMm: 0,
            plinthRecessMm: 0,
            bodyHeightMm: 840,
            worktopThicknessMm: 80,
            heightMm: 920,
            boardThicknessMm: BOARD_MM,
            normal: [0, -1, 0],
            specs: '2,400 × 1,000 × 920 mm (X = 7,715..10,115 mm, Y = 5,420..6,420 mm, Z = 0..920 mm; 1,650 mm South of North cabinets, 1,200 mm East of West cabinets): 80 mm stone waterfall top & side legs + North side (20 mm filler + 600 + 1,000 + 600 mm 2-drawer cabinets with Gola aluminum handle rails + 20 mm filler) + South side (300 mm deep seating overhang with 2,240 × 840 mm back panel at Y = 6,120 mm, no shelves) + 900 × 520 mm Induction Hob (Indukcja) at Z = 920..927 mm',
            description: 'Freestanding waterfall kitchen island positioned 1,650 mm South of the North Wall cabinets (Y = 5,420..6,420 mm) and 1,200 mm from both the West Wall base cabinets and East Kitchen wall (X = 7,715..10,115 mm). Comprises an 80 mm thick stone waterfall countertop and 80 mm vertical waterfall side panels (Z = 0..920 mm), three North-facing 2-drawer base cabinets (600 + 1,000 + 600 mm, Z = 0..840 mm split horizontally into 420 + 420 mm tiers with wood drawer fronts and 30 mm Gola aluminum handle rails) flanked by 20 mm brown filler strips, a South-facing 2,240 × 840 mm back panel recessed 300 mm (30 cm) in from the South edge (Y = 6,120 mm) with no shelves, and a centered 900 mm black glass induction hob (Indukcja).',
            skeleton: (function buildKitchenIslandSkeleton() {
                const parts = [];
                const xEastOut = 7715;
                const xEastIn = 7795;   // 80 mm East waterfall leg (X = 7,715..7,795)
                const xWestIn = 10035;  // 80 mm West waterfall leg (X = 10,035..10,115)
                const xWestOut = 10115;
                const yNorth = 5420;    // North / Kitchen-facing front of island (outer face of 20mm fronts)
                const yCarcassFront = yNorth + 20; // 5440 mm (carcass front behind 20mm drawer fronts)
                const yMid = 6020;      // 600 mm deep North cooking cabinet zone (Y = 5,420..6,020)
                const ySouth = 6420;    // South / Dining-facing edge of island
                const ySouthBack = ySouth - 300; // 300 mm (30 cm) recessed back panel from South edge (Y = 6,120)

                // 1. 80 mm Stone Waterfall Countertop Slab & East/West Waterfall Side Legs (#E8DCC4)
                parts.push(
                    {
                        id: 'KITCHEN_ISLAND_TOP_SLAB',
                        name: '80mm Waterfall Stone Countertop Slab (2400×1000×80 mm Blat)',
                        role: 'countertop_slab',
                        material: 'stone_worktop',
                        colorRgb: COLOR_WORKTOP,
                        x0: xEastOut, x1: xWestOut,
                        y0: yNorth, y1: ySouth,
                        z0: 840, z1: 920
                    },
                    {
                        id: 'KITCHEN_ISLAND_EAST_WATERFALL',
                        name: 'East 80mm Stone Waterfall Side Panel (80×1000×840 mm)',
                        role: 'countertop_slab',
                        material: 'stone_worktop',
                        colorRgb: COLOR_WORKTOP,
                        x0: xEastOut, x1: xEastIn,
                        y0: yNorth, y1: ySouth,
                        z0: 0, z1: 840
                    },
                    {
                        id: 'KITCHEN_ISLAND_WEST_WATERFALL',
                        name: 'West 80mm Stone Waterfall Side Panel (80×1000×840 mm)',
                        role: 'countertop_slab',
                        material: 'stone_worktop',
                        colorRgb: COLOR_WORKTOP,
                        x0: xWestIn, x1: xWestOut,
                        y0: yNorth, y1: ySouth,
                        z0: 0, z1: 840
                    }
                );

                // 2. North-Side 20 mm Wood Filler Strips (Blenda 20×600×840 mm at X = 7,795..7,815 and X = 10,015..10,035)
                parts.push(
                    {
                        id: 'KITCHEN_ISLAND_EAST_FILLER',
                        name: 'North-East 20mm Wood Filler Panel (20×600×840 mm Blenda)',
                        role: 'carcass_panel',
                        material: 'wood_tone',
                        colorRgb: COLOR_WOOD_FRONT,
                        x0: 7795, x1: 7815,
                        y0: yNorth, y1: yMid,
                        z0: 0, z1: 840
                    },
                    {
                        id: 'KITCHEN_ISLAND_WEST_FILLER',
                        name: 'North-West 20mm Wood Filler Panel (20×600×840 mm Blenda)',
                        role: 'carcass_panel',
                        material: 'wood_tone',
                        colorRgb: COLOR_WOOD_FRONT,
                        x0: 10015, x1: 10035,
                        y0: yNorth, y1: yMid,
                        z0: 0, z1: 840
                    }
                );

                // Helper for the 3 North-facing stacked-drawer base carcasses (600 + 1,000 + 600 mm, Z = 0..840 mm split at Z = 420 mm)
                function addNorthIslandCarcass(subId, label, cx0, cx1) {
                    const cw = cx1 - cx0;
                    parts.push(
                        {
                            id: `${subId}_EAST_PANEL`,
                            name: `${label} — East Side Carcass Panel (18×580×840 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_SIDE,
                            x0: cx0, x1: cx0 + BOARD_MM,
                            y0: yCarcassFront, y1: yMid,
                            z0: 0, z1: 840
                        },
                        {
                            id: `${subId}_WEST_PANEL`,
                            name: `${label} — West Side Carcass Panel (18×580×840 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_SIDE,
                            x0: cx1 - BOARD_MM, x1: cx1,
                            y0: yCarcassFront, y1: yMid,
                            z0: 0, z1: 840
                        },
                        {
                            id: `${subId}_BACK_PANEL`,
                            name: `${label} — Rear Backing Panel (${cw - 2 * BOARD_MM}×18×840 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_BACK,
                            x0: cx0 + BOARD_MM, x1: cx1 - BOARD_MM,
                            y0: yMid - BOARD_MM, y1: yMid,
                            z0: 0, z1: 840
                        },
                        {
                            id: `${subId}_BOTTOM_PANEL`,
                            name: `${label} — Bottom Carcass Panel (${cw - 2 * BOARD_MM}×562×18 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_SHELF,
                            x0: cx0 + BOARD_MM, x1: cx1 - BOARD_MM,
                            y0: yCarcassFront, y1: yMid - BOARD_MM,
                            z0: 0, z1: BOARD_MM
                        },
                        {
                            id: `${subId}_MID_SHELF`,
                            name: `${label} — Horizontal 420/420mm Drawer Divider Shelf (${cw - 2 * BOARD_MM}×562×18 mm at Z=420 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_SHELF,
                            x0: cx0 + BOARD_MM, x1: cx1 - BOARD_MM,
                            y0: yCarcassFront + 4, y1: yMid - BOARD_MM,
                            z0: 411,
                            z1: 429
                        },
                        {
                            id: `${subId}_TOP_PANEL`,
                            name: `${label} — Top Carcass Panel (${cw - 2 * BOARD_MM}×562×18 mm)`,
                            role: 'carcass_panel',
                            material: 'carcass_melamine',
                            colorRgb: COLOR_CARCASS_SHELF,
                            x0: cx0 + BOARD_MM, x1: cx1 - BOARD_MM,
                            y0: yCarcassFront + 4, y1: yMid - BOARD_MM,
                            z0: 840 - BOARD_MM, z1: 840
                        }
                    );
                }

                // 3. Three North-Facing Stacked-Drawer Base Carcasses (East 600mm, Center 1000mm, West 600mm)
                addNorthIslandCarcass('KITCHEN_ISLAND_CAB_N_EAST', 'Island North-East 600mm Cabinet', 7815, 8415);
                addNorthIslandCarcass('KITCHEN_ISLAND_CAB_N_CENTER', 'Island North-Center 1000mm Hob Cabinet', 8415, 9415);
                addNorthIslandCarcass('KITCHEN_ISLAND_CAB_N_WEST', 'Island North-West 600mm Cabinet', 9415, 10015);

                // 4. South-Facing (Dining Room Back Side) Back Panel recessed 300 mm (30 cm) from the South edge (Y = 6,120 mm, no shelves)
                parts.push({
                    id: 'KITCHEN_ISLAND_SOUTH_BACK_PANEL',
                    name: 'Island South Recessed Back Panel — 30cm from South Edge (2240×18×840 mm at Y=6102..6120 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_BACK,
                    x0: xEastIn, x1: xWestIn,
                    y0: ySouthBack - BOARD_MM, y1: ySouthBack,
                    z0: 0, z1: 840
                });

                // 5. 900 × 520 × 7 mm Black Glass-Ceramic Induction Hob (Indukcja, centered at X = 8,915 mm on North cooking side)
                const hobWireRings = [];
                const hobZones = [
                    { cx: 8665, cy: 5650, r: 95 },
                    { cx: 8665, cy: 5850, r: 75 },
                    { cx: 9165, cy: 5650, r: 80 },
                    { cx: 9165, cy: 5850, r: 105 },
                    { cx: 8915, cy: 5740, r: 115 }
                ];
                hobZones.forEach(z => {
                    const ring = [];
                    const segs = 20;
                    for (let i = 0; i <= segs; i++) {
                        const a = (i / segs) * Math.PI * 2;
                        ring.push([
                            Math.round((z.cx + z.r * Math.cos(a)) * 10) / 10,
                            Math.round((z.cy + z.r * Math.sin(a)) * 10) / 10,
                            927.5
                        ]);
                    }
                    hobWireRings.push(ring);
                });

                parts.push({
                    id: 'KITCHEN_ISLAND_INDUCTION_HOB',
                    name: '90cm Black Glass-Ceramic Induction Hob (Indukcja 900×520×7 mm, Z=920..927 mm)',
                    role: 'appliance_front',
                    material: 'appliance_glass',
                    colorRgb: COLOR_APPLIANCE_BODY,
                    x0: 8465, x1: 9365,
                    y0: 5470, y1: 5990,
                    z0: 920, z1: 927,
                    wireframeLines3D: hobWireRings
                });

                return parts;
            })(),
            fronts: (function buildKitchenIslandFronts() {
                const fParts = [];
                const yFrontFace = 5420;                   // Flush with North edge of island waterfall frame
                const yCarcassFront = yFrontFace + 20; // 5440 mm

                function addNorthIslandTwoDrawerFronts(subId, label, cx0, cx1) {
                    const cw = cx1 - cx0;
                    fParts.push(
                        {
                            id: `${subId}_FRONT_LOWER`,
                            name: `${label} — Lower Drawer Wood Front (${cw - 4}×20×388 mm)`,
                            role: 'drawer_front',
                            material: 'wood_tone',
                            colorRgb: COLOR_WOOD_FRONT,
                            x0: cx0 + 2, x1: cx1 - 2,
                            y0: yFrontFace, y1: yCarcassFront,
                            z0: 2, z1: 390
                        },
                        {
                            id: `${subId}_RAIL_LOWER`,
                            name: `${label} — Lower Recessed Aluminum Handle Rail (${cw}×22×30 mm)`,
                            role: 'handle_rail',
                            material: 'aluminum_rail',
                            colorRgb: COLOR_ALU_RAIL,
                            x0: cx0, x1: cx1,
                            y0: yFrontFace + 2, y1: yCarcassFront + 4,
                            z0: 390, z1: 420
                        },
                        {
                            id: `${subId}_FRONT_UPPER`,
                            name: `${label} — Upper Drawer Wood Front (${cw - 4}×20×388 mm)`,
                            role: 'drawer_front',
                            material: 'wood_tone',
                            colorRgb: COLOR_WOOD_FRONT,
                            x0: cx0 + 2, x1: cx1 - 2,
                            y0: yFrontFace, y1: yCarcassFront,
                            z0: 422, z1: 810
                        },
                        {
                            id: `${subId}_RAIL_UPPER`,
                            name: `${label} — Upper Recessed Aluminum Handle Rail (${cw}×22×30 mm)`,
                            role: 'handle_rail',
                            material: 'aluminum_rail',
                            colorRgb: COLOR_ALU_RAIL,
                            x0: cx0, x1: cx1,
                            y0: yFrontFace + 2, y1: yCarcassFront + 4,
                            z0: 810, z1: 840
                        }
                    );
                }

                addNorthIslandTwoDrawerFronts('KITCHEN_ISLAND_CAB_N_EAST', 'Island North-East 600mm Cabinet', 7815, 8415);
                addNorthIslandTwoDrawerFronts('KITCHEN_ISLAND_CAB_N_CENTER', 'Island North-Center 1000mm Hob Cabinet', 8415, 9415);
                addNorthIslandTwoDrawerFronts('KITCHEN_ISLAND_CAB_N_WEST', 'Island North-West 600mm Cabinet', 9415, 10015);

                return fParts;
            })()
        },

        // =====================================================================
        // 26. PANTRY_FRIDGE: Freestanding 600 × 600 × 1,900 mm Samsung Brushed Graphite
        //     Upright Refrigerator / Freezer (Zamrażarka) on North Wall of 0.14 Spiżarnia
        //     Inspired by attached reference photos: dark matte charcoal cabinet body with
        //     stepped top rear housing, magnetic gasket reveal, thick beveled brushed-graphite
        //     steel door, raised silver SAMSUNG badge, recessed black glass digital control panel
        //     displaying "-19 °C" LED readout + Wi-Fi/leaf icons + "< O >" touch controls,
        //     smooth cylindrical vertical bar handle with top/bottom standoff brackets, and leveling feet.
        // =====================================================================
        (function buildPantryFridgeObject() {
            const fx0 = 5715, fx1 = 6315; // 600 mm width in NW corner of 0.14 Spiżarnia (flush with GW_13_EAST at X=6315)
            const fy0 = 3170, fy1 = 3770; // 600 mm total body + door depth from EW_NORTH_RECESSED_INT (Y=3170)
            const fz0 = 0, fz1 = 1900;    // 1,900 mm total height

            const COLOR_FRIDGE_CASING = [0.17, 0.19, 0.22];       // Matte dark charcoal insulated cabinet sides & top
            const COLOR_FRIDGE_GASKET = [0.10, 0.11, 0.13];       // Deep shadow accordion door seal
            const COLOR_FRIDGE_DOOR_FACE = [0.24, 0.27, 0.31];    // Brushed graphite / black stainless steel door front
            const COLOR_FRIDGE_DOOR_BEVEL = [0.31, 0.35, 0.40];   // Specular brushed edge bevel highlight
            const COLOR_FRIDGE_HANDLE_BAR = [0.30, 0.34, 0.39];   // Anodized dark gunmetal tubular bar handle
            const COLOR_FRIDGE_HANDLE_MOUNT = [0.38, 0.42, 0.47]; // Brushed metallic handle standoffs & end caps
            const COLOR_FRIDGE_BADGE = [0.84, 0.87, 0.91];        // Brushed silver-chrome SAMSUNG logo badge
            const COLOR_FRIDGE_BEZEL = [0.13, 0.15, 0.18];        // Recessed control panel bezel frame
            const COLOR_FRIDGE_GLASS = [0.05, 0.06, 0.08];        // Pitch-black tempered glass LED display screen
            const COLOR_FRIDGE_LED = [0.95, 0.99, 1.00];          // Crisp glowing white LED 7-segment readout (-19 °C)
            const WIRE_FRIDGE_DARK = [0.34, 0.38, 0.44, 0.92];
            const WIRE_FRIDGE_LED = [0.95, 0.99, 1.00, 0.98];

            // Helper for smooth cylindrical tubes (leveling feet, vertical bar handle, horizontal standoffs)
            function buildFridgeTubePart(opts) {
                const spine = opts.spine || [];
                const numSegs = opts.numSegs || 22;
                const faces3D = [];
                const wireframeLines3D = opts.wireframeLines3D ? opts.wireframeLines3D.slice() : [];
                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;
                let minZ = Infinity, maxZ = -Infinity;

                const tangents = [];
                for (let i = 0; i < spine.length; i++) {
                    let iPrev = i;
                    while (iPrev > 0 && Math.hypot(spine[i][0] - spine[iPrev][0], spine[i][1] - spine[iPrev][1], spine[i][2] - spine[iPrev][2]) < 0.05) iPrev--;
                    let iNext = i;
                    while (iNext < spine.length - 1 && Math.hypot(spine[iNext][0] - spine[i][0], spine[iNext][1] - spine[i][1], spine[iNext][2] - spine[i][2]) < 0.05) iNext++;
                    let tx = spine[iNext][0] - spine[iPrev][0];
                    let ty = spine[iNext][1] - spine[iPrev][1];
                    let tz = spine[iNext][2] - spine[iPrev][2];
                    const len = Math.hypot(tx, ty, tz) || 1;
                    tangents.push([tx / len, ty / len, tz / len]);
                }

                const rings = [];
                for (let i = 0; i < spine.length; i++) {
                    const [px, py, pz, r] = spine[i];
                    const T = tangents[i];
                    const ref = (Math.abs(T[0]) < 0.85) ? [1, 0, 0] : [0, 1, 0];
                    let vx = T[1] * ref[2] - T[2] * ref[1];
                    let vy = T[2] * ref[0] - T[0] * ref[2];
                    let vz = T[0] * ref[1] - T[1] * ref[0];
                    const vLen = Math.hypot(vx, vy, vz) || 1;
                    vx /= vLen; vy /= vLen; vz /= vLen;
                    let ux = vy * T[2] - vz * T[1];
                    let uy = vz * T[0] - vx * T[2];
                    let uz = vx * T[1] - vy * T[0];
                    const uLen = Math.hypot(ux, uy, uz) || 1;
                    ux /= uLen; uy /= uLen; uz /= uLen;

                    const ringPts = [];
                    const ringNormals = [];
                    for (let k = 0; k < numSegs; k++) {
                        const ang = (k / numSegs) * Math.PI * 2;
                        const ca = Math.cos(ang), sa = Math.sin(ang);
                        const nx = ca * ux + sa * vx;
                        const ny = ca * uy + sa * vy;
                        const nz = ca * uz + sa * vz;
                        const vx3 = Math.round((px + r * nx) * 100) / 100;
                        const vy3 = Math.round((py + r * ny) * 100) / 100;
                        const vz3 = Math.round((pz + r * nz) * 100) / 100;
                        ringPts.push([vx3, vy3, vz3]);
                        ringNormals.push([nx, ny, nz]);
                        if (vx3 < minX) minX = vx3;
                        if (vx3 > maxX) maxX = vx3;
                        if (vy3 < minY) minY = vy3;
                        if (vy3 > maxY) maxY = vy3;
                        if (vz3 < minZ) minZ = vz3;
                        if (vz3 > maxZ) maxZ = vz3;
                    }
                    rings.push({ pts: ringPts, normals: ringNormals, T, r });
                }

                for (let i = 0; i + 1 < rings.length; i++) {
                    const rA = rings[i], rB = rings[i + 1];
                    const distCenters = Math.hypot(
                        spine[i + 1][0] - spine[i][0],
                        spine[i + 1][1] - spine[i][1],
                        spine[i + 1][2] - spine[i][2]
                    );
                    const dr = rB.r - rA.r;
                    if (distCenters < 0.02 && Math.abs(dr) < 0.02) continue;
                    const hyp = Math.hypot(distCenters, dr) || 1;
                    const wRad = distCenters / hyp;
                    const wTan = -dr / hyp;
                    for (let k = 0; k < numSegs; k++) {
                        const kNext = (k + 1) % numSegs;
                        const p00 = rA.pts[k], p10 = rA.pts[kNext], p11 = rB.pts[kNext], p01 = rB.pts[k];
                        const n00 = [rA.normals[k][0] * wRad + rA.T[0] * wTan, rA.normals[k][1] * wRad + rA.T[1] * wTan, rA.normals[k][2] * wRad + rA.T[2] * wTan];
                        const n10 = [rA.normals[kNext][0] * wRad + rA.T[0] * wTan, rA.normals[kNext][1] * wRad + rA.T[1] * wTan, rA.normals[kNext][2] * wRad + rA.T[2] * wTan];
                        const n11 = [rB.normals[kNext][0] * wRad + rB.T[0] * wTan, rB.normals[kNext][1] * wRad + rB.T[1] * wTan, rB.normals[kNext][2] * wRad + rB.T[2] * wTan];
                        const n01 = [rB.normals[k][0] * wRad + rB.T[0] * wTan, rB.normals[k][1] * wRad + rB.T[1] * wTan, rB.normals[k][2] * wRad + rB.T[2] * wTan];
                        const avgNx = (n00[0] + n10[0] + n11[0] + n01[0]) / 4;
                        const avgNy = (n00[1] + n10[1] + n11[1] + n01[1]) / 4;
                        const avgNz = (n00[2] + n10[2] + n11[2] + n01[2]) / 4;
                        const avgLen = Math.hypot(avgNx, avgNy, avgNz) || 1;
                        faces3D.push({
                            side: 'curved',
                            noWireframe: true,
                            normal: [avgNx / avgLen, avgNy / avgLen, avgNz / avgLen],
                            vertexNormals3D: [n00, n10, n11, n01],
                            loop3D: [p00, p10, p11, p01]
                        });
                    }
                }

                if (opts.capStart && rings.length > 0 && rings[0].r > 0.2) {
                    const T0 = rings[0].T;
                    faces3D.push({ side: 'cap_start', noWireframe: true, normal: [-T0[0], -T0[1], -T0[2]], loop3D: rings[0].pts.slice().reverse() });
                }
                if (opts.capEnd && rings.length > 0 && rings[rings.length - 1].r > 0.2) {
                    const TN = rings[rings.length - 1].T;
                    faces3D.push({ side: 'cap_end', noWireframe: true, normal: [TN[0], TN[1], TN[2]], loop3D: rings[rings.length - 1].pts.slice() });
                }
                (opts.ringWireframeIndices || []).forEach(idx => {
                    if (rings[idx]) wireframeLines3D.push(rings[idx].pts.concat([rings[idx].pts[0]]));
                });

                return {
                    id: opts.id,
                    name: opts.name,
                    role: opts.role || 'appliance_front',
                    material: opts.material || 'stainless_steel',
                    colorRgb: opts.colorRgb || COLOR_FRIDGE_HANDLE_BAR,
                    wireColorRgba: opts.wireColorRgba || WIRE_FRIDGE_DARK,
                    x0: Math.floor(minX), x1: Math.ceil(maxX),
                    y0: Math.floor(minY), y1: Math.ceil(maxY),
                    z0: Math.floor(minZ), z1: Math.ceil(maxZ),
                    faces3D,
                    wireframeLines3D
                };
            }

            const skeletonParts = [];

            // 1. Recessed Lower Chassis Base & Adjustable Leveling Feet (Z = 0..30 mm)
            skeletonParts.push(
                {
                    id: 'PANTRY_FRIDGE_CHASSIS_APRON',
                    name: 'Recessed Lower Compressor Chassis & Kickplate (580×510×18 mm, Z=12..30 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.11, 0.12, 0.14],
                    wireColorRgba: WIRE_FRIDGE_DARK,
                    x0: fx0 + 10, x1: fx1 - 10,
                    y0: fy0 + 20, y1: 3700,
                    z0: 12, z1: 30
                },
                buildFridgeTubePart({
                    id: 'PANTRY_FRIDGE_FOOT_LEFT',
                    name: 'Front-Left (West) Adjustable Leveling Foot (Ø44 mm, Z=0..30 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.14, 0.15, 0.17],
                    numSegs: 16,
                    spine: [
                        [6272, 3726, 2, 22],
                        [6272, 3726, 10, 22],
                        [6272, 3726, 12, 13],
                        [6272, 3726, 30, 13]
                    ],
                    capStart: true,
                    ringWireframeIndices: [1]
                }),
                buildFridgeTubePart({
                    id: 'PANTRY_FRIDGE_FOOT_RIGHT',
                    name: 'Front-Right (East) Adjustable Leveling Foot (Ø44 mm, Z=0..30 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.14, 0.15, 0.17],
                    numSegs: 16,
                    spine: [
                        [5758, 3726, 2, 22],
                        [5758, 3726, 10, 22],
                        [5758, 3726, 12, 13],
                        [5758, 3726, 30, 13]
                    ],
                    capStart: true,
                    ringWireframeIndices: [1]
                }),
                {
                    id: 'PANTRY_FRIDGE_LOWER_HINGE',
                    name: 'Lower Door Hinge Bracket & Pivot Pin (58×62×16 mm, Z=16..32 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.18, 0.20, 0.23],
                    wireColorRgba: WIRE_FRIDGE_DARK,
                    x0: 6255, x1: 6313,
                    y0: 3700, y1: 3762,
                    z0: 16, z1: 32
                }
            );

            // 2. Main Insulated Cabinet Body (Z = 30..1,838 mm) + Stepped Top-Front Electronics Housing (Z = 1,838..1,886 mm) + Top Hinge Cover
            skeletonParts.push(
                {
                    id: 'PANTRY_FRIDGE_CABINET_BODY',
                    name: 'Matte Dark-Charcoal Steel Insulated Cabinet Body (596×518×1808 mm, Z=30..1838 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: COLOR_FRIDGE_CASING,
                    wireColorRgba: WIRE_FRIDGE_DARK,
                    x0: fx0 + 2, x1: fx1 - 2,
                    y0: fy0 + 12, y1: 3700,
                    z0: 30, z1: 1838
                },
                {
                    id: 'PANTRY_FRIDGE_TOP_HOUSING',
                    name: 'Stepped Top-Front Electronics & Hinge Housing (596×230×48 mm, Z=1838..1886 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.16, 0.18, 0.21],
                    wireColorRgba: WIRE_FRIDGE_DARK,
                    x0: fx0 + 2, x1: fx1 - 2,
                    y0: 3470, y1: 3700,
                    z0: 1838, z1: 1886
                },
                {
                    id: 'PANTRY_FRIDGE_UPPER_HINGE_CAP',
                    name: 'Molded Top Door Hinge Cover Cap (98×104×14 mm, Z=1886..1900 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: [0.20, 0.22, 0.26],
                    wireColorRgba: WIRE_FRIDGE_DARK,
                    x0: 6215, x1: 6313,
                    y0: 3660, y1: 3764,
                    z0: 1886, z1: 1900
                }
            );

            // 3. Recessed Magnetic Accordion Door Gasket Seal (Y = 3,700..3,714 mm)
            skeletonParts.push({
                id: 'PANTRY_FRIDGE_DOOR_GASKET',
                name: 'Recessed Magnetic Accordion Door Gasket Seal (584×14×1854 mm, Y=3700..3714 mm)',
                role: 'appliance_front',
                material: 'appliance_steel',
                colorRgb: COLOR_FRIDGE_GASKET,
                wireColorRgba: [0.18, 0.20, 0.23, 0.90],
                x0: fx0 + 8, x1: fx1 - 8,
                y0: 3700, y1: 3714,
                z0: 36, z1: 1890
            });

            // 4. Thick 56 mm Sculpted Brushed-Graphite Steel Door (Y = 3,714..3,770 mm, Z = 32..1,898 mm)
            //    Built with chamfered perimeter bevel facets (Y = 3,762..3,770 mm) and brushed metallic highlight lines
            const dx0 = fx0, dx1 = fx1;           // 5,715..6,315 mm
            const dxIn0 = fx0 + 8, dxIn1 = fx1 - 8; // 5,723..6,307 mm
            const dyBack = 3714, dyBevel = 3762, dyFront = 3770;
            const dz0 = 32, dz1 = 1898;
            const dzIn0 = 40, dzIn1 = 1890;

            skeletonParts.push({
                id: 'PANTRY_FRIDGE_DOOR_SLAB',
                name: 'Thick Chamfered Brushed-Graphite Steel Door Panel (600×56×1866 mm, Y=3714..3770, Z=32..1898 mm)',
                role: 'appliance_front',
                material: 'stainless_steel',
                colorRgb: COLOR_FRIDGE_DOOR_FACE,
                wireColorRgba: [0.38, 0.43, 0.49, 0.94],
                x0: dx0, x1: dx1,
                y0: dyBack, y1: dyFront,
                z0: dz0, z1: dz1,
                faces3D: [
                    // Main brushed-graphite front door face (South +Y)
                    {
                        side: 'front_main',
                        normal: [0, 1, 0],
                        loop3D: [[dxIn0, dyFront, dzIn0], [dxIn1, dyFront, dzIn0], [dxIn1, dyFront, dzIn1], [dxIn0, dyFront, dzIn1]]
                    },
                    // 4 Chamfered perimeter bevel facets around the front door face
                    {
                        side: 'bevel_west',
                        noWireframe: true,
                        normal: [0.707, 0.707, 0],
                        loop3D: [[dxIn1, dyFront, dzIn0], [dx1, dyBevel, dz0], [dx1, dyBevel, dz1], [dxIn1, dyFront, dzIn1]]
                    },
                    {
                        side: 'bevel_east',
                        noWireframe: true,
                        normal: [-0.707, 0.707, 0],
                        loop3D: [[dx0, dyBevel, dz0], [dxIn0, dyFront, dzIn0], [dxIn0, dyFront, dzIn1], [dx0, dyBevel, dz1]]
                    },
                    {
                        side: 'bevel_top',
                        noWireframe: true,
                        normal: [0, 0.707, 0.707],
                        loop3D: [[dxIn0, dyFront, dzIn1], [dxIn1, dyFront, dzIn1], [dx1, dyBevel, dz1], [dx0, dyBevel, dz1]]
                    },
                    {
                        side: 'bevel_bottom',
                        noWireframe: true,
                        normal: [0, 0.707, -0.707],
                        loop3D: [[dx0, dyBevel, dz0], [dx1, dyBevel, dz0], [dxIn1, dyFront, dzIn0], [dxIn0, dyFront, dzIn0]]
                    },
                    // Side & Top/Bottom returns of the 56mm thick insulated door
                    {
                        side: 'west_return',
                        normal: [1, 0, 0],
                        loop3D: [[dx1, dyBevel, dz0], [dx1, dyBack, dz0], [dx1, dyBack, dz1], [dx1, dyBevel, dz1]]
                    },
                    {
                        side: 'east_return',
                        normal: [-1, 0, 0],
                        loop3D: [[dx0, dyBack, dz0], [dx0, dyBevel, dz0], [dx0, dyBevel, dz1], [dx0, dyBack, dz1]]
                    },
                    {
                        side: 'top_return',
                        normal: [0, 0, 1],
                        loop3D: [[dx0, dyBevel, dz1], [dx1, dyBevel, dz1], [dx1, dyBack, dz1], [dx0, dyBack, dz1]]
                    },
                    {
                        side: 'bottom_return',
                        normal: [0, 0, -1],
                        loop3D: [[dx0, dyBack, dz0], [dx1, dyBack, dz0], [dx1, dyBevel, dz0], [dx0, dyBevel, dz0]]
                    },
                    {
                        side: 'rear_liner',
                        noWireframe: true,
                        normal: [0, -1, 0],
                        loop3D: [[dx1, dyBack, dz0], [dx0, dyBack, dz0], [dx0, dyBack, dz1], [dx1, dyBack, dz1]]
                    }
                ],
                wireframeLines3D: [
                    // Outer chamfer boundary
                    [[dx0, dyBevel, dz0], [dx1, dyBevel, dz0], [dx1, dyBevel, dz1], [dx0, dyBevel, dz1], [dx0, dyBevel, dz0]],
                    // Inner front bevel crease
                    [[dxIn0, dyFront + 0.2, dzIn0], [dxIn1, dyFront + 0.2, dzIn0], [dxIn1, dyFront + 0.2, dzIn1], [dxIn0, dyFront + 0.2, dzIn1], [dxIn0, dyFront + 0.2, dzIn0]]
                ]
            });

            // 5. Raised Brushed Silver-Chrome "SAMSUNG" Emblem Plate & Vector Lettering (X = 5,967..6,063, Z = 1,742..1,758 mm)
            //    Note: When looking at the North Wall from the South (+Y looking toward -Y), LEFT is +X (West) and RIGHT is -X (East).
            const ly = 3772.3;
            const lz0 = 1745, lzM = 1750, lz1 = 1755;
            const samsungStrokes = [
                // S (X = 6053 -> 6045)
                [[6045, ly, lz1], [6053, ly, lz1], [6053, ly, lzM], [6045, ly, lzM], [6045, ly, lz0], [6053, ly, lz0]],
                // A (X = 6041 -> 6033)
                [[6041, ly, lz0], [6037, ly, lz1], [6033, ly, lz0]],
                [[6039.5, ly, lzM - 1], [6034.5, ly, lzM - 1]],
                // M (X = 6029 -> 6019)
                [[6029, ly, lz0], [6029, ly, lz1], [6024, ly, lzM - 1], [6019, ly, lz1], [6019, ly, lz0]],
                // S (X = 6015 -> 6007)
                [[6007, ly, lz1], [6015, ly, lz1], [6015, ly, lzM], [6007, ly, lzM], [6007, ly, lz0], [6015, ly, lz0]],
                // U (X = 6003 -> 5995)
                [[6003, ly, lz1], [6003, ly, lz0], [5995, ly, lz0], [5995, ly, lz1]],
                // N (X = 5991 -> 5983)
                [[5991, ly, lz0], [5991, ly, lz1], [5983, ly, lz0], [5983, ly, lz1]],
                // G (X = 5979 -> 5971)
                [[5971, ly, lz1], [5979, ly, lz1], [5979, ly, lz0], [5971, ly, lz0], [5971, ly, lzM], [5975, ly, lzM]]
            ];

            skeletonParts.push({
                id: 'PANTRY_FRIDGE_SAMSUNG_BADGE',
                name: 'Raised Brushed Silver SAMSUNG Brand Emblem (96×2.2×16 mm, Z=1742..1758 mm)',
                role: 'sink_faucet',
                material: 'chrome',
                colorRgb: COLOR_FRIDGE_BADGE,
                wireColorRgba: [0.88, 0.92, 0.96, 0.98],
                x0: 5967, x1: 6063,
                y0: 3770, y1: 3772.2,
                z0: 1742, z1: 1758,
                wireframeLines3D: samsungStrokes
            });

            // 6. Recessed Black Glass Digital Control & Temperature Display Panel (X = 5,973..6,057, Z = 1,490..1,665 mm)
            //    Inspired directly by close-up Photo 3 (media_1794776865523.png):
            //    - Beveled dark surround frame (84 × 175 mm)
            //    - Glossy pitch-black glass face (72 × 163 mm)
            //    - Glowing white 7-segment "-19 °C" LED readout + Wi-Fi & eco leaf icons + "< O >" touch controls
            skeletonParts.push(
                {
                    id: 'PANTRY_FRIDGE_DISPLAY_BEZEL',
                    name: 'Recessed Digital Control Panel Beveled Surround Bezel (84×3.5×175 mm, Z=1490..1665 mm)',
                    role: 'appliance_front',
                    material: 'appliance_steel',
                    colorRgb: COLOR_FRIDGE_BEZEL,
                    wireColorRgba: [0.42, 0.47, 0.54, 0.96],
                    x0: 5973, x1: 6057,
                    y0: 3768.5, y1: 3771.5,
                    z0: 1490, z1: 1665,
                    wireframeLines3D: [
                        [[5973, 3771.6, 1490], [6057, 3771.6, 1490], [6057, 3771.6, 1665], [5973, 3771.6, 1665], [5973, 3771.6, 1490]],
                        [[5979, 3771.8, 1496], [6051, 3771.8, 1496], [6051, 3771.8, 1659], [5979, 3771.8, 1659], [5979, 3771.8, 1496]]
                    ]
                },
                {
                    id: 'PANTRY_FRIDGE_DISPLAY_GLASS',
                    name: 'Glossy Black Glass Digital Temperature Display Window (72×1.2×163 mm, Z=1496..1659 mm)',
                    role: 'appliance_window',
                    material: 'appliance_glass',
                    isReflectiveGlass: true,
                    colorRgb: COLOR_FRIDGE_GLASS,
                    wireColorRgba: [0.28, 0.34, 0.42, 0.94],
                    x0: 5979, x1: 6051,
                    y0: 3771.2, y1: 3772.2,
                    z0: 1496, z1: 1659
                }
            );

            // Build 3D bright white LED micro-plaques + vector strokes for "-19 °C", status icons, and "< O >" touch buttons
            const ledY = 3772.4;
            const ledFaces = [];
            function addLedRect(xA, xB, zA, zB) {
                const xMinL = Math.min(xA, xB), xMaxL = Math.max(xA, xB);
                ledFaces.push({
                    side: 'south',
                    noWireframe: true,
                    normal: [0, 1, 0],
                    loop3D: [[xMinL, ledY, zA], [xMaxL, ledY, zA], [xMaxL, ledY, zB], [xMinL, ledY, zB]]
                });
            }

            // Minus sign "-" (on left side: X = 6042..6035, Z = 1612..1615)
            addLedRect(6035, 6042, 1612, 1615);
            // Digit "1" (vertical right-hand bar at X = 6027..6030, Z = 1598..1629)
            addLedRect(6027, 6030, 1598, 1629);
            // Digit "9" (X = 6010..6022, Z = 1598..1629: top, mid, bottom, upper-left, full-right)
            addLedRect(6010, 6022, 1626, 1629); // top bar
            addLedRect(6010, 6022, 1612, 1615); // middle bar
            addLedRect(6010, 6022, 1598, 1601); // bottom bar
            addLedRect(6019, 6022, 1613, 1629); // upper-left bar (+X)
            addLedRect(6010, 6013, 1598, 1629); // full-right bar (-X)
            // Degree symbol "°" (X = 6001..6006, Z = 1622..1628)
            addLedRect(6001, 6006, 1626, 1628);
            addLedRect(6001, 6006, 1622, 1624);
            addLedRect(6004, 6006, 1622, 1628);
            addLedRect(6001, 6003, 1622, 1628);
            // Letter "C" (X = 5989..5998, Z = 1614..1628)
            addLedRect(5989, 5998, 1626, 1628); // top of C
            addLedRect(5989, 5998, 1614, 1616); // bottom of C
            addLedRect(5996, 5998, 1614, 1628); // left vertical of C (+X)

            // Center touch button circle "O" (X = 6012..6018, Z = 1515..1523)
            addLedRect(6012, 6018, 1521.5, 1523);
            addLedRect(6012, 6018, 1515, 1516.5);
            addLedRect(6016.5, 6018, 1515, 1523);
            addLedRect(6012, 6013.5, 1515, 1523);

            const ledWireLines = [
                // "-19 °C" crisp vector segments
                [[6042, ledY + 0.1, 1613.5], [6035, ledY + 0.1, 1613.5]],
                [[6028.5, ledY + 0.1, 1598], [6028.5, ledY + 0.1, 1629]],
                [[6011.5, ledY + 0.1, 1599.5], [6020.5, ledY + 0.1, 1599.5]],
                [[6011.5, ledY + 0.1, 1599.5], [6011.5, ledY + 0.1, 1627.5], [6020.5, ledY + 0.1, 1627.5], [6020.5, ledY + 0.1, 1613.5], [6011.5, ledY + 0.1, 1613.5]],
                [[6001.5, ledY + 0.1, 1623], [6005.5, ledY + 0.1, 1623], [6005.5, ledY + 0.1, 1627], [6001.5, ledY + 0.1, 1627], [6001.5, ledY + 0.1, 1623]],
                [[5989.5, ledY + 0.1, 1627], [5997, ledY + 0.1, 1627], [5997, ledY + 0.1, 1615], [5989.5, ledY + 0.1, 1615]],
                // Middle row status icons: Wi-Fi waves (left, X=6028..6036) & Eco Leaf / Snowflake (right, X=5994..6002)
                [[6036, ledY + 0.1, 1568], [6032, ledY + 0.1, 1572], [6028, ledY + 0.1, 1568]],
                [[6034.5, ledY + 0.1, 1565], [6032, ledY + 0.1, 1567.5], [6029.5, ledY + 0.1, 1565]],
                [[5998, ledY + 0.1, 1562], [6002, ledY + 0.1, 1567], [5998, ledY + 0.1, 1572], [5994, ledY + 0.1, 1567], [5998, ledY + 0.1, 1562]],
                // Indicator dots row (Z = 1546)
                [[6033, ledY + 0.1, 1546], [6031, ledY + 0.1, 1546]],
                [[6016, ledY + 0.1, 1546], [6014, ledY + 0.1, 1546]],
                [[5999, ledY + 0.1, 1546], [5997, ledY + 0.1, 1546]],
                // Bottom touch controls: "<" (left, X=6030..6035), "O" (center, X=6012..6018), ">" (right, X=5995..6000)
                [[6030, ledY + 0.1, 1523], [6035, ledY + 0.1, 1519], [6030, ledY + 0.1, 1515]],
                [[6012.5, ledY + 0.1, 1515.5], [6017.5, ledY + 0.1, 1515.5], [6017.5, ledY + 0.1, 1522.5], [6012.5, ledY + 0.1, 1522.5], [6012.5, ledY + 0.1, 1515.5]],
                [[6000, ledY + 0.1, 1523], [5995, ledY + 0.1, 1519], [6000, ledY + 0.1, 1515]]
            ];

            skeletonParts.push({
                id: 'PANTRY_FRIDGE_DISPLAY_LED_READOUT',
                name: 'White LED "-19 °C" Digital Readout, Status Icons & "< O >" Touch Controls (Z=1515..1629 mm)',
                role: 'appliance_led',
                material: 'led_white',
                colorRgb: COLOR_FRIDGE_LED,
                wireColorRgba: WIRE_FRIDGE_LED,
                x0: 5988, x1: 6043,
                y0: 3772.2, y1: 3772.6,
                z0: 1514, z1: 1630,
                faces3D: ledFaces,
                wireframeLines3D: ledWireLines
            });

            // 7. Full-Height Vertical Tubular Bar Handle on Right (East, -X) Side of Door (X = 5,772, Y = 3,770..3,818, Z = 760..1,560 mm)
            const hx = 5772;
            const hyBar = 3806;
            skeletonParts.push(
                buildFridgeTubePart({
                    id: 'PANTRY_FRIDGE_HANDLE_BAR',
                    name: 'Vertical Brushed-Gunmetal Tubular Bar Handle (Ø22×800 mm, X=5772, Y=3795..3817, Z=760..1560 mm)',
                    role: 'sink_faucet',
                    material: 'stainless_steel',
                    colorRgb: COLOR_FRIDGE_HANDLE_BAR,
                    wireColorRgba: [0.46, 0.51, 0.58, 0.95],
                    numSegs: 24,
                    spine: [
                        [hx, hyBar, 760, 2.0],
                        [hx, hyBar, 763, 10.5],
                        [hx, hyBar, 778, 11.0],
                        [hx, hyBar, 1542, 11.0],
                        [hx, hyBar, 1557, 10.5],
                        [hx, hyBar, 1560, 2.0]
                    ],
                    capStart: true,
                    capEnd: true,
                    ringWireframeIndices: [1, 4]
                }),
                buildFridgeTubePart({
                    id: 'PANTRY_FRIDGE_HANDLE_MOUNT_TOP',
                    name: 'Upper Horizontal Cylindrical Handle Standoff Bracket (Ø17×34 mm at Z=1495 mm)',
                    role: 'sink_faucet',
                    material: 'stainless_steel',
                    colorRgb: COLOR_FRIDGE_HANDLE_MOUNT,
                    wireColorRgba: [0.50, 0.55, 0.62, 0.95],
                    numSegs: 18,
                    spine: [
                        [hx, 3770, 1495, 9.5],
                        [hx, 3773, 1495, 8.2],
                        [hx, 3800, 1495, 8.2]
                    ],
                    ringWireframeIndices: [0]
                }),
                buildFridgeTubePart({
                    id: 'PANTRY_FRIDGE_HANDLE_MOUNT_BOTTOM',
                    name: 'Lower Horizontal Cylindrical Handle Standoff Bracket (Ø17×34 mm at Z=825 mm)',
                    role: 'sink_faucet',
                    material: 'stainless_steel',
                    colorRgb: COLOR_FRIDGE_HANDLE_MOUNT,
                    wireColorRgba: [0.50, 0.55, 0.62, 0.95],
                    numSegs: 18,
                    spine: [
                        [hx, 3770, 825, 9.5],
                        [hx, 3773, 825, 8.2],
                        [hx, 3800, 825, 8.2]
                    ],
                    ringWireframeIndices: [0]
                })
            );

            return {
                id: 'PANTRY_FRIDGE',
                aliasIds: ['CAB_PANTRY_FRIDGE', 'ZAMRAZARKA'],
                name: 'PANTRY_FRIDGE — Samsung Freestanding Brushed Graphite Upright Refrigerator/Freezer (600×600×1900mm Zamrażarka)',
                shortName: 'Samsung Upright Freezer (600×600×1900mm)',
                category: 'tall_appliance',
                subtype: 'freestanding_fridge_freezer',
                floor: 'ground',
                room: '0.14 Spiżarnia',
                hostWallId: 'EW_NORTH_RECESSED',
                viewId: 'pantry_north_wall',
                x1: fx0,
                x2: fx1,
                y1: fy0,
                y2: fy1,
                zBottom: fz0,
                zTop: fz1,
                widthMm: 600,
                depthMm: 600,
                carcassDepthMm: 600,
                frontThicknessMm: 0,
                plinthHeightMm: 30,
                plinthRecessMm: 10,
                bodyHeightMm: 1870,
                heightMm: 1900,
                boardThicknessMm: 20,
                normal: [0, 1, 0],
                specs: '600 × 600 × 1,900 mm (X = 5,715..6,315 mm, Y = 3,170..3,770 mm, Z = 0..1,900 mm) Samsung brushed-graphite steel upright freezer/refrigerator • Stepped top housing + magnetic door gasket + 56 mm chamfered brushed-steel door + raised silver SAMSUNG emblem + recessed black glass digital display (-19 °C LED readout, Wi-Fi/leaf icons, < O > touch controls) + Ø 22 × 800 mm vertical tubular bar handle + adjustable leveling feet',
                description: 'Freestanding 600 × 600 × 1,900 mm Samsung brushed-graphite upright refrigerator/freezer (Zamrażarka) positioned in the North-West corner of 0.14 Spiżarnia against EW_NORTH_RECESSED (Y = 3,170 mm) and GW_13_EAST (X = 6,315 mm). Modeled with a dark charcoal cabinet body, stepped top-front electronics housing, recessed magnetic door gasket, 56 mm chamfered brushed-graphite steel door, raised silver SAMSUNG badge, recessed black glass digital control panel displaying -19 °C in white 7-segment LED digits, and a full-height vertical tubular bar handle on the right side.',
                skeleton: skeletonParts,
                fronts: []
            };
        })(),

        // =====================================================================
        // 27–38. PANTRY (0.14 SPIŻARNIA) INTERIOR DESIGNER PLAN — FULL 3D B-REP SUITE
        //        Matches the approved Interior Designer Proposal in pantry.html:
        //        - North Wall (EW_NORTH_RECESSED, Y = 3,170 mm):
        //          • PANTRY_FRIDGE (600×600×1,900 mm at X = 5,715..6,315 mm, Z = 0..1,900 mm) + 50 mm air gap
        //          • CAB_PANTRY_N_UP1: 600×600×850 mm Overhead Bridge Cabinet above Freezer (Z = 1,950..2,800 mm)
        //            with aligned shelves at Z = 2,240 & 2,520 mm + 20 mm Full-Height Warm-Oak Portal Cheek Panel
        //            (X = 5,695..5,715 mm, Z = 0..2,800 mm)
        //          • CAB_PANTRY_HOUSEKEEPING: 805 mm Wide (X = 4,905..5,695 mm clear bay) × 450 mm Deep × 1,950 mm High
        //            Housekeeping & Cordless Vacuum Charging Closet with:
        //            - Waterproof dark floor runner mat (Z = 0..20 mm, extending into the NE corner bucket pocket)
        //            - Warm-oak acoustic slatwall/pegboard back panel + top detergent shelf (Z = 1,665..1,950 mm)
        //            - Left 200 mm Slot housing a 3D Tall 4-Step Folding Aluminum & Oak Ladder (H = 1,500 mm)
        //            - Right 605 mm Bay housing a 3D Wall-Mounted Cordless Stick Vacuum on a 230V Charging Dock,
        //              2 pegboard accessory nozzles, and a 3D Wall-Mounted Flat Microfiber Mop & Broom
        //          • CAB_PANTRY_N_UP2 & CAB_PANTRY_N_UP3: 2 × 470 mm (nominal 475+480 mm) Overhead Bridge Cabinets
        //            above the Housekeeping Closet (X = 4,755..5,695 mm, Y = 3,170..3,620 mm, Z = 1,950..2,800 mm)
        //            with shelves aligned at Z = 2,240 and Z = 2,520 mm
        //        - East Wall (GW_14, X = 4,455 mm, Y = 3,170..5,210 mm):
        //          • CAB_PANTRY_CORNER_BUCKET: Side-Access 450×450×900 mm Corner Bucket Garage (Y = 3,170..3,670 mm)
        //            closed to the room on the West (eliminating L-corner drawer collisions) and open on its North-West
        //            side into the Housekeeping Closet, housing a 3D Full-Size Mop Bucket with Side-Press Wringer
        //          • CAB_PANTRY_E1..E3: 3 × 500 mm Lower Base Cabinets (Y = 3,670..5,170 mm, D = 450 mm, Z = 0..900 mm),
        //            each fitted with 3 tiers of ventilated pull-out slatted warm-oak crate drawers
        //          • PANTRY_COUNTERTOP: Continuous 2,000 × 450 × 30 mm Quartz Stone Worktop Slab (Z = 900..930 mm)
        //            + 3000K recessed under-cabinet LED task strip (Z = 1,375..1,380 mm)
        //          • CAB_PANTRY_E_UP1..UP4: 4 × 500 mm Upper Open Shelving Columns (Y = 3,170..5,170 mm, D = 300 mm,
        //            Z = 1,380..2,800 mm) with 5 aligned shelf tiers (Z = 1,380, 1,665, 1,950, 2,240, 2,520, 2,800 mm)
        //          • PANTRY_STAIR_POST: Full-Height 40 × 450 × 2,800 mm Structural Warm-Oak Stair Guard Post
        //            (Y = 5,170..5,210 mm, Z = 0..2,800 mm) before the 900 mm Basement Stairwell
        // =====================================================================
        ...(function buildPantryDesignerPlanObjects() {
            const X_PANTRY_EAST = 4455; // GW_14_UPPER_WEST interior face in 0.14 Spiżarnia
            const Y_PANTRY_NORTH = 3170; // EW_NORTH_RECESSED interior South face in 0.14 Spiżarnia
            const PANTRY_BOARD_MM = 20;  // 20 mm (2 cm) shelf & carcass board thickness

            const COLOR_OAK_WARM = [0.68, 0.52, 0.36];        // Warm architectural oak veneer (crates, cheek, slatwall)
            const COLOR_OAK_SLAT_DARK = [0.46, 0.34, 0.23];   // Deep oak shadow groove / slat reveal
            const COLOR_MATTE_ANTHRACITE = [0.16, 0.18, 0.21];// Waterproof floor mat, socket frame, dark hardware
            const COLOR_ALU_ANODIZED = [0.78, 0.81, 0.85];    // Brushed aluminum ladder rails & mop pole
            const COLOR_VACUUM_COBALT = [0.24, 0.29, 0.48];   // Metallic cobalt-indigo cyclone & wand accent
            const COLOR_VACUUM_BODY = [0.22, 0.24, 0.28];     // Satin gunmetal vacuum body & cleaner head
            const COLOR_VACUUM_BIN = [0.58, 0.64, 0.72];      // Smoked clear polycarbonate cyclone dust bin
            const COLOR_VACUUM_ACCENT = [0.86, 0.24, 0.22];   // Dyson/Bespoke red trigger & quick-release catches
            const COLOR_TEAL_CLEAN = [0.16, 0.58, 0.64];      // Turquoise-teal mop bucket, microfiber pad & spray bottle
            const COLOR_WRINGER_GREY = [0.32, 0.36, 0.40];    // Molded grey wringer sieve basket & broom bristles
            const COLOR_LED_WARM = [1.00, 0.95, 0.82];        // 3000K warm LED under-cabinet strip
            const COLOR_LED_GREEN = [0.20, 0.92, 0.55];       // Vacuum battery charging indicator LED

            // Smooth 3D tubular B-Rep builder for ladder safety bow, vacuum wand/cyclones, mop/broom poles & bucket bail
            function buildPantryTubePart(opts) {
                const spine = opts.spine || [];
                const numSegs = opts.numSegs || 18;
                const faces3D = [];
                const wireframeLines3D = opts.wireframeLines3D ? opts.wireframeLines3D.slice() : [];
                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;
                let minZ = Infinity, maxZ = -Infinity;

                const tangents = [];
                for (let i = 0; i < spine.length; i++) {
                    let iPrev = i;
                    while (iPrev > 0 && Math.hypot(spine[i][0] - spine[iPrev][0], spine[i][1] - spine[iPrev][1], spine[i][2] - spine[iPrev][2]) < 0.05) iPrev--;
                    let iNext = i;
                    while (iNext < spine.length - 1 && Math.hypot(spine[iNext][0] - spine[i][0], spine[iNext][1] - spine[i][1], spine[iNext][2] - spine[i][2]) < 0.05) iNext++;
                    let tx = spine[iNext][0] - spine[iPrev][0];
                    let ty = spine[iNext][1] - spine[iPrev][1];
                    let tz = spine[iNext][2] - spine[iPrev][2];
                    const len = Math.hypot(tx, ty, tz) || 1;
                    tangents.push([tx / len, ty / len, tz / len]);
                }

                const rings = [];
                for (let i = 0; i < spine.length; i++) {
                    const [px, py, pz, r] = spine[i];
                    const T = tangents[i];
                    const ref = (Math.abs(T[0]) < 0.85) ? [1, 0, 0] : [0, 1, 0];
                    let vx = T[1] * ref[2] - T[2] * ref[1];
                    let vy = T[2] * ref[0] - T[0] * ref[2];
                    let vz = T[0] * ref[1] - T[1] * ref[0];
                    const vLen = Math.hypot(vx, vy, vz) || 1;
                    vx /= vLen; vy /= vLen; vz /= vLen;
                    let ux = vy * T[2] - vz * T[1];
                    let uy = vz * T[0] - vx * T[2];
                    let uz = vx * T[1] - vy * T[0];
                    const uLen = Math.hypot(ux, uy, uz) || 1;
                    ux /= uLen; uy /= uLen; uz /= uLen;

                    const ringPts = [];
                    const ringNormals = [];
                    for (let k = 0; k < numSegs; k++) {
                        const ang = (k / numSegs) * Math.PI * 2;
                        const ca = Math.cos(ang), sa = Math.sin(ang);
                        const nx = ca * ux + sa * vx;
                        const ny = ca * uy + sa * vy;
                        const nz = ca * uz + sa * vz;
                        const vx3 = Math.round((px + r * nx) * 100) / 100;
                        const vy3 = Math.round((py + r * ny) * 100) / 100;
                        const vz3 = Math.round((pz + r * nz) * 100) / 100;
                        ringPts.push([vx3, vy3, vz3]);
                        ringNormals.push([nx, ny, nz]);
                        if (vx3 < minX) minX = vx3;
                        if (vx3 > maxX) maxX = vx3;
                        if (vy3 < minY) minY = vy3;
                        if (vy3 > maxY) maxY = maxY < vy3 ? vy3 : maxY;
                        if (vz3 < minZ) minZ = vz3;
                        if (vz3 > maxZ) maxZ = vz3;
                    }
                    rings.push({ pts: ringPts, normals: ringNormals, T, r });
                }

                for (let i = 0; i + 1 < rings.length; i++) {
                    const rA = rings[i], rB = rings[i + 1];
                    const distCenters = Math.hypot(
                        spine[i + 1][0] - spine[i][0],
                        spine[i + 1][1] - spine[i][1],
                        spine[i + 1][2] - spine[i][2]
                    );
                    const dr = rB.r - rA.r;
                    if (distCenters < 0.02 && Math.abs(dr) < 0.02) continue;
                    const hyp = Math.hypot(distCenters, dr) || 1;
                    const wRad = distCenters / hyp;
                    const wTan = -dr / hyp;
                    for (let k = 0; k < numSegs; k++) {
                        const kNext = (k + 1) % numSegs;
                        const p00 = rA.pts[k], p10 = rA.pts[kNext], p11 = rB.pts[kNext], p01 = rB.pts[k];
                        const n00 = [rA.normals[k][0] * wRad + rA.T[0] * wTan, rA.normals[k][1] * wRad + rA.T[1] * wTan, rA.normals[k][2] * wRad + rA.T[2] * wTan];
                        const n10 = [rA.normals[kNext][0] * wRad + rA.T[0] * wTan, rA.normals[kNext][1] * wRad + rA.T[1] * wTan, rA.normals[kNext][2] * wRad + rA.T[2] * wTan];
                        const n11 = [rB.normals[kNext][0] * wRad + rB.T[0] * wTan, rB.normals[kNext][1] * wRad + rB.T[1] * wTan, rB.normals[kNext][2] * wRad + rB.T[2] * wTan];
                        const n01 = [rB.normals[k][0] * wRad + rB.T[0] * wTan, rB.normals[k][1] * wRad + rB.T[1] * wTan, rB.normals[k][2] * wRad + rB.T[2] * wTan];
                        const avgNx = (n00[0] + n10[0] + n11[0] + n01[0]) / 4;
                        const avgNy = (n00[1] + n10[1] + n11[1] + n01[1]) / 4;
                        const avgNz = (n00[2] + n10[2] + n11[2] + n01[2]) / 4;
                        const avgLen = Math.hypot(avgNx, avgNy, avgNz) || 1;
                        faces3D.push({
                            side: 'curved',
                            noWireframe: true,
                            normal: [avgNx / avgLen, avgNy / avgLen, avgNz / avgLen],
                            vertexNormals3D: [n00, n10, n11, n01],
                            loop3D: [p00, p10, p11, p01]
                        });
                    }
                }

                if (opts.capStart && rings.length > 0 && rings[0].r > 0.2) {
                    const T0 = rings[0].T;
                    faces3D.push({ side: 'cap_start', noWireframe: true, normal: [-T0[0], -T0[1], -T0[2]], loop3D: rings[0].pts.slice().reverse() });
                }
                if (opts.capEnd && rings.length > 0 && rings[rings.length - 1].r > 0.2) {
                    const TN = rings[rings.length - 1].T;
                    faces3D.push({ side: 'cap_end', noWireframe: true, normal: [TN[0], TN[1], TN[2]], loop3D: rings[rings.length - 1].pts.slice() });
                }
                (opts.ringWireframeIndices || []).forEach(idx => {
                    if (rings[idx]) wireframeLines3D.push(rings[idx].pts.concat([rings[idx].pts[0]]));
                });

                return {
                    id: opts.id,
                    name: opts.name,
                    role: opts.role || 'appliance_front',
                    material: opts.material || 'stainless_steel',
                    colorRgb: opts.colorRgb || COLOR_ALU_ANODIZED,
                    wireColorRgba: opts.wireColorRgba || [0.35, 0.40, 0.46, 0.90],
                    x0: Math.floor(minX), x1: Math.ceil(maxX),
                    y0: Math.floor(minY), y1: Math.ceil(maxY),
                    z0: Math.floor(minZ), z1: Math.ceil(maxZ),
                    faces3D,
                    wireframeLines3D
                };
            }

            // -----------------------------------------------------------------
            // 27. CAB_PANTRY_N_UP1: Overhead Bridge Cabinet above Freezer (600×600×850 mm, Z = 1,950..2,800 mm)
            //     + Full-Height 20 mm Warm-Oak Portal Cheek Panel (X = 5,695..5,715 mm, Z = 0..2,800 mm)
            // -----------------------------------------------------------------
            function buildPantryNorthFreezerBridge() {
                const x0 = 5715, x1 = 6315;
                const y0 = Y_PANTRY_NORTH, y1 = Y_PANTRY_NORTH + 600; // 3,170..3,770 mm
                const z0 = 1950, z1 = 2800;
                const b = PANTRY_BOARD_MM;

                const skeleton = [
                    // Full-Height 20 mm Warm-Oak Portal Cheek Panel on East side of Freezer (X = 5,695..5,715 mm, Z = 0..2,800 mm)
                    {
                        id: 'CAB_PANTRY_N_UP1_PORTAL_CHEEK_LOWER',
                        name: 'Full-Height 20mm Warm-Oak Freezer Portal Cheek Panel (20×600×2800 mm, X=5695..5715, Z=0..2800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: 5695, x1: 5715,
                        y0: y0, y1: y1,
                        z0: 0, z1: 2800
                    },
                    // Recessed 50 mm Ventilation Shadow Baffle above Freezer (Z = 1,900..1,950 mm)
                    {
                        id: 'CAB_PANTRY_N_UP1_VENT_BAFFLE',
                        name: 'Recessed 50mm Freezer Heat-Dissipation Ventilation Grille Baffle (600×40×50 mm, Z=1900..1950 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: x0, x1: x1,
                        y0: y1 - 65, y1: y1 - 25,
                        z0: 1900, z1: 1950,
                        wireframeLines3D: [
                            [[x0 + 25, y1 - 24.5, 1916], [x1 - 25, y1 - 24.5, 1916]],
                            [[x0 + 25, y1 - 24.5, 1934], [x1 - 25, y1 - 24.5, 1934]]
                        ]
                    },
                    // Bridge Cabinet West Panel (X = 6,295..6,315, Z = 1,950..2,800)
                    {
                        id: 'CAB_PANTRY_N_UP1_WEST_PANEL',
                        name: 'Bridge Cabinet West Side Panel (20×600×850 mm, Z=1950..2800 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: y1,
                        z0: z0, z1: z1
                    },
                    // Bridge Cabinet Back Panel (Y = 3,170..3,190, Z = 1,950..2,800)
                    {
                        id: 'CAB_PANTRY_N_UP1_BACK_PANEL',
                        name: 'Bridge Cabinet Rear Backing Panel (580×20×850 mm, Z=1950..2800 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: x0, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    // Bottom Shelf at Z = 1,950..1,970 mm (aligned with N_UP2, N_UP3 & East Shelf #3!)
                    {
                        id: 'CAB_PANTRY_N_UP1_BOTTOM_PANEL',
                        name: 'Bridge Cabinet Bottom Shelf — Aligned at Z=1950..1970 mm (580×580×20 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 1950, z1: 1970
                    },
                    // Middle Shelf #1 at Z = 2,240..2,260 mm (aligned across entire Pantry!)
                    {
                        id: 'CAB_PANTRY_N_UP1_SHELF_1',
                        name: 'Bridge Cabinet Shelf #1 — Aligned at Z=2240..2260 mm (580×580×20 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2240, z1: 2260
                    },
                    // Upper Shelf #2 at Z = 2,520..2,540 mm (aligned across entire Pantry!)
                    {
                        id: 'CAB_PANTRY_N_UP1_SHELF_2',
                        name: 'Bridge Cabinet Shelf #2 — Aligned at Z=2520..2540 mm (580×580×20 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2520, z1: 2540
                    },
                    // Top Ceiling Panel at Z = 2,780..2,800 mm
                    {
                        id: 'CAB_PANTRY_N_UP1_TOP_PANEL',
                        name: 'Bridge Cabinet Top Panel — Flush with Ceiling at Z=2780..2800 mm (580×580×20 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2780, z1: 2800
                    }
                ];

                return {
                    id: 'CAB_PANTRY_N_UP1',
                    name: 'CAB_PANTRY_N_UP1 — Freezer Overhead Bridge Cabinet & 20mm Full-Height Oak Portal Cheek (620×600×2800mm)',
                    shortName: 'Freezer Bridge Cabinet & Oak Portal (600×600mm)',
                    category: 'wall_cabinet',
                    subtype: 'pantry_bridge_cabinet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'EW_NORTH_RECESSED',
                    viewId: 'pantry_north_wall',
                    x1: 5695,
                    x2: 6315,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 2800,
                    widthMm: 620,
                    depthMm: 600,
                    carcassDepthMm: 600,
                    frontThicknessMm: 0,
                    plinthHeightMm: 0,
                    plinthRecessMm: 0,
                    bodyHeightMm: 850,
                    heightMm: 2800,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '600 × 600 × 850 mm Bridge Cabinet (Z = 1,950..2,800 mm above 50 mm ventilation gap) + 20 mm full-height warm-oak portal cheek panel (X = 5,695..5,715 mm, Z = 0..2,800 mm) • 2 internal shelves aligned with East & North upper runs at Z = 2,240 and Z = 2,520 mm',
                    description: 'Deep 600 × 600 × 850 mm overhead bridge cabinet above the Samsung Upright Freezer (Z = 1,950..2,800 mm, leaving a 50 mm ventilation shadow gap at Z = 1,900..1,950 mm), paired with a full-height 20 mm warm-oak portal cheek panel (X = 5,695..5,715 mm, Z = 0..2,800 mm). Internal shelves at Z = 2,240 mm and Z = 2,520 mm align horizontally with CAB_PANTRY_N_UP2..UP3 and CAB_PANTRY_E_UP1..UP4.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 28. CAB_PANTRY_HOUSEKEEPING: 805 mm Wide (X = 4,905..5,695 mm clear bay) × 450 mm Deep × 1,950 mm High
            //     Housekeeping, 4-Step Folding Ladder, Mop & Cordless Vacuum Charging Dock
            // -----------------------------------------------------------------
            function buildPantryHousekeepingCloset() {
                const x0 = 4905, x1 = 5695; // 790 mm clear plastered span (805 mm nominal to unplastered wall)
                const y0 = Y_PANTRY_NORTH, y1 = Y_PANTRY_NORTH + 450; // 3,170..3,620 mm (450 mm depth)
                const xDiv0 = 5480, xDiv1 = 5498; // 18 mm vertical divider: Left 197 mm Ladder Slot (5498..5695), Right 575 mm Vacuum/Mop Dock (4905..5480)
                const skeleton = [];

                // 1. Continuous Waterproof Dark Anthracite Floor Runner Tray (Z = 0..20 mm)
                //    Extends from X = 5,695 mm all the way into the NE Side-Access Corner Bucket Pocket (X = 4,475 mm)!
                skeleton.push({
                    id: 'PANTRY_HK_FLOOR_MAT',
                    name: 'Waterproof Ribbed Dark-Anthracite Rubber Floor Runner Tray (1220×450×20 mm, X=4475..5695, Z=0..20 mm)',
                    role: 'plinth',
                    material: 'dark_plinth',
                    colorRgb: COLOR_MATTE_ANTHRACITE,
                    x0: 4475, x1: x1,
                    y0: y0, y1: y1,
                    z0: 0, z1: 20,
                    wireframeLines3D: [
                        [[4500, y1 - 1, 10], [5670, y1 - 1, 10]]
                    ]
                });

                // 2. Acoustic Warm-Oak Slatwall & Pegboard Back Panel (X = 4,755..5,695, Y = 3,170..3,188, Z = 20..1,665 mm)
                //    Extends East to X = 4,755 mm (meeting the 300 mm deep East upper shelving cleanly with zero gap)
                const slatLines = [];
                for (let sx = 4795; sx <= 5650; sx += 45) {
                    slatLines.push([[sx, y0 + 18.3, 25], [sx, y0 + 18.3, 1660]]);
                }
                skeleton.push({
                    id: 'PANTRY_HK_SLATWALL_BACK',
                    name: 'Warm-Oak Acoustic Slatwall & Pegboard Tool Wall Backing (940×18×1645 mm, X=4755..5695, Z=20..1665 mm)',
                    role: 'carcass_panel',
                    material: 'wood_oak',
                    colorRgb: COLOR_OAK_WARM,
                    wireColorRgba: [0.42, 0.30, 0.19, 0.85],
                    x0: 4755, x1: x1,
                    y0: y0, y1: y0 + 18,
                    z0: 20, z1: 1665,
                    wireframeLines3D: slatLines
                });

                // 3. Vertical Partition Dividing Left 200mm Ladder Slot from Right 605mm Vacuum & Mop Wall Dock
                skeleton.push({
                    id: 'PANTRY_HK_VERTICAL_DIVIDER',
                    name: 'Vertical Ladder-Slot Partition Panel (18×400×1645 mm, X=5480..5498, Z=20..1665 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_SIDE,
                    x0: xDiv0, x1: xDiv1,
                    y0: y0 + 18, y1: y1 - 32,
                    z0: 20, z1: 1665
                });

                // 4. Top Detergent & Cleaning Supply Shelf at Z = 1,665..1,685 mm (aligned with East Wall Shelf #2!)
                //    Extends to X = 4,755 mm to join the East Wall L-corner shelf seamlessly, and uses CAB_PANTRY_N_UP2..UP3's
                //    Z = 1,950..1,970 mm bottom panel as its single flush ceiling (no double-stacked ceiling board or step!)
                skeleton.push(
                    {
                        id: 'PANTRY_HK_DETERGENT_SHELF',
                        name: 'Upper Detergent & Cleaning Caddy Shelf — Aligned at Z=1665..1685 mm (940×432×20 mm, X=4755..5695 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_OAK_WARM,
                        x0: 4755, x1: x1,
                        y0: y0 + 18, y1: y1,
                        z0: 1665, z1: 1685
                    },
                    {
                        id: 'PANTRY_HK_TOP_BACK',
                        name: 'Upper Detergent Compartment Rear Backing Panel (940×18×265 mm, X=4755..5695, Z=1685..1950 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: 4755, x1: x1,
                        y0: y0, y1: y0 + 18,
                        z0: 1685, z1: 1950
                    },
                    // 3D Eco-Detergent Bottle & Cleaning Caddy on the Z=1685 mm Shelf
                    {
                        id: 'PANTRY_HK_DETERGENT_CADDY_BOX',
                        name: 'Cleaning Supply Organizer Tray & Microfiber Sponges (240×210×115 mm on Z=1685 mm Shelf)',
                        role: 'appliance_front',
                        material: 'carcass_melamine',
                        colorRgb: [0.88, 0.89, 0.91],
                        x0: 5020, x1: 5260,
                        y0: 3280, y1: 3490,
                        z0: 1685, z1: 1800
                    },
                    {
                        id: 'PANTRY_HK_DETERGENT_JUG',
                        name: 'Eco Laundry & Floor Detergent Jug (130×110×205 mm on Z=1685 mm Shelf)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_TEAL_CLEAN,
                        x0: 5340, x1: 5470,
                        y0: 3300, y1: 3410,
                        z0: 1685, z1: 1890
                    }
                );

                // =============================================================
                // 5. 3D TALL 4-STEP FOLDING ALUMINUM & WARM-OAK HOUSEHOLD LADDER
                //    Tucked vertically inside the Left 200 mm Slot (X = 5,540..5,655, Y = 3,230..3,560, Z = 20..1,520 mm)
                // =============================================================
                const lx0 = 5545, lx1 = 5650; // 105 mm folded profile width inside 197 mm slot
                const lyFront0 = 3455, lyFront1 = 3495; // Front main stile rail
                const lyBack0 = 3250, lyBack1 = 3285;   // Rear support leg rail
                skeleton.push(
                    // Non-slip dark rubber ladder feet (Z = 20..42 mm)
                    {
                        id: 'PANTRY_LADDER_FEET_FRONT',
                        name: 'Folding Ladder Non-Slip Rubber Front Feet (105×44×22 mm, Z=20..42 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: lx0 - 2, x1: lx1 + 2,
                        y0: lyFront0 - 2, y1: lyFront1 + 2,
                        z0: 20, z1: 42
                    },
                    {
                        id: 'PANTRY_LADDER_FEET_REAR',
                        name: 'Folding Ladder Non-Slip Rubber Rear Feet (105×39×22 mm, Z=20..42 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: lx0 - 2, x1: lx1 + 2,
                        y0: lyBack0 - 2, y1: lyBack1 + 2,
                        z0: 20, z1: 42
                    },
                    // Anodized Aluminum Side Stiles (Left X=5545..5563 & Right X=5632..5650, Front & Rear legs, Z=42..1080 mm)
                    {
                        id: 'PANTRY_LADDER_STILE_FRONT_WEST',
                        name: 'Folding Ladder Anodized Aluminum Front-Left Stile (18×40×1040 mm, Z=42..1082 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        x0: lx1 - 18, x1: lx1,
                        y0: lyFront0, y1: lyFront1,
                        z0: 42, z1: 1082
                    },
                    {
                        id: 'PANTRY_LADDER_STILE_FRONT_EAST',
                        name: 'Folding Ladder Anodized Aluminum Front-Right Stile (18×40×1040 mm, Z=42..1082 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        x0: lx0, x1: lx0 + 18,
                        y0: lyFront0, y1: lyFront1,
                        z0: 42, z1: 1082
                    },
                    {
                        id: 'PANTRY_LADDER_STILE_REAR_WEST',
                        name: 'Folding Ladder Anodized Aluminum Rear-Left Leg Stile (16×35×1010 mm, Z=42..1052 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        x0: lx1 - 16, x1: lx1,
                        y0: lyBack0, y1: lyBack1,
                        z0: 42, z1: 1052
                    },
                    {
                        id: 'PANTRY_LADDER_STILE_REAR_EAST',
                        name: 'Folding Ladder Anodized Aluminum Rear-Right Leg Stile (16×35×1010 mm, Z=42..1052 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        x0: lx0, x1: lx0 + 16,
                        y0: lyBack0, y1: lyBack1,
                        z0: 42, z1: 1052
                    }
                );

                // 4 Folded Warm-Oak Anti-Slip Treads/Steps at Z = 260, 500, 740, and 980 mm (Top Platform)
                [
                    { idx: 1, zA: 260, zB: 282, yA: 3320, yB: 3485, label: 'Step #1' },
                    { idx: 2, zA: 500, zB: 522, yA: 3310, yB: 3485, label: 'Step #2' },
                    { idx: 3, zA: 740, zB: 762, yA: 3300, yB: 3485, label: 'Step #3' },
                    { idx: 4, zA: 980, zB: 1008, yA: 3270, yB: 3490, label: 'Top Standing Platform (#4)' }
                ].forEach(st => {
                    skeleton.push({
                        id: `PANTRY_LADDER_STEP_${st.idx}`,
                        name: `Folding Ladder Ribbed Warm-Oak ${st.label} (85×${st.yB - st.yA}×${st.zB - st.zA} mm, Z=${st.zA}..${st.zB} mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: lx0 + 10, x1: lx1 - 10,
                        y0: st.yA, y1: st.yB,
                        z0: st.zA, z1: st.zB
                    });
                });

                // Tall Curved Tubular Aluminum Safety Bow Handle (rising from Z=1050 to Z=1520 mm!)
                const bowX = Math.round((lx0 + lx1) / 2); // X = 5,598 mm
                skeleton.push(
                    buildPantryTubePart({
                        id: 'PANTRY_LADDER_SAFETY_BOW',
                        name: 'Folding Ladder Tall Curved Tubular Safety Bow Handle (Ø24 mm, H=1520 mm, Z=1050..1520 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        numSegs: 16,
                        spine: [
                            [bowX, 3475, 1050, 12],
                            [bowX, 3475, 1440, 12],
                            [bowX, 3455, 1485, 12],
                            [bowX, 3415, 1506, 13],
                            [bowX, 3330, 1506, 13],
                            [bowX, 3290, 1485, 12],
                            [bowX, 3270, 1440, 12],
                            [bowX, 3270, 1040, 12]
                        ],
                        capStart: true,
                        capEnd: true,
                        ringWireframeIndices: [1, 3, 4, 6]
                    }),
                    // Soft Black Foam Top Grip on the Safety Bow (Z = 1,490..1,522 mm)
                    {
                        id: 'PANTRY_LADDER_BOW_FOAM_GRIP',
                        name: 'Folding Ladder Ergonomic Soft-Foam Top Hand Grip (32×110×32 mm, Z=1490..1522 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: bowX - 16, x1: bowX + 16,
                        y0: 3320, y1: 3425,
                        z0: 1490, z1: 1522
                    }
                );

                // =============================================================
                // 6. 3D WALL-MOUNTED CORDLESS STICK VACUUM CLEANER ON 230V CHARGING DOCK
                //    Mounted on the Right Slatwall Bay (X = 5,180..5,425, Y = 3,188..3,415, Z = 265..1,425 mm)
                // =============================================================
                const vx = 5295; // Vacuum centerline X = 5,295 mm
                skeleton.push(
                    // Dedicated 230V Wall Socket (IP44) at X = 5,365..5,425, Y = 3,188..3,202, Z = 1,320..1,380 mm
                    {
                        id: 'PANTRY_VACUUM_230V_SOCKET',
                        name: 'Dedicated 230V Vacuum Charger Wall Socket (60×14×60 mm at Z=1320..1380 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: 5365, x1: 5425,
                        y0: y0 + 18, y1: y0 + 32,
                        z0: 1320, z1: 1380,
                        wireframeLines3D: [
                            // Cord from 230V socket to charging dock
                            [[5365, y0 + 24, 1350], [5330, y0 + 24, 1350], [5330, y0 + 24, 1290]]
                        ]
                    },
                    // Wall-Mounted Charging Dock Bracket (X = 5,260..5,330, Y = 3,188..3,255, Z = 1,150..1,400 mm)
                    {
                        id: 'PANTRY_VACUUM_CHARGING_DOCK',
                        name: 'Wall-Mounted Cordless Vacuum Charging Dock Cradle (70×67×250 mm, Z=1150..1400 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: vx - 35, x1: vx + 35,
                        y0: y0 + 18, y1: y0 + 85,
                        z0: 1150, z1: 1400
                    },
                    // Click-In Lithium-Ion Battery Pack + Glowing Green LED Charge Indicator (Z = 1,165..1,215 mm)
                    {
                        id: 'PANTRY_VACUUM_BATTERY_PACK',
                        name: 'Click-In Lithium-Ion Battery Pack (64×85×50 mm, Z=1165..1215 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_BODY,
                        x0: vx - 32, x1: vx + 32,
                        y0: y0 + 55, y1: y0 + 140,
                        z0: 1165, z1: 1215
                    },
                    {
                        id: 'PANTRY_VACUUM_BATTERY_LED',
                        name: 'Glowing Green Battery Charge Status LED Bar (36×4×8 mm, Z=1185..1193 mm)',
                        role: 'appliance_led',
                        material: 'led_white',
                        colorRgb: COLOR_LED_GREEN,
                        wireColorRgba: [0.20, 0.95, 0.55, 0.98],
                        x0: vx - 18, x1: vx + 18,
                        y0: y0 + 138, y1: y0 + 142,
                        z0: 1185, z1: 1193
                    },
                    // Ergonomic Pistol Grip & Red Trigger (Z = 1,215..1,335 mm)
                    {
                        id: 'PANTRY_VACUUM_PISTOL_GRIP',
                        name: 'Vacuum Ergonomic Pistol Handle Grip (34×42×120 mm, Z=1215..1335 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_BODY,
                        x0: vx - 17, x1: vx + 17,
                        y0: y0 + 62, y1: y0 + 104,
                        z0: 1215, z1: 1335
                    },
                    {
                        id: 'PANTRY_VACUUM_RED_TRIGGER',
                        name: 'Vacuum Crimson Power Trigger Switch (14×18×32 mm, Z=1275..1307 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_ACCENT,
                        x0: vx - 7, x1: vx + 7,
                        y0: y0 + 104, y1: y0 + 122,
                        z0: 1275, z1: 1307
                    },
                    // Cylindrical Smoked-Clear Polycarbonate Cyclone Dust Bin (Ø90 mm, Z = 1,135..1,290 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_DUST_BIN',
                        name: 'Smoked Polycarbonate Cyclone Dust Bin Chamber (Ø90×155 mm, Z=1135..1290 mm)',
                        role: 'appliance_window',
                        material: 'appliance_glass',
                        colorRgb: COLOR_VACUUM_BIN,
                        numSegs: 20,
                        spine: [
                            [vx, y0 + 165, 1135, 44],
                            [vx, y0 + 165, 1290, 44]
                        ],
                        capStart: true,
                        capEnd: true,
                        ringWireframeIndices: [0, 1]
                    }),
                    // Metallic Cobalt Multi-Cyclone & Digital Motorhead Crown (Ø94 mm, Z = 1,290..1,425 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_CYCLONE_HEAD',
                        name: 'Metallic Cobalt Multi-Cyclone & HEPA Filter Motorhead (Ø94×135 mm, Z=1290..1425 mm)',
                        role: 'appliance_front',
                        material: 'stainless_steel',
                        colorRgb: COLOR_VACUUM_COBALT,
                        numSegs: 20,
                        spine: [
                            [vx, y0 + 165, 1290, 46],
                            [vx, y0 + 165, 1365, 48],
                            [vx, y0 + 165, 1415, 42],
                            [vx, y0 + 165, 1425, 34]
                        ],
                        capStart: true,
                        capEnd: true,
                        ringWireframeIndices: [0, 1, 2]
                    }),
                    // Long Anodized Metallic Cobalt Extension Wand Tube (Ø34 mm, Z = 320..1,135 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_EXTENSION_WAND',
                        name: 'Anodized Metallic Cobalt Vacuum Extension Wand Tube (Ø34×815 mm, Z=320..1135 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_VACUUM_COBALT,
                        numSegs: 18,
                        spine: [
                            [vx, y0 + 115, 320, 17],
                            [vx, y0 + 115, 1135, 17]
                        ],
                        capStart: true,
                        capEnd: true,
                        ringWireframeIndices: [0, 1]
                    }),
                    // Crimson Quick-Release Wand Collars (Top Z=1110..1135 & Bottom Z=320..345 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_COLLAR_TOP',
                        name: 'Upper Quick-Release Wand Catch Collar (Ø40×25 mm, Z=1110..1135 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_ACCENT,
                        numSegs: 16,
                        spine: [
                            [vx, y0 + 115, 1110, 20],
                            [vx, y0 + 115, 1135, 20]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_COLLAR_BOTTOM',
                        name: 'Lower Quick-Release Wand Catch Collar (Ø40×25 mm, Z=320..345 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_ACCENT,
                        numSegs: 16,
                        spine: [
                            [vx, y0 + 115, 320, 20],
                            [vx, y0 + 115, 345, 20]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    // Motorized Multi-Surface Floor Cleaner Head Housing (230 × 140 × 55 mm, Z = 265..320 mm)
                    {
                        id: 'PANTRY_VACUUM_FLOOR_HEAD',
                        name: 'Motorized Multi-Surface Floor Roller Cleaner Head (230×140×55 mm, Z=265..320 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_BODY,
                        x0: vx - 115, x1: vx + 115,
                        y0: y0 + 55, y1: y0 + 195,
                        z0: 265, z1: 320
                    },
                    // Fluffy Soft Roller Brush Bar inside Floor Cleaner Head (Ø42 × 210 mm along X)
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_ROLLER_BRUSH',
                        name: 'Soft Carbon-Fiber Fluffy Roller Brush Bar (Ø42×210 mm, Z=262..304 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_ACCENT,
                        numSegs: 16,
                        spine: [
                            [vx - 105, y0 + 165, 283, 21],
                            [vx + 105, y0 + 165, 283, 21]
                        ],
                        capStart: true,
                        capEnd: true,
                        ringWireframeIndices: [0, 1]
                    }),
                    // Pegboard Accessory Nozzles (Crevice Tool & Dusting Brush at X = 5,095..5,165, Z = 890..1,170 mm)
                    {
                        id: 'PANTRY_VACUUM_NOZZLE_HOLDER',
                        name: 'Slatwall Accessory Nozzle Clip Rail (85×36×28 mm, Z=1140..1168 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: 5085, x1: 5170,
                        y0: y0 + 18, y1: y0 + 54,
                        z0: 1140, z1: 1168
                    },
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_CREVICE_NOZZLE',
                        name: 'Wall-Clipped Long Crevice Nozzle Attachment (Ø28×260 mm, Z=890..1150 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_BODY,
                        numSegs: 14,
                        spine: [
                            [5145, y0 + 42, 890, 7],
                            [5145, y0 + 42, 1090, 14],
                            [5145, y0 + 42, 1150, 16]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    buildPantryTubePart({
                        id: 'PANTRY_VACUUM_BRUSH_NOZZLE',
                        name: 'Wall-Clipped Combination Dusting Brush Nozzle (Ø36×175 mm, Z=985..1160 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_VACUUM_COBALT,
                        numSegs: 14,
                        spine: [
                            [5105, y0 + 45, 985, 20],
                            [5105, y0 + 45, 1045, 18],
                            [5105, y0 + 45, 1160, 16]
                        ],
                        capStart: true,
                        capEnd: true
                    })
                );

                // =============================================================
                // 7. 3D WALL-MOUNTED FLAT MICROFIBER MOP & LONG-HANDLED BROOM
                //    Clipped to the Slatwall on the Right Side of the Bay (X = 4,920..5,070, Z = 110..1,420 mm)
                // =============================================================
                const mx = 5020; // Flat Mop pole X = 5,020 mm
                const bx = 4950; // Broom pole X = 4,950 mm
                skeleton.push(
                    // Wall Spring-Clip Tool Holder Rail (X = 4,920..5,060, Y = 3,188..3,228, Z = 1,140..1,180 mm)
                    {
                        id: 'PANTRY_MOP_WALL_CLIP_RAIL',
                        name: 'Wall-Mounted Spring-Grip Mop & Broom Holder Rail (140×40×40 mm, Z=1140..1180 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: 4920, x1: 5060,
                        y0: y0 + 18, y1: y0 + 58,
                        z0: 1140, z1: 1180
                    },
                    // Flat Microfiber Spray Mop Pole (Ø22 mm brushed aluminum, Z = 140..1,420 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_MOP_HANDLE_POLE',
                        name: 'Flat Spray Mop Telescopic Brushed-Aluminum Handle (Ø22×1280 mm, Z=140..1420 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        numSegs: 14,
                        spine: [
                            [mx, y0 + 55, 140, 11],
                            [mx, y0 + 55, 1300, 11],
                            [mx, y0 + 55, 1420, 13]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    // Spray Mop Refillable Water Reservoir Bottle (Z = 380..550 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_MOP_WATER_RESERVOIR',
                        name: 'Spray Mop Translucent Teal Water Reservoir Bottle (Ø56×170 mm, Z=380..550 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_TEAL_CLEAN,
                        numSegs: 14,
                        spine: [
                            [mx, y0 + 78, 380, 16],
                            [mx, y0 + 78, 410, 28],
                            [mx, y0 + 78, 530, 28],
                            [mx, y0 + 78, 550, 14]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    // Flat Swivel Microfiber Mop Head & Pad (110 × 320 × 26 mm oriented along Y, Z = 114..140 mm)
                    {
                        id: 'PANTRY_MOP_FLAT_PAD',
                        name: 'Flat Swivel Turquoise Microfiber Mop Head & Pad (90×280×26 mm, Z=114..140 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_TEAL_CLEAN,
                        x0: mx - 45, x1: mx + 45,
                        y0: y0 + 30, y1: y0 + 310,
                        z0: 114, z1: 140
                    },
                    // Long-Handled Sweeping Broom Pole (Ø22 mm warm oak/ash wood, Z = 185..1,380 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_BROOM_WOOD_POLE',
                        name: 'Long-Handled Sweeping Broom Wooden Pole (Ø22×1195 mm, Z=185..1380 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        numSegs: 14,
                        spine: [
                            [bx, y0 + 55, 185, 11],
                            [bx, y0 + 55, 1380, 11]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    // Sweeping Broom Head & Bristle Block (70 × 240 × 75 mm, Z = 110..185 mm)
                    {
                        id: 'PANTRY_BROOM_BRISTLE_HEAD',
                        name: 'Soft-Bristle Sweeping Broom Head (64×230×75 mm, Z=110..185 mm)',
                        role: 'appliance_front',
                        material: 'dark_plinth',
                        colorRgb: COLOR_WRINGER_GREY,
                        x0: bx - 32, x1: bx + 32,
                        y0: y0 + 35, y1: y0 + 265,
                        z0: 110, z1: 185
                    }
                );

                return {
                    id: 'CAB_PANTRY_HOUSEKEEPING',
                    name: 'CAB_PANTRY_HOUSEKEEPING — 805mm Housekeeping, 4-Step Folding Ladder, Mop & Cordless Vacuum Charging Closet (805×450×1950mm)',
                    shortName: 'Housekeeping, Ladder, Mop & Vacuum Closet (805×450mm)',
                    category: 'tall_cabinet',
                    subtype: 'pantry_housekeeping_closet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'EW_NORTH_RECESSED',
                    viewId: 'pantry_north_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 1950,
                    widthMm: x1 - x0,
                    depthMm: 450,
                    carcassDepthMm: 450,
                    frontThicknessMm: 0,
                    plinthHeightMm: 20,
                    plinthRecessMm: 0,
                    bodyHeightMm: 1930,
                    heightMm: 1950,
                    boardThicknessMm: PANTRY_BOARD_MM,
                    normal: [0, 1, 0],
                    specs: '805 mm nominal width (X = 4,905..5,695 mm clear bay + 450 mm corner bucket extension to X = 4,455 mm) × 450 mm deep (Y = 3,170..3,620 mm) × 1,950 mm high • Left 200 mm slot with 3D 4-step folding aluminum/oak ladder (H = 1,500 mm) • Right 605 mm warm-oak slatwall dock with 3D cordless stick vacuum on 230V charger, 2 accessory nozzles, flat microfiber spray mop & broom • Top detergent shelf at Z = 1,665..1,950 mm',
                    description: 'Dedicated 805 mm wide × 1,930 mm clear-height Housekeeping & Cordless Vacuum Charging Closet on the Pantry North Wall (EW_NORTH_RECESSED). Features a waterproof dark anthracite floor runner mat extending into the NE corner pocket, an acoustic warm-oak slatwall/pegboard back panel, an upper detergent shelf aligned at Z = 1,665 mm, a 200 mm left slot holding a tall 4-step folding ladder with safety bow, and a 605 mm right wall dock holding a cordless stick vacuum cleaner on a 230V charging cradle plus a wall-clipped flat microfiber mop and sweeping broom.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 29–30. CAB_PANTRY_N_UP2 & CAB_PANTRY_N_UP3: Overhead Bridge Cabinets above Housekeeping Closet
            //        (X = 4,755..5,695 mm, Y = 3,170..3,620 mm, Z = 1,950..2,800 mm)
            //        With internal shelves aligned at Z = 2,240 and Z = 2,520 mm!
            //        Note: CAB_PANTRY_N_UP3 (index === 3) is open on its East side (X = 4,755 mm) into CAB_PANTRY_E_UP1
            //        so the shelves wrap continuously around the North-East L-corner without covering the corner shelves!
            // -----------------------------------------------------------------
            function makePantryNorthOverheadCabinet(id, index, x0, x1, nominalWidthMm) {
                const y0 = Y_PANTRY_NORTH, y1 = Y_PANTRY_NORTH + 450; // 3,170..3,620 mm
                const z0 = 1950, z1 = 2800;
                const b = PANTRY_BOARD_MM;
                const w = x1 - x0;
                const isCornerRight = (index === 3); // Open East side at X = 4,755 mm to form continuous L-corner shelves!
                const xEastInner = isCornerRight ? x0 : (x0 + b);

                const skeleton = [
                    {
                        id: `${id}_WEST_PANEL`,
                        name: `Left/West Side Carcass Panel (20×450×850 mm, Z=1950..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: y1,
                        z0: z0, z1: z1
                    }
                ];

                if (!isCornerRight) {
                    skeleton.push({
                        id: `${id}_EAST_PANEL`,
                        name: `Right/East Side Carcass Panel (20×450×850 mm, Z=1950..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: y1,
                        z0: z0, z1: z1
                    });
                }

                skeleton.push(
                    {
                        id: `${id}_BACK_PANEL`,
                        name: `Rear Carcass Backing Panel (${x1 - b - xEastInner}×20×850 mm, Z=1950..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: xEastInner, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    {
                        id: `${id}_BOTTOM_PANEL`,
                        name: `Bottom Shelf — Aligned at Z=1950..1970 mm (${x1 - b - xEastInner}×430×20 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xEastInner, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 1950, z1: 1970
                    },
                    {
                        id: `${id}_SHELF_1`,
                        name: `Internal Shelf #1 — Aligned at Z=2240..2260 mm (${x1 - b - xEastInner}×430×20 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: xEastInner, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2240, z1: 2260
                    },
                    {
                        id: `${id}_SHELF_2`,
                        name: `Internal Shelf #2 — Aligned at Z=2520..2540 mm (${x1 - b - xEastInner}×430×20 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: xEastInner, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2520, z1: 2540
                    },
                    {
                        id: `${id}_TOP_PANEL`,
                        name: `Top Ceiling Panel — Aligned at Z=2780..2800 mm (${x1 - b - xEastInner}×430×20 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: xEastInner, x1: x1 - b,
                        y0: y0 + b, y1: y1,
                        z0: 2780, z1: 2800
                    }
                );

                return {
                    id: id,
                    name: `${id} — Housekeeping Overhead Bridge Cabinet #${index} (${nominalWidthMm}×450×850mm, Z=1950..2800mm)`,
                    shortName: `Pantry North Overhead #${index} (${nominalWidthMm}×450mm)`,
                    category: 'wall_cabinet',
                    subtype: 'pantry_bridge_cabinet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'EW_NORTH_RECESSED',
                    viewId: 'pantry_north_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: z0,
                    zTop: z1,
                    widthMm: w,
                    depthMm: 450,
                    carcassDepthMm: 450,
                    frontThicknessMm: 0,
                    plinthHeightMm: 0,
                    plinthRecessMm: 0,
                    bodyHeightMm: 850,
                    heightMm: 850,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: `${nominalWidthMm} × 450 × 850 mm (X = ${x0}..${x1} mm, Y = ${y0}..${y1} mm, Z = 1,950..2,800 mm) • Shelves aligned at Z = 1,950, 2,240, 2,520, 2,800 mm with Freezer Bridge & East Wall Upper Shelving`,
                    description: `Overhead cabinet #${index} above the Housekeeping & Vacuum Closet on the Pantry North Wall (Z = 1,950..2,800 mm), featuring horizontal shelves at Z = 2,240 mm and Z = 2,520 mm that align continuously with both the Freezer Bridge Cabinet (CAB_PANTRY_N_UP1) on the left and the East Wall Upper Shelving (CAB_PANTRY_E_UP1..UP4) on the right.`,
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 31. CAB_PANTRY_CORNER_BUCKET: North-East Side-Access 450×450×900 mm Corner Bucket Garage
            //     + 50 mm Corner Filler + 3D Full-Size Mop Bucket with Side-Press Wringer
            //     (X = 4,455..4,905 mm, Y = 3,170..3,670 mm, Z = 0..900 mm)
            // -----------------------------------------------------------------
            function buildPantryCornerBucketGarage() {
                const x0 = X_PANTRY_EAST, x1 = X_PANTRY_EAST + 450; // 4,455..4,905 mm
                const y0 = Y_PANTRY_NORTH, yPocketEnd = Y_PANTRY_NORTH + 450, y1 = Y_PANTRY_NORTH + 500; // 3,170..3,620 pocket + 3,620..3,670 filler
                const b = PANTRY_BOARD_MM;

                const skeleton = [
                    // East Wall Rear Panel (X = 4,455..4,475, Y = 3,170..3,670, Z = 20..900 mm)
                    {
                        id: 'CAB_PANTRY_CORNER_EAST_BACK',
                        name: 'Corner Bucket Garage East Wall Backing Panel (20×500×880 mm, Z=20..900 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: y1,
                        z0: 20, z1: 900
                    },
                    // North Wall Rear Panel inside Corner Pocket (X = 4,475..4,885, Y = 3,170..3,190, Z = 20..900 mm)
                    {
                        id: 'CAB_PANTRY_CORNER_NORTH_BACK',
                        name: 'Corner Bucket Garage North Wall Backing Panel (410×20×880 mm, Z=20..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: 20, z1: 900
                    },
                    // Closed Warm-Oak Front Panel facing West into the Room (X = 4,885..4,905, Y = 3,620..3,670 filler + 3,520..3,620 corner post)
                    // Note: Y = 3,190..3,580 mm is WIDE OPEN on the West (X = 4,885..4,905) so the Mop Bucket slides in sideways from the Housekeeping Closet!
                    {
                        id: 'CAB_PANTRY_CORNER_SOUTH_DIVIDER',
                        name: 'Corner Bucket Garage South Partition & 50mm Anti-Collision Filler (450×50×800 mm, Y=3620..3670, Z=100..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x1,
                        y0: yPocketEnd, y1: y1,
                        z0: 100, z1: 900
                    },
                    {
                        id: 'CAB_PANTRY_CORNER_PLINTH_FILLER',
                        name: 'Corner Bucket Garage South Plinth Return (410×50×100 mm, Y=3620..3670, Z=0..100 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_PLINTH,
                        x0: x0, x1: x1 - 40,
                        y0: yPocketEnd, y1: y1,
                        z0: 0, z1: 100
                    },
                    // Top Support Frame under the NE Corner of the Quartz Countertop (Z = 880..900 mm)
                    {
                        id: 'CAB_PANTRY_CORNER_TOP_PANEL',
                        name: 'Corner Bucket Garage Top Worktop Support Panel (430×480×20 mm, Z=880..900 mm)',
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + b, x1: x1,
                        y0: y0 + b, y1: y1,
                        z0: 880, z1: 900
                    },

                    // =========================================================
                    // 3D FULL-SIZE RECTANGULAR MOP BUCKET WITH SIDE-PRESS WRINGER
                    // Tucked inside the 450×450×880 mm Side-Access Corner Pocket (X = 4,535..4,845, Y = 3,240..3,540, Z = 20..445 mm)
                    // =========================================================
                    // 4 Swivel Caster Wheels (Z = 20..58 mm)
                    {
                        id: 'PANTRY_BUCKET_CASTERS',
                        name: 'Mop Bucket 4 Swivel Caster Base Frame (280×260×38 mm, Z=20..58 mm)',
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: 4550, x1: 4830,
                        y0: 3260, y1: 3520,
                        z0: 20, z1: 58
                    },
                    // Molded Turquoise-Teal Polypropylene Mop Bucket Body (300 × 280 × 275 mm, Z = 58..333 mm)
                    {
                        id: 'PANTRY_BUCKET_BODY',
                        name: 'Full-Size Rectangular Turquoise Mop Bucket Body (300×280×275 mm, Z=58..333 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_TEAL_CLEAN,
                        x0: 4540, x1: 4840,
                        y0: 3250, y1: 3530,
                        z0: 58, z1: 333
                    },
                    // Flared Top Pouring Rim of Mop Bucket (320 × 300 × 22 mm, Z = 325..347 mm)
                    {
                        id: 'PANTRY_BUCKET_RIM',
                        name: 'Mop Bucket Reinforced Top Pouring Spout Rim (320×300×22 mm, Z=325..347 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_TEAL_CLEAN,
                        x0: 4530, x1: 4850,
                        y0: 3240, y1: 3540,
                        z0: 325, z1: 347
                    },
                    // Detachable Charcoal-Grey Side-Press Wringer Sieve Basket (175 × 270 × 125 mm, Z = 285..410 mm)
                    {
                        id: 'PANTRY_BUCKET_WRINGER_BASKET',
                        name: 'Detachable Mop Wringer Perforated Sieve Basket (175×270×125 mm, Z=285..410 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_WRINGER_GREY,
                        x0: 4540, x1: 4715,
                        y0: 3255, y1: 3525,
                        z0: 285, z1: 410
                    },
                    // Wringer Press Lever Arm (Z = 365..450 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_BUCKET_WRINGER_LEVER',
                        name: 'Mop Wringer Side-Press Torsion Handle Lever (Ø18 mm, Z=365..450 mm)',
                        role: 'sink_faucet',
                        material: 'appliance_steel',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        numSegs: 12,
                        spine: [
                            [4625, 3390, 365, 9],
                            [4685, 3390, 445, 10]
                        ],
                        capStart: true,
                        capEnd: true
                    }),
                    // Curved Chrome Wire Carry Bail Handle (arching over Y = 3,245..3,535 mm)
                    buildPantryTubePart({
                        id: 'PANTRY_BUCKET_WIRE_BAIL',
                        name: 'Mop Bucket Curved Stainless-Steel Carry Bail Handle (Ø10 mm, Z=290..385 mm)',
                        role: 'sink_faucet',
                        material: 'stainless_steel',
                        colorRgb: COLOR_ALU_ANODIZED,
                        numSegs: 12,
                        spine: [
                            [4740, 3245, 335, 5],
                            [4795, 3285, 378, 5],
                            [4815, 3390, 390, 5],
                            [4795, 3495, 378, 5],
                            [4740, 3535, 335, 5]
                        ],
                        capStart: true,
                        capEnd: true
                    })
                ];

                return {
                    id: 'CAB_PANTRY_CORNER_BUCKET',
                    name: 'CAB_PANTRY_CORNER_BUCKET — Side-Access 450×450×900mm Corner Bucket Garage & 3D Mop Bucket with Wringer',
                    shortName: 'Side-Access Corner Bucket Garage (450×500mm)',
                    category: 'base_cabinet',
                    subtype: 'pantry_corner_bucket_garage',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 900,
                    widthMm: 500,
                    depthMm: 450,
                    carcassDepthMm: 450,
                    frontThicknessMm: 0,
                    plinthHeightMm: 100,
                    plinthRecessMm: 40,
                    bodyHeightMm: 800,
                    heightMm: 900,
                    boardThicknessMm: b,
                    normal: [1, 0, 0],
                    specs: '450 × 450 × 880 mm Side-Access Corner Pocket (X = 4,455..4,905 mm, Y = 3,170..3,620 mm, Z = 20..900 mm) + 50 mm South anti-collision filler (Y = 3,620..3,670 mm) • Open on the North-West side into the Housekeeping Closet • Houses a 3D full-size turquoise mop bucket on casters with detachable side-press wringer',
                    description: 'Ingenious side-access 450 × 450 × 880 mm corner base cavity underneath the North-East corner of the East Quartz Countertop (Y = 3,170..3,670 mm). Closed toward the East-wall drawer run with a 50 mm warm-oak filler (eliminating L-corner drawer collisions) and wide open on its West side into the Housekeeping Closet so a full-size mop bucket with wringer rolls effortlessly in and out on the continuous waterproof floor mat.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 32–34. CAB_PANTRY_E1, CAB_PANTRY_E2, CAB_PANTRY_E3:
            //        3 × 500 mm Lower Base Cabinets with 3 Tiers of Pull-Out Slatted Warm-Oak Crate Drawers
            //        (X = 4,455..4,905 mm, Y = 3,670..5,170 mm, Z = 0..900 mm; topped by PANTRY_COUNTERTOP at Z = 900..930 mm)
            // -----------------------------------------------------------------
            function makePantryCrateBaseCabinet(id, index, y0, y1) {
                const depthMm = 450;
                const x0 = X_PANTRY_EAST;
                const x1 = x0 + depthMm; // 4,905 mm
                const xPlinthFront = x1 - 40; // 4,865 mm
                const w = y1 - y0; // 500 mm
                const b = PANTRY_BOARD_MM; // 20 mm

                const skeleton = [
                    {
                        id: `${id}_PLINTH`,
                        name: `Recessed Dark Plinth / Toe-Kick (410×${w}×100 mm Cokół, Z=0..100 mm)`,
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_PLINTH,
                        x0: x0, x1: xPlinthFront,
                        y0: y0, y1: y1,
                        z0: 0, z1: 100
                    },
                    {
                        id: `${id}_NORTH_PANEL`,
                        name: `Left/North Side Carcass Panel (450×20×800 mm, Z=100..900 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: 100, z1: 900
                    },
                    {
                        id: `${id}_SOUTH_PANEL`,
                        name: `Right/South Side Carcass Panel (450×20×800 mm, Z=100..900 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1 - b,
                        y0: y1 - b, y1: y1,
                        z0: 100, z1: 900
                    },
                    {
                        id: `${id}_BACK_PANEL`,
                        name: `Rear Carcass Backing Panel (20×${w - 2 * b}×800 mm, Z=100..900 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: x0, x1: x0 + b,
                        y0: y0 + b, y1: y1 - b,
                        z0: 100, z1: 900
                    },
                    {
                        id: `${id}_BOTTOM_PANEL`,
                        name: `Bottom Carcass Panel (410×${w - 2 * b}×20 mm, Z=100..120 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: y1 - b,
                        z0: 100, z1: 120
                    },
                    {
                        id: `${id}_TOP_PANEL`,
                        name: `Top Worktop Support Panel (410×${w - 2 * b}×20 mm, Z=880..900 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: y1 - b,
                        z0: 880, z1: 900
                    }
                ];

                // Build 3 Tiers of Ventilated Pull-Out Slatted Warm-Oak Crate Drawers:
                // Tier 1 (Bottom): Z = 130..355 mm (225 mm high)
                // Tier 2 (Middle): Z = 390..615 mm (225 mm high)
                // Tier 3 (Top):    Z = 650..865 mm (215 mm high)
                const crateTiers = [
                    { idx: 1, zA: 130, zB: 355, label: 'Lower Deep Root-Vegetable & Bottle Crate' },
                    { idx: 2, zA: 390, zB: 615, label: 'Middle Ventilated Produce & Dry-Goods Crate' },
                    { idx: 3, zA: 650, zB: 865, label: 'Upper Bread, Onion & Snack Slatted Crate' }
                ];

                crateTiers.forEach(cr => {
                    const cy0 = y0 + b + 8, cy1 = y1 - b - 8; // 444 mm wide inner drawer box
                    const cx0 = x0 + b + 12, cx1 = x1 - b;    // 398 mm deep inner drawer tray
                    // Drawer tray bottom & side walls
                    skeleton.push(
                        {
                            id: `${id}_CRATE_${cr.idx}_TRAY_BOTTOM`,
                            name: `${cr.label} #${cr.idx} — Pull-Out Tray Floor (${cx1 - cx0}×${cy1 - cy0}×14 mm, Z=${cr.zA}..${cr.zA + 14} mm)`,
                            role: 'carcass_panel',
                            material: 'wood_oak',
                            colorRgb: COLOR_CARCASS_SHELF,
                            x0: cx0, x1: cx1,
                            y0: cy0, y1: cy1,
                            z0: cr.zA, z1: cr.zA + 14
                        },
                        {
                            id: `${id}_CRATE_${cr.idx}_SIDE_NORTH`,
                            name: `${cr.label} #${cr.idx} — North Drawer Runner Side (${cx1 - cx0}×16×140 mm)`,
                            role: 'carcass_panel',
                            material: 'wood_oak',
                            colorRgb: COLOR_OAK_WARM,
                            x0: cx0, x1: cx1,
                            y0: cy0, y1: cy0 + 16,
                            z0: cr.zA + 14, z1: cr.zA + 154
                        },
                        {
                            id: `${id}_CRATE_${cr.idx}_SIDE_SOUTH`,
                            name: `${cr.label} #${cr.idx} — South Drawer Runner Side (${cx1 - cx0}×16×140 mm)`,
                            role: 'carcass_panel',
                            material: 'wood_oak',
                            colorRgb: COLOR_OAK_WARM,
                            x0: cx0, x1: cx1,
                            y0: cy1 - 16, y1: cy1,
                            z0: cr.zA + 14, z1: cr.zA + 154
                        },
                        // Dark Shadow Backing Behind the Slatted Front Bars (creates realistic ventilation gap depth!)
                        {
                            id: `${id}_CRATE_${cr.idx}_SHADOW_BACKING`,
                            name: `${cr.label} #${cr.idx} — Recessed Ventilation Shadow Backing (8×${w - 16}×${cr.zB - cr.zA - 12} mm)`,
                            role: 'plinth',
                            material: 'dark_plinth',
                            colorRgb: COLOR_OAK_SLAT_DARK,
                            x0: x1 - b - 4, x1: x1 - b + 4,
                            y0: y0 + 8, y1: y1 - 8,
                            z0: cr.zA + 6, z1: cr.zB - 6
                        }
                    );

                    // 3 Horizontal Solid Warm-Oak Slats across the West Front (X = 4,885..4,905 mm) with 16 mm air gaps between slats!
                    const slatH = 56;
                    const slatGap = 18;
                    for (let s = 0; s < 3; s++) {
                        const sz0 = cr.zA + s * (slatH + slatGap);
                        const sz1 = Math.min(cr.zB, sz0 + slatH);
                        skeleton.push({
                            id: `${id}_CRATE_${cr.idx}_SLAT_${s + 1}`,
                            name: `${cr.label} #${cr.idx} — Warm-Oak Ventilated Front Slat #${s + 1} (20×${w - 6}×${sz1 - sz0} mm, Z=${sz0}..${sz1} mm)`,
                            role: 'drawer_front',
                            material: 'wood_oak',
                            colorRgb: COLOR_OAK_WARM,
                            x0: x1 - b, x1: x1,
                            y0: y0 + 3, y1: y1 - 3,
                            z0: sz0, z1: sz1
                        });
                    }

                    // Recessed Integrated Finger-Pull Grip Cutout at the top center of the crate front
                    const yMid = Math.round((y0 + y1) / 2);
                    skeleton.push({
                        id: `${id}_CRATE_${cr.idx}_PULL_GRIP`,
                        name: `${cr.label} #${cr.idx} — Integrated Finger-Pull Cutout (6×120×18 mm)`,
                        role: 'handle_rail',
                        material: 'dark_plinth',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: x1 - 4, x1: x1 + 1,
                        y0: yMid - 60, y1: yMid + 60,
                        z0: cr.zB - 22, z1: cr.zB - 4
                    });
                });

                return {
                    id: id,
                    name: `${id} — Pantry Lower 3-Tier Pull-Out Slatted Oak Crate Cabinet #${index} (500×450×900mm Szuflady Skrzynkowe)`,
                    shortName: `Pantry Slatted Crate Tower #${index} (500×450mm)`,
                    category: 'base_cabinet',
                    subtype: 'pantry_crate_drawer_cabinet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 900,
                    widthMm: w,
                    depthMm: depthMm,
                    carcassDepthMm: depthMm - b,
                    frontThicknessMm: b,
                    plinthHeightMm: 100,
                    plinthRecessMm: 40,
                    bodyHeightMm: 800,
                    heightMm: 900,
                    boardThicknessMm: b,
                    normal: [1, 0, 0],
                    specs: `500 × 450 × 900 mm (X = ${x0}..${x1} mm, Y = ${y0}..${y1} mm, Z = 0..900 mm; topped by 30 mm PANTRY_COUNTERTOP at Z = 900..930 mm) • 100 mm dark plinth + 3 tiers of full-extension ventilated warm-oak slatted crate drawers (Z = 130..355, 390..615, 650..865 mm)`,
                    description: `Pantry East Wall (GW_14) lower storage tower #${index} (500 mm wide × 450 mm deep × 900 mm high, topped by the 30 mm quartz worktop at Z = 900..930 mm). Fitted with 3 tiers of full-extension pull-out slatted warm-oak crate drawers with 18 mm ventilation slots and integrated finger-pull grips for root vegetables, fruit, bread, and bulk bottles.`,
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 35. PANTRY_COUNTERTOP: Continuous 2,000 × 450 × 30 mm Quartz Stone Worktop Slab
            //     (X = 4,455..4,905 mm, Y = 3,170..5,170 mm, Z = 900..930 mm)
            //     + Warm 3000K Under-Cabinet LED Strip (Z = 1,375..1,380 mm) + Dual 230V Counter Socket
            // -----------------------------------------------------------------
            function buildPantryCountertopObject() {
                const x0 = X_PANTRY_EAST, x1 = X_PANTRY_EAST + 450; // 4,455..4,905 mm
                const y0 = Y_PANTRY_NORTH, y1 = Y_PANTRY_NORTH + 2000; // 3,170..5,170 mm

                const skeleton = [
                    {
                        id: 'PANTRY_COUNTERTOP_SLAB',
                        name: 'Continuous 30mm Satin Quartz Stone Countertop Slab (450×2000×30 mm Blat Kwarcowy, Z=900..930 mm)',
                        role: 'worktop',
                        material: 'stone_worktop',
                        colorRgb: COLOR_WORKTOP,
                        x0: x0, x1: x1,
                        y0: y0, y1: y1,
                        z0: 900, z1: 930
                    },
                    {
                        id: 'PANTRY_COUNTERTOP_LED_STRIP',
                        name: 'Recessed 3000K Warm-White Under-Shelf LED Task Light Bar (16×1960×5 mm at Z=1375..1380 mm)',
                        role: 'appliance_led',
                        material: 'led_white',
                        colorRgb: COLOR_LED_WARM,
                        wireColorRgba: [1.00, 0.94, 0.76, 0.96],
                        x0: x0 + 255, x1: x0 + 271,
                        y0: y0 + 20, y1: y1 - 20,
                        z0: 1375, z1: 1380
                    },
                    {
                        id: 'PANTRY_COUNTERTOP_APPLIANCE_SOCKET',
                        name: 'Dual 230V Countertop Appliance Power Outlet (8×142×72 mm on East Wall at Z=1080..1152 mm)',
                        role: 'appliance_front',
                        material: 'appliance_steel',
                        colorRgb: COLOR_MATTE_ANTHRACITE,
                        x0: x0, x1: x0 + 8,
                        y0: y0 + 210, y1: y0 + 352,
                        z0: 1080, z1: 1152
                    }
                ];

                return {
                    id: 'PANTRY_COUNTERTOP',
                    name: 'PANTRY_COUNTERTOP — 2,000 × 450 × 30 mm Quartz Prep & Appliance Countertop + 3000K LED Strip (Z=900..930mm)',
                    shortName: 'Pantry Quartz Countertop (2000×450×30mm)',
                    category: 'countertop',
                    subtype: 'stone_worktop',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 900,
                    zTop: 1380,
                    widthMm: 2000,
                    depthMm: 450,
                    carcassDepthMm: 450,
                    frontThicknessMm: 0,
                    plinthHeightMm: 0,
                    plinthRecessMm: 0,
                    bodyHeightMm: 30,
                    heightMm: 30,
                    boardThicknessMm: 30,
                    normal: [1, 0, 0],
                    specs: '2,000 × 450 × 30 mm Satin Quartz Worktop Slab (X = 4,455..4,905 mm, Y = 3,170..5,170 mm, Z = 900..930 mm) • 450 mm clear backsplash height (Z = 930..1,380 mm) with 450×450 mm NE Corner Appliance Niche + dual 230V socket + 3000K recessed LED task light strip',
                    description: 'Continuous 2,000 × 450 × 30 mm light quartz stone worktop slab spanning the Pantry East Wall (GW_14) at Z = 900..930 mm above CAB_PANTRY_CORNER_BUCKET and CAB_PANTRY_E1..E3. Provides a 450 mm high illuminated prep & small-appliance zone (Z = 930..1,380 mm) complete with a 3000K under-shelf LED strip and a dual 230V appliance socket in the North-East corner niche.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 36–39. CAB_PANTRY_E_UP1..UP4: 4 × 500 mm Upper Open Shelving Columns
            //        (X = 4,455..4,755 mm, Y = 3,170..5,170 mm, Z = 1,380..2,800 mm)
            //        With 5 aligned shelf tiers at Z = 1,380, 1,665, 1,950, 2,240, 2,520, and 2,780..2,800 mm!
            // -----------------------------------------------------------------
            function makePantryEastUpperColumn(id, index, y0, y1) {
                const depthMm = 300; // 30 cm ergonomic single-row jar depth
                const x0 = X_PANTRY_EAST;
                const x1 = x0 + depthMm; // 4,755 mm
                const w = y1 - y0; // 500 mm
                const zBot = 1380, zTop = 2800;
                const zCornerOpen = 1665; // Above Z=1,665 mm, North shelves (Y=3,170..3,620 mm) meet East shelves (X=4,455..4,755 mm) in an Open L-Corner
                const b = PANTRY_BOARD_MM;
                const isCornerCol1 = (index === 1); // Y = 3,170..3,670 mm
                const isCornerCol2 = (index === 2); // Y = 3,670..4,170 mm

                const skeleton = [];

                // Left/North Side Carcass Panel:
                // - For Col #2 (Y = 3,670 mm), terminate at Z = 1,665 mm so it does not create a wall 50 mm South of the Y = 3,620 mm North cabinet front!
                skeleton.push({
                    id: `${id}_NORTH_PANEL`,
                    name: isCornerCol2
                        ? `Lower Left/North Divider Panel (300×20×285 mm, Z=1380..1665 mm below Open L-Corner)`
                        : `Left/North Side Carcass Panel (300×20×1420 mm, Z=1380..2800 mm)`,
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_SIDE,
                    x0: x0, x1: x1,
                    y0: y0, y1: y0 + b,
                    z0: zBot, z1: isCornerCol2 ? zCornerOpen : zTop
                });

                // Right/South Side Carcass Panel:
                // - For Col #1 (Y = 3,650..3,670 mm), terminate at Z = 1,665 mm so Z = 1,665..2,800 mm forms an unobstructed Open L-Corner with Col #2 and CAB_PANTRY_N_UP3!
                skeleton.push({
                    id: `${id}_SOUTH_PANEL`,
                    name: isCornerCol1
                        ? `Lower Right/South Divider Panel (300×20×285 mm, Z=1380..1665 mm below Open L-Corner)`
                        : `Right/South Side Carcass Panel (300×20×1420 mm, Z=1380..2800 mm)`,
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_SIDE,
                    x0: x0, x1: x1,
                    y0: y1 - b, y1: y1,
                    z0: zBot, z1: isCornerCol1 ? zCornerOpen : zTop
                });

                // Rear Carcass Backing Panel (flush against East Wall X = 4,455..4,475 mm)
                skeleton.push({
                    id: `${id}_BACK_PANEL`,
                    name: `Rear Carcass Backing Panel (20×${w - 2 * b}×1420 mm, Z=1380..2800 mm)`,
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_BACK,
                    x0: x0, x1: x0 + b,
                    y0: isCornerCol2 ? y0 : y0 + b,
                    y1: isCornerCol1 ? y1 : y1 - b,
                    z0: zBot, z1: zTop
                });

                // Aligned 20 mm shelves at Z = 1,380, 1,665, 1,950, 2,240, 2,520 mm + Top Panel at Z = 2,780..2,800 mm
                const alignedShelves = [
                    { z0: 1380, label: 'Bottom Shelf #1 (450mm above Worktop)' },
                    { z0: 1665, label: 'Shelf #2 (Continuous Open L-Corner with Housekeeping Detergent Shelf)' },
                    { z0: 1950, label: 'Shelf #3 (Continuous Open L-Corner with North Overhead Bridge Base)' },
                    { z0: 2240, label: 'Shelf #4 (Continuous Open L-Corner with North Overhead Shelf #1)' },
                    { z0: 2520, label: 'Shelf #5 (Continuous Open L-Corner with North Overhead Shelf #2)' }
                ];

                alignedShelves.forEach((sh, idx) => {
                    const isOpenLCornerTier = (sh.z0 >= zCornerOpen);
                    const shelfY0 = (isCornerCol2 && isOpenLCornerTier) ? y0 : (y0 + b);
                    const shelfY1 = (isCornerCol1 && isOpenLCornerTier) ? y1 : (y1 - b);
                    skeleton.push({
                        id: `${id}_SHELF_${idx + 1}`,
                        name: `${sh.label} — Z=${sh.z0}..${sh.z0 + b} mm (280×${shelfY1 - shelfY0}×20 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: (idx === 0 || idx === 2) ? COLOR_OAK_WARM : COLOR_CARCASS_SHELF,
                        x0: x0 + b, x1: x1,
                        y0: shelfY0, y1: shelfY1,
                        z0: sh.z0, z1: sh.z0 + b
                    });
                });

                const topY0 = isCornerCol2 ? y0 : (y0 + b);
                const topY1 = isCornerCol1 ? y1 : (y1 - b);
                skeleton.push({
                    id: `${id}_TOP_PANEL`,
                    name: `Top Ceiling Panel — Z=2780..2800 mm (280×${topY1 - topY0}×20 mm)`,
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_SHELF,
                    x0: x0 + b, x1: x1,
                    y0: topY0, y1: topY1,
                    z0: zTop - b, z1: zTop
                });

                return {
                    id: id,
                    name: `${id} — Pantry Upper Open Shelving Column #${index} (500×300×1420mm, Z=1380..2800mm)`,
                    shortName: `Pantry Upper Shelving #${index} (500×300mm)`,
                    category: 'wall_cabinet',
                    subtype: 'pantry_open_upper_cabinet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: zBot,
                    zTop: zTop,
                    widthMm: w,
                    depthMm: depthMm,
                    carcassDepthMm: depthMm,
                    frontThicknessMm: 0,
                    plinthHeightMm: 0,
                    plinthRecessMm: 0,
                    bodyHeightMm: 1420,
                    heightMm: 1420,
                    boardThicknessMm: b,
                    normal: [1, 0, 0],
                    specs: `500 × 300 × 1,420 mm (X = ${x0}..${x1} mm, Y = ${y0}..${y1} mm, Z = 1,380..2,800 mm) • 5 aligned shelf tiers at Z = 1,380, 1,665, 1,950, 2,240, 2,520, 2,800 mm (Open L-Corner above Z = 1,665 mm)`,
                    description: `Pantry East Wall (GW_14) 500 mm wide × 300 mm deep upper open shelving column #${index} (Z = 1,380..2,800 mm), vertically aligned with the 500 mm lower cabinets below and horizontally aligned across all 5 shelf elevations (Z = 1,380, 1,665, 1,950, 2,240, 2,520 mm) in an unobstructed Open L-Corner with the North Wall cabinetry.`,
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 40. PANTRY_STAIR_POST: Full-Height 40 × 450 × 2,800 mm Structural Warm-Oak
            //     Stairwell End-Post & Guard Panel (X = 4,455..4,905 mm, Y = 5,170..5,210 mm, Z = 0..2,800 mm)
            // -----------------------------------------------------------------
            function buildPantryStairGuardPost() {
                const x0 = X_PANTRY_EAST, x1 = X_PANTRY_EAST + 450; // 4,455..4,905 mm
                const y0 = 5170, y1 = 5210; // 40 mm post immediately North of STAIRS_BASEMENT (Y = 5,210..6,110 mm)

                return {
                    id: 'PANTRY_STAIR_POST',
                    name: 'PANTRY_STAIR_POST — Full-Height 40mm Structural Warm-Oak Stairwell End-Post & Guard Panel (450×40×2800mm)',
                    shortName: 'Pantry Oak Stair Guard Post (40×450×2800mm)',
                    category: 'tall_cabinet',
                    subtype: 'pantry_stair_guard_post',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 2800,
                    widthMm: 40,
                    depthMm: 450,
                    carcassDepthMm: 450,
                    frontThicknessMm: 0,
                    plinthHeightMm: 0,
                    plinthRecessMm: 0,
                    bodyHeightMm: 2800,
                    heightMm: 2800,
                    boardThicknessMm: 40,
                    normal: [1, 0, 0],
                    specs: '450 × 40 × 2,800 mm (X = 4,455..4,905 mm, Y = 5,170..5,210 mm, Z = 0..2,800 mm) • Full-height solid warm-oak structural end-panel & stairwell safety guard before the 900 mm Basement Stairs (Y = 5,210..6,110 mm)',
                    description: 'Full-height 40 mm thick × 450 mm deep structural warm-oak end panel and stairwell safety guard post at Y = 5,170..5,210 mm (Z = 0..2,800 mm), cleanly terminating the 2,000 mm East Wall countertop and upper shelving run right before the 900 mm basement stairwell drop.',
                    skeleton: [
                        {
                            id: 'PANTRY_STAIR_POST_PANEL',
                            name: 'Full-Height 40mm Structural Warm-Oak Stair Guard Panel (450×40×2800 mm, Y=5170..5210, Z=0..2800 mm)',
                            role: 'carcass_panel',
                            material: 'wood_oak',
                            colorRgb: COLOR_OAK_WARM,
                            x0: x0, x1: x1,
                            y0: y0, y1: y1,
                            z0: 0, z1: 2800
                        }
                    ],
                    fronts: []
                };
            }

            return [
                // North Wall Overhead Bridge above Freezer + 20mm Full-Height Oak Portal Cheek Panel
                buildPantryNorthFreezerBridge(),
                // North Wall 805mm Housekeeping, Folding Ladder, Mop & Cordless Vacuum Charging Dock
                buildPantryHousekeepingCloset(),
                // North Wall 2 × Overhead Bridge Cabinets above Housekeeping Closet (aligned shelves at Z = 2,240 & 2,520 mm)
                makePantryNorthOverheadCabinet('CAB_PANTRY_N_UP2', 2, 5225, 5695, 475),
                makePantryNorthOverheadCabinet('CAB_PANTRY_N_UP3', 3, 4755, 5225, 480),
                // East Wall Side-Access 450×450×900mm Corner Bucket Garage + 3D Mop Bucket with Wringer
                buildPantryCornerBucketGarage(),
                // East Wall 3 × 500mm Lower Base Cabinets with 3 Tiers of Pull-Out Slatted Oak Crate Drawers
                makePantryCrateBaseCabinet('CAB_PANTRY_E1', 1, 3670, 4170),
                makePantryCrateBaseCabinet('CAB_PANTRY_E2', 2, 4170, 4670),
                makePantryCrateBaseCabinet('CAB_PANTRY_E3', 3, 4670, 5170),
                // East Wall Continuous 2,000 × 450 × 30 mm Quartz Stone Countertop + 3000K LED Strip
                buildPantryCountertopObject(),
                // East Wall 4 × 500mm Upper Open Shelving Columns (Z = 1,380..2,800 mm, aligned shelves)
                makePantryEastUpperColumn('CAB_PANTRY_E_UP1', 1, 3170, 3670),
                makePantryEastUpperColumn('CAB_PANTRY_E_UP2', 2, 3670, 4170),
                makePantryEastUpperColumn('CAB_PANTRY_E_UP3', 3, 4170, 4670),
                makePantryEastUpperColumn('CAB_PANTRY_E_UP4', 4, 4670, 5170),
                // East Wall Full-Height 40mm Warm-Oak Stairwell End-Post & Guard Panel (Y = 5,170..5,210 mm)
                buildPantryStairGuardPost()
            ];
        })(),

        // =====================================================================
        // 41–51. GROUND FLOOR LAUNDRY (0.08 Pralnia — North Wall GW_8 / EW_ALCOVE_SOUTH)
        //        Based on /laundry.html (Total Width: 3,970 mm, Height: 2,800 mm)
        //        North Wall Y = 11,400 mm, X = 20,325 mm (Left/West) -> 16,355 mm (Right/East)
        //        - Left Empty Wall Gap: 670 mm (X = 19,655..20,325 mm)
        //        - Tall Left Cabinet: 450 × 2,400 mm with 150 mm Plinth (X = 19,205..19,655 mm, Z = 0..2,400 mm)
        //        - Washing Machine ("Pralka"): 650 × 900 mm (X = 18,555..19,205 mm, Z = 0..900 mm)
        //        - Tumble Dryer ("Suszarka"): 650 × 900 mm (X = 18,555..19,205 mm, Z = 900..1,800 mm)
        //        - Leftmost Top Cabinet: 650 × 600 mm with shelf at Z = 2,100 mm (X = 18,555..19,205 mm, Z = 1,800..2,400 mm)
        //        - Lower Double Cabinet: 800 × 900 mm split 400+400 mm (X = 17,755..18,555 mm, Z = 0..900 mm)
        //        - Hanging Drying Niche: 800 × 900 mm with Closet Rod at Z = 1,600 mm & Partition (X = 17,755..18,555 mm, Z = 900..1,800 mm)
        //        - Sink Base Cabinet: 600 × 900 mm with 300 mm Basin & Faucet (X = 17,155..17,755 mm, Z = 0..900 mm)
        //        - Middle Top Cabinet: 1,100 × 600 mm with shelf at Z = 2,100 mm (X = 17,455..18,555 mm, Z = 1,800..2,400 mm)
        //        - Rightmost Top Cabinet: 1,100 × 600 mm with shelf at Z = 2,100 mm (X = 16,355..17,455 mm, Z = 1,800..2,400 mm)
        //        - Right Multi-Split Cabinet: 800 × 1,600 mm split 200+200+400 mm (X = 16,355..17,155 mm, Z = 0..1,600 mm)
        //        - Right Bridge Cubby Cabinet: 800 × 200 mm (X = 16,355..17,155 mm, Z = 1,600..1,800 mm)
        // =====================================================================
        ...(function buildLaundryFurniture() {
            const Y_LAUNDRY_NORTH = 11400; // Interior South face of GW_8 & EW_ALCOVE_SOUTH
            const LAUNDRY_DEPTH_MM = 650;  // 650 mm depth (fits inside the 900 mm North pier Y=11,400..12,300 mm of GW_9)
            const LAUNDRY_CARCASS_DEPTH_MM = 630;
            const LAUNDRY_FRONT_MM = 20;
            const LAUNDRY_BOARD_MM = 20;
            const COLOR_OAK_WARM = [0.557, 0.420, 0.278];    // #8E6B47 warm oak carcass matching laundry.html stroke
            const COLOR_CASHMERE_FRONT = [0.910, 0.886, 0.867]; // #E8E2DD warm cashmere/beige front matching #EFEBE9..#D7CCC8
            const COLOR_APPLIANCE_BODY = [0.945, 0.957, 0.965]; // #F1F4F6 crisp white appliance enamel
            const COLOR_APPLIANCE_RING = [0.780, 0.816, 0.839]; // #C7D0D6 brushed silver porthole bezel
            const COLOR_APPLIANCE_GLASS = [0.220, 0.275, 0.310]; // #38464F dark tinted drum glass
            const COLOR_STEEL_CHROME = [0.690, 0.745, 0.773];   // #B0BEC5 stainless steel / sink / closet rod
            const COLOR_FAUCET_STEEL = [0.471, 0.565, 0.612];   // #78909C brushed gunmetal/chrome faucet
            const COLOR_PLINTH_DARK = [0.22, 0.20, 0.18];

            const y0 = Y_LAUNDRY_NORTH;
            const yCarcass1 = y0 + LAUNDRY_CARCASS_DEPTH_MM; // 12,030 mm
            const yFront1 = y0 + LAUNDRY_DEPTH_MM;           // 12,050 mm
            const b = LAUNDRY_BOARD_MM;

            // Helper: Normalize colorRgb array so both [0..1] and [0..255] work seamlessly
            function normRgb(c, fallback) {
                if (!Array.isArray(c) || c.length < 3) return fallback || COLOR_STEEL_CHROME;
                if (c[0] > 1.01 || c[1] > 1.01 || c[2] > 1.01) {
                    return [
                        Math.round((c[0] / 255) * 1000) / 1000,
                        Math.round((c[1] / 255) * 1000) / 1000,
                        Math.round((c[2] / 255) * 1000) / 1000
                    ];
                }
                return c;
            }

            // Helper: Build a B-Rep part from indexed vertices3D [[x,y,z],...], faces3D [[i0,i1,i2,...],...], and wireframeIndices [[a,b],...]
            function buildIndexedMeshPart(opts) {
                const verts = opts.vertices3D || [];
                const idxFaces = opts.faces3D || [];
                const wireIdx = opts.wireframeIndices || [];
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
                for (let i = 0; i < verts.length; i++) {
                    const [vx, vy, vz] = verts[i];
                    if (vx < minX) minX = vx; if (vx > maxX) maxX = vx;
                    if (vy < minY) minY = vy; if (vy > maxY) maxY = vy;
                    if (vz < minZ) minZ = vz; if (vz > maxZ) maxZ = vz;
                }
                const faces3D = [];
                for (let f = 0; f < idxFaces.length; f++) {
                    const idxs = idxFaces[f];
                    if (!Array.isArray(idxs) || idxs.length < 3) continue;
                    const loop3D = idxs.map(ix => verts[ix]);
                    const p0 = loop3D[0], p1 = loop3D[1], p2 = loop3D[2];
                    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
                    const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
                    const nx = uy * vz - uz * vy;
                    const ny = uz * vx - ux * vz;
                    const nz = ux * vy - uy * vx;
                    const nLen = Math.hypot(nx, ny, nz) || 1;
                    faces3D.push({
                        side: 'mesh',
                        noWireframe: true,
                        normal: [nx / nLen, ny / nLen, nz / nLen],
                        loop3D
                    });
                }
                const wireframeLines3D = wireIdx.map(([ia, ib]) => [verts[ia], verts[ib]]);
                return {
                    id: opts.id,
                    name: opts.name,
                    role: opts.role || 'carcass_panel',
                    material: opts.material || 'wood_oak',
                    colorRgb: normRgb(opts.colorRgb, COLOR_OAK_WARM),
                    x0: Number.isFinite(opts.x0) ? opts.x0 : Math.floor(minX),
                    x1: Number.isFinite(opts.x1) ? opts.x1 : Math.ceil(maxX),
                    y0: Number.isFinite(opts.y0) ? opts.y0 : Math.floor(minY),
                    y1: Number.isFinite(opts.y1) ? opts.y1 : Math.ceil(maxY),
                    z0: Number.isFinite(opts.z0) ? opts.z0 : Math.floor(minZ),
                    z1: Number.isFinite(opts.z1) ? opts.z1 : Math.ceil(maxZ),
                    faces3D,
                    wireframeLines3D
                };
            }

            // Helper: Build a smooth-shaded 3D tubular / lathe B-Rep part along an arbitrary 3D spine [[x,y,z,r], ...] or [{cx,cy,cz,r}, ...]
            function buildLaundryTubePart(opts) {
                const rawSpine = opts.spine || [];
                const spine = rawSpine.map(s => Array.isArray(s) ? s : [s.cx, s.cy, s.cz, s.r]);
                const numSegs = opts.numSegs || opts.segments || 28;
                const faces3D = [];
                const wireframeLines3D = opts.wireframeLines3D ? opts.wireframeLines3D.slice() : [];
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;

                const tangents = [];
                for (let i = 0; i < spine.length; i++) {
                    let iPrev = i;
                    while (iPrev > 0 && Math.hypot(spine[i][0] - spine[iPrev][0], spine[i][1] - spine[iPrev][1], spine[i][2] - spine[iPrev][2]) < 0.05) iPrev--;
                    let iNext = i;
                    while (iNext < spine.length - 1 && Math.hypot(spine[iNext][0] - spine[i][0], spine[iNext][1] - spine[i][1], spine[iNext][2] - spine[i][2]) < 0.05) iNext++;
                    const tx = spine[iNext][0] - spine[iPrev][0];
                    const ty = spine[iNext][1] - spine[iPrev][1];
                    const tz = spine[iNext][2] - spine[iPrev][2];
                    const len = Math.hypot(tx, ty, tz) || 1;
                    tangents.push([tx / len, ty / len, tz / len]);
                }

                const rings = [];
                for (let i = 0; i < spine.length; i++) {
                    const [px, py, pz, r] = spine[i];
                    const T = tangents[i];
                    const ref = opts.upHint && Math.hypot(
                        T[1] * opts.upHint[2] - T[2] * opts.upHint[1],
                        T[2] * opts.upHint[0] - T[0] * opts.upHint[2],
                        T[0] * opts.upHint[1] - T[1] * opts.upHint[0]
                    ) > 0.15 ? opts.upHint : ((Math.abs(T[0]) < 0.85) ? [1, 0, 0] : [0, 1, 0]);
                    let vx = T[1] * ref[2] - T[2] * ref[1];
                    let vy = T[2] * ref[0] - T[0] * ref[2];
                    let vz = T[0] * ref[1] - T[1] * ref[0];
                    const vLen = Math.hypot(vx, vy, vz) || 1;
                    vx /= vLen; vy /= vLen; vz /= vLen;
                    let ux = vy * T[2] - vz * T[1];
                    let uy = vz * T[0] - vx * T[2];
                    let uz = vx * T[1] - vy * T[0];
                    const uLen = Math.hypot(ux, uy, uz) || 1;
                    ux /= uLen; uy /= uLen; uz /= uLen;

                    const ringPts = [], ringNormals = [];
                    for (let k = 0; k < numSegs; k++) {
                        const ang = (k / numSegs) * Math.PI * 2;
                        const ca = Math.cos(ang), sa = Math.sin(ang);
                        const nx = ca * ux + sa * vx, ny = ca * uy + sa * vy, nz = ca * uz + sa * vz;
                        const vx3 = Math.round((px + r * nx) * 100) / 100;
                        const vy3 = Math.round((py + r * ny) * 100) / 100;
                        const vz3 = Math.round((pz + r * nz) * 100) / 100;
                        ringPts.push([vx3, vy3, vz3]);
                        ringNormals.push([nx, ny, nz]);
                        if (vx3 < minX) minX = vx3; if (vx3 > maxX) maxX = vy3 > maxX ? vx3 : vx3;
                        if (vx3 > maxX) maxX = vx3;
                        if (vy3 < minY) minY = vy3; if (vy3 > maxY) maxY = vy3;
                        if (vz3 < minZ) minZ = vz3; if (vz3 > maxZ) maxZ = vz3;
                    }
                    rings.push({ pts: ringPts, normals: ringNormals, T, r });
                }

                const invN = opts.invertNormals ? -1 : 1;
                for (let i = 0; i + 1 < rings.length; i++) {
                    const rA = rings[i], rB = rings[i + 1];
                    const dist = Math.hypot(spine[i + 1][0] - spine[i][0], spine[i + 1][1] - spine[i][1], spine[i + 1][2] - spine[i][2]);
                    const dr = rB.r - rA.r;
                    if (dist < 0.02 && Math.abs(dr) < 0.02) continue;
                    const hyp = Math.hypot(dist, dr) || 1;
                    const wRad = (dist / hyp) * invN;
                    const wTan = (-dr / hyp) * invN;

                    for (let k = 0; k < numSegs; k++) {
                        const kNext = (k + 1) % numSegs;
                        const p00 = rA.pts[k], p10 = rA.pts[kNext], p11 = rB.pts[kNext], p01 = rB.pts[k];
                        const n00 = [rA.normals[k][0] * wRad + rA.T[0] * wTan, rA.normals[k][1] * wRad + rA.T[1] * wTan, rA.normals[k][2] * wRad + rA.T[2] * wTan];
                        const n10 = [rA.normals[kNext][0] * wRad + rA.T[0] * wTan, rA.normals[kNext][1] * wRad + rA.T[1] * wTan, rA.normals[kNext][2] * wRad + rA.T[2] * wTan];
                        const n11 = [rB.normals[kNext][0] * wRad + rB.T[0] * wTan, rB.normals[kNext][1] * wRad + rB.T[1] * wTan, rB.normals[kNext][2] * wRad + rB.T[2] * wTan];
                        const n01 = [rB.normals[k][0] * wRad + rB.T[0] * wTan, rB.normals[k][1] * wRad + rB.T[1] * wTan, rB.normals[k][2] * wRad + rB.T[2] * wTan];
                        const avgNx = (n00[0] + n10[0] + n11[0] + n01[0]) / 4;
                        const avgNy = (n00[1] + n10[1] + n11[1] + n01[1]) / 4;
                        const avgNz = (n00[2] + n10[2] + n11[2] + n01[2]) / 4;
                        const avgLen = Math.hypot(avgNx, avgNy, avgNz) || 1;
                        faces3D.push({
                            side: 'curved',
                            noWireframe: true,
                            normal: [avgNx / avgLen, avgNy / avgLen, avgNz / avgLen],
                            vertexNormals3D: invN < 0 ? [n00, n01, n11, n10] : [n00, n10, n11, n01],
                            loop3D: invN < 0 ? [p00, p01, p11, p10] : [p00, p10, p11, p01]
                        });
                    }
                }

                if (opts.capStart && rings.length > 0 && rings[0].r > 0.2) {
                    const T0 = rings[0].T;
                    faces3D.push({
                        side: 'cap_start',
                        noWireframe: true,
                        normal: [-T0[0] * invN, -T0[1] * invN, -T0[2] * invN],
                        loop3D: invN < 0 ? rings[0].pts.slice() : rings[0].pts.slice().reverse()
                    });
                }
                if (opts.capEnd && rings.length > 0 && rings[rings.length - 1].r > 0.2) {
                    const TN = rings[rings.length - 1].T;
                    faces3D.push({
                        side: 'cap_end',
                        noWireframe: true,
                        normal: [TN[0] * invN, TN[1] * invN, TN[2] * invN],
                        loop3D: invN < 0 ? rings[rings.length - 1].pts.slice().reverse() : rings[rings.length - 1].pts.slice()
                    });
                }

                let ringWires = opts.ringWireframeIndices;
                if (!ringWires && opts.ringStep && rings.length > 0) {
                    ringWires = [0];
                    for (let ri = opts.ringStep; ri < rings.length - 1; ri += opts.ringStep) ringWires.push(ri);
                    if (rings.length > 1) ringWires.push(rings.length - 1);
                }
                (ringWires || []).forEach(idx => {
                    if (rings[idx]) wireframeLines3D.push(rings[idx].pts.concat([rings[idx].pts[0]]));
                });

                return {
                    id: opts.id,
                    name: opts.name,
                    role: opts.role || 'appliance_front',
                    material: opts.material || 'steel_chrome',
                    colorRgb: normRgb(opts.colorRgb, COLOR_STEEL_CHROME),
                    x0: Math.floor(minX), x1: Math.ceil(maxX),
                    y0: Math.floor(minY), y1: Math.ceil(maxY),
                    z0: Math.floor(minZ), z1: Math.ceil(maxZ),
                    faces3D,
                    wireframeLines3D
                };
            }

            // Build complete 3D Front-Loading Appliance (Washer or Dryer) with recessed stainless drum,
            // 3D agitator paddles, smooth 32-segment chrome porthole bezel, concave glass bowl, and control fascia
            function addFrontLoadApplianceParts(skeleton, prefix, labelPrefix, x0, x1, z0, z1, isDryer) {
                const cx = Math.round((x0 + x1) * 0.5); // 18,880 mm
                const cz = z0 + 435;                    // Porthole center Z
                const yApp0 = y0 + 25;
                const yApp1 = yCarcass1 - 6;            // 12,024 mm front appliance face
                const yDrumBack = yApp1 - 240;          // 240 mm deep visible stainless steel drum
                const rHole = 156;                      // Inner drum radius

                // 1. Appliance Enamel Body with Recessed Drum Cavity (4 surround blocks + rear box)
                skeleton.push(
                    {
                        id: `${prefix}_CHASSIS_REAR`,
                        name: `${labelPrefix} Rear Enamel Chassis (600×360×850 mm)`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: COLOR_APPLIANCE_BODY,
                        x0: x0 + 25, x1: x1 - 25,
                        y0: yApp0, y1: yDrumBack,
                        z0: z0 + 20, z1: z1 - 25
                    },
                    {
                        id: `${prefix}_CHASSIS_LEFT_CHEEK`,
                        name: `${labelPrefix} Left Front Enamel Cheek`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: COLOR_APPLIANCE_BODY,
                        x0: cx + rHole, x1: x1 - 25,
                        y0: yDrumBack, y1: yApp1,
                        z0: z0 + 20, z1: z1 - 145
                    },
                    {
                        id: `${prefix}_CHASSIS_RIGHT_CHEEK`,
                        name: `${labelPrefix} Right Front Enamel Cheek`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: COLOR_APPLIANCE_BODY,
                        x0: x0 + 25, x1: cx - rHole,
                        y0: yDrumBack, y1: yApp1,
                        z0: z0 + 20, z1: z1 - 145
                    },
                    {
                        id: `${prefix}_CHASSIS_LOWER_APRON`,
                        name: `${labelPrefix} Lower Front Enamel Apron`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: COLOR_APPLIANCE_BODY,
                        x0: cx - rHole, x1: cx + rHole,
                        y0: yDrumBack, y1: yApp1,
                        z0: z0 + 20, z1: cz - rHole
                    },
                    {
                        id: `${prefix}_CHASSIS_UPPER_FASCIA`,
                        name: `${labelPrefix} Top Control Fascia Panel (600×240×120 mm)`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: COLOR_APPLIANCE_BODY,
                        x0: x0 + 25, x1: x1 - 25,
                        y0: yDrumBack, y1: yApp1 + 4,
                        z0: cz + rHole, z1: z1 - 25,
                        wireframeLines3D: [
                            // Crisp control panel horizontal seam & vertical drawer divider
                            [[x0 + 26, yApp1 + 4.5, z1 - 140], [x1 - 26, yApp1 + 4.5, z1 - 140]],
                            [[cx + 58, yApp1 + 4.5, z1 - 140], [cx + 58, yApp1 + 4.5, z1 - 26]],
                            // Lower service kickplate seam
                            [[x0 + 26, yApp1 + 0.8, z0 + 135], [x1 - 26, yApp1 + 0.8, z0 + 135]]
                        ]
                    }
                );

                // 2. Smooth 32-Segment Brushed Stainless Steel Inner Rotating Drum (facing inward)
                skeleton.push(buildLaundryTubePart({
                    id: `${prefix}_STAINLESS_DRUM`,
                    name: `${labelPrefix} Brushed Stainless Steel Rotating Drum (Ø312 mm, D=235 mm)`,
                    role: 'appliance_front',
                    material: 'steel_chrome',
                    colorRgb: [0.64, 0.69, 0.73],
                    numSegs: 32,
                    invertNormals: true,
                    spine: [
                        [cx, yDrumBack + 4, cz, 2],
                        [cx, yDrumBack + 6, cz, 146],
                        [cx, yDrumBack + 85, cz, 154],
                        [cx, yDrumBack + 165, cz, 154],
                        [cx, yApp1 - 6, cz, 150]
                    ],
                    ringWireframeIndices: [1, 2, 3]
                }));

                // 3. Three 3D Stainless Steel Drum Lifter Paddles inside the drum (at 90°, 210°, 330°)
                [Math.PI * 0.5, Math.PI * 1.167, Math.PI * 1.833].forEach((ang, pIdx) => {
                    const px = Math.round(cx + Math.cos(ang) * 134);
                    const pz = Math.round(cz + Math.sin(ang) * 134);
                    skeleton.push({
                        id: `${prefix}_DRUM_PADDLE_${pIdx + 1}`,
                        name: `${labelPrefix} Stainless Steel Drum Agitator Paddle #${pIdx + 1}`,
                        role: 'appliance_front',
                        material: 'steel_chrome',
                        colorRgb: [0.76, 0.80, 0.84],
                        x0: px - 16, x1: px + 16,
                        y0: yDrumBack + 25, y1: yApp1 - 35,
                        z0: pz - 16, z1: pz + 16
                    });
                });

                // 4. Smooth 36-Segment Sculpted Brushed Chrome Outer Porthole Door Bezel Ring (R=204 -> R=164 mm)
                skeleton.push(buildLaundryTubePart({
                    id: `${prefix}_CHROME_BEZEL_RING`,
                    name: `${labelPrefix} Turned-Chrome Outer Porthole Door Bezel (Ø408 mm)`,
                    role: 'appliance_front',
                    material: 'steel_chrome',
                    colorRgb: [0.83, 0.86, 0.89],
                    numSegs: 36,
                    spine: [
                        [cx, yApp1 - 2, cz, 160],
                        [cx, yApp1 + 2, cz, 204],
                        [cx, yApp1 + 18, cz, 202],
                        [cx, yApp1 + 26, cz, 174],
                        [cx, yApp1 + 20, cz, 162]
                    ],
                    ringWireframeIndices: [1, 2, 3]
                }));

                // 5. Smooth 36-Segment Dark Anthracite Inner Door Frame & Gasket Ring (R=164 -> R=146 mm)
                skeleton.push(buildLaundryTubePart({
                    id: `${prefix}_INNER_DARK_RING`,
                    name: `${labelPrefix} Dark Anthracite Inner Porthole Frame Ring (Ø348 mm)`,
                    role: 'appliance_window',
                    material: 'glass_tinted',
                    colorRgb: [0.18, 0.21, 0.24],
                    numSegs: 36,
                    spine: [
                        [cx, yApp1 + 24, cz, 174],
                        [cx, yApp1 + 28, cz, 164],
                        [cx, yApp1 + 22, cz, 146],
                        [cx, yApp1 - 4, cz, 146]
                    ],
                    ringWireframeIndices: [1, 2]
                }));

                // 6. Smooth 32-Segment Concave Translucent Glass Porthole Bowl curving into the drum
                skeleton.push(buildLaundryTubePart({
                    id: `${prefix}_CONCAVE_GLASS_BOWL`,
                    name: `${labelPrefix} Concave Tempered Glass Porthole Dome (Ø292 mm)`,
                    role: 'vitrine_glass',
                    material: 'glass_tinted',
                    colorRgb: [0.52, 0.68, 0.78],
                    numSegs: 32,
                    spine: [
                        [cx, yApp1 + 18, cz, 146],
                        [cx, yApp1 - 12, cz, 124],
                        [cx, yApp1 - 42, cz, 86],
                        [cx, yApp1 - 56, cz, 2]
                    ],
                    capEnd: true
                }));

                // 7. Smooth Curved Porthole Door Handle Grip at 3 o'clock (East side of bezel) & Hinge at 9 o'clock
                skeleton.push(
                    buildLaundryTubePart({
                        id: `${prefix}_DOOR_HANDLE_GRIP`,
                        name: `${labelPrefix} Ergonomic Curved Chrome Door Handle`,
                        role: 'appliance_front',
                        material: 'steel_chrome',
                        colorRgb: [0.52, 0.58, 0.63],
                        numSegs: 18,
                        spine: [
                            [cx - 182, yApp1 + 18, cz - 58, 9],
                            [cx - 186, yApp1 + 31, cz - 32, 11],
                            [cx - 188, yApp1 + 33, cz, 11],
                            [cx - 186, yApp1 + 31, cz + 32, 11],
                            [cx - 182, yApp1 + 18, cz + 58, 9]
                        ]
                    }),
                    // Top Control Fascia: Recessed Finger-Pocket Drawer (Left)
                    {
                        id: `${prefix}_DRAWER_FRONT`,
                        name: isDryer
                            ? `${labelPrefix} Condensate Water Tank Drawer with Recessed Pull Pocket`
                            : `${labelPrefix} Detergent Dispenser Drawer with Recessed Pull Pocket`,
                        role: 'appliance_body',
                        material: 'appliance_white',
                        colorRgb: [0.91, 0.93, 0.95],
                        x0: cx + 64, x1: x1 - 32,
                        y0: yApp1 + 3, y1: yApp1 + 10,
                        z0: z1 - 132, z1: z1 - 34,
                        wireframeLines3D: [
                            [[cx + 64, yApp1 + 10.5, z1 - 54], [x1 - 32, yApp1 + 10.5, z1 - 54]]
                        ]
                    },
                    {
                        id: `${prefix}_DRAWER_POCKET_RECESS`,
                        name: `${labelPrefix} Drawer Chrome Finger-Pull Trim Bar`,
                        role: 'appliance_front',
                        material: 'steel_chrome',
                        colorRgb: COLOR_APPLIANCE_RING,
                        x0: cx + 88, x1: x1 - 56,
                        y0: yApp1 + 4, y1: yApp1 + 12,
                        z0: z1 - 56, z1: z1 - 44
                    },
                    // Top Control Fascia: Turned-Chrome Rotary Program Selector Dial (Center)
                    buildLaundryTubePart({
                        id: `${prefix}_PROGRAM_DIAL_KNOB`,
                        name: `${labelPrefix} Turned-Aluminum Rotary Program Selector Knob (Ø48 mm)`,
                        role: 'appliance_front',
                        material: 'steel_chrome',
                        colorRgb: [0.82, 0.85, 0.88],
                        numSegs: 28,
                        spine: [
                            [cx, yApp1 + 4, z1 - 82, 25],
                            [cx, yApp1 + 9, z1 - 82, 24],
                            [cx, yApp1 + 24, z1 - 82, 22],
                            [cx, yApp1 + 26, z1 - 82, 18],
                            [cx, yApp1 + 26.5, z1 - 82, 1]
                        ],
                        capEnd: true,
                        ringWireframeIndices: [1, 2]
                    }),
                    // Top Control Fascia: Black-Glass Digital LED Touch Display (Right)
                    {
                        id: `${prefix}_LED_TOUCH_DISPLAY`,
                        name: `${labelPrefix} Black-Glass Digital Cycle Touch Display (185×8×68 mm)`,
                        role: 'appliance_window',
                        material: 'glass_tinted',
                        colorRgb: [0.10, 0.13, 0.16],
                        x0: x0 + 38, x1: cx - 42,
                        y0: yApp1 + 4, y1: yApp1 + 11,
                        z0: z1 - 116, z1: z1 - 48,
                        wireframeLines3D: [
                            // Glowing digital status bar & cycle time indicator lines
                            [[x0 + 54, yApp1 + 11.4, z1 - 74], [cx - 88, yApp1 + 11.4, z1 - 74]],
                            [[x0 + 54, yApp1 + 11.4, z1 - 92], [cx - 110, yApp1 + 11.4, z1 - 92]]
                        ]
                    },
                    // Lower Service Detail (Pump Filter Door on Washer / Heat-Exchanger Louver Grille on Dryer)
                    {
                        id: `${prefix}_LOWER_SERVICE_DETAIL`,
                        name: isDryer
                            ? `${labelPrefix} Heat-Pump Condenser Airflow Louver Grille`
                            : `${labelPrefix} Drain Pump Filter Service Access Flap`,
                        role: 'appliance_front',
                        material: 'steel_chrome',
                        colorRgb: [0.84, 0.87, 0.90],
                        x0: x0 + 44, x1: isDryer ? (x0 + 215) : (x0 + 138),
                        y0: yApp1 + 1, y1: yApp1 + 5,
                        z0: z0 + 38, z1: z0 + 116,
                        wireframeLines3D: isDryer ? [
                            [[x0 + 52, yApp1 + 5.4, z0 + 54], [x0 + 207, yApp1 + 5.4, z0 + 54]],
                            [[x0 + 52, yApp1 + 5.4, z0 + 70], [x0 + 207, yApp1 + 5.4, z0 + 70]],
                            [[x0 + 52, yApp1 + 5.4, z0 + 86], [x0 + 207, yApp1 + 5.4, z0 + 86]],
                            [[x0 + 52, yApp1 + 5.4, z0 + 102], [x0 + 207, yApp1 + 5.4, z0 + 102]]
                        ] : []
                    }
                );
            }

            // -----------------------------------------------------------------
            // 41. CAB_LAUNDRY_LEFT_TALL: Leftmost 450 × 2,400 mm Tall Cabinet with 150 mm Plinth
            //     (d = 670..1,120 mm from West wall -> X = 19,205..19,655 mm, Z = 0..2,400 mm)
            // -----------------------------------------------------------------
            function buildLaundryLeftTallCabinet() {
                const x0 = 19205, x1 = 19655; // 450 mm wide
                const zPlinth = 150, zTop = 2400;
                const skeleton = [
                    // 150 mm Plinth base (Z = 0..150 mm, recessed 40 mm)
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_PLINTH',
                        name: 'Recessed 150mm Plinth Base (450×590×150 mm, Z=0..150 mm)',
                        role: 'plinth',
                        material: 'plinth_dark',
                        colorRgb: COLOR_PLINTH_DARK,
                        x0: x0, x1: x1,
                        y0: y0, y1: yCarcass1 - 40,
                        z0: 0, z1: zPlinth
                    },
                    // Plinth oak kickplate
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_KICKPLATE',
                        name: 'Front Plinth Line Kickplate (450×20×150 mm, Z=0..150 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x1,
                        y0: yCarcass1 - 20, y1: yCarcass1,
                        z0: 0, z1: zPlinth
                    },
                    // Left (East) & Right (West) Side Panels (Z = 150..2,400 mm)
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_WEST_PANEL',
                        name: 'Left/West Outer Carcass Panel (20×630×2250 mm, Z=150..2400 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: zPlinth, z1: zTop
                    },
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_EAST_PANEL',
                        name: 'Right/East Side Carcass Panel (20×630×2250 mm, Z=150..2400 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: zPlinth, z1: zTop
                    },
                    // Back Panel
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_BACK_PANEL',
                        name: 'Rear Backing Panel (410×20×2250 mm, Z=150..2400 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: zPlinth, z1: zTop
                    },
                    // Bottom & Top Carcass Panels
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_BOTTOM',
                        name: 'Bottom Carcass Shelf above 150mm Plinth (410×610×20 mm, Z=150..170 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: zPlinth, z1: zPlinth + b
                    },
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_TOP',
                        name: 'Top Ceiling Panel (410×610×20 mm, Z=2380..2400 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: zTop - b, z1: zTop
                    }
                ];

                // Internal shelves at Z = 900, 1,350, 1,800, 2,100 mm
                [900, 1350, 1800, 2100].forEach((sz, idx) => {
                    skeleton.push({
                        id: `CAB_LAUNDRY_LEFT_TALL_SHELF_${idx + 1}`,
                        name: `Internal Utility Shelf #${idx + 1} (Z=${sz}..${sz + b} mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1 - 10,
                        z0: sz, z1: sz + b
                    });
                });

                const fronts = [
                    {
                        id: 'CAB_LAUNDRY_LEFT_TALL_DOOR',
                        name: 'Tall Utility Cabinet Hinged Door (446×20×2246 mm, Z=152..2398 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: zPlinth + 2, z1: zTop - 2
                    }
                ];

                return {
                    id: 'CAB_LAUNDRY_LEFT_TALL',
                    name: 'CAB_LAUNDRY_LEFT_TALL — Leftmost Tall Laundry Cabinet with 150mm Plinth (450×650×2400mm)',
                    shortName: 'Laundry Tall Cabinet (450×2400mm)',
                    category: 'tall_cabinet',
                    subtype: 'laundry_tall_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'EW_ALCOVE_SOUTH',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: 0, zTop: zTop,
                    widthMm: 450, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: zPlinth, plinthRecessMm: 40,
                    bodyHeightMm: zTop - zPlinth, heightMm: zTop,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '450 × 650 × 2,400 mm (X = 19,205..19,655 mm, Y = 11,400..12,050 mm, Z = 0..2,400 mm) • 150 mm Plinth (Z = 0..150 mm) • Positioned 670 mm from West Wall',
                    description: 'Leftmost 450 × 2,400 mm tall laundry cabinet with a 150 mm plinth (Z = 0..150 mm), positioned after the 670 mm left wall clearance on the Laundry North Wall.',
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            // -----------------------------------------------------------------
            // 42. CAB_LAUNDRY_WASHER: 650 × 900 mm Washing Machine Cabinet ("Pralka")
            //     (d = 1,120..1,770 mm from West wall -> X = 18,555..19,205 mm, Z = 0..900 mm)
            // -----------------------------------------------------------------
            function buildLaundryWasherCabinet() {
                const x0 = 18555, x1 = 19205; // 650 mm wide
                const z0 = 0, z1 = 900;

                const skeleton = [
                    // Outer 650×900 mm Warm-Oak Carcass Frame
                    {
                        id: 'CAB_LAUNDRY_WASHER_WEST_PANEL',
                        name: 'Washer Housing Left/West Panel (20×630×900 mm, Z=0..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_WASHER_EAST_PANEL',
                        name: 'Washer Housing Right/East Panel (20×630×900 mm, Z=0..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_WASHER_BOTTOM_PANEL',
                        name: 'Washer Housing Base Deck (610×630×20 mm, Z=0..20 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z0 + b
                    },
                    {
                        id: 'CAB_LAUNDRY_WASHER_TOP_PANEL',
                        name: 'Washer/Dryer Stacking Deck (610×630×20 mm, Z=880..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: yCarcass1,
                        z0: z1 - b, z1: z1
                    }
                ];

                addFrontLoadApplianceParts(skeleton, 'LAUNDRY_WASHER', 'Pralka (Washing Machine)', x0, x1, z0, z1, false);

                return {
                    id: 'CAB_LAUNDRY_WASHER',
                    name: 'CAB_LAUNDRY_WASHER — Washing Machine ("Pralka") & 650×900mm Housing Cabinet',
                    shortName: 'Pralka / Washer (650×900mm)',
                    category: 'appliance',
                    subtype: 'washing_machine_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: 650, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: 0,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 900, heightMm: 900,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '650 × 650 × 900 mm (X = 18,555..19,205 mm, Y = 11,400..12,050 mm, Z = 0..900 mm) • Built-in Front-Loading Washing Machine ("Pralka") with Ø408 mm Turned-Chrome Bezel, Concave Glass Dome & Stainless Drum',
                    description: '650 × 900 mm lower appliance housing cabinet containing the front-loading washing machine ("Pralka") with a 32-segment stainless steel inner drum, 3D agitator paddles, concave glass porthole dome, and rotary program dial.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 43. CAB_LAUNDRY_DRYER: 650 × 900 mm Stacked Tumble Dryer Cabinet ("Suszarka")
            //     (d = 1,120..1,770 mm from West wall -> X = 18,555..19,205 mm, Z = 900..1,800 mm)
            // -----------------------------------------------------------------
            function buildLaundryDryerCabinet() {
                const x0 = 18555, x1 = 19205; // 650 mm wide
                const z0 = 900, z1 = 1800;

                const skeleton = [
                    // Outer 650×900 mm Warm-Oak Carcass Frame (Z = 900..1,800 mm)
                    {
                        id: 'CAB_LAUNDRY_DRYER_WEST_PANEL',
                        name: 'Dryer Housing Left/West Panel (20×630×900 mm, Z=900..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_DRYER_EAST_PANEL',
                        name: 'Dryer Housing Right/East Panel (20×630×900 mm, Z=900..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_DRYER_TOP_PANEL',
                        name: 'Dryer Housing Top Ceiling Panel (610×630×20 mm, Z=1780..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: yCarcass1,
                        z0: z1 - b, z1: z1
                    }
                ];

                addFrontLoadApplianceParts(skeleton, 'LAUNDRY_DRYER', 'Suszarka (Tumble Dryer)', x0, x1, z0, z1, true);

                return {
                    id: 'CAB_LAUNDRY_DRYER',
                    name: 'CAB_LAUNDRY_DRYER — Stacked Tumble Dryer ("Suszarka") & 650×900mm Housing Cabinet',
                    shortName: 'Suszarka / Dryer (650×900mm)',
                    category: 'appliance',
                    subtype: 'tumble_dryer_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: 650, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: 0,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 900, heightMm: 900,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '650 × 650 × 900 mm (X = 18,555..19,205 mm, Y = 11,400..12,050 mm, Z = 900..1,800 mm) • Stacked Heat-Pump Tumble Dryer ("Suszarka") with Ø408 mm Turned-Chrome Bezel, Concave Glass Dome & Stainless Drum',
                    description: '650 × 900 mm upper appliance housing cabinet stacked directly above the washing machine at Z = 900..1,800 mm, housing the heat-pump tumble dryer ("Suszarka") with stainless steel drum, paddles, concave glass dome, and condenser louver grille.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 44. CAB_LAUNDRY_BASE_800: 800 × 900 mm Lower Cabinet with 400+400 mm Center Split
            //     (d = 1,770..2,570 mm from West wall -> X = 17,755..18,555 mm, Z = 0..900 mm)
            // -----------------------------------------------------------------
            function buildLaundryBase800Cabinet() {
                const x0 = 17755, x1 = 18555; // 800 mm wide
                const xMid = 18155;          // Center split (400 + 400 mm, x=217 in laundry.html)
                const z0 = 0, z1 = 900;

                const skeleton = [
                    {
                        id: 'CAB_LAUNDRY_BASE_800_WEST_PANEL',
                        name: 'Left/West Carcass Side Panel (20×630×900 mm, Z=0..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_EAST_PANEL',
                        name: 'Right/East Carcass Side Panel (20×630×900 mm, Z=0..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_CENTER_SPLIT',
                        name: 'Center Vertical Divider Panel — 400+400mm Split (20×610×860 mm, X=18145..18165 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xMid - 10, x1: xMid + 10,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0 + b, z1: z1 - b
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_BACK_PANEL',
                        name: 'Rear Backing Panel (760×20×900 mm, Z=0..900 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_BOTTOM_PANEL',
                        name: 'Bottom Carcass Panel (760×610×20 mm, Z=0..20 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0, z1: z0 + b
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_TOP_PANEL',
                        name: 'Top Countertop Deck Panel (800×650×20 mm, Z=880..900 mm)',
                        role: 'countertop',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x1,
                        y0: y0, y1: yFront1,
                        z0: z1 - b, z1: z1
                    },
                    // Mid-height internal shelves inside both 400 mm bays (Z = 440..460 mm)
                    {
                        id: 'CAB_LAUNDRY_BASE_800_SHELF_LEFT',
                        name: 'Left 400mm Bay Internal Shelf (370×590×20 mm, Z=440..460 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xMid + 10, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1 - 10,
                        z0: 440, z1: 460
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_SHELF_RIGHT',
                        name: 'Right 400mm Bay Internal Shelf (370×590×20 mm, Z=440..460 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: xMid - 10,
                        y0: y0 + b, y1: yCarcass1 - 10,
                        z0: 440, z1: 460
                    }
                ];

                const fronts = [
                    {
                        id: 'CAB_LAUNDRY_BASE_800_DOOR_LEFT',
                        name: 'Left 400mm Hinged Door (396×20×876 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: xMid + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - b - 2
                    },
                    {
                        id: 'CAB_LAUNDRY_BASE_800_DOOR_RIGHT',
                        name: 'Right 400mm Hinged Door (396×20×876 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: xMid - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - b - 2
                    }
                ];

                return {
                    id: 'CAB_LAUNDRY_BASE_800',
                    name: 'CAB_LAUNDRY_BASE_800 — Lower 800×900mm Double Cabinet (400+400mm Split)',
                    shortName: 'Laundry Base 800mm (400+400mm)',
                    category: 'base_cabinet',
                    subtype: 'laundry_base_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: 800, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 900, heightMm: 900,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '800 × 650 × 900 mm (X = 17,755..18,555 mm, Y = 11,400..12,050 mm, Z = 0..900 mm) • Center vertical split (400 + 400 mm at X = 18,155 mm)',
                    description: '800 × 900 mm lower laundry base cabinet located between the washer/dryer tower and the utility sink cabinet, divided centrally into two 400 mm bays (400 + 400 mm).',
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            // -----------------------------------------------------------------
            // 45. LAUNDRY_HANGING_NICHE: 800 × 900 mm Hanging Drying Zone with Closet Rod (Z=1600mm),
            //     4 Sculpted 3D Coat Hangers + Garments, & 900 mm Vertical Divider Panel at X = 17,755 mm
            // -----------------------------------------------------------------
            function buildLaundryHangingNiche() {
                const x0 = 17755, x1 = 18555; // 800 mm wide (d = 1,770..2,570 mm)
                const z0 = 900, z1 = 1800;
                const zRod = 1600;            // y = 100 in laundry.html -> 260-100 = 160 -> Z = 1,600 mm
                const yRod = y0 + 325;        // Centered at 325 mm depth (Y = 11,725 mm)

                const skeleton = [
                    // Vertical Divider Panel above left edge of sink cabinet (X = 17,745..17,765 mm, Z = 900..1,800 mm)
                    // Matches <line x1="257" y1="170" x2="257" y2="80" stroke="#8E6B47" /> in laundry.html
                    {
                        id: 'LAUNDRY_HANGING_NICHE_DIVIDER',
                        name: 'Vertical Partition Panel between Hanging Zone & Sink Zone (20×630×900 mm, Z=900..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 - 10, x1: x0 + 10,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    }
                ];

                // 1. Smooth 24-segment Cylindrical Brushed Chrome Closet Rod (Ø28 mm, X = 17,765..18,555 mm)
                const rodSpine = [
                    { cx: x1, cy: yRod, cz: zRod, r: 14 },
                    { cx: x0 + 10, cy: yRod, cz: zRod, r: 14 }
                ];
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_CLOSET_ROD_CYLINDER',
                    name: 'Smooth Cylindrical Brushed Chrome Closet Rod (Ø28×790 mm at Z=1600 mm)',
                    role: 'handle_rail',
                    material: 'steel_chrome',
                    colorRgb: [224, 229, 235],
                    spine: rodSpine,
                    segments: 24,
                    upHint: [0, 0, 1],
                    capStart: false,
                    capEnd: false,
                    ringStep: 1
                }));

                // 2. Turned Chrome End-Socket Flanges (West at X = 18,555 mm, East at X = 17,765 mm)
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_CLOSET_ROD_MOUNT_WEST',
                    name: 'Closet Rod West Mounting Socket Rosette (Ø52 mm at X=18555 mm)',
                    role: 'handle_rail',
                    material: 'steel_chrome',
                    colorRgb: [200, 206, 214],
                    spine: [
                        { cx: x1, cy: yRod, cz: zRod, r: 26 },
                        { cx: x1 - 6, cy: yRod, cz: zRod, r: 26 },
                        { cx: x1 - 10, cy: yRod, cz: zRod, r: 19 },
                        { cx: x1 - 18, cy: yRod, cz: zRod, r: 18 }
                    ],
                    segments: 24,
                    upHint: [0, 0, 1],
                    capStart: false,
                    capEnd: true,
                    ringStep: 1
                }));
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_CLOSET_ROD_MOUNT_EAST',
                    name: 'Closet Rod East Mounting Socket Rosette (Ø52 mm at X=17765 mm)',
                    role: 'handle_rail',
                    material: 'steel_chrome',
                    colorRgb: [200, 206, 214],
                    spine: [
                        { cx: x0 + 10, cy: yRod, cz: zRod, r: 26 },
                        { cx: x0 + 16, cy: yRod, cz: zRod, r: 26 },
                        { cx: x0 + 20, cy: yRod, cz: zRod, r: 19 },
                        { cx: x0 + 28, cy: yRod, cz: zRod, r: 18 }
                    ],
                    segments: 24,
                    upHint: [0, 0, 1],
                    capStart: false,
                    capEnd: true,
                    ringStep: 1
                }));

                // 3. Four Sculpted 3D Coat Hangers + 2 Hung Drying Shirts along the Closet Rod
                const hangerConfigs = [
                    { x: 18410, hasGarment: true, garmentColor: [232, 236, 242], garmentName: 'Crisp White Linen Shirt' },
                    { x: 18240, hasGarment: true, garmentColor: [182, 198, 214], garmentName: 'Chambray Blue Oxford Shirt' },
                    { x: 18070, hasGarment: false },
                    { x: 17900, hasGarment: false }
                ];

                for (let hi = 0; hi < hangerConfigs.length; hi++) {
                    const hc = hangerConfigs[hi];
                    const hx = hc.x;

                    // 3a. Smooth Chrome Wire Hanger Hook wrapping around the Ø28 mm rod
                    const hookSpine = [
                        { cx: hx, cy: yRod, cz: 1532, r: 3.2 },
                        { cx: hx, cy: yRod, cz: 1562, r: 3.2 },
                        { cx: hx, cy: yRod - 14, cz: 1580, r: 3.2 },
                        { cx: hx, cy: yRod - 22, cz: 1600, r: 3.2 },
                        { cx: hx, cy: yRod - 15, cz: 1620, r: 3.2 },
                        { cx: hx, cy: yRod, cz: 1626, r: 3.2 },
                        { cx: hx, cy: yRod + 16, cz: 1618, r: 3.2 },
                        { cx: hx, cy: yRod + 21, cz: 1602, r: 2.8 }
                    ];
                    skeleton.push(buildLaundryTubePart({
                        id: `LAUNDRY_HANGER_${hi + 1}_HOOK`,
                        name: `Coat Hanger #${hi + 1} Chrome Swivel Hook`,
                        role: 'handle_rail',
                        material: 'steel_chrome',
                        colorRgb: [228, 233, 240],
                        spine: hookSpine,
                        segments: 12,
                        upHint: [1, 0, 0],
                        capStart: true,
                        capEnd: true,
                        ringStep: 3
                    }));

                    // 3b. Contoured Wooden Hanger Body (Sloped Shoulders along Y = yRod-195 .. yRod+195)
                    const hw = 7; // Half-thickness in X (14 mm thick tailored wooden hanger)
                    const hVerts = [
                        // Rear shoulder tip (0, 1)
                        [hx - hw, yRod - 195, 1455], [hx + hw, yRod - 195, 1455],
                        // Rear shoulder upper slope (2, 3)
                        [hx - hw, yRod - 185, 1474], [hx + hw, yRod - 185, 1474],
                        // Center neck apex (4, 5)
                        [hx - hw, yRod,       1536], [hx + hw, yRod,       1536],
                        // Front shoulder upper slope (6, 7)
                        [hx - hw, yRod + 185, 1474], [hx + hw, yRod + 185, 1474],
                        // Front shoulder tip (8, 9)
                        [hx - hw, yRod + 195, 1455], [hx + hw, yRod + 195, 1455],
                        // Front lower inner shoulder (10, 11)
                        [hx - hw, yRod + 150, 1452], [hx + hw, yRod + 150, 1452],
                        // Center neck lower arch (12, 13)
                        [hx - hw, yRod,       1506], [hx + hw, yRod,       1506],
                        // Rear lower inner shoulder (14, 15)
                        [hx - hw, yRod - 150, 1452], [hx + hw, yRod - 150, 1452]
                    ];
                    const hFaces = [
                        // East face (hx - hw)
                        [0, 2, 14], [2, 4, 12, 14], [4, 6, 10, 12], [6, 8, 10],
                        // West face (hx + hw)
                        [1, 15, 3], [3, 15, 13, 5], [5, 13, 11, 7], [7, 11, 9],
                        // Top sloped bevels
                        [0, 1, 3, 2], [2, 3, 5, 4], [4, 5, 7, 6], [6, 7, 9, 8],
                        // Bottom inner arch bevels
                        [8, 9, 11, 10], [10, 11, 13, 12], [12, 13, 15, 14], [14, 15, 1, 0]
                    ];
                    const hWire = [
                        [0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 0],
                        [1, 3], [3, 5], [5, 7], [7, 9], [9, 11], [11, 13], [13, 15], [15, 1],
                        [0, 1], [4, 5], [8, 9]
                    ];
                    skeleton.push(buildIndexedMeshPart({
                        id: `LAUNDRY_HANGER_${hi + 1}_BODY`,
                        name: `Coat Hanger #${hi + 1} Contoured Oak Shoulder Frame (390 mm span)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: hx - hw, x1: hx + hw,
                        y0: yRod - 195, y1: yRod + 195,
                        z0: 1452, z1: 1536,
                        vertices3D: hVerts,
                        faces3D: hFaces,
                        wireframeIndices: hWire
                    }));

                    // 3c. Cylindrical Trouser Crossbar (Y = yRod-165 .. yRod+165 at Z = 1,454 mm)
                    skeleton.push(buildLaundryTubePart({
                        id: `LAUNDRY_HANGER_${hi + 1}_BAR`,
                        name: `Coat Hanger #${hi + 1} Trouser Crossbar`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        spine: [
                            { cx: hx, cy: yRod - 165, cz: 1454, r: 4.5 },
                            { cx: hx, cy: yRod + 165, cz: 1454, r: 4.5 }
                        ],
                        segments: 10,
                        upHint: [1, 0, 0],
                        capStart: false,
                        capEnd: false,
                        ringStep: 2
                    }));

                    // 3d. Sculpted Hanging Garment / Shirt on Hangers #1 and #2
                    if (hc.hasGarment) {
                        const gw = 20; // 40 mm softly draped garment thickness
                        const gVerts = [
                            // Collar apex (0, 1)
                            [hx - gw + 4, yRod,       1524], [hx + gw - 4, yRod,       1524],
                            // Rear shoulder (2, 3)
                            [hx - gw,     yRod - 198, 1466], [hx + gw,     yRod - 198, 1466],
                            // Front shoulder (4, 5)
                            [hx - gw,     yRod + 198, 1466], [hx + gw,     yRod + 198, 1466],
                            // Rear sleeve cuff (6, 7)
                            [hx - gw + 2, yRod - 222, 1180], [hx + gw - 2, yRod - 222, 1180],
                            // Front sleeve cuff (8, 9)
                            [hx - gw + 2, yRod + 222, 1180], [hx + gw - 2, yRod + 222, 1180],
                            // Rear underarm (10, 11)
                            [hx - gw,     yRod - 165, 1340], [hx + gw,     yRod - 165, 1340],
                            // Front underarm (12, 13)
                            [hx - gw,     yRod + 165, 1340], [hx + gw,     yRod + 165, 1340],
                            // Rear bottom hem (14, 15)
                            [hx - gw + 3, yRod - 172, 1045], [hx + gw - 3, yRod - 172, 1045],
                            // Front bottom hem (16, 17)
                            [hx - gw + 3, yRod + 172, 1045], [hx + gw - 3, yRod + 172, 1045]
                        ];
                        const gFaces = [
                            // East side of garment
                            [0, 2, 10, 12, 4], [2, 6, 10], [4, 12, 8], [10, 14, 16, 12],
                            // West side of garment
                            [1, 5, 13, 11, 3], [3, 11, 7], [5, 9, 13], [11, 13, 17, 15],
                            // Top shoulders & collar
                            [0, 1, 3, 2], [0, 4, 5, 1],
                            // Outer sleeves & cuffs
                            [2, 3, 7, 6], [6, 7, 11, 10], [4, 8, 9, 5], [8, 12, 13, 9],
                            // Side seams & bottom hem
                            [10, 11, 15, 14], [12, 16, 17, 13], [14, 15, 17, 16]
                        ];
                        const gWire = [
                            [0, 2], [2, 6], [6, 10], [10, 14], [14, 16], [16, 12], [12, 8], [8, 4], [4, 0],
                            [1, 3], [3, 7], [7, 11], [11, 15], [15, 17], [17, 13], [13, 9], [9, 5], [5, 1],
                            [0, 1], [2, 3], [4, 5], [14, 15], [16, 17]
                        ];
                        skeleton.push(buildIndexedMeshPart({
                            id: `LAUNDRY_HANGER_${hi + 1}_GARMENT`,
                            name: `Hanging Garment #${hi + 1}: ${hc.garmentName}`,
                            role: 'front_panel',
                            material: 'front_cashmere',
                            colorRgb: hc.garmentColor,
                            x0: hx - gw, x1: hx + gw,
                            y0: yRod - 222, y1: yRod + 222,
                            z0: 1045, z1: 1524,
                            vertices3D: gVerts,
                            faces3D: gFaces,
                            wireframeIndices: gWire
                        }));
                    }
                }

                return {
                    id: 'LAUNDRY_HANGING_NICHE',
                    name: 'LAUNDRY_HANGING_NICHE — 800×900mm Hanging Drying Zone with Closet Rod (Z=1600mm), 4 Coat Hangers & Divider',
                    shortName: 'Laundry Closet Rod & Hangers (800×900mm)',
                    category: 'wall_cabinet',
                    subtype: 'laundry_hanging_niche',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0 - 10, x2: x1,
                    y1: y0, y2: yCarcass1,
                    zBottom: z0, zTop: z1,
                    widthMm: 800, depthMm: LAUNDRY_CARCASS_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: 0,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 900, heightMm: 900,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '800 × 630 × 900 mm (X = 17,755..18,555 mm, Y = 11,400..12,030 mm, Z = 900..1,800 mm) • Smooth Ø28 mm Chrome Closet Rod at Z = 1,600 mm • 4 Contoured Wooden Coat Hangers & 2 Hanging Shirts • 900 mm Vertical Partition',
                    description: 'Open 800 × 900 mm shirt & garment air-drying niche above the 800 mm base cabinet, equipped with a cylindrical chrome closet rod at Z = 1,600 mm, turned mounting sockets, 4 contoured oak coat hangers with chrome hooks, 2 hanging shirts, and a 900 mm vertical partition.',
                    skeleton: skeleton,
                    fronts: []
                };
            }

            // -----------------------------------------------------------------
            // 46. CAB_LAUNDRY_SINK: 600 × 900 mm Utility Sink Cabinet + Deep 300 mm Stainless Basin & Curved Gooseneck Faucet
            //     (d = 2,570..3,170 mm from West wall -> X = 17,155..17,755 mm, Z = 0..900 mm + Sink/Faucet to Z=1185mm)
            // -----------------------------------------------------------------
            function buildLaundrySinkCabinet() {
                const x0 = 17155, x1 = 17755; // 600 mm wide (d = 2,570..3,170 mm)
                const z0 = 0, z1 = 900;
                // Sink Basin in laundry.html: x = 272..302 (d = 2,720..3,020 mm -> X = 17,305..17,605 mm, 300 mm wide)
                const xSink0 = 17305, xSink1 = 17605;
                const ySink0 = y0 + 130;      // Y = 11,530 mm (leaves 130 mm rear deck for gooseneck faucet)
                const ySink1 = y0 + 510;      // Y = 11,910 mm (380 mm front-to-back cutout)
                const xFaucet = 17455;        // Centered at X = 17,455 mm
                const yFaucet = y0 + 78;      // Mounted on rear oak deck at Y = 11,478 mm
                const cxDrain = 17455;
                const cyDrain = (ySink0 + ySink1) / 2; // Y = 11,720 mm

                const skeleton = [
                    // 1. Cabinet Carcass Side, Back & Bottom Panels (stopped below sink sump where needed)
                    {
                        id: 'CAB_LAUNDRY_SINK_WEST_PANEL',
                        name: 'Sink Cabinet Left/West Side Panel (20×630×880 mm, Z=0..880 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1 - b
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_EAST_PANEL',
                        name: 'Sink Cabinet Right/East Side Panel (20×630×880 mm, Z=0..880 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1 - b
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_BACK_PANEL',
                        name: 'Sink Cabinet Rear Panel (560×20×880 mm, Z=0..880 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1 - b
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_BOTTOM_PANEL',
                        name: 'Sink Cabinet Bottom Panel (560×610×20 mm, Z=0..20 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0, z1: z0 + b
                    },

                    // 2. Oak Countertop Deck with Real 300 × 380 mm Sink Cutout Opening (Z = 880..900 mm)
                    {
                        id: 'CAB_LAUNDRY_SINK_DECK_WEST',
                        name: 'Sink Countertop Left Deck Strip (150×650×20 mm)',
                        role: 'countertop',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xSink1, x1: x1,
                        y0: y0, y1: yFront1,
                        z0: z1 - b, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_DECK_EAST',
                        name: 'Sink Countertop Right Deck Strip (150×650×20 mm)',
                        role: 'countertop',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: xSink0,
                        y0: y0, y1: yFront1,
                        z0: z1 - b, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_DECK_NORTH',
                        name: 'Sink Countertop Rear Faucet Deck Strip (300×130×20 mm)',
                        role: 'countertop',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xSink0, x1: xSink1,
                        y0: y0, y1: ySink0,
                        z0: z1 - b, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_SINK_DECK_SOUTH',
                        name: 'Sink Countertop Front Apron Deck Strip (300×140×20 mm)',
                        role: 'countertop',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xSink0, x1: xSink1,
                        y0: ySink1, y1: yFront1,
                        z0: z1 - b, z1: z1
                    }
                ];

                // 3. Sculpted Above-Counter Beveled Stainless Utility Sink Rim (Z = 900..932 mm)
                //    Outer footprint: X = 17,295..17,615 (320 mm), Y = 11,520..11,920 (400 mm)
                //    Inner basin opening: X = 17,315..17,595 (280 mm), Y = 11,540..11,900 (360 mm)
                const rx0 = xSink0 - 10, rx1 = xSink1 + 10;
                const ry0 = ySink0 - 10, ry1 = ySink1 + 10;
                const bx0 = xSink0 + 10, bx1 = xSink1 - 10;
                const by0 = ySink0 + 10, by1 = ySink1 - 10;
                const zRim0 = 900, zRim1 = 932;

                const rimVerts = [
                    // Outer bottom perimeter at Z = 900 (0..3)
                    [rx0, ry0, zRim0], [rx1, ry0, zRim0], [rx1, ry1, zRim0], [rx0, ry1, zRim0],
                    // Outer top beveled perimeter at Z = 932 (4..7)
                    [rx0 + 3, ry0 + 3, zRim1], [rx1 - 3, ry0 + 3, zRim1], [rx1 - 3, ry1 - 3, zRim1], [rx0 + 3, ry1 - 3, zRim1],
                    // Inner top perimeter at Z = 932 (8..11)
                    [bx0, by0, zRim1], [bx1, by0, zRim1], [bx1, by1, zRim1], [bx0, by1, zRim1],
                    // Inner basin bottom perimeter at Z = 686 (12..15)
                    [bx0 + 6, by0 + 6, 686], [bx1 - 6, by0 + 6, 686], [bx1 - 6, by1 - 6, 686], [bx0 + 6, by1 - 6, 686],
                    // Center drain sump perimeter at Z = 678 (16..19)
                    [cxDrain - 28, cyDrain - 28, 678], [cxDrain + 28, cyDrain - 28, 678],
                    [cxDrain + 28, cyDrain + 28, 678], [cxDrain - 28, cyDrain + 28, 678]
                ];
                const rimFaces = [
                    // Outer rim slopes (facing outward)
                    [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
                    // Top brushed stainless rim deck (facing up +Z)
                    [4, 5, 9, 8], [5, 6, 10, 9], [6, 7, 11, 10], [7, 4, 8, 11],
                    // Inner basin walls (facing inward into the sink cavity!)
                    [8, 9, 13, 12], [9, 10, 14, 13], [10, 11, 15, 14], [11, 8, 12, 15],
                    // Pitched 4-facet stainless steel basin floor with X-drainage creases (facing up +Z)
                    [12, 13, 17, 16], [13, 14, 18, 17], [14, 15, 19, 18], [15, 12, 16, 19],
                    // Outer underside of sink sump box (so looking from below is also solid)
                    [0, 4, 12, 15, 3], [1, 2, 14, 13, 5]
                ];
                const rimWire = [
                    [0, 1], [1, 2], [2, 3], [3, 0],
                    [4, 5], [5, 6], [6, 7], [7, 4],
                    [8, 9], [9, 10], [10, 11], [11, 8],
                    [12, 13], [13, 14], [14, 15], [15, 12],
                    [8, 12], [9, 13], [10, 14], [11, 15],
                    // X-drainage creases on basin floor
                    [12, 16], [13, 17], [14, 18], [15, 19],
                    [16, 17], [17, 18], [18, 19], [19, 16]
                ];
                skeleton.push(buildIndexedMeshPart({
                    id: 'LAUNDRY_SINK_BASIN_SHELL',
                    name: 'Sculpted Brushed Stainless Steel Utility Sink Basin & Pitched Sump (320×400×254 mm, Z=678..932 mm)',
                    role: 'sink_basin',
                    material: 'steel_chrome',
                    colorRgb: [208, 215, 222],
                    x0: rx0, x1: rx1,
                    y0: ry0, y1: ry1,
                    z0: 678, z1: zRim1,
                    vertices3D: rimVerts,
                    faces3D: rimFaces,
                    wireframeIndices: rimWire
                }));

                // 4. Circular Stainless Steel Basket Strainer Drain & Stopper (Ø76 mm at cxDrain, cyDrain)
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_SINK_DRAIN_STRAINER',
                    name: 'Circular Stainless Steel Basket Strainer Drain (Ø76 mm)',
                    role: 'sink_drain',
                    material: 'steel_chrome',
                    colorRgb: [165, 174, 184],
                    spine: [
                        { cx: cxDrain, cy: cyDrain, cz: 681, r: 38 },
                        { cx: cxDrain, cy: cyDrain, cz: 682, r: 28 },
                        { cx: cxDrain, cy: cyDrain, cz: 674, r: 24 },
                        { cx: cxDrain, cy: cyDrain, cz: 679, r: 8 }
                    ],
                    segments: 24,
                    upHint: [0, 1, 0],
                    capStart: false,
                    capEnd: true,
                    ringStep: 1
                }));

                // Rear Wall Chrome Overflow Escutcheon Slot (at Y = by0 + 1, Z = 865..885 mm)
                skeleton.push({
                    id: 'LAUNDRY_SINK_OVERFLOW_PLATE',
                    name: 'Sink Rear Wall Chrome Overflow Escutcheon (48×4×20 mm)',
                    role: 'sink_drain',
                    material: 'steel_chrome',
                    colorRgb: [0.35, 0.38, 0.42],
                    x0: cxDrain - 24, x1: cxDrain + 24,
                    y0: by0, y1: by0 + 4,
                    z0: 865, z1: 885
                });

                // 5. Smooth-Shaded 3D Gooseneck Mixer Faucet (X = 17,455 mm, Y = 11,478 mm, Z = 900..1,185 mm)
                // 5a. Turned Base Escutcheon & Cylindrical Mixer Body Column (Z = 900..1,055 mm)
                const faucetBaseSpine = [
                    { cx: xFaucet, cy: yFaucet, cz: 900,  r: 27 },
                    { cx: xFaucet, cy: yFaucet, cz: 908,  r: 27 },
                    { cx: xFaucet, cy: yFaucet, cz: 912,  r: 20 },
                    { cx: xFaucet, cy: yFaucet, cz: 1045, r: 20 },
                    { cx: xFaucet, cy: yFaucet, cz: 1055, r: 14 }
                ];
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_SINK_FAUCET_BODY',
                    name: 'Laundry Sink Mixer Faucet Turned Chrome Column & Escutcheon (Ø54/Ø40×155 mm)',
                    role: 'sink_faucet',
                    material: 'steel_chrome',
                    colorRgb: [225, 230, 238],
                    spine: faucetBaseSpine,
                    segments: 24,
                    upHint: [0, 1, 0],
                    capStart: false,
                    capEnd: false,
                    ringStep: 1
                }));

                // 5b. Smooth 18-Step 180° Curved Gooseneck Spout Arch + Aerator Nozzle
                //     Rises from Z = 1,055 to 1,095 at Y = 11,478, then sweeps a 95 mm radius 180° arch forward
                //     to Y = 11,668 mm (over the center of the sink bowl), ending with a flared aerator at Z = 1,068 mm.
                const R_arch = 95;
                const cyArch = yFaucet + R_arch; // Y = 11,573 mm
                const czArch = 1090;
                const spoutSpine = [
                    { cx: xFaucet, cy: yFaucet, cz: 1055, r: 12 },
                    { cx: xFaucet, cy: yFaucet, cz: 1090, r: 12 }
                ];
                const archSteps = 16;
                for (let s = 1; s <= archSteps; s++) {
                    const theta = Math.PI * (1 - s / archSteps); // PI (rear) -> 0 (front)
                    const py = cyArch + R_arch * Math.cos(theta);
                    const pz = czArch + R_arch * Math.sin(theta);
                    spoutSpine.push({ cx: xFaucet, cy: py, cz: pz, r: 12 });
                }
                // Aerator nozzle drop & lip
                const yNozzle = cyArch + R_arch; // Y = 11,668 mm
                spoutSpine.push(
                    { cx: xFaucet, cy: yNozzle, cz: 1074, r: 13.5 },
                    { cx: xFaucet, cy: yNozzle, cz: 1066, r: 13.5 },
                    { cx: xFaucet, cy: yNozzle, cz: 1065, r: 10.5 }
                );
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_SINK_FAUCET_GOOSENECK_SPOUT',
                    name: 'Laundry Sink Smooth 180° Gooseneck Spout Arch & Aerator (Z=1055..1185 mm)',
                    role: 'sink_faucet',
                    material: 'steel_chrome',
                    colorRgb: [228, 233, 240],
                    spine: spoutSpine,
                    segments: 20,
                    upHint: [1, 0, 0],
                    capStart: false,
                    capEnd: true,
                    ringStep: 3
                }));

                // 5c. Side Mixer Valve Cylinder & Pin Lever Handle (protruding East/Right from mixer column at Z = 975 mm)
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_SINK_FAUCET_VALVE_HUB',
                    name: 'Laundry Sink Mixer Side Valve Cartridge Hub',
                    role: 'sink_faucet',
                    material: 'steel_chrome',
                    colorRgb: [220, 226, 234],
                    spine: [
                        { cx: xFaucet - 16, cy: yFaucet, cz: 975, r: 14 },
                        { cx: xFaucet - 48, cy: yFaucet, cz: 975, r: 14 },
                        { cx: xFaucet - 52, cy: yFaucet, cz: 975, r: 11 }
                    ],
                    segments: 16,
                    upHint: [0, 0, 1],
                    capStart: false,
                    capEnd: true,
                    ringStep: 1
                }));
                skeleton.push(buildLaundryTubePart({
                    id: 'LAUNDRY_SINK_FAUCET_LEVER_PIN',
                    name: 'Laundry Sink Mixer Pin Lever Handle',
                    role: 'sink_faucet',
                    material: 'steel_chrome',
                    colorRgb: [232, 236, 242],
                    spine: [
                        { cx: xFaucet - 42, cy: yFaucet,      cz: 982,  r: 4.5 },
                        { cx: xFaucet - 42, cy: yFaucet + 18, cz: 1048, r: 5.5 }
                    ],
                    segments: 12,
                    upHint: [1, 0, 0],
                    capStart: true,
                    capEnd: true,
                    ringStep: 1
                }));

                const fronts = [
                    {
                        id: 'CAB_LAUNDRY_SINK_DOOR',
                        name: 'Sink Base Cabinet Hinged Door (596×20×876 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - b - 2
                    }
                ];

                return {
                    id: 'CAB_LAUNDRY_SINK',
                    name: 'CAB_LAUNDRY_SINK — 600×900mm Utility Sink Base Cabinet + 300mm Sculpted Stainless Basin & Gooseneck Faucet',
                    shortName: 'Laundry Sink Cabinet (600×900mm)',
                    category: 'base_cabinet',
                    subtype: 'laundry_sink_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: 1185,
                    widthMm: 600, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 900, heightMm: 900,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '600 × 650 × 900 mm (X = 17,155..17,755 mm, Y = 11,400..12,050 mm, Z = 0..900 mm) • Sculpted 300 × 380 × 254 mm Brushed Stainless Basin with Pitched Sump & Strainer • Smooth Curved 180° Gooseneck Mixer Faucet',
                    description: '600 × 900 mm utility sink base cabinet featuring a real countertop cutout, a deep 254 mm brushed stainless steel soaking basin with pitched X-grooved floor and basket strainer drain, and a smooth-shaded 180° gooseneck mixer faucet with pin lever.',
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            // -----------------------------------------------------------------
            // 47. CAB_LAUNDRY_RIGHT_1600: Right-Side 800 × 1,600 mm Multi-Split Cabinet
            //     (d = 3,170..3,970 mm from West wall -> X = 16,355..17,155 mm, Z = 0..1,600 mm)
            //     Vertical Splits (Right to Left: 400, 200, 200 mm -> Left to Right: 200, 200, 400 mm)
            //     Matches x=317..337 (200mm), x=337..357 (200mm), x=357..397 (400mm) in laundry.html!
            // -----------------------------------------------------------------
            function buildLaundryRight1600Cabinet() {
                const x0 = 16355, x1 = 17155; // 800 mm wide (flush with East Wall GW_9 at X = 16,355 mm)
                const xSplit1 = 16755;        // 400 mm from Right/East wall (x = 357 in laundry.html)
                const xSplit2 = 16955;        // 600 mm from Right/East wall (x = 337 in laundry.html)
                const z0 = 0, z1 = 1600;

                const skeleton = [
                    // Left/West Outer Panel (X = 17,135..17,155 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_WEST_PANEL',
                        name: 'Left/West Outer Carcass Panel (20×630×1600 mm, Z=0..1600 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    // Right/East Outer Panel (X = 16,355..16,375 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_EAST_PANEL',
                        name: 'Right/East Outer Carcass Panel (20×630×1600 mm, Z=0..1600 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    // Vertical Split #1 at x = 357 (400 mm from Right -> X = 16,745..16,765 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_SPLIT_357',
                        name: 'Vertical Split #1 (400mm from Right, X=16745..16765, Z=20..1580 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xSplit1 - 10, x1: xSplit1 + 10,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0 + b, z1: z1 - b
                    },
                    // Vertical Split #2 at x = 337 (600 mm from Right -> X = 16,945..16,965 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_SPLIT_337',
                        name: 'Vertical Split #2 (200+200mm Narrow Bays, X=16945..16965, Z=20..1580 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: xSplit2 - 10, x1: xSplit2 + 10,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0 + b, z1: z1 - b
                    },
                    // Back Panel
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_BACK_PANEL',
                        name: 'Rear Backing Panel (760×20×1600 mm, Z=0..1600 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    // Bottom & Top Panels
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_BOTTOM_PANEL',
                        name: 'Bottom Carcass Panel (760×610×20 mm, Z=0..20 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0, z1: z0 + b
                    },
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_TOP_PANEL',
                        name: 'Top Carcass Panel (760×610×20 mm, Z=1580..1600 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z1 - b, z1: z1
                    }
                ];

                // Internal shelves inside the 400 mm right bay (X = 16,375..16,745 mm)
                [400, 800, 1200].forEach((sz, idx) => {
                    skeleton.push({
                        id: `CAB_LAUNDRY_RIGHT_1600_SHELF_${idx + 1}`,
                        name: `Right 400mm Bay Internal Shelf #${idx + 1} (Z=${sz}..${sz + b} mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: xSplit1 - 10,
                        y0: y0 + b, y1: yCarcass1 - 10,
                        z0: sz, z1: sz + b
                    });
                });

                const fronts = [
                    // Leftmost 200 mm door (X = 16,955..17,155 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_DOOR_200A',
                        name: 'Left 200mm Narrow Pull-Out Door (196×20×1596 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: xSplit2 + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - 2
                    },
                    // Middle 200 mm door (X = 16,755..16,955 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_DOOR_200B',
                        name: 'Middle 200mm Narrow Pull-Out Door (196×20×1596 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: xSplit1 + 2, x1: xSplit2 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - 2
                    },
                    // Rightmost 400 mm door (X = 16,355..16,755 mm)
                    {
                        id: 'CAB_LAUNDRY_RIGHT_1600_DOOR_400',
                        name: 'Right 400mm Hinged Storage Door (396×20×1596 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: xSplit1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: 2, z1: z1 - 2
                    }
                ];

                return {
                    id: 'CAB_LAUNDRY_RIGHT_1600',
                    name: 'CAB_LAUNDRY_RIGHT_1600 — Right 800×1600mm Multi-Split Cabinet (200+200+400mm)',
                    shortName: 'Laundry Right Cabinet (800×1600mm)',
                    category: 'tall_cabinet',
                    subtype: 'laundry_mid_tall_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: 800, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 1600, heightMm: 1600,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '800 × 650 × 1,600 mm (X = 16,355..17,155 mm, Y = 11,400..12,050 mm, Z = 0..1,600 mm) • Vertical Splits (Right to Left: 400, 200, 200 mm)',
                    description: 'Rightmost 800 × 1,600 mm laundry cabinet at Z = 0..1,600 mm, divided vertically into two 200 mm narrow utility compartments (ironing board / drying rack) and one 400 mm shelved storage bay.',
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            // -----------------------------------------------------------------
            // 48. CAB_LAUNDRY_RIGHT_BRIDGE: 800 × 200 mm Cubby Cabinet on top of 800×1600mm Cabinet
            //     (d = 3,170..3,970 mm from West wall -> X = 16,355..17,155 mm, Z = 1,600..1,800 mm)
            // -----------------------------------------------------------------
            function buildLaundryRightBridgeCabinet() {
                const x0 = 16355, x1 = 17155; // 800 mm wide
                const z0 = 1600, z1 = 1800;   // 200 mm high (y = 80..100 in laundry.html)

                const skeleton = [
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_WEST_PANEL',
                        name: 'Left/West Side Panel (20×630×200 mm, Z=1600..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_EAST_PANEL',
                        name: 'Right/East Side Panel (20×630×200 mm, Z=1600..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_BACK_PANEL',
                        name: 'Rear Backing Panel (760×20×200 mm, Z=1600..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_BOTTOM_PANEL',
                        name: 'Bottom Panel (760×610×18 mm, Z=1600..1618 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0, z1: z0 + 18
                    },
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_TOP_PANEL',
                        name: 'Top Panel (760×610×18 mm, Z=1782..1800 mm)',
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z1 - 18, z1: z1
                    }
                ];

                const fronts = [
                    {
                        id: 'CAB_LAUNDRY_RIGHT_BRIDGE_FLAP',
                        name: 'Flip-Up Cubby Front Door (796×20×196 mm, Z=1602..1798 mm)',
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: z0 + 2, z1: z1 - 2
                    }
                ];

                return {
                    id: 'CAB_LAUNDRY_RIGHT_BRIDGE',
                    name: 'CAB_LAUNDRY_RIGHT_BRIDGE — 800×200mm Cubby Cabinet on Top of 800×1600mm Cabinet',
                    shortName: 'Laundry Bridge Cubby (800×200mm)',
                    category: 'wall_cabinet',
                    subtype: 'laundry_bridge_cubby',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: 800, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 200, heightMm: 200,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: '800 × 650 × 200 mm (X = 16,355..17,155 mm, Y = 11,400..12,050 mm, Z = 1,600..1,800 mm) • Sits atop the 800×1600 mm cabinet below CAB_LAUNDRY_TOP_3',
                    description: '800 × 200 mm horizontal cubby cabinet at Z = 1,600..1,800 mm directly on top of CAB_LAUNDRY_RIGHT_1600, bridging up to the Z = 1,800 mm top cabinet line.',
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            // -----------------------------------------------------------------
            // 49–51. CAB_LAUNDRY_TOP_1..3: Top Wall Cabinets at Z = 1,800..2,400 mm
            //        with Horizontal Middle Shelf at Z = 2,100 mm (y = 50 in laundry.html)
            //        - CAB_LAUNDRY_TOP_1: 650 × 600 mm (X = 18,555..19,205 mm)
            //        - CAB_LAUNDRY_TOP_2: 1,100 × 600 mm (X = 17,455..18,555 mm)
            //        - CAB_LAUNDRY_TOP_3: 1,100 × 600 mm (X = 16,355..17,455 mm)
            // -----------------------------------------------------------------
            function makeLaundryTopCabinet(id, index, x0, x1, labelPos) {
                const w = x1 - x0;
                const z0 = 1800, zMid = 2100, z1 = 2400; // 600 mm height, shelf in middle at Z = 2,100 mm

                const skeleton = [
                    {
                        id: `${id}_WEST_PANEL`,
                        name: `Left/West Side Carcass Panel (20×630×600 mm, Z=1800..2400 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x1 - b, x1: x1,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: `${id}_EAST_PANEL`,
                        name: `Right/East Side Carcass Panel (20×630×600 mm, Z=1800..2400 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0, x1: x0 + b,
                        y0: y0, y1: yCarcass1,
                        z0: z0, z1: z1
                    },
                    {
                        id: `${id}_BACK_PANEL`,
                        name: `Rear Backing Panel (${w - 2 * b}×20×600 mm, Z=1800..2400 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0, y1: y0 + b,
                        z0: z0, z1: z1
                    },
                    {
                        id: `${id}_BOTTOM_PANEL`,
                        name: `Bottom Carcass Panel (${w - 2 * b}×610×20 mm, Z=1800..1820 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z0, z1: z0 + b
                    },
                    {
                        id: `${id}_MID_SHELF`,
                        name: `Middle Horizontal Shelf — Z=2090..2110 mm (${w - 2 * b}×600×20 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1 - 10,
                        z0: zMid - 10, z1: zMid + 10
                    },
                    {
                        id: `${id}_TOP_PANEL`,
                        name: `Top Ceiling Panel (${w - 2 * b}×610×20 mm, Z=2380..2400 mm)`,
                        role: 'carcass_panel',
                        material: 'wood_oak',
                        colorRgb: COLOR_OAK_WARM,
                        x0: x0 + b, x1: x1 - b,
                        y0: y0 + b, y1: yCarcass1,
                        z0: z1 - b, z1: z1
                    }
                ];

                const fronts = [];
                if (w <= 700) {
                    fronts.push({
                        id: `${id}_DOOR`,
                        name: `Top Cabinet Hinged Door (${w - 4}×20×596 mm, Z=1802..2398 mm)`,
                        role: 'front_panel',
                        material: 'front_cashmere',
                        colorRgb: COLOR_CASHMERE_FRONT,
                        x0: x0 + 2, x1: x1 - 2,
                        y0: yCarcass1, y1: yFront1,
                        z0: z0 + 2, z1: z1 - 2
                    });
                } else {
                    const xHalf = Math.round((x0 + x1) * 0.5);
                    fronts.push(
                        {
                            id: `${id}_DOOR_LEFT`,
                            name: `Left Hinged Door (${x1 - xHalf - 4}×20×596 mm, Z=1802..2398 mm)`,
                            role: 'front_panel',
                            material: 'front_cashmere',
                            colorRgb: COLOR_CASHMERE_FRONT,
                            x0: xHalf + 2, x1: x1 - 2,
                            y0: yCarcass1, y1: yFront1,
                            z0: z0 + 2, z1: z1 - 2
                        },
                        {
                            id: `${id}_DOOR_RIGHT`,
                            name: `Right Hinged Door (${xHalf - x0 - 4}×20×596 mm, Z=1802..2398 mm)`,
                            role: 'front_panel',
                            material: 'front_cashmere',
                            colorRgb: COLOR_CASHMERE_FRONT,
                            x0: x0 + 2, x1: xHalf - 2,
                            y0: yCarcass1, y1: yFront1,
                            z0: z0 + 2, z1: z1 - 2
                        }
                    );
                }

                return {
                    id: id,
                    name: `${id} — ${labelPos} Top Laundry Cabinet (${w}×650×600mm, Z=1800..2400mm)`,
                    shortName: `Laundry Top #${index} (${w}×600mm)`,
                    category: 'wall_cabinet',
                    subtype: 'laundry_top_cabinet',
                    floor: 'ground',
                    room: '0.08 Pralnia',
                    hostWallId: 'GW_8',
                    viewId: 'laundry_north_wall',
                    x1: x0, x2: x1,
                    y1: y0, y2: yFront1,
                    zBottom: z0, zTop: z1,
                    widthMm: w, depthMm: LAUNDRY_DEPTH_MM,
                    carcassDepthMm: LAUNDRY_CARCASS_DEPTH_MM, frontThicknessMm: LAUNDRY_FRONT_MM,
                    plinthHeightMm: 0, plinthRecessMm: 0,
                    bodyHeightMm: 600, heightMm: 600,
                    boardThicknessMm: b,
                    normal: [0, 1, 0],
                    specs: `${w} × 650 × 600 mm (X = ${x0}..${x1} mm, Y = 11,400..12,050 mm, Z = 1,800..2,400 mm) • Horizontal middle shelf at Z = 2,100 mm`,
                    description: `${labelPos} top laundry cabinet (${w} × 600 mm) at Z = 1,800..2,400 mm with a central horizontal shelf at Z = 2,100 mm.`,
                    skeleton: skeleton,
                    fronts: fronts
                };
            }

            return [
                buildLaundryLeftTallCabinet(),
                buildLaundryWasherCabinet(),
                buildLaundryDryerCabinet(),
                buildLaundryBase800Cabinet(),
                buildLaundryHangingNiche(),
                buildLaundrySinkCabinet(),
                buildLaundryRight1600Cabinet(),
                buildLaundryRightBridgeCabinet(),
                makeLaundryTopCabinet('CAB_LAUNDRY_TOP_1', 1, 18555, 19205, 'Leftmost'),
                makeLaundryTopCabinet('CAB_LAUNDRY_TOP_2', 2, 17455, 18555, 'Middle'),
                makeLaundryTopCabinet('CAB_LAUNDRY_TOP_3', 3, 16355, 17455, 'Rightmost')
            ];
        })()
    ];

    return {
        _role: 'DEFAULT_SEED_VALUES',
        entityType: 'furniture',
        version: '1.4.0-brep',
        metadata: {
            isDefaultSeed: true,
            representation: '3D B-Rep Furniture & Cabinets with separate Skeleton and Fronts parts',
            coordinateSystem: {
                x: 'East -> West horizontal axis in millimeters (0..20,705 mm)',
                y: 'North -> South horizontal axis in millimeters (-290..21,130 mm)',
                z: 'Vertical height / elevation in millimeters (0..6,740 mm)'
            }
        },
        furniture: defaultFurniture,
        defaultFurniture: defaultFurniture
    };
}));
