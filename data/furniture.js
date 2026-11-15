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
        // 27–33. PANTRY EAST WALL (GW_14) LOWER & UPPER OPEN SHELVING CABINETS
        //        Based on pantry.html specifications:
        //        - 4 Lower Base Units (CAB_PANTRY_E1..E4): 4 × 500 mm wide (Y = 3,170..5,170 mm),
        //          450 mm (45 cm) deep (X = 4,455..4,905 mm), Z = 0..960 mm (100 mm plinth +
        //          20 mm bottom shelf + 400 mm space + 20 mm middle shelf + 400 mm space + 20 mm top shelf),
        //          leaving a 40 mm gap before the 900 mm basement stairwell at Y = 5,210..6,110 mm.
        //        - 1st Upper Cabinet (CAB_PANTRY_E_UP1 — Left/North): 700 mm wide (Y = 3,170..3,870 mm),
        //          450 mm (45 cm) deep (X = 4,455..4,905 mm), Z = 960..2,800 mm (1,840 mm tall) with
        //          three 20 mm shelves spaced at 400 / 400 / 400 / 580 mm (Z = 1,360, 1,780, 2,200 mm).
        //        - 2nd Upper Cabinet (CAB_PANTRY_E_UP2 — Middle): 600 mm wide (Y = 3,870..4,470 mm),
        //          300 mm (30 cm) deep (X = 4,455..4,755 mm), Z = 960..2,800 mm (1,840 mm tall) with
        //          four 20 mm shelves spaced at 340 / 350 / 350 / 350 / 370 mm (Z = 1,300, 1,670, 2,040, 2,410 mm).
        //        - 3rd Upper Cabinet (CAB_PANTRY_E_UP3 — Right/South): 700 mm wide (Y = 4,470..5,170 mm),
        //          300 mm (30 cm) deep (X = 4,455..4,755 mm), Z = 960..2,800 mm (1,840 mm tall) with
        //          four 20 mm shelves spaced at 340 / 350 / 350 / 350 / 370 mm (Z = 1,300, 1,670, 2,040, 2,410 mm).
        //        - All Pantry cabinets have `fronts: []` ("No fronts for now").
        // =====================================================================
        ...(function buildPantryEastWallCabinets() {
            const X_PANTRY_EAST = 4455; // GW_14_UPPER_WEST interior face in 0.14 Spiżarnia
            const PANTRY_BOARD_MM = 20; // 20 mm (2 cm) shelf & carcass board thickness per pantry.html

            function makePantryLowerCabinet(id, index, y0, y1) {
                const depthMm = 450; // 45 cm depth per pantry.html legend
                const x0 = X_PANTRY_EAST;
                const x1 = x0 + depthMm; // 4,905 mm
                const xPlinthFront = x1 - 40; // 40 mm recessed toe-kick (4,865 mm)
                const w = y1 - y0; // 500 mm

                const skeleton = [
                    {
                        id: `${id}_PLINTH`,
                        name: `Recessed Plinth / Toe-Kick (410×${w}×100 mm Cokół, Z=0..100 mm)`,
                        role: 'plinth',
                        material: 'dark_plinth',
                        colorRgb: COLOR_PLINTH,
                        x0: x0, x1: xPlinthFront,
                        y0: y0, y1: y1,
                        z0: 0, z1: 100
                    },
                    {
                        id: `${id}_NORTH_PANEL`,
                        name: `Left/North Side Carcass Panel (450×20×860 mm, Z=100..960 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1,
                        y0: y0, y1: y0 + PANTRY_BOARD_MM,
                        z0: 100, z1: 960
                    },
                    {
                        id: `${id}_SOUTH_PANEL`,
                        name: `Right/South Side Carcass Panel (450×20×860 mm, Z=100..960 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1,
                        y0: y1 - PANTRY_BOARD_MM, y1: y1,
                        z0: 100, z1: 960
                    },
                    {
                        id: `${id}_BACK_PANEL`,
                        name: `Rear Carcass Backing Panel (20×${w - 2 * PANTRY_BOARD_MM}×860 mm, Z=100..960 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: x0, x1: x0 + PANTRY_BOARD_MM,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: 100, z1: 960
                    },
                    {
                        id: `${id}_BOTTOM_SHELF`,
                        name: `Bottom 2cm Shelf (430×${w - 2 * PANTRY_BOARD_MM}×20 mm, Z=100..120 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + PANTRY_BOARD_MM, x1: x1,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: 100, z1: 120
                    },
                    {
                        id: `${id}_MIDDLE_SHELF`,
                        name: `Middle 2cm Shelf after 400mm Lower Space (430×${w - 2 * PANTRY_BOARD_MM}×20 mm, Z=520..540 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + PANTRY_BOARD_MM, x1: x1,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: 520, z1: 540
                    },
                    {
                        id: `${id}_TOP_SHELF`,
                        name: `Top 2cm Shelf/Panel after 400mm Upper Space (430×${w - 2 * PANTRY_BOARD_MM}×20 mm, Z=940..960 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + PANTRY_BOARD_MM, x1: x1,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: 940, z1: 960
                    }
                ];

                return {
                    id: id,
                    name: `${id} — Pantry Lower Open Cabinet #${index} (500×450×960mm Regał Dolny)`,
                    shortName: `Pantry Lower Cabinet #${index} (500×450mm)`,
                    category: 'base_cabinet',
                    subtype: 'pantry_open_base_cabinet',
                    floor: 'ground',
                    room: '0.14 Spiżarnia',
                    hostWallId: 'GW_14',
                    viewId: 'pantry_east_wall',
                    x1: x0,
                    x2: x1,
                    y1: y0,
                    y2: y1,
                    zBottom: 0,
                    zTop: 960,
                    widthMm: w,
                    depthMm: depthMm,
                    carcassDepthMm: depthMm,
                    frontThicknessMm: 0,
                    plinthHeightMm: 100,
                    plinthRecessMm: 40,
                    bodyHeightMm: 860,
                    heightMm: 960,
                    boardThicknessMm: PANTRY_BOARD_MM,
                    normal: [1, 0, 0],
                    specs: `500 × 450 × 960 mm (X = ${x0}..${x1} mm, Y = ${y0}..${y1} mm, Z = 0..960 mm) • 100 mm plinth + 20 mm bottom shelf (Z=100..120) + 400 mm space + 20 mm middle shelf (Z=520..540) + 400 mm space + 20 mm top panel (Z=940..960) • Open carcass (no fronts)`,
                    description: `Pantry East Wall (GW_14) lower open storage unit #${index} (500 mm wide × 450 mm deep × 960 mm high) with 100 mm dark plinth and two 400 mm clear vertical storage tiers separated by 20 mm shelves. No fronts for now.`,
                    skeleton: skeleton,
                    fronts: []
                };
            }

            function makePantryUpperCabinet(id, index, y0, y1, depthMm, shelfBottomZList, spacingDesc) {
                const x0 = X_PANTRY_EAST;
                const x1 = x0 + depthMm;
                const w = y1 - y0;
                const zBot = 960, zTop = 2800;

                const skeleton = [
                    {
                        id: `${id}_NORTH_PANEL`,
                        name: `Left/North Side Carcass Panel (${depthMm}×20×1840 mm, Z=960..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1,
                        y0: y0, y1: y0 + PANTRY_BOARD_MM,
                        z0: zBot, z1: zTop
                    },
                    {
                        id: `${id}_SOUTH_PANEL`,
                        name: `Right/South Side Carcass Panel (${depthMm}×20×1840 mm, Z=960..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SIDE,
                        x0: x0, x1: x1,
                        y0: y1 - PANTRY_BOARD_MM, y1: y1,
                        z0: zBot, z1: zTop
                    },
                    {
                        id: `${id}_BACK_PANEL`,
                        name: `Rear Carcass Backing Panel (20×${w - 2 * PANTRY_BOARD_MM}×1840 mm, Z=960..2800 mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_BACK,
                        x0: x0, x1: x0 + PANTRY_BOARD_MM,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: zBot, z1: zTop
                    }
                ];

                shelfBottomZList.forEach((sz0, idx) => {
                    skeleton.push({
                        id: `${id}_SHELF_${idx + 1}`,
                        name: `Internal 2cm Shelf #${idx + 1} (${depthMm - PANTRY_BOARD_MM}×${w - 2 * PANTRY_BOARD_MM}×20 mm, Z=${sz0}..${sz0 + PANTRY_BOARD_MM} mm)`,
                        role: 'carcass_panel',
                        material: 'carcass_melamine',
                        colorRgb: COLOR_CARCASS_SHELF,
                        x0: x0 + PANTRY_BOARD_MM, x1: x1,
                        y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                        z0: sz0, z1: sz0 + PANTRY_BOARD_MM
                    });
                });

                skeleton.push({
                    id: `${id}_TOP_PANEL`,
                    name: `Top Carcass Panel (${depthMm - PANTRY_BOARD_MM}×${w - 2 * PANTRY_BOARD_MM}×20 mm, Z=2780..2800 mm)`,
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: COLOR_CARCASS_SHELF,
                    x0: x0 + PANTRY_BOARD_MM, x1: x1,
                    y0: y0 + PANTRY_BOARD_MM, y1: y1 - PANTRY_BOARD_MM,
                    z0: zTop - PANTRY_BOARD_MM, z1: zTop
                });

                return {
                    id: id,
                    name: `${id} — Pantry Upper Open Cabinet #${index} (${w}×${depthMm}×1840mm Szafka Górna)`,
                    shortName: `Pantry Upper Cabinet #${index} (${w}×${depthMm}mm)`,
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
                    bodyHeightMm: 1840,
                    heightMm: 1840,
                    boardThicknessMm: PANTRY_BOARD_MM,
                    normal: [1, 0, 0],
                    specs: `${w} × ${depthMm} × 1,840 mm (X = ${x0}..${x1} mm, Y = ${y0}..${y1} mm, Z = 960..2,800 mm) • ${spacingDesc} • Open carcass (no fronts)`,
                    description: `Pantry East Wall (GW_14) upper open shelving cabinet #${index} (${w} mm wide × ${depthMm} mm deep × 1,840 mm high, Z = 960..2,800 mm) with 20 mm shelves (${spacingDesc}). No fronts for now.`,
                    skeleton: skeleton,
                    fronts: []
                };
            }

            return [
                // 4 Lower Open Base Cabinets (4 × 500 mm = 2,000 mm, 450 mm deep, Z = 0..960 mm)
                makePantryLowerCabinet('CAB_PANTRY_E1', 1, 3170, 3670),
                makePantryLowerCabinet('CAB_PANTRY_E2', 2, 3670, 4170),
                makePantryLowerCabinet('CAB_PANTRY_E3', 3, 4170, 4670),
                makePantryLowerCabinet('CAB_PANTRY_E4', 4, 4670, 5170),

                // 3 Upper Open Shelving Cabinets (700 + 600 + 700 = 2,000 mm, Z = 960..2,800 mm):
                // Left/North unit is 450 mm deep with 400/400/400/580 mm clear spaces;
                // Middle & Right/South units are 300 mm deep with 340/350/350/350/370 mm clear spaces.
                makePantryUpperCabinet(
                    'CAB_PANTRY_E_UP1',
                    1,
                    3170,
                    3870,
                    450,
                    [1360, 1780, 2200],
                    '3 × 20 mm shelves at Z = 1,360, 1,780, 2,200 mm (clear spaces: 400 + 400 + 400 + 580 mm)'
                ),
                makePantryUpperCabinet(
                    'CAB_PANTRY_E_UP2',
                    2,
                    3870,
                    4470,
                    300,
                    [1300, 1670, 2040, 2410],
                    '4 × 20 mm shelves at Z = 1,300, 1,670, 2,040, 2,410 mm (clear spaces: 340 + 350 + 350 + 350 + 370 mm)'
                ),
                makePantryUpperCabinet(
                    'CAB_PANTRY_E_UP3',
                    3,
                    4470,
                    5170,
                    300,
                    [1300, 1670, 2040, 2410],
                    '4 × 20 mm shelves at Z = 1,300, 1,670, 2,040, 2,410 mm (clear spaces: 340 + 350 + 350 + 350 + 370 mm)'
                )
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
