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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Exterior Garden (N) ↔ 0.15 Gabinet, 0.14 Spiżarnia & 0.13 Kuchnia',
                specs: '12,000 mm (plan) / 12,010 mm (facade) × 380 mm (38 cm) • Hosts study window O2 and kitchen window O1 as 3D holes',
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
                        p1: [12095, 3170],
                        p2: [95, 3170],
                        outerLoop: [
                            [12095, 3170, 0],
                            [95, 3170, 0],
                            [95, 3170, 2800],
                            [12095, 3170, 2800]
                        ],
                        holes: [
                            {
                                id: 'O2',
                                kind: 'window',
                                loop: [
                                    [2680, 3170, 800],
                                    [880, 3170, 800],
                                    [880, 3170, 2500],
                                    [2680, 3170, 2500]
                                ]
                            },
                            {
                                id: 'O1',
                                kind: 'window',
                                loop: [
                                    [10580, 3170, 1100],
                                    [8480, 3170, 1100],
                                    [8480, 3170, 2500],
                                    [10580, 3170, 2500]
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
                        p1: [12095, 90],
                        p2: [12095, 3170],
                        outerLoop: [
                            [12095, 90, 0],
                            [12095, 3170, 0],
                            [12095, 3170, 2800],
                            [12095, 90, 2800]
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
                        p1: [20325, 90],
                        p2: [12095, 90],
                        outerLoop: [
                            [20325, 90, 0],
                            [12095, 90, 0],
                            [12095, 90, 2800],
                            [20325, 90, 2800]
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
                        p1: [20325, 8180],
                        p2: [20325, 90],
                        outerLoop: [
                            [20325, 8180, 0],
                            [20325, 5890, 0],
                            [20325, 5890, 2200],
                            [20325, 690, 2200],
                            [20325, 690, 0],
                            [20325, 90, 0],
                            [20325, 90, 2800],
                            [20325, 8180, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch ↔ 0.04 Wiatrołap',
                specs: '1,480 × 380 mm (38 cm) • North reveal of recessed main entrance',
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
                        p2: [19225, 8560],
                        outerLoop: [
                            [20705, 8560, 0],
                            [19225, 8560, 0],
                            [19225, 8560, 2800],
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
                        p1: [18845, 8180],
                        p2: [20325, 8180],
                        outerLoop: [
                            [18845, 8180, 0],
                            [20325, 8180, 0],
                            [20325, 8180, 2800],
                            [18845, 8180, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch (W) ↔ 0.04 Wiatrołap',
                specs: '2,460 × 380 mm (38 cm) • OuterLoop notches up to Z = 2,250 mm over entrance door Z1 (550 mm lintel above door)',
                openings: ['Z1'],
                doors: [],
                sides: [
                    {
                        id: 'EW_ALCOVE_WEST_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [1, 0, 0],
                        p1: [19225, 8560],
                        p2: [19225, 11020],
                        outerLoop: [
                            [19225, 8560, 0],
                            [19225, 8920, 0],
                            [19225, 8920, 2250],
                            [19225, 10620, 2250],
                            [19225, 10620, 0],
                            [19225, 11020, 0],
                            [19225, 11020, 2800],
                            [19225, 8560, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_ALCOVE_WEST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [-1, 0, 0],
                        p1: [18845, 11400],
                        p2: [18845, 8180],
                        outerLoop: [
                            [18845, 11400, 0],
                            [18845, 10620, 0],
                            [18845, 10620, 2250],
                            [18845, 8920, 2250],
                            [18845, 8920, 0],
                            [18845, 8180, 0],
                            [18845, 8180, 2800],
                            [18845, 11400, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered Entrance Porch ↔ 0.08 Pralnia',
                specs: '1,480 × 380 mm (38 cm) • South reveal of recessed main entrance',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'EW_ALCOVE_SOUTH_EXT',
                        role: 'exterior',
                        material: 'clinker_brick',
                        materialLabel: 'Dark Graphite Clinker Brick',
                        normal: [0, -1, 0],
                        p1: [19225, 11020],
                        p2: [20705, 11020],
                        outerLoop: [
                            [19225, 11020, 0],
                            [20705, 11020, 0],
                            [20705, 11020, 2800],
                            [19225, 11020, 2800]
                        ],
                        holes: []
                    },
                    {
                        id: 'EW_ALCOVE_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [20325, 11400],
                        p2: [18845, 11400],
                        outerLoop: [
                            [20325, 11400, 0],
                            [18845, 11400, 0],
                            [18845, 11400, 2800],
                            [20325, 11400, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'West Garden (W) ↔ 0.08 Pralnia, 0.09 Łazienka & 0.10 Siłownia',
                specs: '10,110 × 380 mm (38 cm) • Hosts high clerestory ribbon window O8a (hp = 2,060..2,800 mm, above 1,200 mm floor-plan slice)',
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
                        p1: [20325, 20750],
                        p2: [20325, 11400],
                        outerLoop: [
                            [20325, 20750, 0],
                            [20325, 11400, 0],
                            [20325, 11400, 2800],
                            [20325, 15250, 2800],
                            [20325, 15250, 2060],
                            [20325, 20750, 2060]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'South Garden (S) ↔ 0.10 Siłownia',
                specs: '6,010 × 380 mm (38 cm) • Hosts full-height corner window O7 (2,000 × 2,800 mm)',
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
                        p1: [15075, 20750],
                        p2: [20325, 20750],
                        outerLoop: [
                            [16895, 20750, 0],
                            [20325, 20750, 0],
                            [20325, 20750, 2800],
                            [16895, 20750, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'Covered South Terrace (E) ↔ 0.10 Siłownia & 0.16 Komunikacja',
                specs: '9,550 × 380 mm (38 cm) • Sheltered by 1,960 mm East roof overhang; hosts O6b and O6a',
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
                        p1: [15075, 11200],
                        p2: [15075, 20750],
                        outerLoop: [
                            [15075, 11200, 0],
                            [15075, 15285, 0],
                            [15075, 15285, 2800],
                            [15075, 15035, 2800],
                            [15075, 15035, 2060],
                            [15075, 13275, 2060],
                            [15075, 13275, 2800],
                            [15075, 11200, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'South Terrace (S) ↔ 0.12 Jadalnia & 0.11 Salon',
                specs: '14,980 × 380 mm (38 cm) • Full-height HST glazing O5 (7,215..13,695) and corner glazing O4 (-285..6,215)',
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
                        p1: [95, 11200],
                        p2: [15075, 11200],
                        outerLoop: [
                            [6215, 11200, 0],
                            [15075, 11200, 0],
                            [15075, 11200, 2800],
                            [6215, 11200, 2800]
                        ],
                        holes: [
                            {
                                id: 'O5',
                                kind: 'window',
                                loop: [
                                    [7215, 11200, 0],
                                    [13695, 11200, 0],
                                    [13695, 11200, 2800],
                                    [7215, 11200, 2800]
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
                thickness: 380,
                zBottom: 0,
                zTop: 2800,
                rooms: 'East Garden (E) ↔ 0.11 Salon & 0.15 Gabinet',
                specs: '8,790 × 380 mm (38 cm) • Hosts full-height corner glazing O3 (5,090 × 2,800 mm) meeting O4 at SE corner',
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
                        p1: [95, 3170],
                        p2: [95, 11200],
                        outerLoop: [
                            [95, 3170, 0],
                            [95, 6290, 0],
                            [95, 6290, 2800],
                            [95, 3170, 2800]
                        ],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // UPPER FLOOR (PIĘTRO, Z = 3,430..6,300 mm) — EXTERIOR MITERED 3D B-REP WALLS
            // =========================================================================
            {
                id: 'UW_TERRACE_BACK',
                name: 'Upper NE Terrace Recessed Back Wall',
                floor: 'first',
                category: 'exterior',
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'NE Covered Balcony (N) ↔ Pustka nad salonem',
                specs: '6,400 mm (plan) / 6,115 mm (balcony clear span) × 380 mm (38 cm) • Recessed 3,100 mm South behind NE terrace',
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
                        p2: [6115, 5890],
                        outerLoop: [
                            [-285, 5890, 3430],
                            [6115, 5890, 3430],
                            [6115, 5890, 6300],
                            [-285, 5890, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_TERRACE_BACK_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [0, 1, 0],
                        p1: [6495, 6270],
                        p2: [95, 6270],
                        outerLoop: [
                            [6495, 6270, 3430],
                            [95, 6270, 3430],
                            [95, 6270, 6300],
                            [6495, 6270, 6300]
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
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'NE Covered Balcony (E) ↔ 1.01 Sypialnia',
                specs: '3,100 × 380 mm (38 cm) • Hosts terrace glazing O14b + balcony door D1 (2,810 × 2,700 mm, Z=3,430..6,130 mm) with 170 mm lintel up to Z=6,300 mm',
                openings: ['O14b'],
                doors: [],
                sides: [
                    {
                        id: 'UW_TERRACE_EAST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [-1, 0, 0],
                        p1: [6115, 5890],
                        p2: [6115, 2790],
                        outerLoop: [
                            [6115, 5890, 3430],
                            [6115, 5800, 3430],
                            [6115, 5800, 6130],
                            [6115, 2790, 6130],
                            [6115, 2790, 6300],
                            [6115, 5890, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'UW_TERRACE_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Interior Gypsum Plaster',
                        normal: [1, 0, 0],
                        p1: [6495, 3170],
                        p2: [6495, 6270],
                        outerLoop: [
                            [6495, 5800, 3430],
                            [6495, 6270, 3430],
                            [6495, 6270, 6300],
                            [6495, 3170, 6300],
                            [6495, 3170, 6130],
                            [6495, 5800, 6130]
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
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'North Garden (N) ↔ 1.01 Sypialnia, 1.02 Łazienka, 1.03 Łazienka & 1.05 Pokój',
                specs: '14,590 mm (plan) / 14,390 mm (excl. 200 mm right jamb) × 380 mm (38 cm) • Starts at X=7,305 after corner window 14a, notches down to Z=4,180 for NW corner window O13a, with 170 mm lintel (Z=6,130..6,300 mm)',
                openings: ['14a', 'O15', 'O11_1', 'O11_2', 'O11_3', 'O13a'],
                doors: [],
                sides: [
                    {
                        id: 'UW_NORTH_MAIN_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Vertical Natural Timber Slat Cladding',
                        normal: [0, -1, 0],
                        p1: [6115, 2790],
                        p2: [20705, 2790],
                        outerLoop: [
                            [7305, 2790, 3430],
                            [20705, 2790, 3430],
                            [20705, 2790, 4180],
                            [18125, 2790, 4180],
                            [18125, 2790, 6130],
                            [20705, 2790, 6130],
                            [20705, 2790, 6300],
                            [6115, 2790, 6300],
                            [6115, 2790, 6130],
                            [7305, 2790, 6130]
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
                        p1: [20325, 3170],
                        p2: [6495, 3170],
                        outerLoop: [
                            [20325, 3170, 3430],
                            [7305, 3170, 3430],
                            [7305, 3170, 6130],
                            [6495, 3170, 6130],
                            [6495, 3170, 6300],
                            [20325, 3170, 6300],
                            [20325, 3170, 6130],
                            [18125, 3170, 6130],
                            [18125, 3170, 4180],
                            [20325, 3170, 4180]
                        ],
                        holes: [
                            {
                                id: 'O15',
                                kind: 'window',
                                loop: [
                                    [10580, 3170, 3430],
                                    [8480, 3170, 3430],
                                    [8480, 3170, 6130],
                                    [10580, 3170, 6130]
                                ]
                            },
                            {
                                id: 'O11_2',
                                kind: 'window',
                                loop: [
                                    [12375, 3170, 4180],
                                    [11375, 3170, 4180],
                                    [11375, 3170, 6130],
                                    [12375, 3170, 6130]
                                ]
                            },
                            {
                                id: 'O11_3',
                                kind: 'window',
                                loop: [
                                    [15015, 3170, 4180],
                                    [14015, 3170, 4180],
                                    [14015, 3170, 6130],
                                    [15015, 3170, 6130]
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
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'West Forecourt (W) ↔ 1.05 Pokój & 1.04 Pokój',
                specs: '8,790 × 380 mm (38 cm) • Hosts NW and SW corner windows O13b_1 and O13b_2 (Z=4,180..6,130 mm) with 170 mm lintel up to Z=6,300 mm',
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
                            [20705, 11580, 6130],
                            [20705, 11580, 6300],
                            [20705, 2790, 6300],
                            [20705, 2790, 6130],
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
                        p1: [20325, 11200],
                        p2: [20325, 3170],
                        outerLoop: [
                            [20325, 11200, 3430],
                            [20325, 3170, 3430],
                            [20325, 3170, 4180],
                            [20325, 5360, 4180],
                            [20325, 5360, 6130],
                            [20325, 3170, 6130],
                            [20325, 3170, 6300],
                            [20325, 11200, 6300],
                            [20325, 11200, 6130],
                            [20325, 9010, 6130],
                            [20325, 9010, 4180],
                            [20325, 11200, 4180]
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
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'South Garden (S) ↔ 1.04 Pokój, 1.06 Korytarz, 1.08 Garderoba & Antresola',
                specs: '20,990 × 380 mm (38 cm) • Notches down to Z=4,180 for SW corner window O13a_2, hosts O12 and SO3, and ends at X=6,215 before SE corner window O10, with 170 mm lintel (Z=6,130..6,300 mm)',
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
                            [-285, 11580, 6130],
                            [-285, 11580, 6300],
                            [20705, 11580, 6300],
                            [20705, 11580, 6130],
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
                        p1: [95, 11200],
                        p2: [20325, 11200],
                        outerLoop: [
                            [6215, 11200, 3430],
                            [20325, 11200, 3430],
                            [20325, 11200, 4180],
                            [18125, 11200, 4180],
                            [18125, 11200, 6130],
                            [20325, 11200, 6130],
                            [20325, 11200, 6300],
                            [95, 11200, 6300],
                            [95, 11200, 6130],
                            [6215, 11200, 6130]
                        ],
                        holes: [
                            {
                                id: 'O12',
                                kind: 'window',
                                loop: [
                                    [10695, 11200, 3430],
                                    [14695, 11200, 3430],
                                    [14695, 11200, 6130],
                                    [10695, 11200, 6130]
                                ]
                            },
                            {
                                id: 'SO3',
                                kind: 'window',
                                loop: [
                                    [7215, 11200, 4180],
                                    [8215, 11200, 4180],
                                    [8215, 11200, 6130],
                                    [7215, 11200, 6130]
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
                thickness: 380,
                zBottom: 3430,
                zTop: 6300,
                rooms: 'East Garden (E) ↔ Pustka nad salonem (Antresola)',
                specs: '5,690 × 380 mm (38 cm) • Hosts corner glazing O9 (5,090 × 2,700 mm, Z=3,430..6,130 mm) meeting O10, with 170 mm lintel up to Z=6,300 mm',
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
                            [-285, 5890, 6300],
                            [-285, 11580, 6300],
                            [-285, 11580, 6130],
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
                        p1: [95, 6270],
                        p2: [95, 11200],
                        outerLoop: [
                            [95, 6270, 3430],
                            [95, 6290, 3430],
                            [95, 6290, 6130],
                            [95, 11200, 6130],
                            [95, 11200, 6300],
                            [95, 6270, 6300]
                        ],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // GROUND FLOOR (PARTER, A.02) — INTERNAL PARTITION WALLS (18 cm / 12 cm, Z = 0..2,960 mm)
            // Where a wall has doors (height 2,050..2,100 mm < ceiling 2,960 mm),
            // outerLoop traces the 3D doorway notches along the bottom edge!
            // =========================================================================
            {
                id: 'GW_1',
                name: 'GW_1 (Garaż / Magazyn & Kotłownia)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 14095, y1: 90, x2: 14275, y2: 6290,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.01 Garaż (605 × 620 cm) ↔ 0.02 Magazyn & 0.03 Kotłownia (200 cm)',
                specs: '180 × 6,200 mm (18 cm structural wall) • 150 cm top + 90 cm door (Z=1590..2490) + 201 cm mid + 90 cm door (Z=4500..5400) + 89 cm bottom',
                openings: [],
                doors: [
                    { id: 'D_GW1_1', start: 1590, end: 2490, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: true },
                    { id: 'D_GW1_2', start: 4500, end: 5400, sillMm: 0, heightMm: 2050, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_1_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [14095, 6290],
                        p2: [14095, 90],
                        outerLoop: [
                            [14095, 6290, 0],
                            [14095, 5400, 0],
                            [14095, 5400, 2050],
                            [14095, 4500, 2050],
                            [14095, 4500, 0],
                            [14095, 2490, 0],
                            [14095, 2490, 2050],
                            [14095, 1590, 2050],
                            [14095, 1590, 0],
                            [14095, 90, 0],
                            [14095, 90, 2960],
                            [14095, 6290, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_1_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [14275, 90],
                        p2: [14275, 6290],
                        outerLoop: [
                            [14275, 90, 0],
                            [14275, 1590, 0],
                            [14275, 1590, 2050],
                            [14275, 2490, 2050],
                            [14275, 2490, 0],
                            [14275, 4500, 0],
                            [14275, 4500, 2050],
                            [14275, 5400, 2050],
                            [14275, 5400, 0],
                            [14275, 6290, 0],
                            [14275, 6290, 2960],
                            [14275, 90, 2960]
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
                x1: 12095, y1: 2990, x2: 14095, y2: 3110,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.02 Magazyn ↔ 0.03 Kotłownia',
                specs: '2,000 × 120 mm • 2,900 mm (290 cm) South of Garage North inner wall (Z = 90 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_2_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 2990],
                        p2: [14095, 2990],
                        outerLoop: [[12095, 2990, 0], [14095, 2990, 0], [14095, 2990, 2960], [12095, 2990, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_2_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [14095, 3110],
                        p2: [12095, 3110],
                        outerLoop: [[14095, 3110, 0], [12095, 3110, 0], [12095, 3110, 2960], [14095, 3110, 2960]],
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
                x1: 11915, y1: 3170, x2: 12095, y2: 8360,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.03 Kotłownia & 0.06 WC ↔ 0.13 Kuchnia',
                specs: '180 × 5,190 mm (18 cm structural wall) • Axis 4 wall from Z=3,170 mm to GW_7 South face (Z=8,360 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_3_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11915, 8360],
                        p2: [11915, 3170],
                        outerLoop: [[11915, 8360, 0], [11915, 3170, 0], [11915, 3170, 2960], [11915, 8360, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [12095, 3170],
                        p2: [12095, 8360],
                        outerLoop: [[12095, 3170, 0], [12095, 8360, 0], [12095, 8360, 2960], [12095, 3170, 2960]],
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
                x1: 12095, y1: 6290, x2: 17625, y2: 6470,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.01 Garaż & 0.03 Kotłownia ↔ 0.05 Garderoba & 0.06 WC',
                specs: '5,530 × 180 mm (18 cm structural wall) • 620 cm South of Garage North inner wall; 335 cm West of GW_1 + 18 cm GW_1 + 200 cm Kotłownia (no openings)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_4_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 6290],
                        p2: [17625, 6290],
                        outerLoop: [
                            [12095, 6290, 0],
                            [17625, 6290, 0],
                            [17625, 6290, 2960],
                            [12095, 6290, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_4_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [17625, 6470],
                        p2: [12095, 6470],
                        outerLoop: [
                            [17625, 6470, 0],
                            [12095, 6470, 0],
                            [12095, 6470, 2960],
                            [17625, 6470, 2960]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_5a',
                name: 'GW_5a (Garderoba West Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 17445, y1: 6470, x2: 17625, y2: 8360,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.01 Garaż (Passage) ↔ 0.05 Garderoba',
                specs: '180 × 1,890 mm (18 cm structural wall) • Flush with West end of GW_4 (X = 17,625 mm); 317 cm West of GW_6',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_5a_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [17445, 8360],
                        p2: [17445, 6470],
                        outerLoop: [
                            [17445, 8360, 0],
                            [17445, 6470, 0],
                            [17445, 6470, 2960],
                            [17445, 8360, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_5a_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [17625, 6470],
                        p2: [17625, 8360],
                        outerLoop: [
                            [17625, 6470, 0],
                            [17625, 8360, 0],
                            [17625, 8360, 2960],
                            [17625, 6470, 2960]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_5b',
                name: 'GW_5b (Garaż / Wiatrołap North Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 17625, y1: 8180, x2: 18845, y2: 8360,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.01 Garaż ↔ 0.04 Wiatrołap',
                specs: '1,220 × 180 mm (18 cm structural wall) • 17 cm West pier + 90×210 cm doorway (X=17775..18675, Y=0..2100 mm) + 15 cm East pier',
                openings: [],
                doors: [
                    { id: 'D_GW5b_1', start: 17775, end: 18675, sillMm: 0, heightMm: 2100, swingDir: 1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_5b_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [17625, 8180],
                        p2: [18845, 8180],
                        outerLoop: [
                            [17625, 8180, 0],
                            [17775, 8180, 0],
                            [17775, 8180, 2100],
                            [18675, 8180, 2100],
                            [18675, 8180, 0],
                            [18845, 8180, 0],
                            [18845, 8180, 2960],
                            [17625, 8180, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_5b_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [18845, 8360],
                        p2: [17625, 8360],
                        outerLoop: [
                            [18845, 8360, 0],
                            [18675, 8360, 0],
                            [18675, 8360, 2100],
                            [17775, 8360, 2100],
                            [17775, 8360, 0],
                            [17625, 8360, 0],
                            [17625, 8360, 2960],
                            [18845, 8360, 2960]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_5',
                name: 'GW_5 (Wiatrołap / Komunikacja)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 16175, y1: 8360, x2: 16255, y2: 11220,
                thickness: 80,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.04 Wiatrołap (259 cm) ↔ 0.07 Komunikacja',
                specs: '80 × 2,860 mm (8 cm partition wall) • 136 cm top + 90×210 cm doorway (Z=9720..10620, Y=0..2100 mm) + 60 cm bottom',
                openings: [],
                doors: [
                    { id: 'D_GW5_1', start: 9720, end: 10620, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_5_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [16175, 11220],
                        p2: [16175, 8360],
                        outerLoop: [
                            [16175, 11220, 0],
                            [16175, 10620, 0],
                            [16175, 10620, 2100],
                            [16175, 9720, 2100],
                            [16175, 9720, 0],
                            [16175, 8360, 0],
                            [16175, 8360, 2960],
                            [16175, 11220, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_5_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [16255, 8360],
                        p2: [16255, 11220],
                        outerLoop: [
                            [16255, 8360, 0],
                            [16255, 9720, 0],
                            [16255, 9720, 2100],
                            [16255, 10620, 2100],
                            [16255, 10620, 0],
                            [16255, 11220, 0],
                            [16255, 11220, 2960],
                            [16255, 8360, 2960]
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
                x1: 14095, y1: 6470, x2: 14275, y2: 8180,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.05 Garderoba ↔ 0.06 WC',
                specs: '180 × 1,710 mm (18 cm structural wall) • 3,170 mm (317 cm) East of Garderoba West wall GW_5a',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_6_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [14095, 8180],
                        p2: [14095, 6470],
                        outerLoop: [[14095, 8180, 0], [14095, 6470, 0], [14095, 6470, 2960], [14095, 8180, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_6_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [14275, 6470],
                        p2: [14275, 8180],
                        outerLoop: [[14275, 6470, 0], [14275, 8180, 0], [14275, 8180, 2960], [14275, 6470, 2960]],
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
                x1: 12095, y1: 8180, x2: 17445, y2: 8360,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.05 Garderoba & 0.06 WC ↔ 0.04 Wiatrołap & 0.07 Komunikacja (Stairs)',
                specs: '5,350 × 180 mm (18 cm structural wall) • Garderoba: 14 cm + 90×210 cm door (X=16405..17305) + 213 cm; WC: 104 cm + 86×207 cm door (X=12195..13055) + 10 cm',
                openings: [],
                doors: [
                    { id: 'D_GW7_1', start: 16405, end: 17305, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true },
                    { id: 'D_GW7_2', start: 12195, end: 13055, sillMm: 0, heightMm: 2070, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_7_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [12095, 8180],
                        p2: [17445, 8180],
                        outerLoop: [
                            [12095, 8180, 0],
                            [12195, 8180, 0],
                            [12195, 8180, 2070],
                            [13055, 8180, 2070],
                            [13055, 8180, 0],
                            [16405, 8180, 0],
                            [16405, 8180, 2100],
                            [17305, 8180, 2100],
                            [17305, 8180, 0],
                            [17445, 8180, 0],
                            [17445, 8180, 2960],
                            [12095, 8180, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_7_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [17445, 8360],
                        p2: [12095, 8360],
                        outerLoop: [
                            [17445, 8360, 0],
                            [17305, 8360, 0],
                            [17305, 8360, 2100],
                            [16405, 8360, 2100],
                            [16405, 8360, 0],
                            [13055, 8360, 0],
                            [13055, 8360, 2070],
                            [12195, 8360, 2070],
                            [12195, 8360, 0],
                            [12095, 8360, 0],
                            [12095, 8360, 2960],
                            [17445, 8360, 2960]
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
                x1: 16175, y1: 11220, x2: 18845, y2: 11400,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.04 Wiatrołap ↔ 0.08 Pralnia',
                specs: '2,670 × 180 mm (18 cm structural wall) • Aligned with Entrance Alcove South inner corner (Z = 11,400 mm) and East face of GW_5 (X = 16,175 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_8_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [16175, 11220],
                        p2: [18845, 11220],
                        outerLoop: [[16175, 11220, 0], [18845, 11220, 0], [18845, 11220, 2960], [16175, 11220, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_8_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [18845, 11400],
                        p2: [16175, 11400],
                        outerLoop: [[18845, 11400, 0], [16175, 11400, 0], [16175, 11400, 2960], [18845, 11400, 2960]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_9b',
                name: 'GW_9b (Komunikacja / SW Corridor East Pier)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 15075, y1: 11200, x2: 15225, y2: 11320,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.07 Komunikacja ↔ 0.16 Komunikacja',
                specs: '150 × 120 mm (15 cm long × 12 cm thick pier) • Protrudes 15 cm West from EW_SW_EAST_INT (X = 15,075 mm) at Z = 11,200..11,320 mm',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_9b_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [15075, 11200],
                        p2: [15225, 11200],
                        outerLoop: [[15075, 11200, 0], [15225, 11200, 0], [15225, 11200, 2960], [15075, 11200, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_9b_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [15225, 11320],
                        p2: [15075, 11320],
                        outerLoop: [[15225, 11320, 0], [15075, 11320, 0], [15075, 11320, 2960], [15225, 11320, 2960]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_9',
                name: 'GW_9 (Pralnia / Komunikacja SW)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 16235, y1: 11400, x2: 16355, y2: 13420,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.08 Pralnia (397 × 190 cm) ↔ 0.16 Komunikacja (116 cm)',
                specs: '120 × 2,020 mm • 90 cm top pier + 90×210 cm door (Z=12300..13200, Y=0..2100 mm) + 10 cm bottom pier to GW_10',
                openings: [],
                doors: [
                    { id: 'D_GW9_1', start: 12300, end: 13200, sillMm: 0, heightMm: 2100, swingDir: 1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_9_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [16235, 13420],
                        p2: [16235, 11400],
                        outerLoop: [
                            [16235, 13420, 0],
                            [16235, 13200, 0],
                            [16235, 13200, 2100],
                            [16235, 12300, 2100],
                            [16235, 12300, 0],
                            [16235, 11400, 0],
                            [16235, 11400, 2960],
                            [16235, 13420, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_9_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [16355, 11400],
                        p2: [16355, 13420],
                        outerLoop: [
                            [16355, 11400, 0],
                            [16355, 12300, 0],
                            [16355, 12300, 2100],
                            [16355, 13200, 2100],
                            [16355, 13200, 0],
                            [16355, 13420, 0],
                            [16355, 13420, 2960],
                            [16355, 11400, 2960]
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
                x1: 16355, y1: 13300, x2: 20325, y2: 13420,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.08 Pralnia (190 cm) ↔ 0.09 Łazienka & 0.17 Sauna (171 cm)',
                specs: '3,970 × 120 mm (397 cm) • 1,900 mm (190 cm) South of Wiatrołap wall (Z = 11,400 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_10_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [16355, 13300],
                        p2: [20325, 13300],
                        outerLoop: [[16355, 13300, 0], [20325, 13300, 0], [20325, 13300, 2960], [16355, 13300, 2960]],
                        holes: []
                    },
                    {
                        id: 'GW_10_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 13420],
                        p2: [16355, 13420],
                        outerLoop: [[20325, 13420, 0], [16355, 13420, 0], [16355, 13420, 2960], [20325, 13420, 2960]],
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
                x1: 17705, y1: 13420, x2: 17825, y2: 15130,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.09 Łazienka (250 × 171 cm) ↔ 0.17 Sauna (143 × 171 cm)',
                specs: '120 × 1,710 mm • 2,500 mm (250 cm) East of West inner wall (solid wall, no doorway)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_11_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [17705, 15130],
                        p2: [17705, 13420],
                        outerLoop: [
                            [17705, 15130, 0],
                            [17705, 13420, 0],
                            [17705, 13420, 2960],
                            [17705, 15130, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_11_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [17825, 13420],
                        p2: [17825, 15130],
                        outerLoop: [
                            [17825, 13420, 0],
                            [17825, 15130, 0],
                            [17825, 15130, 2960],
                            [17825, 13420, 2960]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_12',
                name: 'GW_12 (Łazienka South Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 17705, y1: 15130, x2: 20325, y2: 15250,
                thickness: 120,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.09 Łazienka (250 × 171 cm) ↔ 0.10 Siłownia',
                specs: '2,620 × 120 mm • South face aligned with West wall corner Z=15,250 mm; 60 cm West pier + 90×210 cm door (X=18825..19725) + 100 cm East pier + 12 cm GW_11 corner',
                openings: [],
                doors: [
                    { id: 'D_GW12_1', start: 18825, end: 19725, sillMm: 0, heightMm: 2100, swingDir: 1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'GW_12_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [17705, 15130],
                        p2: [20325, 15130],
                        outerLoop: [
                            [17705, 15130, 0],
                            [18825, 15130, 0],
                            [18825, 15130, 2100],
                            [19725, 15130, 2100],
                            [19725, 15130, 0],
                            [20325, 15130, 0],
                            [20325, 15130, 2960],
                            [17705, 15130, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_12_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 15250],
                        p2: [17705, 15250],
                        outerLoop: [
                            [20325, 15250, 0],
                            [19725, 15250, 0],
                            [19725, 15250, 2100],
                            [18825, 15250, 2100],
                            [18825, 15250, 0],
                            [17705, 15250, 0],
                            [17705, 15250, 2960],
                            [20325, 15250, 2960]
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
                x1: 6315, y1: 3170, x2: 6495, y2: 6110,
                thickness: 180,
                zBottom: 0,
                zTop: 2960,
                rooms: '0.13 Kuchnia (542 cm) ↔ 0.14 Spiżarnia (186/211 cm)',
                specs: '180 × 2,940 mm (18 cm structural wall) • 70 cm top pier + 90×210 cm door (Z=3870..4770) + 134 cm bottom pier',
                openings: [],
                doors: [
                    { id: 'D_GW13_1', start: 3870, end: 4770, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_13_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [6315, 6110],
                        p2: [6315, 3170],
                        outerLoop: [
                            [6315, 6110, 0],
                            [6315, 4770, 0],
                            [6315, 4770, 2100],
                            [6315, 3870, 2100],
                            [6315, 3870, 0],
                            [6315, 3170, 0],
                            [6315, 3170, 2960],
                            [6315, 6110, 2960]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_13_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [6495, 3170],
                        p2: [6495, 6110],
                        outerLoop: [
                            [6495, 3170, 0],
                            [6495, 3870, 0],
                            [6495, 3870, 2100],
                            [6495, 4770, 2100],
                            [6495, 4770, 0],
                            [6495, 6110, 0],
                            [6495, 6110, 2960],
                            [6495, 3170, 2960]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_14',
                name: 'GW_14 (Spiżarnia / Gabinet Stepped Wall)',
                floor: 'ground',
                category: 'internal',
                axis: 'y',
                x1: 4085, y1: 3170, x2: 4455, y2: 6110,
                thickness: 120,
                zBottom: 0,
                zTop: 2850,
                rooms: '0.14 Spiżarnia (186 cm upper / 211 cm lower) ↔ 0.15 Gabinet (424 cm upper / 399 cm lower)',
                specs: 'Stepped 120 mm (12 cm) wall • Z = 0..2,850 mm (285 cm tall under TERRACE_UPPER) • Upper 1,920 mm (X=4,335..4,455, Y=3,170..5,090) + 250 mm step (X=4,085..4,455, Y=5,090..5,210) + Lower 900 mm (X=4,085..4,205, Y=5,210..6,110)',
                footprint2D: [
                    [4335, 3170],
                    [4455, 3170],
                    [4455, 5210],
                    [4205, 5210],
                    [4205, 6110],
                    [4085, 6110],
                    [4085, 5090],
                    [4335, 5090]
                ],
                solidPolygons2D: [
                    [
                        [4335, 3170],
                        [4455, 3170],
                        [4455, 5210],
                        [4205, 5210],
                        [4205, 6110],
                        [4085, 6110],
                        [4085, 5090],
                        [4335, 5090]
                    ]
                ],
                collisionBoxes2D: [
                    { x0: 4335, x1: 4455, y0: 3170, y1: 5090 },
                    { x0: 4085, x1: 4455, y0: 5090, y1: 5210 },
                    { x0: 4085, x1: 4205, y0: 5210, y1: 6110 }
                ],
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14_UPPER_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4335, 5090],
                        p2: [4335, 3170],
                        outerLoop: [[4335, 5090, 0], [4335, 3170, 0], [4335, 3170, 2850], [4335, 5090, 2850]],
                        holes: []
                    },
                    {
                        id: 'GW_14_UPPER_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4455, 3170],
                        p2: [4455, 5210],
                        outerLoop: [[4455, 3170, 0], [4455, 5210, 0], [4455, 5210, 2850], [4455, 3170, 2850]],
                        holes: []
                    },
                    {
                        id: 'GW_14_STEP_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [4085, 5090],
                        p2: [4335, 5090],
                        outerLoop: [[4085, 5090, 0], [4335, 5090, 0], [4335, 5090, 2850], [4085, 5090, 2850]],
                        holes: []
                    },
                    {
                        id: 'GW_14_STEP_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [4455, 5210],
                        p2: [4205, 5210],
                        outerLoop: [[4455, 5210, 0], [4205, 5210, 0], [4205, 5210, 2850], [4455, 5210, 2850]],
                        holes: []
                    },
                    {
                        id: 'GW_14_LOWER_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4085, 6110],
                        p2: [4085, 5090],
                        outerLoop: [[4085, 6110, 0], [4085, 5090, 0], [4085, 5090, 2850], [4085, 6110, 2850]],
                        holes: []
                    },
                    {
                        id: 'GW_14_LOWER_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4205, 5210],
                        p2: [4205, 6110],
                        outerLoop: [[4205, 5210, 0], [4205, 6110, 0], [4205, 6110, 2850], [4205, 5210, 2850]],
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
                x1: 95, y1: 6110, x2: 6495, y2: 6290,
                thickness: 180,
                zBottom: 0,
                zTop: 3430,
                rooms: '0.14 Spiżarnia & 0.15 Gabinet (294 cm) ↔ 0.11 Salon',
                specs: '6,400 × 180 mm (18 cm structural wall, H=343 cm up to UW_TERRACE_BACK) • 93 cm East pier (X=95..1025) + 90×210 cm door (X=1025..1925) + 457 cm West wall (X=1925..6495)',
                openings: [],
                doors: [
                    { id: 'D_GW15_1', start: 1025, end: 1925, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'GW_15_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [95, 6110],
                        p2: [6495, 6110],
                        outerLoop: [
                            [95, 6110, 0],
                            [1025, 6110, 0],
                            [1025, 6110, 2100],
                            [1925, 6110, 2100],
                            [1925, 6110, 0],
                            [6495, 6110, 0],
                            [6495, 6110, 3430],
                            [95, 6110, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'GW_15_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [6495, 6290],
                        p2: [95, 6290],
                        outerLoop: [
                            [6495, 6290, 0],
                            [1925, 6290, 0],
                            [1925, 6290, 2100],
                            [1025, 6290, 2100],
                            [1025, 6290, 0],
                            [95, 6290, 0],
                            [95, 6290, 3430],
                            [6495, 6290, 3430]
                        ],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // UPPER FLOOR (PIĘTRO, A.03) — INTERNAL PARTITION WALLS (12/18 cm, Z = 3,330..6,300 mm)
            // =========================================================================
            {
                id: 'FW_1',
                name: 'FW_1 (1.05 Pokój / 1.03 Łazienka Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 15435, y1: 3170, x2: 15555, y2: 6940,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.05 Pokój (477 cm) ↔ 1.03 Łazienka (226 cm)',
                specs: '120 × 3,770 mm (377 cm) • Upper partition wall between 1.05 Pokój (477 cm) and 1.03 Łazienka (226 cm) (Z=3,170..6,940 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_1_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [15435, 6940],
                        p2: [15435, 3170],
                        outerLoop: [
                            [15435, 6940, 3330],
                            [15435, 3170, 3330],
                            [15435, 3170, 6300],
                            [15435, 6940, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_1_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [15555, 3170],
                        p2: [15555, 6940],
                        outerLoop: [
                            [15555, 3170, 3330],
                            [15555, 6940, 3330],
                            [15555, 6940, 6300],
                            [15555, 3170, 6300]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_1b',
                name: 'FW_1b (1.04 Pokój / 1.06 Korytarz Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'y',
                x1: 15535, y1: 8440, x2: 15655, y2: 11200,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.04 Pokój (467 cm) ↔ 1.06 Korytarz (484 cm)',
                specs: '120 × 2,760 mm (276 cm) • Stepped West of FW_1 so East face is at X=15,535 mm (484 cm West of FW_8 at X=10,695 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_1b_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [15535, 11200],
                        p2: [15535, 8440],
                        outerLoop: [
                            [15535, 11200, 3330],
                            [15535, 8440, 3330],
                            [15535, 8440, 6300],
                            [15535, 11200, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_1b_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [15655, 8440],
                        p2: [15655, 11200],
                        outerLoop: [
                            [15655, 8440, 3330],
                            [15655, 11200, 3330],
                            [15655, 11200, 6300],
                            [15655, 8440, 6300]
                        ],
                        holes: []
                    }
                ]
            },
            {
                id: 'FW_2a',
                name: 'FW_2a (1.05 Pokój, 1.03 & 1.02 Łazienka South 18 cm Structural Wall)',
                floor: 'first',
                category: 'internal',
                axis: 'x',
                x1: 10575, y1: 6940, x2: 20325, y2: 7120,
                thickness: 180,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.05 Pokój, 1.03 Łazienka & 1.02 Łazienka (377 cm) ↔ 1.06 Korytarz & 1.04 Pokój (408 cm)',
                specs: '9,750 × 180 mm (18 cm structural wall) • Continuous from UW_WEST (20,325) to East end of 1.02 Łazienka (10,575); 68+90+68 cm in 1.03 Łazienka, 70+90+317 cm in 1.05 Pokój',
                openings: [],
                doors: [
                    { id: 'D_FW4_1', start: 13855, end: 14755, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false },
                    { id: 'D_FW2a_1', start: 16255, end: 17155, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'FW_2a_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [10575, 6940],
                        p2: [20325, 6940],
                        outerLoop: [
                            [10575, 6940, 3330],
                            [13855, 6940, 3330],
                            [13855, 6940, 5430],
                            [14755, 6940, 5430],
                            [14755, 6940, 3330],
                            [16255, 6940, 3330],
                            [16255, 6940, 5430],
                            [17155, 6940, 5430],
                            [17155, 6940, 3330],
                            [20325, 6940, 3330],
                            [20325, 6940, 6300],
                            [10575, 6940, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_2a_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 7120],
                        p2: [10575, 7120],
                        outerLoop: [
                            [20325, 7120, 3330],
                            [17155, 7120, 3330],
                            [17155, 7120, 5430],
                            [16255, 7120, 5430],
                            [16255, 7120, 3330],
                            [14755, 7120, 3330],
                            [14755, 7120, 5430],
                            [13855, 7120, 5430],
                            [13855, 7120, 3330],
                            [10575, 7120, 3330],
                            [10575, 7120, 6300],
                            [20325, 7120, 6300]
                        ],
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
                x1: 17255, y1: 7120, x2: 17375, y2: 8320,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.04 Pokój ↔ Doorway Alcove (172 cm)',
                specs: '120 × 1,200 mm • 1,720 mm (172 cm) West of X=15,535 mm (X=17,255..17,375 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_2b_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [17255, 8320],
                        p2: [17255, 7120],
                        outerLoop: [[17255, 8320, 3330], [17255, 7120, 3330], [17255, 7120, 6300], [17255, 8320, 6300]],
                        holes: []
                    },
                    {
                        id: 'FW_2b_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [17375, 7120],
                        p2: [17375, 8320],
                        outerLoop: [[17375, 7120, 3330], [17375, 8320, 3330], [17375, 8320, 6300], [17375, 7120, 6300]],
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
                x1: 15535, y1: 8320, x2: 17375, y2: 8440,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: 'Doorway Alcove (172 cm) ↔ 1.04 Pokój (276 cm)',
                specs: '1,840 × 120 mm (172 cm alcove span + 12 cm FW_2b) • From right (X=15,535 mm): 75 cm wall (X=15535..16285) + 90×210 cm door (X=16285..17185) + 7 cm pier to FW_2b (X=17185..17255)',
                openings: [],
                doors: [
                    { id: 'D_FW2c_1', start: 16285, end: 17185, sillMm: 0, heightMm: 2100, swingDir: 1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_2c_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [15535, 8320],
                        p2: [17375, 8320],
                        outerLoop: [
                            [15535, 8320, 3330],
                            [16285, 8320, 3330],
                            [16285, 8320, 5430],
                            [17185, 8320, 5430],
                            [17185, 8320, 3330],
                            [17375, 8320, 3330],
                            [17375, 8320, 6300],
                            [15535, 8320, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_2c_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [17375, 8440],
                        p2: [15535, 8440],
                        outerLoop: [
                            [17375, 8440, 3330],
                            [17185, 8440, 3330],
                            [17185, 8440, 5430],
                            [16285, 8440, 5430],
                            [16285, 8440, 3330],
                            [15535, 8440, 3330],
                            [15535, 8440, 6300],
                            [17375, 8440, 6300]
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
                x1: 13055, y1: 3170, x2: 13175, y2: 6940,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.03 Łazienka (226 cm) ↔ 1.02 Łazienka (236 cm)',
                specs: '120 × 3,770 mm (377 cm) • 2,260 mm (226 cm) East of FW_1 (X = 15,435 mm), terminates at FW_2a (Z = 6,940 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_3_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [13055, 6940],
                        p2: [13055, 3170],
                        outerLoop: [[13055, 6940, 3330], [13055, 3170, 3330], [13055, 3170, 6300], [13055, 6940, 6300]],
                        holes: []
                    },
                    {
                        id: 'FW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [13175, 3170],
                        p2: [13175, 6940],
                        outerLoop: [[13175, 3170, 3330], [13175, 6940, 3330], [13175, 6940, 6300], [13175, 3170, 6300]],
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
                x1: 10575, y1: 3170, x2: 10695, y2: 6940,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.02 Łazienka (236 cm) ↔ 1.01 Sypialnia (408 cm)',
                specs: '120 × 3,770 mm (377 cm) • 139 cm North pier (Z=3170..4560) + 90×210 cm door (Z=4560..5460) + 148 cm South pier (Z=5460..6940)',
                openings: [],
                doors: [
                    { id: 'D_FW5_1', start: 4560, end: 5460, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_5_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [10575, 6940],
                        p2: [10575, 3170],
                        outerLoop: [
                            [10575, 6940, 3330],
                            [10575, 5460, 3330],
                            [10575, 5460, 5430],
                            [10575, 4560, 5430],
                            [10575, 4560, 3330],
                            [10575, 3170, 3330],
                            [10575, 3170, 6300],
                            [10575, 6940, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_5_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [10695, 3170],
                        p2: [10695, 6940],
                        outerLoop: [
                            [10695, 3170, 3330],
                            [10695, 4560, 3330],
                            [10695, 4560, 5430],
                            [10695, 5460, 5430],
                            [10695, 5460, 3330],
                            [10695, 6940, 3330],
                            [10695, 6940, 6300],
                            [10695, 3170, 6300]
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
                x1: 6495, y1: 6940, x2: 10575, y2: 7120,
                thickness: 180,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.01 Sypialnia (408 × 377 cm) ↔ 1.08 Garderoba (408 × 408 cm)',
                specs: '4,080 × 180 mm (18 cm structural wall) • 3,770 mm (377 cm) South of North inner wall (Z = 3,170 mm); doorway notch X=9525..10425, Z=3330..5430 mm',
                openings: [],
                doors: [
                    { id: 'D_FW7_1', start: 9525, end: 10425, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false }
                ],
                sides: [
                    {
                        id: 'FW_7_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [6495, 6940],
                        p2: [10575, 6940],
                        outerLoop: [
                            [6495, 6940, 3330],
                            [9525, 6940, 3330],
                            [9525, 6940, 5430],
                            [10425, 6940, 5430],
                            [10425, 6940, 3330],
                            [10575, 6940, 3330],
                            [10575, 6940, 6300],
                            [6495, 6940, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_7_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [10575, 7120],
                        p2: [6495, 7120],
                        outerLoop: [
                            [10575, 7120, 3330],
                            [10425, 7120, 3330],
                            [10425, 7120, 5430],
                            [9525, 7120, 5430],
                            [9525, 7120, 3330],
                            [6495, 7120, 3330],
                            [6495, 7120, 6300],
                            [10575, 7120, 6300]
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
                x1: 10575, y1: 7120, x2: 10695, y2: 11200,
                thickness: 120,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.06 Korytarz & Schody (484 cm) ↔ 1.08 Garderoba (408 cm)',
                specs: '120 × 4,080 mm • Aligned with FW_5 (4,080 mm West of FW_9); 15 cm North stub (Z=7120..7270) + 90×210 cm door (Z=7270..8170) + 303 cm South wall (Z=8170..11200)',
                openings: [],
                doors: [
                    { id: 'D_FW8_1', start: 7270, end: 8170, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true }
                ],
                sides: [
                    {
                        id: 'FW_8_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [10575, 11200],
                        p2: [10575, 7120],
                        outerLoop: [
                            [10575, 11200, 3330],
                            [10575, 8170, 3330],
                            [10575, 8170, 5430],
                            [10575, 7270, 5430],
                            [10575, 7270, 3330],
                            [10575, 7120, 3330],
                            [10575, 7120, 6300],
                            [10575, 11200, 6300]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_8_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [10695, 7120],
                        p2: [10695, 11200],
                        outerLoop: [
                            [10695, 7120, 3330],
                            [10695, 7270, 3330],
                            [10695, 7270, 5430],
                            [10695, 8170, 5430],
                            [10695, 8170, 3330],
                            [10695, 11200, 3330],
                            [10695, 11200, 6300],
                            [10695, 7120, 6300]
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
                x1: 6315, y1: 6270, x2: 6495, y2: 11200,
                thickness: 180,
                zBottom: 3330,
                zTop: 6300,
                rooms: '1.08 Garderoba (408 × 408 cm) ↔ Pustka nad salonem (+0.00)',
                specs: '180 × 4,930 mm (18 cm structural wall) • Aligned with UW_TERRACE_EAST inner face (X = 6,495 mm), 6,220 mm (622 cm) West of UW_EAST',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_9_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [6315, 11200],
                        p2: [6315, 6270],
                        outerLoop: [[6315, 11200, 3330], [6315, 6270, 3330], [6315, 6270, 6300], [6315, 11200, 6300]],
                        holes: []
                    },
                    {
                        id: 'FW_9_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [6495, 6270],
                        p2: [6495, 11200],
                        outerLoop: [[6495, 6270, 3330], [6495, 11200, 3330], [6495, 11200, 6300], [6495, 6270, 6300]],
                        holes: []
                    }
                ]
            },

            // =========================================================================
            // INTER-FLOOR PERIMETER BAND (Z = 2,800..3,430 mm, H = 630 mm, T = 380 mm)
            // Goes all around the building perimeter, including around the NE balcony
            // and straight above the West entrance door nook (Y = 8,560..11,020 mm).
            // =========================================================================
            {
                id: 'WALL_BAND',
                name: 'Perimeter Inter-Floor Band (Opaska międzykondygnacyjna +2.80..+3.43 m)',
                floor: 'band',
                category: 'band',
                thickness: 380,
                zBottom: 2800,
                zTop: 3430,
                rooms: 'Full Building Perimeter (Garage, NE Balcony, Living/Dining, SW Gym Wing & Straight Over Entrance Nook)',
                specs: '8-segment closed perimeter ring • Z = 2,800..3,430 mm (630 mm = 63 cm high) × 380 mm (38 cm thick) • Wraps around the NE balcony (-285..11,715 × 2,790..11,580) and runs straight along West facade X = 20,325..20,705 mm above the entrance door nook',
                openings: [],
                doors: [],
                outerPolygon2D: [
                    [-285, 2790],
                    [11715, 2790],
                    [11715, -290],
                    [20705, -290],
                    [20705, 21130],
                    [14695, 21130],
                    [14695, 11580],
                    [-285, 11580]
                ],
                innerPolygon2D: [
                    [95, 3170],
                    [12095, 3170],
                    [12095, 90],
                    [20325, 90],
                    [20325, 20750],
                    [15075, 20750],
                    [15075, 11200],
                    [95, 11200]
                ],
                sides: [
                    // 1. North Recessed & NE Balcony North Band (Y = 2,790..3,170 mm, X = -285..11,715 mm)
                    {
                        id: 'BAND_NORTH_RECESSED_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [0, -1, 0],
                        p1: [-285, 2790],
                        p2: [11715, 2790],
                        outerLoop: [
                            [-285, 2790, 2800],
                            [11715, 2790, 2800],
                            [11715, 2790, 3430],
                            [-285, 2790, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_NORTH_RECESSED_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [0, 1, 0],
                        p1: [12095, 3170],
                        p2: [95, 3170],
                        outerLoop: [
                            [12095, 3170, 2800],
                            [95, 3170, 2800],
                            [95, 3170, 3430],
                            [12095, 3170, 3430]
                        ],
                        holes: []
                    },
                    // 2. Garage East Protrusion Band (X = 11,715..12,095 mm, Y = -290..2,790 mm)
                    {
                        id: 'BAND_GARAGE_EAST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [-1, 0, 0],
                        p1: [11715, 2790],
                        p2: [11715, -290],
                        outerLoop: [
                            [11715, 2790, 2800],
                            [11715, -290, 2800],
                            [11715, -290, 3430],
                            [11715, 2790, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_GARAGE_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [1, 0, 0],
                        p1: [12095, 90],
                        p2: [12095, 3170],
                        outerLoop: [
                            [12095, 90, 2800],
                            [12095, 3170, 2800],
                            [12095, 3170, 3430],
                            [12095, 90, 3430]
                        ],
                        holes: []
                    },
                    // 3. Garage North Band (Y = -290..90 mm, X = 11,715..20,705 mm)
                    {
                        id: 'BAND_GARAGE_NORTH_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [0, -1, 0],
                        p1: [11715, -290],
                        p2: [20705, -290],
                        outerLoop: [
                            [11715, -290, 2800],
                            [20705, -290, 2800],
                            [20705, -290, 3430],
                            [11715, -290, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_GARAGE_NORTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [0, 1, 0],
                        p1: [20325, 90],
                        p2: [12095, 90],
                        outerLoop: [
                            [20325, 90, 2800],
                            [12095, 90, 2800],
                            [12095, 90, 3430],
                            [20325, 90, 3430]
                        ],
                        holes: []
                    },
                    // 4. Continuous West Band — straight across Entrance Nook (X = 20,325..20,705 mm, Y = -290..21,130 mm)
                    {
                        id: 'BAND_WEST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [1, 0, 0],
                        p1: [20705, -290],
                        p2: [20705, 21130],
                        outerLoop: [
                            [20705, -290, 2800],
                            [20705, 21130, 2800],
                            [20705, 21130, 3430],
                            [20705, -290, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_WEST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [-1, 0, 0],
                        p1: [20325, 20750],
                        p2: [20325, 90],
                        outerLoop: [
                            [20325, 20750, 2800],
                            [20325, 90, 2800],
                            [20325, 90, 3430],
                            [20325, 20750, 3430]
                        ],
                        holes: []
                    },
                    // 5. SW Wing (Gym) South Band (Y = 20,750..21,130 mm, X = 14,695..20,705 mm)
                    {
                        id: 'BAND_SW_SOUTH_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [0, 1, 0],
                        p1: [20705, 21130],
                        p2: [14695, 21130],
                        outerLoop: [
                            [20705, 21130, 2800],
                            [14695, 21130, 2800],
                            [14695, 21130, 3430],
                            [20705, 21130, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_SW_SOUTH_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [0, -1, 0],
                        p1: [15075, 20750],
                        p2: [20325, 20750],
                        outerLoop: [
                            [15075, 20750, 2800],
                            [20325, 20750, 2800],
                            [20325, 20750, 3430],
                            [15075, 20750, 3430]
                        ],
                        holes: []
                    },
                    // 6. SW Wing (Gym) East Band (X = 14,695..15,075 mm, Y = 11,580..21,130 mm)
                    {
                        id: 'BAND_SW_EAST_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [-1, 0, 0],
                        p1: [14695, 21130],
                        p2: [14695, 11580],
                        outerLoop: [
                            [14695, 21130, 2800],
                            [14695, 11580, 2800],
                            [14695, 11580, 3430],
                            [14695, 21130, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_SW_EAST_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [1, 0, 0],
                        p1: [15075, 11200],
                        p2: [15075, 20750],
                        outerLoop: [
                            [15075, 11200, 2800],
                            [15075, 20750, 2800],
                            [15075, 20750, 3430],
                            [15075, 11200, 3430]
                        ],
                        holes: []
                    },
                    // 7. Main South Recessed Band (Y = 11,200..11,580 mm, X = -285..14,695 mm)
                    {
                        id: 'BAND_SOUTH_RECESSED_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [0, 1, 0],
                        p1: [14695, 11580],
                        p2: [-285, 11580],
                        outerLoop: [
                            [14695, 11580, 2800],
                            [-285, 11580, 2800],
                            [-285, 11580, 3430],
                            [14695, 11580, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_SOUTH_RECESSED_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [0, -1, 0],
                        p1: [95, 11200],
                        p2: [15075, 11200],
                        outerLoop: [
                            [95, 11200, 2800],
                            [15075, 11200, 2800],
                            [15075, 11200, 3430],
                            [95, 11200, 3430]
                        ],
                        holes: []
                    },
                    // 8. East Core & NE Balcony East Band (X = -285..95 mm, Y = 2,790..11,580 mm)
                    {
                        id: 'BAND_EAST_CORE_EXT',
                        role: 'exterior',
                        material: 'timber_slats',
                        materialLabel: 'Dark Anthracite Fascia / Band Cladding',
                        normal: [-1, 0, 0],
                        p1: [-285, 11580],
                        p2: [-285, 2790],
                        outerLoop: [
                            [-285, 11580, 2800],
                            [-285, 2790, 2800],
                            [-285, 2790, 3430],
                            [-285, 11580, 3430]
                        ],
                        holes: []
                    },
                    {
                        id: 'BAND_EAST_CORE_INT',
                        role: 'interior',
                        material: 'plaster_white',
                        materialLabel: 'Inner Band Structure / Parapet Face',
                        normal: [1, 0, 0],
                        p1: [95, 3170],
                        p2: [95, 11200],
                        outerLoop: [
                            [95, 3170, 2800],
                            [95, 11200, 2800],
                            [95, 11200, 3430],
                            [95, 3170, 3430]
                        ],
                        holes: []
                    }
                ]
            }
        ],
        floors: [
            {
                id: 'FLOOR_LOWER',
                name: 'FLOOR_LOWER — Lower Floor Slab (Podłoga na gruncie -0.22..±0.00 m)',
                floor: 'ground',
                category: 'floor',
                zBottom: -220,
                zTop: 0,
                thickness: 220,
                areaM2: 265.95,
                rooms: 'All Ground Floor Rooms (0.01–0.16) + 38 cm External Walls Footprint',
                specs: 'Single monolithic 12-vertex orthogonal slab • Z = -220..0 mm (220 mm = 22 cm ground slab & screed structure) • Includes full building outer footprint underneath the 38 cm external walls (X = -285..20,705 mm, Y = -290..21,130 mm)',
                footprint2D: [
                    [20705, -290],
                    [11715, -290],
                    [11715, 2790],
                    [-285, 2790],
                    [-285, 11580],
                    [14695, 11580],
                    [14695, 21130],
                    [20705, 21130],
                    [20705, 11020],
                    [19225, 11020],
                    [19225, 8560],
                    [20705, 8560]
                ]
            },
            {
                id: 'FLOOR_UPPER',
                name: 'FLOOR_UPPER — Upper Floor Slab (Strop nad parterem +2.96..+3.33 m)',
                floor: 'first',
                category: 'floor',
                zBottom: 2960,
                zTop: 3330,
                thickness: 370,
                areaM2: 99.42,
                rooms: '1.01 Sypialnia, 1.02 & 1.03 Łazienka, 1.04 & 1.05 Pokój, 1.06 Korytarz (Walkway & Landing), 1.08 Garderoba',
                specs: 'Single monolithic 12-vertex orthogonal slab • Z = 2,960..3,330 mm (370 mm = 20 cm RC slab + 17 cm insulation/screed/oak finish) • Strictly inside 38 cm exterior walls; no floor over the High Living Room (X = 95..6,315 mm), High Hall (X = 10,695..15,535, Y = 9,370..11,200 mm), or Stairwell (X = 11,910..15,535, Y = 8,360..9,370 mm)',
                footprint2D: [
                    [20325, 3170],
                    [6495, 3170],
                    [6495, 6270],
                    [6315, 6270],
                    [6315, 11200],
                    [10695, 11200],
                    [10695, 9370],
                    [11910, 9370],
                    [11910, 8360],
                    [15535, 8360],
                    [15535, 11200],
                    [20325, 11200]
                ]
            },
            {
                id: 'ROOF_GYM',
                name: 'ROOF_GYM — SW Wing / Gym Flat Roof (Stropodach nad siłownią +2.96..+3.40 m)',
                floor: 'ground',
                category: 'roof',
                zBottom: 2960,
                zTop: 3400,
                thickness: 440,
                areaM2: 50.14,
                rooms: '0.08 Pralnia, 0.09 Łazienka, 0.10 Siłownia & 0.16 Komunikacja (SW Wing)',
                specs: 'Single monolithic 4-vertex rectangular flat roof slab • Z = 2,960..3,400 mm (440 mm = 44 cm RC slab + sloped thermal insulation + waterproofing) • Covers the 38 cm strip under UW_SOUTH (Y = 11,200..11,580 mm) meeting FLOOR_UPPER flush at Y = 11,200 mm; excludes outer 38 cm above ground-floor external walls EW_SW_EAST (X = 14,695..15,075), EW_SW_SOUTH (Y = 20,750..21,130), and EW_WEST_SOUTH (X = 20,325..20,705)',
                footprint2D: [
                    [20325, 11200],
                    [15075, 11200],
                    [15075, 20750],
                    [20325, 20750]
                ]
            },
            {
                id: 'ROOF_GARAGE',
                name: 'ROOF_GARAGE — Garage & Magazyn Flat Roof (Stropodach nad garażem +2.96..+3.40 m)',
                floor: 'ground',
                category: 'roof',
                zBottom: 2960,
                zTop: 3400,
                thickness: 440,
                areaM2: 25.35,
                rooms: '0.01 Garaż Dwustanowiskowy (605 cm) & 0.02 Magazyn (200 cm)',
                specs: 'Single monolithic 4-vertex rectangular flat roof slab • Z = 2,960..3,400 mm (440 mm = 44 cm RC slab + sloped thermal insulation + waterproofing) • Covers the 38 cm strip under UW_NORTH_MAIN (Y = 2,790..3,170 mm) meeting FLOOR_UPPER flush at Y = 3,170 mm; excludes outer 38 cm above ground-floor external walls EW_GARAGE_EAST (X = 11,715..12,095), EW_GARAGE_NORTH (Y = -290..90), and EW_GARAGE_WEST (X = 20,325..20,705)',
                footprint2D: [
                    [20325, 90],
                    [12095, 90],
                    [12095, 3170],
                    [20325, 3170]
                ]
            },
            {
                id: 'ROOF_UPPER',
                name: 'ROOF_UPPER — Second Floor Flat Roof (Stropodach nad piętrem +6.30..+6.74 m)',
                floor: 'first',
                category: 'roof',
                zBottom: 6300,
                zTop: 6740,
                thickness: 440,
                areaM2: 152.91,
                rooms: 'All Upper Floor Rooms (1.01–1.08), High Living Room & High Hall Voids + Inner 18 cm of Upper External Walls',
                specs: 'Single monolithic 6-vertex L-shaped flat roof slab • Z = 6,300..6,740 mm (440 mm = 44 cm RC slab + sloped thermal insulation + waterproofing) • Covers the entire enclosed upper floor plus the inner 180 mm (18 cm) of all 380 mm (38 cm) upper-floor external walls (UW_NORTH_MAIN Y=2,990, UW_WEST X=20,505, UW_SOUTH Y=11,380, UW_EAST X=-85, UW_TERRACE_BACK Y=6,090, UW_TERRACE_EAST X=6,315), leaving the outer 200 mm (20 cm) perimeter uncovered',
                footprint2D: [
                    [20505, 2990],
                    [6315, 2990],
                    [6315, 6090],
                    [-85, 6090],
                    [-85, 11380],
                    [20505, 11380]
                ]
            },
            {
                id: 'TERRACE_UPPER',
                name: 'TERRACE_UPPER — NE Terrace & Ceiling Over 0.14/0.15 (+2.85..+3.33 m)',
                floor: 'ground',
                category: 'terrace',
                zBottom: 2850,
                zTop: 3330,
                thickness: 480,
                areaM2: 18.29,
                rooms: '0.14 Spiżarnia & 0.15 Gabinet Ceiling + NE Covered Upper Terrace (+2.85..+3.33 m)',
                specs: 'Single monolithic 4-vertex rectangular terrace & ceiling slab • Z = 2,850..3,330 mm (480 mm = 48 cm RC slab + thermal insulation + waterproofing + gres terrace tiles) • Ceiling for rooms 0.14 Spiżarnia and 0.15 Gabinet (resting directly on top of 285 cm wall GW_14 at Z = 2,850 mm) and upper terrace floor at Z = 3,330 mm',
                footprint2D: [
                    [6315, 3170],
                    [95, 3170],
                    [95, 6110],
                    [6315, 6110]
                ]
            }
        ]
    };
}));
