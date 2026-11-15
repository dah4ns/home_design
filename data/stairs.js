/**
 * stairs.js - Canonical Default Values for Building Staircases
 * Separated per entity type. Runtime modifications are persisted via PersistenceService (js/persistence.js).
 */
(function (root, factory) {
    const data = factory();
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = data;
    } else {
        root.DEFAULT_STAIRS_DATA = data;
        root.BUILDING_STAIRS_DATA = data;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const defaultStairs = {
        "main_staircase": {
            "id": "main_staircase",
            "name": "Main Staircase (Schody)",
            "room": "1.07 Komunikacja / Korytarz",
            "viewId": "stairs_north_wall",
            "flooring_height": 0,
            "width": 1000,
            "step_height": 175,
            "step_length": 260,
            "plank_height": 40,
            "stair_slab": 160,
            "x": 2549,
            "global_x": 16361,
            "total_risers": 19,
            "turn_steps_count": 4,
            "straight_risers_count": 15,
            "straight_treads_count": 14,
            "horizontal_gain": 3640,
            "elevation_gain": 2625,
            "step5_to_d3_distance": 2174,
            "straight_flight_run": 3640,
            "end_x": 7189,
            "total_rise": 3325,
            "top_floor_elevation": 3330,
            "balustrade_height": 900,
            "show_planks": true,
            "line_thickness": 1.0,
            "materials": {
                "structure": "Reinforced concrete monolithic core (C20/25)",
                "riserFinish": "Mineral plaster / paint matching interior wall",
                "treadPlank": "Solid natural European oak (dąb naturalny) 40 mm",
                "balustrade": "Brushed warm bronze / oak handrail h=90 cm",
                "soffit": "Smooth gypsum plaster painted warm off-white"
            },
            "description": "Two-flight interior staircase with 4-step winder entry turn (1 straight + 3 winder) in 1000×1000 mm corner, followed by a 3,640 mm straight flight of 14 treads (260 mm) × 15 risers (175 mm) along the North Wall to finished +3,33 m.",
            "brep3D": {
                "id": "STAIRS_1",
                "stairId": "main_staircase",
                "name": "STAIRS_1 — Main Winder Staircase (Schody 18×18.5×27)",
                "cadSpecLabel": "18×18,5×27",
                "balustradeLabel": "balustrada h=90",
                "floor": "ground",
                "connectsFloors": ["ground", "first"],
                "rooms": "0.07 Komunikacja -> 1.06 Korytarz",
                "northWallId": "GW_7",
                "westWallId": "GW_5",
                "underStairDoorId": "D_GW7_2",
                "xMin": 11910,
                "xPivot": 15175,
                "xTurnMid": 15675,
                "xMax": 16175,
                "yMin": 8360,
                "yPivot": 9370,
                "yMax": 9640,
                "zBottom": 0,
                "zTop": 3330,
                "upperFloorDatumZ": 3430,
                "flightWidthMm": 1010,
                "turnWidthMm": 1000,
                "riserCount": 18,
                "treadCount": 17,
                "turnStepsCount": 4,
                "straightTreadsCount": 13,
                "straightRisersCount": 14,
                "riserHeightMm": 185,
                "treadDepthMm": 251.15,
                "plankThicknessMm": 40,
                "waistSlabThicknessMm": 160,
                "balustradeHeightMm": 900,
                "balustradeThicknessMm": 60,
                "planCutLine2D": [
                    [13919, 8360],
                    [13668, 9370]
                ],
                "turnSteps2D": [
                    {
                        "stepNumber": 1,
                        "kind": "straight_entry",
                        "zBottom": 0,
                        "zTop": 185,
                        "riserLine2D": [[15175, 9640], [16175, 9640]],
                        "riserNormal": [0, 1, 0],
                        "treadPolygon2D": [[15175, 9640], [16175, 9640], [16175, 9370], [15175, 9370]]
                    },
                    {
                        "stepNumber": 2,
                        "kind": "winder",
                        "zBottom": 185,
                        "zTop": 370,
                        "riserLine2D": [[15175, 9370], [16175, 9370]],
                        "riserNormal": [0, 1, 0],
                        "treadPolygon2D": [[15175, 9370], [16175, 9370], [16175, 8750]]
                    },
                    {
                        "stepNumber": 3,
                        "kind": "winder",
                        "zBottom": 370,
                        "zTop": 555,
                        "riserLine2D": [[15175, 9370], [16175, 8750]],
                        "riserNormal": [0.527, 0.85, 0],
                        "treadPolygon2D": [[15175, 9370], [16175, 8750], [16175, 8360], [15675, 8360]]
                    },
                    {
                        "stepNumber": 4,
                        "kind": "winder",
                        "zBottom": 555,
                        "zTop": 740,
                        "riserLine2D": [[15175, 9370], [15675, 8360]],
                        "riserNormal": [0.896, 0.444, 0],
                        "treadPolygon2D": [[15175, 9370], [15675, 8360], [15175, 8360]]
                    }
                ],
                "walkingLine3D": [
                    [15675, 9640, 0],
                    [15675, 9505, 185],
                    [15675, 8865, 555],
                    [15175, 8865, 740],
                    [11910, 8865, 3330]
                ]
            }
        },
        "basement_staircase": {
            "id": "basement_staircase",
            "name": "Basement Staircase (Wejście do piwnicy 13×19,46×21,5)",
            "room": "0.14 Spiżarnia / -1 Piwnica",
            "viewId": "stairs_spizarnia_basement",
            "flooring_height": -2470,
            "width": 900,
            "step_height": 190,
            "step_length": 215,
            "plank_height": 40,
            "stair_slab": 160,
            "total_risers": 13,
            "turn_steps_count": 4,
            "straight_risers_count": 9,
            "straight_treads_count": 8,
            "horizontal_gain": 1720,
            "elevation_gain": 2470,
            "total_rise": 2470,
            "top_floor_elevation": 0,
            "balustrade_height": 0,
            "show_planks": true,
            "line_thickness": 1.0,
            "materials": {
                "structure": "Reinforced concrete monolithic core (C20/25)",
                "riserFinish": "Mineral plaster / paint matching interior wall",
                "treadPlank": "Gres / solid oak tread finish 40 mm",
                "soffit": "Smooth gypsum plaster painted warm off-white"
            },
            "description": "L-shaped winder staircase connecting -1 Piwnica (Z = -2,470 mm) and 0.14 Spiżarnia (Z = 0 mm): 6 lower straight treads (129 cm = 6 × 21.5 cm) along the South wall (X = 4,205..5,495 mm), 4 winder treads in the 82 × 90 cm SW corner (X = 5,495..6,315 mm, Y = 5,210..6,070 mm), and 2 upper straight treads (43 cm = 2 × 21.5 cm, Y = 4,770..5,210 mm) arriving at Z = 0 mm next to door D_GW13_1.",
            "brep3D": {
                "id": "STAIRS_BASEMENT",
                "stairId": "basement_staircase",
                "name": "STAIRS_BASEMENT — Spiżarnia Basement Staircase (Wejście do piwnicy 13×19,46×21,5)",
                "cadSpecLabel": "13×19,46×21,5",
                "balustradeLabel": "wejście do piwnicy",
                "floor": "basement",
                "connectsFloors": ["basement", "ground"],
                "rooms": "-1 Piwnica -> 0.14 Spiżarnia",
                "southWallId": "BW_SOUTH",
                "westWallId": "GW_13",
                "eastWallId": "GW_14",
                "xMin": 4205,
                "xPivot": 5495,
                "xTurnMid": 5905,
                "xMax": 6315,
                "yMin": 4770,
                "yPivot": 5210,
                "yTurnMid": 5640,
                "yMax": 6070,
                "zBottom": -2470,
                "zTop": 0,
                "upperFloorDatumZ": 0,
                "flightWidthMm": 860,
                "turnWidthMm": 820,
                "riserCount": 13,
                "treadCount": 12,
                "lowerStraightTreadsCount": 6,
                "turnStepsCount": 4,
                "upperStraightTreadsCount": 2,
                "riserHeightMm": 190,
                "treadDepthMm": 215,
                "upperTreadDepthMm": 220,
                "plankThicknessMm": 40,
                "waistSlabThicknessMm": 160,
                "balustradeHeightMm": 0,
                "balustradeThicknessMm": 0,
                "planCutLine2D": [
                    [5150, 5210],
                    [5495, 6070]
                ],
                "walkingLine3D": [
                    [4205, 5640, -2470],
                    [5495, 5640, -1330],
                    [5905, 5640, -950],
                    [5905, 5210, -570],
                    [5905, 4770, 0]
                ]
            }
        }
    };

    return {
        "_role": "DEFAULT_SEED_VALUES",
        "entityType": "stairs",
        "version": "1.1.0",
        "metadata": {
            "isDefaultSeed": true,
            "persistenceNote": "This file defines the canonical DEFAULT staircase values (both 2D elevation parameters and 3D B-Rep [x, y, z] coordinates). Runtime modifications are read from and saved to the active PersistenceService adapter (js/persistence.js)."
        },
        "description": "Canonical default database of staircase structural objects, 3D B-Rep geometry, and 2D projection specifications",
        "coordinateSystem": {
            "units": "millimeters (mm)",
            "scale": 0.1,
            "viewId": "stairs_north_wall",
            "viewOriginOnMap": 18910,
            "direction": "east",
            "axes3D": {
                "x": "East -> West (0..20,705 mm)",
                "y": "North -> South (-290..21,130 mm)",
                "z": "Vertical Elevation (0..6,130 mm)"
            }
        },
        "defaultStairs": defaultStairs,
        "stairs": defaultStairs
    };
}));
