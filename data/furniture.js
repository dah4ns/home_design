/**
 * furniture.js - Canonical 3D B-Rep Furniture & Cabinet Database
 *
 * Coordinate System (Right-Handed 3D Architectural / BIM Convention):
 * - X axis: East -> West horizontal axis in millimeters (Axis 6 = 0 mm; Kitchen spans X = 6,495..11,915 mm)
 * - Y axis: North -> South horizontal axis in millimeters (Axis A = 0 mm; Kitchen North Wall interior face = 3,170 mm)
 * - Z axis: Vertical height / elevation in millimeters (Finished Ground Floor = 0 mm)
 *
 * Every cabinet object in this database is composed of two explicit 3D parts:
 * 1. `skeleton`: Structural carcass panels (18 mm side/bottom/back/top/divider boards) and recessed plinth (cokół).
 * 2. `fronts`: Removable exterior drawer/door front panels (wood-tone) and integrated handle rails (Gola profile).
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
    const defaultFurniture = [
        {
            id: 'CAB_KITCHEN_1',
            name: 'CAB_KITCHEN_1 — Kitchen Base 2-Drawer Cabinet 600mm (Right of Zmywarka)',
            shortName: 'Base 2-Drawer Cabinet (600×600×870 mm)',
            category: 'cabinet',
            subtype: 'base_cabinet_2_drawers',
            floor: 'ground',
            room: '0.13 Kuchnia',
            hostWallId: 'EW_NORTH_RECESSED',
            viewId: 'kitchen_north_wall',
            // Global 3D bounding box [x, y, z] in millimeters:
            // Positioned on Kitchen North Wall (interior face Y = 3,170 mm),
            // 2,400..3,000 mm East of Kitchen West Wall GW_3 (X = 11,915 mm) -> X = 8,915..9,515 mm,
            // immediately to the right (East) of Zmywarka (X = 9,515..10,115 mm).
            x1: 8915,
            x2: 9515,
            y1: 3170,
            y2: 3770,
            zBottom: 0,
            zTop: 870,
            widthMm: 600,
            depthMm: 600,
            carcassDepthMm: 580,
            frontThicknessMm: 20,
            plinthHeightMm: 150,
            plinthRecessMm: 60,
            bodyHeightMm: 720,
            heightMm: 870,
            boardThicknessMm: 18,
            normal: [0, 1, 0], // Faces South into 0.13 Kuchnia
            specs: '600 × 600 × 870 mm (150 mm plinth cokół + 720 mm carcass with 2 × 360 mm drawers; 330 mm wood fronts + 30 mm aluminum Gola handle rails)',
            description: 'Base kitchen cabinet with 2 equal-height drawers (2 × 360 mm) located on the Kitchen North Wall (EW_NORTH_RECESSED) immediately to the right of the dishwasher (Zmywarka). Split into 3D Skeleton (recessed plinth + 18 mm carcass panels) and removable Fronts (2 wood drawer fronts + 2 horizontal aluminum handle rails).',
            // Part 1: 3D Skeleton (Plinth + 18 mm Carcass Box Panels)
            skeleton: [
                {
                    id: 'CAB_KITCHEN_1_PLINTH',
                    name: 'Recessed Plinth / Toe-Kick (Cokół 150 mm)',
                    role: 'plinth',
                    material: 'dark_plinth',
                    colorRgb: [0.29, 0.23, 0.20],
                    x0: 8915, x1: 9515,
                    y0: 3170, y1: 3710,
                    z0: 0, z1: 150
                },
                {
                    id: 'CAB_KITCHEN_1_LEFT_PANEL',
                    name: 'Left Side Carcass Panel (18×580×720 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.94, 0.91, 0.85],
                    x0: 8915, x1: 8933,
                    y0: 3170, y1: 3750,
                    z0: 150, z1: 870
                },
                {
                    id: 'CAB_KITCHEN_1_RIGHT_PANEL',
                    name: 'Right Side Carcass Panel (18×580×720 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.94, 0.91, 0.85],
                    x0: 9497, x1: 9515,
                    y0: 3170, y1: 3750,
                    z0: 150, z1: 870
                },
                {
                    id: 'CAB_KITCHEN_1_BACK_PANEL',
                    name: 'Rear Carcass Backing Panel (564×18×720 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.91, 0.88, 0.81],
                    x0: 8933, x1: 9497,
                    y0: 3170, y1: 3188,
                    z0: 150, z1: 870
                },
                {
                    id: 'CAB_KITCHEN_1_BOTTOM_PANEL',
                    name: 'Bottom Carcass Panel (564×562×18 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.93, 0.90, 0.84],
                    x0: 8933, x1: 9497,
                    y0: 3188, y1: 3750,
                    z0: 150, z1: 168
                },
                {
                    id: 'CAB_KITCHEN_1_MID_SHELF',
                    name: 'Middle Drawer Divider Shelf (564×562×18 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.93, 0.90, 0.84],
                    x0: 8933, x1: 9497,
                    y0: 3188, y1: 3750,
                    z0: 501, z1: 519
                },
                {
                    id: 'CAB_KITCHEN_1_TOP_PANEL',
                    name: 'Top Carcass Panel (564×562×18 mm)',
                    role: 'carcass_panel',
                    material: 'carcass_melamine',
                    colorRgb: [0.93, 0.90, 0.84],
                    x0: 8933, x1: 9497,
                    y0: 3188, y1: 3750,
                    z0: 852, z1: 870
                }
            ],
            // Part 2: Removable 3D Fronts (2 × 330 mm Wood Drawer Fronts + 2 × 30 mm Aluminum Handle Rails)
            fronts: [
                {
                    id: 'CAB_KITCHEN_1_FRONT_LOWER',
                    name: 'Lower Drawer Wood Front (596×20×328 mm)',
                    role: 'drawer_front',
                    material: 'wood_tone',
                    colorRgb: [0.63, 0.48, 0.38],
                    x0: 8917, x1: 9513,
                    y0: 3750, y1: 3770,
                    z0: 152, z1: 480
                },
                {
                    id: 'CAB_KITCHEN_1_RAIL_LOWER',
                    name: 'Lower Recessed Aluminum Handle Rail (600×22×30 mm)',
                    role: 'handle_rail',
                    material: 'aluminum_rail',
                    colorRgb: [0.82, 0.84, 0.86],
                    x0: 8915, x1: 9515,
                    y0: 3746, y1: 3768,
                    z0: 480, z1: 510
                },
                {
                    id: 'CAB_KITCHEN_1_FRONT_UPPER',
                    name: 'Upper Drawer Wood Front (596×20×328 mm)',
                    role: 'drawer_front',
                    material: 'wood_tone',
                    colorRgb: [0.63, 0.48, 0.38],
                    x0: 8917, x1: 9513,
                    y0: 3750, y1: 3770,
                    z0: 512, z1: 840
                },
                {
                    id: 'CAB_KITCHEN_1_RAIL_UPPER',
                    name: 'Upper Recessed Aluminum Handle Rail (600×22×30 mm)',
                    role: 'handle_rail',
                    material: 'aluminum_rail',
                    colorRgb: [0.82, 0.84, 0.86],
                    x0: 8915, x1: 9515,
                    y0: 3746, y1: 3768,
                    z0: 840, z1: 870
                }
            ]
        }
    ];

    return {
        _role: 'DEFAULT_SEED_VALUES',
        entityType: 'furniture',
        version: '1.0.0-brep',
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
