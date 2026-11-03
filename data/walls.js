/**
 * walls.js - Canonical 3D B-Rep Wall Model with Connected [x, y, z] Outer Loops & Holes
 *
 * Every wall object in this database is a 3D B-Rep solid bounded by its two main
 * faces: sides = [sideA, sideB].
 *
 * Each side explicitly defines:
 * - normal: [nx, ny, nz] outward unit normal vector (direction-agnostic, no 'north'/'west' keys)
 * - outerLoop: connected list of 3D [x, y, z] vertices around the face perimeter.
 *   * Where a door or floor-to-ceiling opening starts at the floor (z = zBottom) and is
 *     lower than the ceiling (zMax < zTop), outerLoop traces the notch up and over the door
 *     lintel: [x, yStart, zBottom] -> [x, yStart, zDoorTop] -> [x, yEnd, zDoorTop] -> [x, yEnd, zBottom].
 * - holes: array of interior opening loops { id, kind, loop: [[x, y, z], ...] } for windows
 *   that sit above the floor sill (zMin > zBottom) and below the ceiling (zMax < zTop).
 */
(function (root, factory) {
    const db = factory();
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = db;
    } else {
        root.DEFAULT_WALLS_DATA = db;
        root.WALL_DATABASE = db;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    return {
        _role: 'DEFAULT_SEED_VALUES',
        entityType: 'walls',
        metadata: {
            version: '2.0.0-brep',
            representation: '3D B-Rep Faces with connected [x, y, z] outerLoop and holes',
            coordinateSystem: {
                x: 'East -> West horizontal axis in millimeters (Axis 6 = 0 mm; East outer face = -285 mm, West outer face = 20,705 mm)',
                y: 'North -> South horizontal axis in millimeters (Axis A = 0 mm; Garage North outer face = -290 mm, SW Wing South outer face = 21,130 mm)',
                z: 'Vertical height / elevation in millimeters (Parter = 0..2,800 mm, Piętro = 3,430..6,130 mm)'
            }
        },

        walls: [
            // =========================================================================
            // GROUND FLOOR (PARTER, Z = 0..2,800 mm) — EXTERIOR MITERED 3D B-REP WALLS
            // =========================================================================
            {
                id: 'EW_NORTH_RECESSED',
                name: 'North Recessed Exterior Wall (Gabinet & Kuchnia)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Exterior Garden (N) ↔ 0.15 Gabinet, 0.14 Spiżarnia & 0.13 Kuchnia',
                specs: '12,000 mm (plan) / 12,010 mm (facade) × 400 mm • Hosts study window O2 and kitchen window O1 as 3D holes',
                openings: ['O2', 'O1'],
                doors: [],
                sides: [
                    {
                        id: 'EW_NORTH_RECESSED_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, -1, 0],
                        p1: [-285, 2790],
                        p2: [11715, 2790],
                        facadeBounds: { xMinMm: -270, xMaxMm: 11740, lengthMm: 12010, svgGroupId: 'ground-recessed-facade' },
                        outerLoop: [
                            [-285, 2790, 0],
                            [11715, 2790, 0],
                            [11715, 2790, 2800],
                            [-285, 2790, 2800]
                        ],
                        holes: [
                            {
                                id: 'O2',
                                kind: 'window',
                                loop: [
                                    [880, 2790, 800],
                                    [2680, 2790, 800],
                                    [2680, 2790, 2500],
                                    [880, 2790, 2500]
                                ]
                            },
                            {
                                id: 'O1',
                                kind: 'window',
                                loop: [
                                    [8480, 2790, 1100],
                                    [10580, 2790, 1100],
                                    [10580, 2790, 2500],
                                    [8480, 2790, 2500]
                                ]
                            }
                        ]
                    },
                    {
                        id: 'EW_NORTH_RECESSED_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [12095, 3190],
                        p2: [115, 3190],
                        outerLoop: [
                            [12095, 3190, 0],
                            [115, 3190, 0],
                            [115, 3190, 2800],
                            [12095, 3190, 2800]
                        ],
                        holes: [
                            {
                                id: 'O2',
                                kind: 'window',
                                loop: [
                                    [2680, 3190, 800],
                                    [880, 3190, 800],
                                    [880, 3190, 2500],
                                    [2680, 3190, 2500]
                                ]
                            },
                            {
                                id: 'O1',
                                kind: 'window',
                                loop: [
                                    [10580, 3190, 1100],
                                    [8480, 3190, 1100],
                                    [8480, 3190, 2500],
                                    [10580, 3190, 2500]
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'EW_GARAGE_EAST',
                name: 'Garage East Protrusion Wall (Axis 4 Step)',
                floor: 'ground',
                category: 'exterior',
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Exterior Forecourt (E) ↔ 0.02 Magazyn & 0.03 Kotłownia',
                specs: '3,080 × 380 mm (38 cm) • Protrudes 3,080 mm North of Recessed North Wall',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'EW_GARAGE_EAST_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [-1, 0, 0],
                        p1: [11715, 2790],
                        p2: [11715, -290],
                        outerLoop: [
                            [11715, 2790, 0],
                            [11715, -290, 0],
                            [11715, -290, 2800],
                            [11715, 2790, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_GARAGE_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [12095, 110],
                        p2: [12095, 3190],
                        outerLoop: [
                            [12095, 110, 0],
                            [12095, 3190, 0],
                            [12095, 3190, 2800],
                            [12095, 110, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_GARAGE_NORTH',
                name: 'Garage & Magazyn North Exterior Wall (899 cm)',
                floor: 'ground',
                category: 'exterior',
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Exterior Forecourt (N) ↔ 0.01 Garaż (605 cm) & 0.02 Magazyn (200 cm)',
                specs: '8,990 × 380 mm (38 + 605 + 18 + 200 + 38 = 899 cm) • Solid blind clinker brick north wall',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'EW_GARAGE_NORTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, -1, 0],
                        p1: [11715, -290],
                        p2: [20705, -290],
                        facadeBounds: { xMinMm: 11740, xMaxMm: 20730, lengthMm: 8990, svgGroupId: 'ground-garage-volume' },
                        outerLoop: [
                            [11715, -290, 0],
                            [20705, -290, 0],
                            [20705, -290, 2800],
                            [11715, -290, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_GARAGE_NORTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [20325, 110],
                        p2: [12095, 110],
                        outerLoop: [
                            [20325, 110, 0],
                            [12095, 110, 0],
                            [12095, 110, 2800],
                            [20325, 110, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_GARAGE_WEST',
                name: 'Garage & Vestibule West Exterior Wall (with Garage Door Z2 Notch)',
                floor: 'ground',
                category: 'exterior',
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Driveway (W) ↔ 0.01 Garaż Dwustanowiskowy & 0.04 Wiatrołap',
                specs: '8,850 × 380 mm (38 cm) • Continuous West wall from NW corner (Y = -290) to Entrance Alcove (Y = 8,560); outerLoop notches up to Z = 2,200 mm over 5,200 mm garage door Z2',
                openings: ['Z2'],
                doors: [],
                sides: [
                    {
                        id: 'EW_GARAGE_WEST_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [1, 0, 0],
                        p1: [20705, -290],
                        p2: [20705, 8560],
                        // Connected 3D (x,y,z) loop stepping over Garage Door Z2 (Y = 690..5890, Z = 0..2200)
                        outerLoop: [
                            [20705, -290, 0],
                            [20705, 690, 0],
                            [20705, 690, 2200],
                            [20705, 5890, 2200],
                            [20705, 5890, 0],
                            [20705, 8560, 0],
                            [20705, 8560, 2800],
                            [20705, -290, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_GARAGE_WEST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [-1, 0, 0],
                        p1: [20325, 8160],
                        p2: [20325, 110],
                        outerLoop: [
                            [20325, 8160, 0],
                            [20325, 5890, 0],
                            [20325, 5890, 2200],
                            [20325, 690, 2200],
                            [20325, 690, 0],
                            [20325, 110, 0],
                            [20325, 110, 2800],
                            [20325, 8160, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_ALCOVE_NORTH',
                name: 'Entrance Alcove North Return Wall',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch ↔ 0.04 Wiatrołap',
                specs: '1,150 × 400 mm • North reveal of recessed main entrance',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'EW_ALCOVE_NORTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, 1, 0],
                        p1: [20705, 8560],
                        p2: [19555, 8560],
                        outerLoop: [
                            [20705, 8560, 0],
                            [19555, 8560, 0],
                            [19555, 8560, 2800],
                            [20705, 8560, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_ALCOVE_NORTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, -1, 0],
                        p1: [19155, 8160],
                        p2: [20325, 8160],
                        outerLoop: [
                            [19155, 8160, 0],
                            [20325, 8160, 0],
                            [20325, 8160, 2800],
                            [19155, 8160, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_ALCOVE_WEST',
                name: 'Entrance Alcove Recessed Wall (with Door Z1 Notch)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch (W) ↔ 0.04 Wiatrołap',
                specs: '2,460 × 400 mm • OuterLoop notches up to Z = 2,250 mm over entrance door Z1 (550 mm lintel above door)',
                openings: ['Z1'],
                doors: [],
                sides: [
                    {
                        id: 'EW_ALCOVE_WEST_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [1, 0, 0],
                        p1: [19555, 8560],
                        p2: [19555, 11020],
                        outerLoop: [
                            [19555, 8560, 0],
                            [19555, 8920, 0],
                            [19555, 8920, 2250],
                            [19555, 10620, 2250],
                            [19555, 10620, 0],
                            [19555, 11020, 0],
                            [19555, 11020, 2800],
                            [19555, 8560, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_ALCOVE_WEST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [-1, 0, 0],
                        p1: [19155, 11420],
                        p2: [19155, 8160],
                        outerLoop: [
                            [19155, 11420, 0],
                            [19155, 10620, 0],
                            [19155, 10620, 2250],
                            [19155, 8920, 2250],
                            [19155, 8920, 0],
                            [19155, 8160, 0],
                            [19155, 8160, 2800],
                            [19155, 11420, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_ALCOVE_SOUTH',
                name: 'Entrance Alcove South Return Wall',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch ↔ 0.08 Pralnia',
                specs: '1,150 × 400 mm • South reveal of recessed main entrance',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'EW_ALCOVE_SOUTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, -1, 0],
                        p1: [19555, 11020],
                        p2: [20705, 11020],
                        outerLoop: [
                            [19555, 11020, 0],
                            [20705, 11020, 0],
                            [20705, 11020, 2800],
                            [19555, 11020, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_ALCOVE_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [20305, 11420],
                        p2: [19155, 11420],
                        outerLoop: [
                            [20305, 11420, 0],
                            [19155, 11420, 0],
                            [19155, 11420, 2800],
                            [20305, 11420, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_WEST_SOUTH',
                name: 'South-West Wing West Exterior Wall (with Clerestory O8a)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'West Garden (W) ↔ 0.08 Pralnia, 0.09 Łazienka & 0.10 Siłownia',
                specs: '10,110 × 400 mm • Hosts high clerestory ribbon window O8a (hp = 2,060..2,800 mm, above 1,200 mm floor-plan slice)',
                openings: ['O8a'],
                doors: [],
                sides: [
                    {
                        id: 'EW_WEST_SOUTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [1, 0, 0],
                        p1: [20705, 11020],
                        p2: [20705, 21130],
                        outerLoop: [
                            [20705, 11020, 0],
                            [20705, 21130, 0],
                            [20705, 21130, 2800],
                            [20705, 20750, 2800],
                            [20705, 20750, 2060],
                            [20705, 15250, 2060],
                            [20705, 15250, 2800],
                            [20705, 11020, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_WEST_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [-1, 0, 0],
                        p1: [20305, 20730],
                        p2: [20305, 11420],
                        outerLoop: [
                            [20305, 20730, 0],
                            [20305, 11420, 0],
                            [20305, 11420, 2800],
                            [20305, 15250, 2800],
                            [20305, 15250, 2060],
                            [20305, 20730, 2060]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_SW_SOUTH',
                name: 'South-West Wing South Exterior Wall (with O7)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'South Garden (S) ↔ 0.10 Siłownia',
                specs: '6,010 × 400 mm • Hosts full-height corner window O7 (2,000 × 2,800 mm)',
                openings: ['O7'],
                doors: [],
                sides: [
                    {
                        id: 'EW_SW_SOUTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, 1, 0],
                        p1: [20705, 21130],
                        p2: [14695, 21130],
                        outerLoop: [
                            [20705, 21130, 0],
                            [16895, 21130, 0],
                            [16895, 21130, 2800],
                            [20705, 21130, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_SW_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, -1, 0],
                        p1: [15095, 20730],
                        p2: [20305, 20730],
                        outerLoop: [
                            [16895, 20730, 0],
                            [20305, 20730, 0],
                            [20305, 20730, 2800],
                            [16895, 20730, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_SW_EAST',
                name: 'South-West Wing East Terrace Wall (with O6b & O6a)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered South Terrace (E) ↔ 0.10 Siłownia & 0.16 Komunikacja',
                specs: '9,550 × 400 mm • Sheltered by 1,960 mm East roof overhang; hosts O6b and O6a',
                openings: ['O6b', 'O6a'],
                doors: [],
                sides: [
                    {
                        id: 'EW_SW_EAST_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [-1, 0, 0],
                        p1: [14695, 21130],
                        p2: [14695, 11580],
                        outerLoop: [
                            [14695, 15285, 0],
                            [14695, 11580, 0],
                            [14695, 11580, 2800],
                            [14695, 13275, 2800],
                            [14695, 13275, 2060],
                            [14695, 15035, 2060],
                            [14695, 15035, 2800],
                            [14695, 15285, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_SW_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [15095, 11180],
                        p2: [15095, 20730],
                        outerLoop: [
                            [15095, 11180, 0],
                            [15095, 15285, 0],
                            [15095, 15285, 2800],
                            [15095, 15035, 2800],
                            [15095, 15035, 2060],
                            [15095, 13275, 2060],
                            [15095, 13275, 2800],
                            [15095, 11180, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'EW_SOUTH_RECESSED',
                name: 'South Living & Dining Exterior Wall (with O5 & O4)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'South Terrace (S) ↔ 0.12 Jadalnia & 0.11 Salon',
                specs: '14,980 × 400 mm • Full-height HST glazing O5 (7,215..13,695) and corner glazing O4 (-285..6,215)',
                openings: ['O5', 'O4'],
                doors: [],
                sides: [
                    {
                        id: 'EW_SOUTH_RECESSED_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, 1, 0],
                        p1: [14695, 11580],
                        p2: [-285, 11580],
                        outerLoop: [
                            [14695, 11580, 0],
                            [6215, 11580, 0],
                            [6215, 11580, 2800],
                            [14695, 11580, 2800]
                        ],
                        holes: [
                            {
                                id: 'O5',
                                kind: 'window',
                                loop: [
                                    [13695, 11580, 0],
                                    [7215, 11580, 0],
                                    [7215, 11580, 2800],
                                    [13695, 11580, 2800]
                                ]
                            }
                        ]
                    },
                    {
                        id: 'EW_SOUTH_RECESSED_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, -1, 0],
                        p1: [115, 11180],
                        p2: [15095, 11180],
                        outerLoop: [
                            [6215, 11180, 0],
                            [15095, 11180, 0],
                            [15095, 11180, 2800],
                            [6215, 11180, 2800]
                        ],
                        holes: [
                            {
                                id: 'O5',
                                kind: 'window',
                                loop: [
                                    [7215, 11180, 0],
                                    [13695, 11180, 0],
                                    [13695, 11180, 2800],
                                    [7215, 11180, 2800]
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'EW_EAST_CORE',
                name: 'East Garden Exterior Wall (with O3)',
                floor: 'ground',
                category: 'exterior',
                thickness: 400,
                zBottom: 0,
                zTop: 2800,
                rooms: 'East Garden (E) ↔ 0.11 Salon & 0.15 Gabinet',
                specs: '8,790 × 400 mm • Hosts full-height corner glazing O3 (5,090 × 2,800 mm) meeting O4 at SE corner',
                openings: ['O3'],
                doors: [],
                sides: [
                    {
                        id: 'EW_EAST_CORE_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [-1, 0, 0],
                        p1: [-285, 11580],
                        p2: [-285, 2790],
                        outerLoop: [
                            [-285, 6290, 0],
                            [-285, 2790, 0],
                            [-285, 2790, 2800],
                            [-285, 6290, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_EAST_CORE_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [115, 3190],
                        p2: [115, 11180],
                        outerLoop: [
                            [115, 3190, 0],
                            [115, 6290, 0],
                            [115, 6290, 2800],
                            [115, 3190, 2800]
                        ],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // UPPER FLOOR (PIĘTRO, Z = 3,430..6,130 mm) — EXTERIOR MITERED 3D B-REP WALLS
            // =========================================================================
            {
                id: 'UW_TERRACE_BACK',
                name: 'Upper NE Terrace Recessed Back Wall',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'NE Covered Balcony (N) ↔ Pustka nad salonem',
                specs: '6,600 mm (plan) / 6,315 mm (balcony clear span) × 400 mm • Recessed 3,100 mm South behind NE terrace',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'UW_TERRACE_BACK_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [0, -1, 0],
                        p1: [-285, 5890],
                        p2: [6315, 5890],
                        facadeBounds: { xMinMm: 0, xMaxMm: 6315, lengthMm: 6315, svgGroupId: 'upper-terrace' },
                        outerLoop: [
                            [-285, 5890, 3430],
                            [6315, 5890, 3430],
                            [6315, 5890, 6130],
                            [-285, 5890, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_TERRACE_BACK_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [6715, 6290],
                        p2: [115, 6290],
                        outerLoop: [
                            [6715, 6290, 3430],
                            [115, 6290, 3430],
                            [115, 6290, 6130],
                            [6715, 6290, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'UW_TERRACE_EAST',
                name: 'Upper NE Terrace Side Wall (with O14b + D1)',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'NE Covered Balcony (E) ↔ 1.01 Sypialnia',
                specs: '3,100 × 400 mm • Hosts full-height terrace glazing O14b + balcony door D1 (2,810 × 2,700 mm)',
                openings: ['O14b'],
                doors: [],
                sides: [
                    {
                        id: 'UW_TERRACE_EAST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [-1, 0, 0],
                        p1: [6315, 5890],
                        p2: [6315, 2790],
                        outerLoop: [
                            [6315, 5890, 3430],
                            [6315, 5800, 3430],
                            [6315, 5800, 6130],
                            [6315, 5890, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_TERRACE_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [6715, 3190],
                        p2: [6715, 6290],
                        outerLoop: [
                            [6715, 5800, 3430],
                            [6715, 6290, 3430],
                            [6715, 6290, 6130],
                            [6715, 5800, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'UW_NORTH_MAIN',
                name: 'Upper North Main Timber Wall (14a, O15/O11, O13a)',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'North Garden (N) ↔ 1.01 Sypialnia, 1.02 Łazienka, 1.03 Łazienka & 1.05 Pokój',
                specs: '14,390 mm (plan) / 14,190 mm (excl. 200 mm right jamb) × 400 mm • Starts at X=7,505 after full-height corner window 14a and notches down to Z=4,180 for NW corner window O13a',
                openings: ['14a', 'O15', 'O11_1', 'O11_2', 'O11_3', 'O13a'],
                doors: [],
                sides: [
                    {
                        id: 'UW_NORTH_MAIN_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [0, -1, 0],
                        p1: [6315, 2790],
                        p2: [20705, 2790],
                        facadeBounds: { xMinMm: 6315, xMaxMm: 20505, lengthMm: 14190, rightReturnJambMm: 200, svgGroupId: 'upper-timber-facade' },
                        outerLoop: [
                            [7505, 2790, 3430],
                            [20705, 2790, 3430],
                            [20705, 2790, 4180],
                            [18125, 2790, 4180],
                            [18125, 2790, 6130],
                            [7505, 2790, 6130]
                        ],
                        holes: [
                            {
                                id: 'O15',
                                kind: 'window',
                                loop: [
                                    [8480, 2790, 3430],
                                    [10580, 2790, 3430],
                                    [10580, 2790, 6130],
                                    [8480, 2790, 6130]
                                ]
                            },
                            {
                                id: 'O11_2',
                                kind: 'window',
                                loop: [
                                    [11375, 2790, 4180],
                                    [12375, 2790, 4180],
                                    [12375, 2790, 6130],
                                    [11375, 2790, 6130]
                                ]
                            },
                            {
                                id: 'O11_3',
                                kind: 'window',
                                loop: [
                                    [14015, 2790, 4180],
                                    [15015, 2790, 4180],
                                    [15015, 2790, 6130],
                                    [14015, 2790, 6130]
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UW_NORTH_MAIN_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [20305, 3190],
                        p2: [6715, 3190],
                        outerLoop: [
                            [20305, 3190, 3430],
                            [7505, 3190, 3430],
                            [7505, 3190, 6130],
                            [18125, 3190, 6130],
                            [18125, 3190, 4180],
                            [20305, 3190, 4180]
                        ],
                        holes: [
                            {
                                id: 'O15',
                                kind: 'window',
                                loop: [
                                    [10580, 3190, 3430],
                                    [8480, 3190, 3430],
                                    [8480, 3190, 6130],
                                    [10580, 3190, 6130]
                                ]
                            },
                            {
                                id: 'O11_2',
                                kind: 'window',
                                loop: [
                                    [12375, 3190, 4180],
                                    [11375, 3190, 4180],
                                    [11375, 3190, 6130],
                                    [12375, 3190, 6130]
                                ]
                            },
                            {
                                id: 'O11_3',
                                kind: 'window',
                                loop: [
                                    [15015, 3190, 4180],
                                    [14015, 3190, 4180],
                                    [14015, 3190, 6130],
                                    [15015, 3190, 6130]
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'UW_WEST',
                name: 'Upper West Timber Wall (with O13b_1 & O13b_2)',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'West Forecourt (W) ↔ 1.05 Pokój & 1.04 Pokój',
                specs: '8,790 × 400 mm • Hosts NW and SW corner windows O13b_1 and O13b_2',
                openings: ['O13b_1', 'O13b_2'],
                doors: [],
                sides: [
                    {
                        id: 'UW_WEST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [1, 0, 0],
                        p1: [20705, 2790],
                        p2: [20705, 11580],
                        outerLoop: [
                            [20705, 2790, 3430],
                            [20705, 11580, 3430],
                            [20705, 11580, 4180],
                            [20705, 9010, 4180],
                            [20705, 9010, 6130],
                            [20705, 5360, 6130],
                            [20705, 5360, 4180],
                            [20705, 2790, 4180]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_WEST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [-1, 0, 0],
                        p1: [20305, 11180],
                        p2: [20305, 3190],
                        outerLoop: [
                            [20305, 11180, 3430],
                            [20305, 3190, 3430],
                            [20305, 3190, 4180],
                            [20305, 5360, 4180],
                            [20305, 5360, 6130],
                            [20305, 9010, 6130],
                            [20305, 9010, 4180],
                            [20305, 11180, 4180]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'UW_SOUTH',
                name: 'Upper South Timber Wall (O13a_2, O12, SO3, O10)',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'South Garden (S) ↔ 1.04 Pokój, 1.06 Korytarz, 1.08 Garderoba & Antresola',
                specs: '20,990 × 400 mm • Notches down to Z=4,180 for SW corner window O13a_2, hosts O12 and SO3, and ends at X=6,215 before full-height SE corner window O10',
                openings: ['O13a_2', 'O12', 'SO3', 'O10'],
                doors: [],
                sides: [
                    {
                        id: 'UW_SOUTH_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [0, 1, 0],
                        p1: [20705, 11580],
                        p2: [-285, 11580],
                        outerLoop: [
                            [20705, 11580, 3430],
                            [6215, 11580, 3430],
                            [6215, 11580, 6130],
                            [18125, 11580, 6130],
                            [18125, 11580, 4180],
                            [20705, 11580, 4180]
                        ],
                        holes: [
                            {
                                id: 'O12',
                                kind: 'window',
                                loop: [
                                    [14695, 11580, 3430],
                                    [10695, 11580, 3430],
                                    [10695, 11580, 6130],
                                    [14695, 11580, 6130]
                                ]
                            },
                            {
                                id: 'SO3',
                                kind: 'window',
                                loop: [
                                    [8215, 11580, 4180],
                                    [7215, 11580, 4180],
                                    [7215, 11580, 6130],
                                    [8215, 11580, 6130]
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UW_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, -1, 0],
                        p1: [115, 11180],
                        p2: [20305, 11180],
                        outerLoop: [
                            [6215, 11180, 3430],
                            [20305, 11180, 3430],
                            [20305, 11180, 4180],
                            [18125, 11180, 4180],
                            [18125, 11180, 6130],
                            [6215, 11180, 6130]
                        ],
                        holes: [
                            {
                                id: 'O12',
                                kind: 'window',
                                loop: [
                                    [10695, 11180, 3430],
                                    [14695, 11180, 3430],
                                    [14695, 11180, 6130],
                                    [10695, 11180, 6130]
                                ]
                            },
                            {
                                id: 'SO3',
                                kind: 'window',
                                loop: [
                                    [7215, 11180, 4180],
                                    [8215, 11180, 4180],
                                    [8215, 11180, 6130],
                                    [7215, 11180, 6130]
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'UW_EAST',
                name: 'Upper East Timber Wall (with O9)',
                floor: 'first',
                category: 'exterior',
                thickness: 400,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'East Garden (E) ↔ Pustka nad salonem (Antresola)',
                specs: '5,690 × 400 mm • Hosts full-height corner glazing O9 (5,090 × 2,700 mm) meeting O10',
                openings: ['O9'],
                doors: [],
                sides: [
                    {
                        id: 'UW_EAST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [-1, 0, 0],
                        p1: [-285, 11580],
                        p2: [-285, 5890],
                        outerLoop: [
                            [-285, 6290, 3430],
                            [-285, 5890, 3430],
                            [-285, 5890, 6130],
                            [-285, 6290, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [115, 6290],
                        p2: [115, 11180],
                        outerLoop: [],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // GROUND FLOOR (PARTER, A.02) — INTERNAL PARTITION WALLS (18 cm / 12 cm)
            // Where a wall has doors (height 2,050..2,100 mm < ceiling 2,800 mm),
            // outerLoop traces the 3D doorway notches along the bottom edge!
            // =========================================================================
            {
                id: 'GW_1',
                name: 'GW_1 (Garaż / Magazyn & Kotłownia)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 14095, y1: 110, x2: 14275, y2: 7205,
                thickness: 180,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.01 Garaż (605 cm) ↔ 0.02 Magazyn & 0.03 Kotłownia (200 cm)',
                specs: '180 × 7,095 mm (18 cm structural wall) • 2 doorway notches (Z=1010..1910 & Z=5600..6500, Y=0..2050 mm, 750 mm lintel above)',
                openings: [],
                doors: [
                    { id: 'D_GW1_1', start: 1010, end: 1910, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true },
                    { id: 'D_GW1_2', start: 5600, end: 6500, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_1_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [14095, 7205],
                        p2: [14095, 110],
                        outerLoop: [
                            [14095, 7205, 0],
                            [14095, 6500, 0],
                            [14095, 6500, 2050],
                            [14095, 5600, 2050],
                            [14095, 5600, 0],
                            [14095, 1910, 0],
                            [14095, 1910, 2050],
                            [14095, 1010, 2050],
                            [14095, 1010, 0],
                            [14095, 110, 0],
                            [14095, 110, 2800],
                            [14095, 7205, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_1_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [14275, 110],
                        p2: [14275, 7205],
                        outerLoop: [
                            [14275, 110, 0],
                            [14275, 1010, 0],
                            [14275, 1010, 2050],
                            [14275, 1910, 2050],
                            [14275, 1910, 0],
                            [14275, 5600, 0],
                            [14275, 5600, 2050],
                            [14275, 6500, 2050],
                            [14275, 6500, 0],
                            [14275, 7205, 0],
                            [14275, 7205, 2800],
                            [14275, 110, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_2',
                name: 'GW_2 (Magazyn / Kotłownia)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 12095, y1: 2410, x2: 14095, y2: 2530,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.02 Magazyn ↔ 0.03 Kotłownia',
                specs: '2,000 × 120 mm • 2,300 mm (230 cm) South of Garage North inner wall (Z = 110 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_2_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 2410],
                        p2: [14095, 2410],
                        outerLoop: [[12095, 2410, 0], [14095, 2410, 0], [14095, 2410, 2800], [12095, 2410, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_2_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [14095, 2530],
                        p2: [12095, 2530],
                        outerLoop: [[14095, 2530, 0], [12095, 2530, 0], [12095, 2530, 2800], [14095, 2530, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_3',
                name: 'GW_3 (Kotłownia & WC / Kuchnia & Jadalnia)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 11975, y1: 3190, x2: 12095, y2: 9215,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.03 Kotłownia & 0.06 WC ↔ 0.13 Kuchnia & 0.12 Jadalnia',
                specs: '120 × 6,025 mm • Axis 4 partition wall continuing South from Garage East inner wall (X = 12,095 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_3_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11975, 9215],
                        p2: [11975, 3190],
                        outerLoop: [[11975, 9215, 0], [11975, 3190, 0], [11975, 3190, 2800], [11975, 9215, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [12095, 3190],
                        p2: [12095, 9215],
                        outerLoop: [[12095, 3190, 0], [12095, 9215, 0], [12095, 9215, 2800], [12095, 3190, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_3b',
                name: 'GW_3b (Komunikacja / Jadalnia South Pier)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 11975, y1: 11065, x2: 12095, y2: 11180,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.07 Komunikacja ↔ 0.12 Jadalnia (185 cm passage)',
                specs: '120 × 115 mm • South wall pier along Axis 4 defining 1,850 mm (185 cm) open passage',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_3b_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11975, 11180],
                        p2: [11975, 11065],
                        outerLoop: [[11975, 11180, 0], [11975, 11065, 0], [11975, 11065, 2800], [11975, 11180, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_3b_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [12095, 11065],
                        p2: [12095, 11180],
                        outerLoop: [[12095, 11065, 0], [12095, 11180, 0], [12095, 11180, 2800], [12095, 11065, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_4',
                name: 'GW_4 (Garaż & Kotłownia South Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 12095, y1: 7205, x2: 20325, y2: 7325,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.01 Garaż & 0.03 Kotłownia ↔ 0.04 Wiatrołap, 0.05 Garderoba & 0.06 WC',
                specs: '8,230 × 120 mm • 2 doorway notches (X=12800..13700 & X=17605..18505, Y=0..2050 mm)',
                openings: [],
                doors: [
                    { id: 'D_GW4_1', start: 17605, end: 18505, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false },
                    { id: 'D_GW4_2', start: 12800, end: 13700, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_4_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 7205],
                        p2: [20325, 7205],
                        outerLoop: [
                            [12095, 7205, 0],
                            [12800, 7205, 0],
                            [12800, 7205, 2050],
                            [13700, 7205, 2050],
                            [13700, 7205, 0],
                            [17605, 7205, 0],
                            [17605, 7205, 2050],
                            [18505, 7205, 2050],
                            [18505, 7205, 0],
                            [20325, 7205, 0],
                            [20325, 7205, 2800],
                            [12095, 7205, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_4_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 7325],
                        p2: [12095, 7325],
                        outerLoop: [
                            [20325, 7325, 0],
                            [18505, 7325, 0],
                            [18505, 7325, 2050],
                            [17605, 7325, 2050],
                            [17605, 7325, 0],
                            [13700, 7325, 0],
                            [13700, 7325, 2050],
                            [12800, 7325, 2050],
                            [12800, 7325, 0],
                            [12095, 7325, 0],
                            [12095, 7325, 2800],
                            [20325, 7325, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_5',
                name: 'GW_5 (Wiatrołap / Garderoba & Komunikacja)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 16445, y1: 7325, x2: 16565, y2: 11300,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.04 Wiatrołap ↔ 0.05 Garderoba & 0.07 Komunikacja',
                specs: '120 × 3,975 mm • Doorway notch Z=9600..10600, Y=0..2100 mm',
                openings: [],
                doors: [
                    { id: 'D_GW5_1', start: 9600, end: 10600, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_5_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [16445, 11300],
                        p2: [16445, 7325],
                        outerLoop: [
                            [16445, 11300, 0],
                            [16445, 10600, 0],
                            [16445, 10600, 2100],
                            [16445, 9600, 2100],
                            [16445, 9600, 0],
                            [16445, 7325, 0],
                            [16445, 7325, 2800],
                            [16445, 11300, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_5_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [16565, 7325],
                        p2: [16565, 11300],
                        outerLoop: [
                            [16565, 7325, 0],
                            [16565, 9600, 0],
                            [16565, 9600, 2100],
                            [16565, 10600, 2100],
                            [16565, 10600, 0],
                            [16565, 11300, 0],
                            [16565, 11300, 2800],
                            [16565, 7325, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_6',
                name: 'GW_6 (Garderoba / WC)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 14195, y1: 7325, x2: 14315, y2: 9095,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.05 Garderoba ↔ 0.06 WC',
                specs: '120 × 1,770 mm • 2,130 mm (213 cm) East of Wiatrołap wall GW_5',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_6_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [14195, 9095],
                        p2: [14195, 7325],
                        outerLoop: [[14195, 9095, 0], [14195, 7325, 0], [14195, 7325, 2800], [14195, 9095, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_6_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [14315, 7325],
                        p2: [14315, 9095],
                        outerLoop: [[14315, 7325, 0], [14315, 9095, 0], [14315, 9095, 2800], [14315, 7325, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_7',
                name: 'GW_7 (Garderoba & WC / Komunikacja)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 12095, y1: 9095, x2: 16445, y2: 9215,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.05 Garderoba & 0.06 WC ↔ 0.07 Komunikacja (Stairs)',
                specs: '4,350 × 120 mm • 2 doorway notches (X=12900..13700 & X=15000..15800, Y=0..2050 mm)',
                openings: [],
                doors: [
                    { id: 'D_GW7_1', start: 15000, end: 15800, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true },
                    { id: 'D_GW7_2', start: 12900, end: 13700, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_7_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 9095],
                        p2: [16445, 9095],
                        outerLoop: [
                            [12095, 9095, 0],
                            [12900, 9095, 0],
                            [12900, 9095, 2050],
                            [13700, 9095, 2050],
                            [13700, 9095, 0],
                            [15000, 9095, 0],
                            [15000, 9095, 2050],
                            [15800, 9095, 2050],
                            [15800, 9095, 0],
                            [16445, 9095, 0],
                            [16445, 9095, 2800],
                            [12095, 9095, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_7_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [16445, 9215],
                        p2: [12095, 9215],
                        outerLoop: [
                            [16445, 9215, 0],
                            [15800, 9215, 0],
                            [15800, 9215, 2050],
                            [15000, 9215, 2050],
                            [15000, 9215, 0],
                            [13700, 9215, 0],
                            [13700, 9215, 2050],
                            [12900, 9215, 2050],
                            [12900, 9215, 0],
                            [12095, 9215, 0],
                            [12095, 9215, 2800],
                            [16445, 9215, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_8',
                name: 'GW_8 (Wiatrołap / Pralnia)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 16215, y1: 11300, x2: 19155, y2: 11420,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.04 Wiatrołap ↔ 0.08 Pralnia',
                specs: '2,940 × 120 mm • Aligned with Entrance Alcove South inner corner (Z = 11,420 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_8_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [16215, 11300],
                        p2: [19155, 11300],
                        outerLoop: [[16215, 11300, 0], [19155, 11300, 0], [19155, 11300, 2800], [16215, 11300, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_8_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [19155, 11420],
                        p2: [16215, 11420],
                        outerLoop: [[19155, 11420, 0], [16215, 11420, 0], [16215, 11420, 2800], [19155, 11420, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_9',
                name: 'GW_9 (Pralnia & Sauna / Komunikacja SW)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 16215, y1: 11420, x2: 16335, y2: 15030,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.08 Pralnia & 0.17 Sauna ↔ 0.16 Komunikacja',
                specs: '120 × 3,610 mm • 2 doorway notches (Z=11850..12650 & Z=13650..14450, Y=0..2050 mm)',
                openings: [],
                doors: [
                    { id: 'D_GW9_1', start: 11850, end: 12650, sillMm: 0, heightMm: 2050, swingDir: 1, hingeStart: true },
                    { id: 'D_GW9_2', start: 13650, end: 14450, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_9_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [16215, 15030],
                        p2: [16215, 11420],
                        outerLoop: [
                            [16215, 15030, 0],
                            [16215, 14450, 0],
                            [16215, 14450, 2050],
                            [16215, 13650, 2050],
                            [16215, 13650, 0],
                            [16215, 12650, 0],
                            [16215, 12650, 2050],
                            [16215, 11850, 2050],
                            [16215, 11850, 0],
                            [16215, 11420, 0],
                            [16215, 11420, 2800],
                            [16215, 15030, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_9_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [16335, 11420],
                        p2: [16335, 15030],
                        outerLoop: [
                            [16335, 11420, 0],
                            [16335, 11850, 0],
                            [16335, 11850, 2050],
                            [16335, 12650, 2050],
                            [16335, 12650, 0],
                            [16335, 13650, 0],
                            [16335, 13650, 2050],
                            [16335, 14450, 2050],
                            [16335, 14450, 0],
                            [16335, 15030, 0],
                            [16335, 15030, 2800],
                            [16335, 11420, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_10',
                name: 'GW_10 (Pralnia / Łazienka & Sauna)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 16335, y1: 13180, x2: 20305, y2: 13300,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.08 Pralnia ↔ 0.09 Łazienka & 0.17 Sauna',
                specs: '3,970 × 120 mm • 1,760 mm (176 cm) South of Wiatrołap wall (Z = 11,420 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_10_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [16335, 13180],
                        p2: [20305, 13180],
                        outerLoop: [[16335, 13180, 0], [20305, 13180, 0], [20305, 13180, 2800], [16335, 13180, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_10_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20305, 13300],
                        p2: [16335, 13300],
                        outerLoop: [[20305, 13300, 0], [16335, 13300, 0], [16335, 13300, 2800], [20305, 13300, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_11',
                name: 'GW_11 (Łazienka / Sauna)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 17795, y1: 13300, x2: 17915, y2: 15030,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.09 Łazienka (239 cm) ↔ 0.17 Sauna (146 cm)',
                specs: '120 × 1,730 mm • Doorway notch Z=13750..14550, Y=0..2050 mm',
                openings: [],
                doors: [
                    { id: 'D_GW11_1', start: 13750, end: 14550, sillMm: 0, heightMm: 2050, swingDir: 1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_11_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [17795, 15030],
                        p2: [17795, 13300],
                        outerLoop: [
                            [17795, 15030, 0],
                            [17795, 14550, 0],
                            [17795, 14550, 2050],
                            [17795, 13750, 2050],
                            [17795, 13750, 0],
                            [17795, 13300, 0],
                            [17795, 13300, 2800],
                            [17795, 15030, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_11_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [17915, 13300],
                        p2: [17915, 15030],
                        outerLoop: [
                            [17915, 13300, 0],
                            [17915, 13750, 0],
                            [17915, 13750, 2050],
                            [17915, 14550, 2050],
                            [17915, 14550, 0],
                            [17915, 15030, 0],
                            [17915, 15030, 2800],
                            [17915, 13300, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_12',
                name: 'GW_12 (Siłownia North Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 15095, y1: 15030, x2: 20305, y2: 15150,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.09 Łazienka, 0.17 Sauna & 0.16 Komunikacja ↔ 0.10 Siłownia',
                specs: '5,210 × 120 mm • Doorway notch X=15255..16155, Y=0..2050 mm',
                openings: [],
                doors: [
                    { id: 'D_GW12_1', start: 15255, end: 16155, sillMm: 0, heightMm: 2050, swingDir: 1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_12_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [15095, 15030],
                        p2: [20305, 15030],
                        outerLoop: [
                            [15095, 15030, 0],
                            [15255, 15030, 0],
                            [15255, 15030, 2050],
                            [16155, 15030, 2050],
                            [16155, 15030, 0],
                            [20305, 15030, 0],
                            [20305, 15030, 2800],
                            [15095, 15030, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_12_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20305, 15150],
                        p2: [15095, 15150],
                        outerLoop: [
                            [20305, 15150, 0],
                            [16155, 15150, 0],
                            [16155, 15150, 2050],
                            [15255, 15150, 2050],
                            [15255, 15150, 0],
                            [15095, 15150, 0],
                            [15095, 15150, 2800],
                            [20305, 15150, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_13',
                name: 'GW_13 (Kuchnia / Spiżarnia West Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 6435, y1: 3190, x2: 6555, y2: 6130,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.13 Kuchnia (542 cm) ↔ 0.14 Spiżarnia',
                specs: '120 × 2,940 mm • Doorway notch Z=3370..4270, Y=0..2050 mm',
                openings: [],
                doors: [
                    { id: 'D_GW13_1', start: 3370, end: 4270, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_13_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [6435, 6130],
                        p2: [6435, 3190],
                        outerLoop: [
                            [6435, 6130, 0],
                            [6435, 4270, 0],
                            [6435, 4270, 2050],
                            [6435, 3370, 2050],
                            [6435, 3370, 0],
                            [6435, 3190, 0],
                            [6435, 3190, 2800],
                            [6435, 6130, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_13_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [6555, 3190],
                        p2: [6555, 6130],
                        outerLoop: [
                            [6555, 3190, 0],
                            [6555, 3370, 0],
                            [6555, 3370, 2050],
                            [6555, 4270, 2050],
                            [6555, 4270, 0],
                            [6555, 6130, 0],
                            [6555, 6130, 2800],
                            [6555, 3190, 2800]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_14a',
                name: 'GW_14a (Spiżarnia Upper East Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 4445, y1: 3190, x2: 4565, y2: 5060,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia (187 cm upper) ↔ 0.15 Gabinet',
                specs: '120 × 1,870 mm • 1,870 mm (187 cm) East of Kitchen/Pantry wall GW_13',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14a_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4445, 5060],
                        p2: [4445, 3190],
                        outerLoop: [[4445, 5060, 0], [4445, 3190, 0], [4445, 3190, 2800], [4445, 5060, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14a_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4565, 3190],
                        p2: [4565, 5060],
                        outerLoop: [[4565, 3190, 0], [4565, 5060, 0], [4565, 5060, 2800], [4565, 3190, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_14b',
                name: 'GW_14b (Spiżarnia 35 cm Wall Step)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 4445, y1: 5060, x2: 4915, y2: 5180,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia ↔ 0.15 Gabinet (Step)',
                specs: '470 × 120 mm • 350 mm (35 cm) step between 187 cm upper and 152 cm lower Pantry width',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14b_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [4445, 5060],
                        p2: [4915, 5060],
                        outerLoop: [[4445, 5060, 0], [4915, 5060, 0], [4915, 5060, 2800], [4445, 5060, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14b_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [4915, 5180],
                        p2: [4445, 5180],
                        outerLoop: [[4915, 5180, 0], [4445, 5180, 0], [4445, 5180, 2800], [4915, 5180, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_14c',
                name: 'GW_14c (Spiżarnia Lower East Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 4795, y1: 5180, x2: 4915, y2: 6130,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia (152 cm lower) ↔ 0.15 Gabinet',
                specs: '120 × 950 mm • 1,520 mm (152 cm) East of Kitchen/Pantry wall GW_13',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14c_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4795, 6130],
                        p2: [4795, 5180],
                        outerLoop: [[4795, 6130, 0], [4795, 5180, 0], [4795, 5180, 2800], [4795, 6130, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14c_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4915, 5180],
                        p2: [4915, 6130],
                        outerLoop: [[4915, 5180, 0], [4915, 6130, 0], [4915, 6130, 2800], [4915, 5180, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_15',
                name: 'GW_15 (Spiżarnia & Gabinet South Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 115, y1: 6130, x2: 6555, y2: 6250,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia & 0.15 Gabinet ↔ 0.11 Salon',
                specs: '6,440 × 120 mm • Doorway notch X=1045..1945, Y=0..2050 mm',
                openings: [],
                doors: [
                    { id: 'D_GW15_1', start: 1045, end: 1945, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_15_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [115, 6130],
                        p2: [6555, 6130],
                        outerLoop: [
                            [115, 6130, 0],
                            [1045, 6130, 0],
                            [1045, 6130, 2050],
                            [1945, 6130, 2050],
                            [1945, 6130, 0],
                            [6555, 6130, 0],
                            [6555, 6130, 2800],
                            [115, 6130, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_15_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [6555, 6250],
                        p2: [115, 6250],
                        outerLoop: [
                            [6555, 6250, 0],
                            [1945, 6250, 0],
                            [1945, 6250, 2050],
                            [1045, 6250, 2050],
                            [1045, 6250, 0],
                            [115, 6250, 0],
                            [115, 6250, 2800],
                            [6555, 6250, 2800]
                        ],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // UPPER FLOOR (PIĘTRO, A.03) — INTERNAL PARTITION WALLS (12 cm, Y = 3,430..6,130 mm)
            // =========================================================================
            {
                id: 'FW_1',
                name: 'FW_1 (1.05 & 1.04 Pokój East Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 15415, y1: 3190, x2: 15535, y2: 11180,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój & 1.04 Pokój (477 cm) ↔ 1.03 Łazienka & 1.06 Korytarz',
                specs: '120 × 7,990 mm • Doorway notch Z=6950..7850, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW1_1', start: 6950, end: 7850, sillMm: 0, heightMm: 2050, swingDir: 1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_1_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [15415, 11180],
                        p2: [15415, 3190],
                        outerLoop: [
                            [15415, 11180, 3430],
                            [15415, 7850, 3430],
                            [15415, 7850, 5480],
                            [15415, 6950, 5480],
                            [15415, 6950, 3430],
                            [15415, 3190, 3430],
                            [15415, 3190, 6130],
                            [15415, 11180, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_1_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [15535, 3190],
                        p2: [15535, 11180],
                        outerLoop: [
                            [15535, 3190, 3430],
                            [15535, 6950, 3430],
                            [15535, 6950, 5480],
                            [15535, 7850, 5480],
                            [15535, 7850, 3430],
                            [15535, 11180, 3430],
                            [15535, 11180, 6130],
                            [15535, 3190, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_2a',
                name: 'FW_2a (1.05 Pokój / 1.04 Pokój West Partition)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 17385, y1: 6760, x2: 20305, y2: 6880,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój (357 cm) ↔ 1.04 Pokój (430 cm)',
                specs: '2,920 × 120 mm • 3,570 mm (357 cm) South of North inner wall, 2,920 mm (292 cm) from West wall',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_2a_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [17385, 6760],
                        p2: [20305, 6760],
                        outerLoop: [[17385, 6760, 3430], [20305, 6760, 3430], [20305, 6760, 6130], [17385, 6760, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_2a_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20305, 6880],
                        p2: [17385, 6880],
                        outerLoop: [[20305, 6880, 3430], [17385, 6880, 3430], [17385, 6880, 6130], [20305, 6880, 6130]],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_2b',
                name: 'FW_2b (1.05 / 1.04 Alcove Step Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 17265, y1: 6760, x2: 17385, y2: 8190,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój ↔ 1.04 Pokój (Doorway Alcove)',
                specs: '120 × 1,430 mm • Vertical step forming entrance alcove for 1.05 Pokój',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_2b_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [17265, 8190],
                        p2: [17265, 6760],
                        outerLoop: [[17265, 8190, 3430], [17265, 6760, 3430], [17265, 6760, 6130], [17265, 8190, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_2b_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [17385, 6760],
                        p2: [17385, 8190],
                        outerLoop: [[17385, 6760, 3430], [17385, 8190, 3430], [17385, 8190, 6130], [17385, 6760, 6130]],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_2c',
                name: 'FW_2c (1.05 / 1.04 East Partition)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 15535, y1: 8070, x2: 17265, y2: 8190,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój Alcove ↔ 1.04 Pokój (299 cm)',
                specs: '1,730 × 120 mm • Doorway notch X=15800..16700, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW2c_1', start: 15800, end: 16700, sillMm: 0, heightMm: 2050, swingDir: 1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_2c_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [15535, 8070],
                        p2: [17265, 8070],
                        outerLoop: [
                            [15535, 8070, 3430],
                            [15800, 8070, 3430],
                            [15800, 8070, 5480],
                            [16700, 8070, 5480],
                            [16700, 8070, 3430],
                            [17265, 8070, 3430],
                            [17265, 8070, 6130],
                            [15535, 8070, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_2c_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [17265, 8190],
                        p2: [15535, 8190],
                        outerLoop: [
                            [17265, 8190, 3430],
                            [16700, 8190, 3430],
                            [16700, 8190, 5480],
                            [15800, 8190, 5480],
                            [15800, 8190, 3430],
                            [15535, 8190, 3430],
                            [15535, 8190, 6130],
                            [17265, 8190, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_3',
                name: 'FW_3 (1.03 Łazienka / 1.02 Łazienka)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 13815, y1: 3190, x2: 13935, y2: 6880,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.03 Łazienka (148 cm) ↔ 1.02 Łazienka (242 cm)',
                specs: '120 × 3,690 mm • 1,480 mm (148 cm) East of FW_1 (X = 15,415 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_3_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [13815, 6880],
                        p2: [13815, 3190],
                        outerLoop: [[13815, 6880, 3430], [13815, 3190, 3430], [13815, 3190, 6130], [13815, 6880, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [13935, 3190],
                        p2: [13935, 6880],
                        outerLoop: [[13935, 3190, 3430], [13935, 6880, 3430], [13935, 6880, 6130], [13935, 3190, 6130]],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_4',
                name: 'FW_4 (1.03 Łazienka South Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 13935, y1: 6760, x2: 15415, y2: 6880,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.03 Łazienka (357 cm) ↔ 1.06 Korytarz',
                specs: '1,480 × 120 mm • Doorway notch X=14100..14900, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW4_1', start: 14100, end: 14900, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'FW_4_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [13935, 6760],
                        p2: [15415, 6760],
                        outerLoop: [
                            [13935, 6760, 3430],
                            [14100, 6760, 3430],
                            [14100, 6760, 5480],
                            [14900, 6760, 5480],
                            [14900, 6760, 3430],
                            [15415, 6760, 3430],
                            [15415, 6760, 6130],
                            [13935, 6760, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_4_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [15415, 6880],
                        p2: [13935, 6880],
                        outerLoop: [
                            [15415, 6880, 3430],
                            [14900, 6880, 3430],
                            [14900, 6880, 5480],
                            [14100, 6880, 5480],
                            [14100, 6880, 3430],
                            [13935, 6880, 3430],
                            [13935, 6880, 6130],
                            [15415, 6880, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_5',
                name: 'FW_5 (1.02 Łazienka / 1.01 Sypialnia)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 11255, y1: 3190, x2: 11375, y2: 6250,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.02 Łazienka (242 cm) ↔ 1.01 Sypialnia',
                specs: '120 × 3,060 mm • 2,440 mm East of FW_3, between O11_2 and O15',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_5_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11255, 6250],
                        p2: [11255, 3190],
                        outerLoop: [[11255, 6250, 3430], [11255, 3190, 3430], [11255, 3190, 6130], [11255, 6250, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_5_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [11375, 3190],
                        p2: [11375, 6250],
                        outerLoop: [[11375, 3190, 3430], [11375, 6250, 3430], [11375, 6250, 6130], [11375, 3190, 6130]],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_6',
                name: 'FW_6 (1.02 Łazienka South Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 11375, y1: 6010, x2: 13815, y2: 6130,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.02 Łazienka (282 cm) ↔ 1.06 Korytarz',
                specs: '2,440 × 120 mm • Doorway notch X=11850..12650, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW6_1', start: 11850, end: 12650, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_6_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [11375, 6010],
                        p2: [13815, 6010],
                        outerLoop: [
                            [11375, 6010, 3430],
                            [11850, 6010, 3430],
                            [11850, 6010, 5480],
                            [12650, 6010, 5480],
                            [12650, 6010, 3430],
                            [13815, 6010, 3430],
                            [13815, 6010, 6130],
                            [11375, 6010, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_6_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [13815, 6130],
                        p2: [11375, 6130],
                        outerLoop: [
                            [13815, 6130, 3430],
                            [12650, 6130, 3430],
                            [12650, 6130, 5480],
                            [11850, 6130, 5480],
                            [11850, 6130, 3430],
                            [11375, 6130, 3430],
                            [11375, 6130, 6130],
                            [13815, 6130, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_7',
                name: 'FW_7 (1.01 Sypialnia South Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 6715, y1: 6130, x2: 11255, y2: 6250,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.01 Sypialnia (294 cm) ↔ 1.06 Korytarz & 1.08 Garderoba',
                specs: '4,540 × 120 mm • Doorway notch X=10200..11100, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW7_1', start: 10200, end: 11100, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'FW_7_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [6715, 6130],
                        p2: [11255, 6130],
                        outerLoop: [
                            [6715, 6130, 3430],
                            [10200, 6130, 3430],
                            [10200, 6130, 5480],
                            [11100, 6130, 5480],
                            [11100, 6130, 3430],
                            [11255, 6130, 3430],
                            [11255, 6130, 6130],
                            [6715, 6130, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_7_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [11255, 6250],
                        p2: [6715, 6250],
                        outerLoop: [
                            [11255, 6250, 3430],
                            [11100, 6250, 3430],
                            [11100, 6250, 5480],
                            [10200, 6250, 5480],
                            [10200, 6250, 3430],
                            [6715, 6250, 3430],
                            [6715, 6250, 6130],
                            [11255, 6250, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_8',
                name: 'FW_8 (1.06 Korytarz / 1.08 Garderoba West Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 10455, y1: 6250, x2: 10575, y2: 11180,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.06 Korytarz & Schody (484 cm) ↔ 1.08 Garderoba (322 cm)',
                specs: '120 × 4,930 mm • Doorway notch Z=6450..7350, Y=3430..5480 mm',
                openings: [],
                doors: [
                    { id: 'D_FW8_1', start: 6450, end: 7350, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_8_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [10455, 11180],
                        p2: [10455, 6250],
                        outerLoop: [
                            [10455, 11180, 3430],
                            [10455, 7350, 3430],
                            [10455, 7350, 5480],
                            [10455, 6450, 5480],
                            [10455, 6450, 3430],
                            [10455, 6250, 3430],
                            [10455, 6250, 6130],
                            [10455, 11180, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_8_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [10575, 6250],
                        p2: [10575, 11180],
                        outerLoop: [
                            [10575, 6250, 3430],
                            [10575, 6450, 3430],
                            [10575, 6450, 5480],
                            [10575, 7350, 5480],
                            [10575, 7350, 3430],
                            [10575, 11180, 3430],
                            [10575, 11180, 6130],
                            [10575, 6250, 6130]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_9',
                name: 'FW_9 (1.08 Garderoba East Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 7095, y1: 6250, x2: 7215, y2: 11180,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.08 Garderoba (322 × 496 cm) ↔ Pustka nad salonem (+0.00)',
                specs: '120 × 4,930 mm • 3,240 mm East of FW_8, immediately East of SO3',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_9_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [7095, 11180],
                        p2: [7095, 6250],
                        outerLoop: [[7095, 11180, 3430], [7095, 6250, 3430], [7095, 6250, 6130], [7095, 11180, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_9_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [7215, 6250],
                        p2: [7215, 11180],
                        outerLoop: [[7215, 6250, 3430], [7215, 11180, 3430], [7215, 11180, 6130], [7215, 6250, 6130]],
                        holes: []
                    }
                ]
            }
        ]
    };
}));
