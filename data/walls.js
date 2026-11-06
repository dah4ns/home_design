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
            // UPPER FLOOR (PIĘTRO, Z = 3,430..6,130 mm) — EXTERIOR MITERED 3D B-REP WALLS
            // =========================================================================
            {
                id: 'UW_TERRACE_BACK',
                name: 'Upper NE Terrace Recessed Back Wall',
                floor: 'first',
                category: 'exterior',
                thickness: 380,
                zBottom: 3430,
                zTop: 6130,
                rooms: 'NE Covered Balcony (N) ↔ Pustka nad salonem',
                specs: '6,600 mm (plan) / 6,315 mm (balcony clear span) × 380 mm (38 cm) • Recessed 3,100 mm South behind NE terrace',
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
                        p1: [6695, 6270],
                        p2: [95, 6270],
                        outerLoop: [
                            [6695, 6270, 3430],
                            [95, 6270, 3430],
                            [95, 6270, 6130],
                            [6695, 6270, 6130]
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
                zTop: 6130,
                rooms: 'NE Covered Balcony (E) ↔ 1.01 Sypialnia',
                specs: '3,100 × 380 mm (38 cm) • Hosts full-height terrace glazing O14b + balcony door D1 (2,810 × 2,700 mm)',
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
                        p1: [6695, 3170],
                        p2: [6695, 6270],
                        outerLoop: [
                            [6695, 5800, 3430],
                            [6695, 6270, 3430],
                            [6695, 6270, 6130],
                            [6695, 5800, 6130]
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
                zTop: 6130,
                rooms: 'North Garden (N) ↔ 1.01 Sypialnia, 1.02 Łazienka, 1.03 Łazienka & 1.05 Pokój',
                specs: '14,390 mm (plan) / 14,190 mm (excl. 200 mm right jamb) × 380 mm (38 cm) • Starts at X=7,505 after full-height corner window 14a and notches down to Z=4,180 for NW corner window O13a',
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
                        p1: [20325, 3170],
                        p2: [6695, 3170],
                        outerLoop: [
                            [20325, 3170, 3430],
                            [7505, 3170, 3430],
                            [7505, 3170, 6130],
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
                zTop: 6130,
                rooms: 'West Forecourt (W) ↔ 1.05 Pokój & 1.04 Pokój',
                specs: '8,790 × 380 mm (38 cm) • Hosts NW and SW corner windows O13b_1 and O13b_2',
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
                        p1: [20325, 11200],
                        p2: [20325, 3170],
                        outerLoop: [
                            [20325, 11200, 3430],
                            [20325, 3170, 3430],
                            [20325, 3170, 4180],
                            [20325, 5360, 4180],
                            [20325, 5360, 6130],
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
                zTop: 6130,
                rooms: 'South Garden (S) ↔ 1.04 Pokój, 1.06 Korytarz, 1.08 Garderoba & Antresola',
                specs: '20,990 × 380 mm (38 cm) • Notches down to Z=4,180 for SW corner window O13a_2, hosts O12 and SO3, and ends at X=6,215 before full-height SE corner window O10',
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
                        p1: [95, 11200],
                        p2: [20325, 11200],
                        outerLoop: [
                            [6215, 11200, 3430],
                            [20325, 11200, 3430],
                            [20325, 11200, 4180],
                            [18125, 11200, 4180],
                            [18125, 11200, 6130],
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
                zTop: 6130,
                rooms: 'East Garden (E) ↔ Pustka nad salonem (Antresola)',
                specs: '5,690 × 380 mm (38 cm) • Hosts full-height corner glazing O9 (5,090 × 2,700 mm) meeting O10',
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
                        p1: [95, 6270],
                        p2: [95, 11200],
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
                x1: 14095, y1: 90, x2: 14275, y2: 6290,
                thickness: 180,
                zBottom: 0,
                zTop: 2800,
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
                            [14095, 90, 2800],
                            [14095, 6290, 2800]
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
                            [14275, 6290, 2800],
                            [14275, 90, 2800]
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
                zTop: 2800,
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
                        outerLoop: [[12095, 2990, 0], [14095, 2990, 0], [14095, 2990, 2800], [12095, 2990, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_2_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [14095, 3110],
                        p2: [12095, 3110],
                        outerLoop: [[14095, 3110, 0], [12095, 3110, 0], [12095, 3110, 2800], [14095, 3110, 2800]],
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
                zTop: 2800,
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
                        outerLoop: [[11915, 8360, 0], [11915, 3170, 0], [11915, 3170, 2800], [11915, 8360, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [12095, 3170],
                        p2: [12095, 8360],
                        outerLoop: [[12095, 3170, 0], [12095, 8360, 0], [12095, 8360, 2800], [12095, 3170, 2800]],
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
                x1: 11915, y1: 11065, x2: 12095, y2: 11200,
                thickness: 180,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.07 Komunikacja ↔ 0.12 Jadalnia (185 cm passage)',
                specs: '180 × 135 mm • South wall pier along Axis 4 defining 1,850 mm (185 cm) open passage',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_3b_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11915, 11200],
                        p2: [11915, 11065],
                        outerLoop: [[11915, 11200, 0], [11915, 11065, 0], [11915, 11065, 2800], [11915, 11200, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_3b_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [12095, 11065],
                        p2: [12095, 11200],
                        outerLoop: [[12095, 11065, 0], [12095, 11200, 0], [12095, 11200, 2800], [12095, 11065, 2800]],
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
                zTop: 2800,
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
                            [17625, 6290, 2800],
                            [12095, 6290, 2800]
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
                            [12095, 6470, 2800],
                            [17625, 6470, 2800]
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
                zTop: 2800,
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
                            [17445, 6470, 2800],
                            [17445, 8360, 2800]
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
                            [17625, 8360, 2800],
                            [17625, 6470, 2800]
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
                zTop: 2800,
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
                            [18845, 8180, 2800],
                            [17625, 8180, 2800]
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
                            [17625, 8360, 2800],
                            [18845, 8360, 2800]
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
                zTop: 2800,
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
                            [16175, 8360, 2800],
                            [16175, 11220, 2800]
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
                            [16255, 11220, 2800],
                            [16255, 8360, 2800]
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
                zTop: 2800,
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
                        outerLoop: [[14095, 8180, 0], [14095, 6470, 0], [14095, 6470, 2800], [14095, 8180, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_6_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [14275, 6470],
                        p2: [14275, 8180],
                        outerLoop: [[14275, 6470, 0], [14275, 8180, 0], [14275, 8180, 2800], [14275, 6470, 2800]],
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
                zTop: 2800,
                rooms: '0.05 Garderoba & 0.06 WC ↔ 0.04 Wiatrołap & 0.07 Komunikacja (Stairs)',
                specs: '5,350 × 180 mm (18 cm structural wall) • Garderoba: 14 cm + 90×210 cm door (X=16405..17305) + 213 cm; WC: 104 cm + 90×210 cm door (X=12155..13055) + 6 cm',
                openings: [],
                doors: [
                    { id: 'D_GW7_1', start: 16405, end: 17305, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: true },
                    { id: 'D_GW7_2', start: 12155, end: 13055, sillMm: 0, heightMm: 2100, swingDir: -1, hingeStart: false }
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
                            [12155, 8180, 0],
                            [12155, 8180, 2100],
                            [13055, 8180, 2100],
                            [13055, 8180, 0],
                            [16405, 8180, 0],
                            [16405, 8180, 2100],
                            [17305, 8180, 2100],
                            [17305, 8180, 0],
                            [17445, 8180, 0],
                            [17445, 8180, 2800],
                            [12095, 8180, 2800]
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
                            [13055, 8360, 2100],
                            [12155, 8360, 2100],
                            [12155, 8360, 0],
                            [12095, 8360, 0],
                            [12095, 8360, 2800],
                            [17445, 8360, 2800]
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
                zTop: 2800,
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
                        outerLoop: [[16175, 11220, 0], [18845, 11220, 0], [18845, 11220, 2800], [16175, 11220, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_8_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [18845, 11400],
                        p2: [16175, 11400],
                        outerLoop: [[18845, 11400, 0], [16175, 11400, 0], [16175, 11400, 2800], [18845, 11400, 2800]],
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
                zTop: 2800,
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
                        outerLoop: [[15075, 11200, 0], [15225, 11200, 0], [15225, 11200, 2800], [15075, 11200, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_9b_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [15225, 11320],
                        p2: [15075, 11320],
                        outerLoop: [[15225, 11320, 0], [15075, 11320, 0], [15075, 11320, 2800], [15225, 11320, 2800]],
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
                zTop: 2800,
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
                            [16235, 11400, 2800],
                            [16235, 13420, 2800]
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
                            [16355, 13420, 2800],
                            [16355, 11400, 2800]
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
                zTop: 2800,
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
                        outerLoop: [[16355, 13300, 0], [20325, 13300, 0], [20325, 13300, 2800], [16355, 13300, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_10_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 13420],
                        p2: [16355, 13420],
                        outerLoop: [[20325, 13420, 0], [16355, 13420, 0], [16355, 13420, 2800], [20325, 13420, 2800]],
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
                zTop: 2800,
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
                            [17705, 13420, 2800],
                            [17705, 15130, 2800]
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
                            [17825, 15130, 2800],
                            [17825, 13420, 2800]
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
                zTop: 2800,
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
                            [20325, 15130, 2800],
                            [17705, 15130, 2800]
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
                            [17705, 15250, 2800],
                            [20325, 15250, 2800]
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
                zTop: 2800,
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
                            [6315, 3170, 2800],
                            [6315, 6110, 2800]
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
                            [6495, 6110, 2800],
                            [6495, 3170, 2800]
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
                x1: 4335, y1: 3170, x2: 4455, y2: 5090,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia (186 cm upper) ↔ 0.15 Gabinet (424 cm upper)',
                specs: '120 × 1,920 mm • 1,860 mm (186 cm) East of GW_13, 4,240 mm (424 cm) West of EW_EAST_CORE',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14a_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4335, 5090],
                        p2: [4335, 3170],
                        outerLoop: [[4335, 5090, 0], [4335, 3170, 0], [4335, 3170, 2800], [4335, 5090, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14a_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4455, 3170],
                        p2: [4455, 5090],
                        outerLoop: [[4455, 3170, 0], [4455, 5090, 0], [4455, 5090, 2800], [4455, 3170, 2800]],
                        holes: []
                    }
                ]
            },
            {
                id: 'GW_14b',
                name: 'GW_14b (Spiżarnia / Gabinet 25 cm Wall Step)',
                floor: 'ground',
                category: 'internal',
                axis: 'x',
                x1: 4085, y1: 5090, x2: 4455, y2: 5210,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia ↔ 0.15 Gabinet (25 cm Step)',
                specs: '370 × 120 mm • 250 mm (25 cm) step between 186 cm upper and 211 cm lower Spiżarnia width',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14b_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [4085, 5090],
                        p2: [4455, 5090],
                        outerLoop: [[4085, 5090, 0], [4455, 5090, 0], [4455, 5090, 2800], [4085, 5090, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14b_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [4455, 5210],
                        p2: [4085, 5210],
                        outerLoop: [[4455, 5210, 0], [4085, 5210, 0], [4085, 5210, 2800], [4455, 5210, 2800]],
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
                x1: 4085, y1: 5210, x2: 4205, y2: 6110,
                thickness: 120,
                zBottom: 0,
                zTop: 2800,
                rooms: '0.14 Spiżarnia (211 cm lower) ↔ 0.15 Gabinet (399 cm lower)',
                specs: '120 × 900 mm (90 cm) • Stepped 250 mm (25 cm) East of GW_14a; 399 cm West of EW_EAST_CORE',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'GW_14c_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [4085, 6110],
                        p2: [4085, 5210],
                        outerLoop: [[4085, 6110, 0], [4085, 5210, 0], [4085, 5210, 2800], [4085, 6110, 2800]],
                        holes: []
                    },
                    {
                        id: 'GW_14c_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [4205, 5210],
                        p2: [4205, 6110],
                        outerLoop: [[4205, 5210, 0], [4205, 6110, 0], [4205, 6110, 2800], [4205, 5210, 2800]],
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
                zTop: 2800,
                rooms: '0.14 Spiżarnia & 0.15 Gabinet (294 cm) ↔ 0.11 Salon',
                specs: '6,400 × 180 mm (18 cm structural wall) • 93 cm East pier (X=95..1025) + 90×210 cm door (X=1025..1925) + 457 cm West wall (X=1925..6495)',
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
                            [6495, 6110, 2800],
                            [95, 6110, 2800]
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
                            [95, 6290, 2800],
                            [6495, 6290, 2800]
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
                x1: 15415, y1: 3170, x2: 15535, y2: 11200,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój & 1.04 Pokój (479 cm) ↔ 1.03 Łazienka & 1.06 Korytarz',
                specs: '120 × 8,030 mm • Doorway notch Z=6950..7850, Y=3430..5480 mm',
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
                        p1: [15415, 11200],
                        p2: [15415, 3170],
                        outerLoop: [
                            [15415, 11200, 3430],
                            [15415, 7850, 3430],
                            [15415, 7850, 5480],
                            [15415, 6950, 5480],
                            [15415, 6950, 3430],
                            [15415, 3170, 3430],
                            [15415, 3170, 6130],
                            [15415, 11200, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_1_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [15535, 3170],
                        p2: [15535, 11200],
                        outerLoop: [
                            [15535, 3170, 3430],
                            [15535, 6950, 3430],
                            [15535, 6950, 5480],
                            [15535, 7850, 5480],
                            [15535, 7850, 3430],
                            [15535, 11200, 3430],
                            [15535, 11200, 6130],
                            [15535, 3170, 6130]
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
                x1: 17385, y1: 6760, x2: 20325, y2: 6880,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.05 Pokój (359 cm) ↔ 1.04 Pokój (432 cm)',
                specs: '2,940 × 120 mm • 3,590 mm (359 cm) South of North inner wall, 2,940 mm (294 cm) from West wall',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_2a_NORTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, -1, 0],
                        p1: [17385, 6760],
                        p2: [20325, 6760],
                        outerLoop: [[17385, 6760, 3430], [20325, 6760, 3430], [20325, 6760, 6130], [17385, 6760, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_2a_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [20325, 6880],
                        p2: [17385, 6880],
                        outerLoop: [[20325, 6880, 3430], [17385, 6880, 3430], [17385, 6880, 6130], [20325, 6880, 6130]],
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
                rooms: '1.05 Pokój Alcove ↔ 1.04 Pokój (301 cm)',
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
                x1: 13815, y1: 3170, x2: 13935, y2: 6880,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.03 Łazienka (148 cm) ↔ 1.02 Łazienka (242 cm)',
                specs: '120 × 3,710 mm • 1,480 mm (148 cm) East of FW_1 (X = 15,415 mm)',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_3_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [13815, 6880],
                        p2: [13815, 3170],
                        outerLoop: [[13815, 6880, 3430], [13815, 3170, 3430], [13815, 3170, 6130], [13815, 6880, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_3_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [13935, 3170],
                        p2: [13935, 6880],
                        outerLoop: [[13935, 3170, 3430], [13935, 6880, 3430], [13935, 6880, 6130], [13935, 3170, 6130]],
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
                rooms: '1.03 Łazienka (359 cm) ↔ 1.06 Korytarz',
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
                x1: 11255, y1: 3170, x2: 11375, y2: 6250,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.02 Łazienka (242 cm) ↔ 1.01 Sypialnia',
                specs: '120 × 3,080 mm • 2,440 mm East of FW_3, between O11_2 and O15',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_5_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [11255, 6250],
                        p2: [11255, 3170],
                        outerLoop: [[11255, 6250, 3430], [11255, 3170, 3430], [11255, 3170, 6130], [11255, 6250, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_5_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [11375, 3170],
                        p2: [11375, 6250],
                        outerLoop: [[11375, 3170, 3430], [11375, 6250, 3430], [11375, 6250, 6130], [11375, 3170, 6130]],
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
                rooms: '1.02 Łazienka (284 cm) ↔ 1.06 Korytarz',
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
                x1: 6695, y1: 6130, x2: 11255, y2: 6250,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.01 Sypialnia (296 cm) ↔ 1.06 Korytarz & 1.08 Garderoba',
                specs: '4,560 × 120 mm • Doorway notch X=10200..11100, Y=3430..5480 mm',
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
                        p1: [6695, 6130],
                        p2: [11255, 6130],
                        outerLoop: [
                            [6695, 6130, 3430],
                            [10200, 6130, 3430],
                            [10200, 6130, 5480],
                            [11100, 6130, 5480],
                            [11100, 6130, 3430],
                            [11255, 6130, 3430],
                            [11255, 6130, 6130],
                            [6695, 6130, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_7_SOUTH',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [0, 1, 0],
                        p1: [11255, 6250],
                        p2: [6695, 6250],
                        outerLoop: [
                            [11255, 6250, 3430],
                            [11100, 6250, 3430],
                            [11100, 6250, 5480],
                            [10200, 6250, 5480],
                            [10200, 6250, 3430],
                            [6695, 6250, 3430],
                            [6695, 6250, 6130],
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
                x1: 10455, y1: 6250, x2: 10575, y2: 11200,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.06 Korytarz & Schody (484 cm) ↔ 1.08 Garderoba (322 cm)',
                specs: '120 × 4,950 mm • Doorway notch Z=6450..7350, Y=3430..5480 mm',
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
                        p1: [10455, 11200],
                        p2: [10455, 6250],
                        outerLoop: [
                            [10455, 11200, 3430],
                            [10455, 7350, 3430],
                            [10455, 7350, 5480],
                            [10455, 6450, 5480],
                            [10455, 6450, 3430],
                            [10455, 6250, 3430],
                            [10455, 6250, 6130],
                            [10455, 11200, 6130]
                        ],
                        holes: []
                    },
                    {
                        id: 'FW_8_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [10575, 6250],
                        p2: [10575, 11200],
                        outerLoop: [
                            [10575, 6250, 3430],
                            [10575, 6450, 3430],
                            [10575, 6450, 5480],
                            [10575, 7350, 5480],
                            [10575, 7350, 3430],
                            [10575, 11200, 3430],
                            [10575, 11200, 6130],
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
                x1: 7095, y1: 6250, x2: 7215, y2: 11200,
                thickness: 120,
                zBottom: 3430,
                zTop: 6130,
                rooms: '1.08 Garderoba (322 × 495 cm) ↔ Pustka nad salonem (+0.00)',
                specs: '120 × 4,950 mm • 3,240 mm East of FW_8, immediately East of SO3',
                openings: [],
                doors: [],
                sides: [
                    {
                        id: 'FW_9_EAST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [-1, 0, 0],
                        p1: [7095, 11200],
                        p2: [7095, 6250],
                        outerLoop: [[7095, 11200, 3430], [7095, 6250, 3430], [7095, 6250, 6130], [7095, 11200, 6130]],
                        holes: []
                    },
                    {
                        id: 'FW_9_WEST',
                        role: 'interior',
                        material: 'plaster_white',
                        normal: [1, 0, 0],
                        p1: [7215, 6250],
                        p2: [7215, 11200],
                        outerLoop: [[7215, 6250, 3430], [7215, 11200, 3430], [7215, 11200, 6130], [7215, 6250, 6130]],
                        holes: []
                    }
                ]
            }
        ]
    };
}));
