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

    /**
     * Build standard base carcass skeleton (150 mm plinth + 720 mm carcass box + 30 mm worktop blat = 900 mm).
     */
    function buildBaseSkeleton(idPrefix, x0, x1, includeMidDrawerShelf) {
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

        parts.push(
            {
                id: `${idPrefix}_TOP_PANEL`,
                name: `Top Carcass Panel (${x1 - x0 - 2 * BOARD_MM}×562×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: x0 + BOARD_MM, x1: x1 - BOARD_MM,
                y0: Y_WALL + BOARD_MM, y1: Y_CARCASS_FRONT,
                z0: 870 - BOARD_MM, z1: 870
            },
            {
                id: `${idPrefix}_WORKTOP`,
                name: `Countertop Segment / Blat (${x1 - x0}×600×30 mm)`,
                role: 'worktop',
                material: 'stone_worktop',
                colorRgb: COLOR_WORKTOP,
                x0: x0, x1: x1,
                y0: Y_WALL, y1: Y_FRONT_FACE,
                z0: 870, z1: 900
            }
        );

        return parts;
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
    function buildWestBaseSkeleton(idPrefix, y0, y1, includeMidDrawerShelf) {
        const w = y1 - y0;
        const parts = [
            {
                id: `${idPrefix}_PLINTH`,
                name: `Recessed Plinth / Toe-Kick (${w}×540×150 mm Cokół)`,
                role: 'plinth',
                material: 'dark_plinth',
                colorRgb: COLOR_PLINTH,
                x0: X_WEST_PLINTH_FRONT, x1: X_WEST_WALL,
                y0: y0, y1: y1,
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

        parts.push(
            {
                id: `${idPrefix}_TOP_PANEL`,
                name: `Top Carcass Panel (562×${w - 2 * BOARD_MM}×18 mm)`,
                role: 'carcass_panel',
                material: 'carcass_melamine',
                colorRgb: COLOR_CARCASS_SHELF,
                x0: X_WEST_CARCASS_FRONT, x1: X_WEST_WALL - BOARD_MM,
                y0: y0 + BOARD_MM, y1: y1 - BOARD_MM,
                z0: 870 - BOARD_MM, z1: 870
            },
            {
                id: `${idPrefix}_WORKTOP`,
                name: `Countertop Segment / Blat (${w}×600×30 mm)`,
                role: 'worktop',
                material: 'stone_worktop',
                colorRgb: COLOR_WORKTOP,
                x0: X_WEST_FRONT_FACE, x1: X_WEST_WALL,
                y0: y0, y1: y1,
                z0: 870, z1: 900
            }
        );

        return parts;
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
            zTop: 900,
            widthMm: 300,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '300 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; X = 11,015..11,315 mm)',
            description: 'Narrow 300 mm 2-drawer base cabinet on the Kitchen North Wall between the North-West corner cabinet and the 900 mm sink cabinet (Zlew).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N1', 11015, 11315, true),
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
            zTop: 900,
            widthMm: 900,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '900 × 600 × 900 mm (150 mm plinth + 720 mm sink carcass + 30 mm blat; full-height 690 mm wood front + 30 mm top handle rail)',
            description: '900 mm wide sink base cabinet (Zlew) on the Kitchen North Wall with a full-height pull-out wood front and top Gola handle rail.',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N2', 10115, 11015, false),
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
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm dishwasher bay + 30 mm blat; full-height 690 mm wood front + 30 mm top handle rail)',
            description: '600 mm wide integrated dishwasher cabinet (Zmywarka) on the Kitchen North Wall with removable full-height wood furniture front and top aluminum handle rail.',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N3', 9515, 10115, false),
            fronts: buildFullHeightBaseFront('CAB_KITCHEN_N3', 9515, 10115, 'Dishwasher (Zmywarka)')
        },

        // =====================================================================
        // 4. CAB_KITCHEN_N4 (alias CAB_KITCHEN_1): 600 mm Base 2-Drawer Cabinet (Right of Zmywarka)
        //    Local X = 2,400..3,000 mm from GW_3 -> X = 8,915..9,515 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N4',
            aliasIds: ['CAB_KITCHEN_1'],
            name: 'CAB_KITCHEN_N4 — Base 2-Drawer Cabinet 600mm (Right of Zmywarka)',
            shortName: 'Base 2-Drawer 600mm (Right of Zmywarka)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 8915,
            x2: 9515,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: '600 mm 2-drawer base cabinet on the Kitchen North Wall immediately to the right of Zmywarka (under Window O1).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N4', 8915, 9515, true),
            fronts: buildTwoDrawerFronts('CAB_KITCHEN_N4', 8915, 9515)
        },

        // =====================================================================
        // 5. CAB_KITCHEN_N5: 600 mm Base 2-Drawer Cabinet (Left of Lodówka)
        //    Local X = 3,000..3,600 mm from GW_3 -> X = 8,315..8,915 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_N5',
            name: 'CAB_KITCHEN_N5 — Base 2-Drawer Cabinet 600mm (Left of Lodówka)',
            shortName: 'Base 2-Drawer 600mm (Left of Lodówka)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            x1: 8315,
            x2: 8915,
            y1: Y_WALL,
            y2: Y_FRONT_FACE,
            zBottom: 0,
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [0, 1, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: '600 mm 2-drawer base cabinet on the Kitchen North Wall immediately to the left of the tall fridge cabinet (Lodówka).',
            skeleton: buildBaseSkeleton('CAB_KITCHEN_N5', 8315, 8915, true),
            fronts: buildTwoDrawerFronts('CAB_KITCHEN_N5', 8315, 8915)
        },

        // =====================================================================
        // 6. CAB_KITCHEN_N6: 600 mm Tall Fridge Cabinet (Lodówka, Z = 0..2,700 mm)
        //    Local X = 3,600..4,200 mm from GW_3 -> X = 7,715..8,315 mm
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
            x1: 7715,
            x2: 8315,
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
            skeleton: buildTallSkeleton('CAB_KITCHEN_N6', 7715, 8315, [2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N6_FRONT_FRIDGE',
                    name: 'Fridge Main Wood Door Front (596×20×1946 mm, Lodówka)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7717, x1: 8313,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N6_HANDLE_BAR',
                    name: 'Vertical Dark Bar Handle (10×12×200 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: 8285, x1: 8295,
                    y0: Y_FRONT_FACE, y1: Y_FRONT_FACE + 12,
                    z0: 700, z1: 900
                },
                {
                    id: 'CAB_KITCHEN_N6_FRONT_TOP',
                    name: 'Top Over-Fridge Wood Door Front (596×20×596 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7717, x1: 8313,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // 7. CAB_KITCHEN_N7: 600 mm Tall Oven & Microwave Tower (Piekarnik & Mikrofala)
        //    Local X = 4,200..4,800 mm from GW_3 -> X = 7,115..7,715 mm
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
            x1: 7115,
            x2: 7715,
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
            skeleton: buildTallSkeleton('CAB_KITCHEN_N7', 7115, 7715, [600, 1200, 1650, 2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N7_FRONT_BOTTOM',
                    name: 'Bottom Cabinet Wood Door Front (596×20×446 mm, Z=150..600 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7117, x1: 7713,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 598
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_OVEN_FRAME',
                    name: 'Oven (Piekarnik) Black Glass Fascia Front (596×20×596 mm, Z=600..1,200 mm)',
                    role: 'appliance_front',
                    material: 'appliance_black_glass',
                    colorRgb: COLOR_APPLIANCE_BODY,
                    x0: 7117, x1: 7713,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 602, z1: 1198
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_OVEN_WINDOW',
                    name: 'Oven (Piekarnik) Viewing Glass Window (500×6×400 mm, Z=750..1,150 mm)',
                    role: 'appliance_window',
                    material: 'appliance_window_glass',
                    colorRgb: COLOR_APPLIANCE_GLASS,
                    x0: 7165, x1: 7665,
                    y0: Y_FRONT_FACE - 2, y1: Y_FRONT_FACE + 4,
                    z0: 750, z1: 1150
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MW_FRAME',
                    name: 'Microwave (Mikrofala) Black Glass Fascia Front (596×20×446 mm, Z=1,200..1,650 mm)',
                    role: 'appliance_front',
                    material: 'appliance_black_glass',
                    colorRgb: COLOR_APPLIANCE_BODY,
                    x0: 7117, x1: 7713,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 1202, z1: 1648
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MW_WINDOW',
                    name: 'Microwave (Mikrofala) Viewing Glass Window (500×6×250 mm, Z=1,350..1,600 mm)',
                    role: 'appliance_window',
                    material: 'appliance_window_glass',
                    colorRgb: COLOR_APPLIANCE_GLASS,
                    x0: 7165, x1: 7665,
                    y0: Y_FRONT_FACE - 2, y1: Y_FRONT_FACE + 4,
                    z0: 1350, z1: 1600
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_MID_UPPER',
                    name: 'Middle-Upper Wood Door Front Above Microwave (596×20×446 mm, Z=1,650..2,100 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7117, x1: 7713,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 1652, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N7_FRONT_TOP',
                    name: 'Top Cabinet Wood Door Front (596×20×596 mm, Z=2,100..2,700 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 7117, x1: 7713,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 2102, z1: 2698
                }
            ]
        },

        // =====================================================================
        // 8. CAB_KITCHEN_N8: 600 mm Tall Pantry Cabinet (Right End of North Wall)
        //    Local X = 4,800..5,400 mm from GW_3 -> X = 6,515..7,115 mm
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
            x1: 6515,
            x2: 7115,
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
            skeleton: buildTallSkeleton('CAB_KITCHEN_N8', 6515, 7115, [2100]),
            fronts: [
                {
                    id: 'CAB_KITCHEN_N8_FRONT_MAIN',
                    name: 'Lower Tall Pantry Wood Door Front (596×20×1946 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 6517, x1: 7113,
                    y0: Y_CARCASS_FRONT, y1: Y_FRONT_FACE,
                    z0: 152, z1: 2098
                },
                {
                    id: 'CAB_KITCHEN_N8_HANDLE_BAR',
                    name: 'Vertical Dark Bar Handle (10×12×200 mm)',
                    role: 'handle_bar',
                    material: 'dark_handle',
                    colorRgb: COLOR_DARK_HANDLE,
                    x0: 7085, x1: 7095,
                    y0: Y_FRONT_FACE, y1: Y_FRONT_FACE + 12,
                    z0: 700, z1: 900
                },
                {
                    id: 'CAB_KITCHEN_N8_FRONT_TOP',
                    name: 'Top Pantry Wood Door Front (596×20×596 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: 6517, x1: 7113,
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
        // 9. CAB_KITCHEN_W1: 600 mm North-West Corner Base Unit (x_svg = 480..540)
        //    Y = 3,170..3,770 mm, X = 11,315..11,915 mm, Z = 0..900 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W1',
            name: 'CAB_KITCHEN_W1 — NW Corner Base Cabinet 600mm (Y=3170..3770)',
            shortName: 'NW Corner Base Unit 600mm',
            category: 'cabinet',
            subtype: 'corner_base_cabinet',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 3170,
            y2: 3770,
            zBottom: 0,
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm NW corner carcass + 30 mm corner blat; X = 11,315..11,915 mm, Y = 3,170..3,770 mm)',
            description: 'North-West corner base cabinet (600 × 600 × 900 mm, x_svg = 480..540) at the intersection of the Kitchen North Wall (EW_NORTH_RECESSED) and Kitchen West Wall (GW_3), forming a continuous L-shaped countertop with CAB_KITCHEN_N1.',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W1', 3170, 3770, true),
            fronts: [
                {
                    id: 'CAB_KITCHEN_W1_CORNER_FASCIA',
                    name: 'NW Corner Base Wood Junction Fascia (20×596×716 mm)',
                    role: 'door_front',
                    material: 'wood_tone',
                    colorRgb: COLOR_WOOD_FRONT,
                    x0: X_WEST_FRONT_FACE, x1: X_WEST_CARCASS_FRONT,
                    y0: 3172, y1: 3768,
                    z0: 152, z1: 868
                }
            ]
        },

        // =====================================================================
        // 10. CAB_KITCHEN_W2: 600 mm Base 2-Drawer Cabinet (Cab 1, x_svg = 420..480)
        //     Y = 3,770..4,370 mm, X = 11,315..11,915 mm, Z = 0..900 mm
        // =====================================================================
        {
            id: 'CAB_KITCHEN_W2',
            name: 'CAB_KITCHEN_W2 — West Base 2-Drawer Cabinet 600mm (Cab 1, Y=3770..4370)',
            shortName: 'West Base 2-Drawer 600mm (Cab 1)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'GW_3',
            viewId: 'kitchen_west_wall',
            x1: X_WEST_FRONT_FACE,
            x2: X_WEST_WALL,
            y1: 3770,
            y2: 4370,
            zBottom: 0,
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'First 600 mm 2-drawer base cabinet south of the NW corner on the Kitchen West Wall (Cab 1, x_svg = 420..480, Y = 3,770..4,370 mm).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W2', 3770, 4370, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W2', 3770, 4370)
        },

        // =====================================================================
        // 11. CAB_KITCHEN_W3: 600 mm Base 2-Drawer Cabinet (Cab 2, x_svg = 360..420)
        //     Y = 4,370..4,970 mm, X = 11,315..11,915 mm, Z = 0..900 mm
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
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Second 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 2, x_svg = 360..420, Y = 4,370..4,970 mm).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W3', 4370, 4970, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W3', 4370, 4970)
        },

        // =====================================================================
        // 12. CAB_KITCHEN_W4: 600 mm Base 2-Drawer Cabinet (Cab 3, x_svg = 300..360)
        //     Y = 4,970..5,570 mm, X = 11,315..11,915 mm, Z = 0..900 mm
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
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Third 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 3, x_svg = 300..360, Y = 4,970..5,570 mm).',
            skeleton: buildWestBaseSkeleton('CAB_KITCHEN_W4', 4970, 5570, true),
            fronts: buildWestTwoDrawerFronts('CAB_KITCHEN_W4', 4970, 5570)
        },

        // =====================================================================
        // 13. CAB_KITCHEN_W5: 600 mm Base 2-Drawer Cabinet (Cab 4, x_svg = 240..300)
        //     Y = 5,570..6,170 mm, X = 11,315..11,915 mm, Z = 0..900 mm
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
            zTop: 900,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            worktopThicknessMm: 30,
            heightMm: 900,
            boardThicknessMm: BOARD_MM,
            normal: [-1, 0, 0],
            specs: '600 × 600 × 900 mm (150 mm plinth + 720 mm 2-drawer carcass + 30 mm blat; 2 × 330 mm wood fronts + 2 × 30 mm handle rails)',
            description: 'Fourth 600 mm 2-drawer base cabinet on the Kitchen West Wall counter run (Cab 4, x_svg = 240..300, Y = 5,570..6,170 mm, immediately north of the 450 mm niche).',
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
        }
    ];

    return {
        _role: 'DEFAULT_SEED_VALUES',
        entityType: 'furniture',
        version: '1.2.0-brep',
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
