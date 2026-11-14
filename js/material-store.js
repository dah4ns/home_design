/**
 * material-store.js - Finishing Materials Store for Fixed-Position 3D Architectural & Interior Objects
 *
 * Persists user-selected finishing materials (e.g. White Glass vs Black Glass for the 5mm Kitchen
 * Backsplash Pane KITCHEN_SPLASHBACK_GLASS) in localStorage ('jetski_finishing_materials_v1')
 * and broadcasts live updates across pages (materials.html, kitchen.html, objects_3d.html, walkthrough_3d.html).
 */
(function (root, factory) {
    const api = factory(root);
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = api;
    } else {
        root.MaterialStore = api;
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    'use strict';

    const STORAGE_KEY = 'jetski_finishing_materials_v1';
    const listeners = new Set();

    /**
     * Catalog of fixed-position (non-movable) 3D objects that support configurable finishing materials.
     */
    const CONFIGURABLE_OBJECTS_CATALOG = [
        {
            objectId: 'KITCHEN_SPLASHBACK_GLASS',
            name: 'Kitchen Glass Backsplash Pane (5 mm)',
            fullName: 'KITCHEN_SPLASHBACK_GLASS — Kitchen West Wall 5mm Tempered Glass Backsplash',
            componentLabel: 'Kitchen West Wall 5mm Tempered Glass Backsplash Pane (Host Wall GW_3, Z = 900..1500 mm)',
            room: '0.13 Kuchnia (Kitchen)',
            hostWallId: 'GW_3 (Kitchen West Wall)',
            dimensionsLabel: '3000 × 600 × 5 mm',
            qtyAreaLabel: '1 pc (1.800 m² / 22.5 kg)',
            positionLabel: 'X = 11,910..11,915 mm • Y = 3,170..6,170 mm • Z = 900..1,500 mm',
            fabricationNotes: 'EN 12150 ESG toughened 5 mm Lacobel glass with diamond-polished low-iron C-edges and CNC cutouts for 2× quadruple sockets at Z = +1,040 mm.',
            positionEditable: false,
            defaultMaterialId: 'white_glass',
            options: [
                {
                    id: 'white_glass',
                    name: 'White Glass',
                    technicalName: 'Lacobel Pure White 9003 (5 mm Optiwhite Low-Iron Tempered Glass)',
                    description: 'Crystal-clear low-iron Optiwhite 5 mm tempered glass back-painted pure architectural white (RAL 9003). Features a luminous porcelain-white core, soft sky-aqua window reflections, crisp diagonal specular highlights, and a diamond-polished aqua glass edge.',
                    colorRgb: [0.95, 0.98, 1.00],
                    edgeColorRgb: [0.32, 0.82, 0.92],
                    wireColorRgba: [0.28, 0.78, 0.90, 0.96],
                    reflectionTintRgb: [0.70, 0.88, 0.98],
                    specularStrength: 0.92,
                    chipColor: '#e6f7fc',
                    swatchClass: 'swatch-white-glass',
                    badgeText: 'OPTWHITE RAL 9003'
                },
                {
                    id: 'black_glass',
                    name: 'Black Glass',
                    technicalName: 'Lacobel Deep Black 9005 (5 mm Tempered Obsidian Glass)',
                    description: 'Deep obsidian back-painted 5 mm tempered float glass (RAL 9005) with high-contrast mirror-like reflections, sharp diagonal light streaks, and a polished dark slate bevel.',
                    colorRgb: [0.06, 0.07, 0.09],
                    edgeColorRgb: [0.22, 0.32, 0.40],
                    wireColorRgba: [0.32, 0.48, 0.64, 0.94],
                    reflectionTintRgb: [0.82, 0.91, 1.0],
                    specularStrength: 0.88,
                    chipColor: '#0f172a',
                    swatchClass: 'swatch-black-glass',
                    badgeText: 'OBSIDIAN RAL 9005'
                }
            ]
        },
        {
            objectId: 'KITCHEN_SPLASHBACK_GLASS_NORTH',
            name: 'Kitchen Back Wall Glass Backsplash U-Panel (5 mm)',
            fullName: 'KITCHEN_SPLASHBACK_GLASS_NORTH — Kitchen Back Wall U-Shaped 5mm Tempered Glass Backsplash around Window O1',
            componentLabel: 'Kitchen Back Wall U-Shaped 5mm Tempered Glass Backsplash around Window O1 (Host Wall EW_NORTH_RECESSED)',
            room: '0.13 Kuchnia (Kitchen)',
            hostWallId: 'EW_NORTH_RECESSED (Kitchen Back/North Wall)',
            dimensionsLabel: '3595 × 600/200 × 5 mm (U-Panel)',
            qtyAreaLabel: '1 U-panel (1.317 m² / 16.5 kg)',
            positionLabel: 'X = 8,315..11,910 mm • Y = 3,170..3,175 mm • Z = 900..1,500 mm (200 mm under Window O1 sill Z = 900..1,100 mm)',
            fabricationNotes: 'EN 12150 ESG toughened 5 mm Lacobel U-shaped glass panel with CNC window cutout under Window O1 (X = 8,480..10,580 mm, Z = 1,100..1,500 mm) and cutouts for 4-gang and 2-gang sockets.',
            positionEditable: false,
            defaultMaterialId: 'white_glass',
            options: [
                {
                    id: 'white_glass',
                    name: 'White Glass',
                    technicalName: 'Lacobel Pure White 9003 (5 mm Optiwhite Low-Iron Tempered Glass)',
                    description: 'Crystal-clear low-iron Optiwhite 5 mm tempered glass back-painted pure architectural white (RAL 9003). Features a luminous porcelain-white core, soft sky-aqua window reflections, crisp diagonal specular highlights, and a diamond-polished aqua glass edge.',
                    colorRgb: [0.95, 0.98, 1.00],
                    edgeColorRgb: [0.32, 0.82, 0.92],
                    wireColorRgba: [0.28, 0.78, 0.90, 0.96],
                    reflectionTintRgb: [0.70, 0.88, 0.98],
                    specularStrength: 0.92,
                    chipColor: '#e6f7fc',
                    swatchClass: 'swatch-white-glass',
                    badgeText: 'OPTWHITE RAL 9003'
                },
                {
                    id: 'black_glass',
                    name: 'Black Glass',
                    technicalName: 'Lacobel Deep Black 9005 (5 mm Tempered Obsidian Glass)',
                    description: 'Deep obsidian back-painted 5 mm tempered float glass (RAL 9005) with high-contrast mirror-like reflections, sharp diagonal light streaks, and a polished dark slate bevel.',
                    colorRgb: [0.06, 0.07, 0.09],
                    edgeColorRgb: [0.22, 0.32, 0.40],
                    wireColorRgba: [0.32, 0.48, 0.64, 0.94],
                    reflectionTintRgb: [0.82, 0.91, 1.0],
                    specularStrength: 0.88,
                    chipColor: '#0f172a',
                    swatchClass: 'swatch-black-glass',
                    badgeText: 'OBSIDIAN RAL 9005'
                }
            ]
        },
        {
            objectId: 'KITCHEN_COUNTERTOP',
            name: 'Kitchen L-Shaped Countertop Slab (30 mm)',
            fullName: 'KITCHEN_COUNTERTOP — L-Shaped Stone Countertop Slab (North & West Walls, Z = 870..900 mm)',
            componentLabel: 'L-Shaped Stone Countertop Slab (North & West Walls, Z = 870..900 mm)',
            room: '0.13 Kuchnia (Kitchen)',
            hostWallId: 'EW_NORTH_RECESSED & GW_3',
            dimensionsLabel: '3600 × 600 × 30 mm + 2400 × 600 × 30 mm',
            qtyAreaLabel: '1 L-slab (3.600 m²)',
            positionLabel: 'North Run: X = 8,310..11,910 mm • West Run: Y = 3,170..6,170 mm • Z = 870..900 mm',
            fabricationNotes: '30 mm composite stone worktop supporting undermount sink KITCHEN_SINK_N2 on North Wall and sitting directly below KITCHEN_SPLASHBACK_GLASS on West Wall.',
            positionEditable: false,
            defaultMaterialId: 'cashmere_quartz',
            options: [
                {
                    id: 'cashmere_quartz',
                    name: 'Warm Cashmere Quartz',
                    technicalName: 'Warm Beige / Cashmere Quartz Composite Stone (30 mm)',
                    description: 'Warm sand-beige engineered quartz stone with a satin-honed finish and mitered front edge.',
                    colorRgb: [0.91, 0.86, 0.77],
                    edgeColorRgb: [0.78, 0.72, 0.62],
                    wireColorRgba: [0.68, 0.60, 0.48, 0.94],
                    reflectionTintRgb: [0.96, 0.93, 0.88],
                    specularStrength: 0.25,
                    chipColor: '#e8dcc4',
                    swatchClass: 'swatch-cashmere-stone',
                    badgeText: 'CASHMERE QUARTZ'
                },
                {
                    id: 'calacatta_white',
                    name: 'Calacatta White Stone',
                    technicalName: 'Calacatta Alpine White Sintered Stone (30 mm)',
                    description: 'Bright alabaster-white sintered stone slab with subtle cool gray mineral veining.',
                    colorRgb: [0.95, 0.95, 0.94],
                    edgeColorRgb: [0.80, 0.82, 0.84],
                    wireColorRgba: [0.64, 0.68, 0.72, 0.94],
                    reflectionTintRgb: [1.0, 1.0, 1.0],
                    specularStrength: 0.35,
                    chipColor: '#f1f5f9',
                    swatchClass: 'swatch-calacatta-stone',
                    badgeText: 'CALACATTA WHITE'
                },
                {
                    id: 'anthracite_granite',
                    name: 'Anthracite Slate Stone',
                    technicalName: 'Nero Assoluto / Anthracite Brushed Granite (30 mm)',
                    description: 'Deep charcoal-anthracite natural stone slab with a velvet-brushed thermal texture.',
                    colorRgb: [0.18, 0.19, 0.21],
                    edgeColorRgb: [0.28, 0.30, 0.34],
                    wireColorRgba: [0.35, 0.38, 0.42, 0.94],
                    reflectionTintRgb: [0.75, 0.78, 0.82],
                    specularStrength: 0.40,
                    chipColor: '#27272a',
                    swatchClass: 'swatch-anthracite-stone',
                    badgeText: 'ANTHRACITE SLATE'
                }
            ]
        },
        {
            objectId: 'KITCHEN_ISLAND',
            name: 'Kitchen Island Waterfall Stone (80 mm)',
            fullName: 'KITCHEN_ISLAND — Freestanding Kitchen Island with 80 mm Mitered Waterfall Sides',
            componentLabel: 'Freestanding Kitchen Island Waterfall Stone Top & Sides (Z = 0..920 mm)',
            room: '0.13 Kuchnia (Kitchen)',
            hostWallId: 'Freestanding Center Island',
            dimensionsLabel: '2400 × 1000 × 920 mm (80 mm Waterfall)',
            qtyAreaLabel: '1 set (4.240 m² stone)',
            positionLabel: 'X = 7,710..10,110 mm • Y = 4,820..5,820 mm • Z = 0..920 mm',
            fabricationNotes: '80 mm mitered waterfall stone countertop and side legs housing the 900 × 600 mm flush induction hob at Z = +920 mm.',
            positionEditable: false,
            defaultMaterialId: 'cashmere_quartz',
            options: [
                {
                    id: 'cashmere_quartz',
                    name: 'Warm Cashmere Quartz',
                    technicalName: 'Warm Beige / Cashmere Quartz Waterfall Stone (80 mm)',
                    description: 'Warm sand-beige engineered quartz waterfall slab matching the perimeter countertop.',
                    colorRgb: [0.91, 0.86, 0.77],
                    edgeColorRgb: [0.78, 0.72, 0.62],
                    wireColorRgba: [0.68, 0.60, 0.48, 0.94],
                    reflectionTintRgb: [0.96, 0.93, 0.88],
                    specularStrength: 0.25,
                    chipColor: '#e8dcc4',
                    swatchClass: 'swatch-cashmere-stone',
                    badgeText: 'CASHMERE QUARTZ'
                },
                {
                    id: 'calacatta_white',
                    name: 'Calacatta White Stone',
                    technicalName: 'Calacatta Alpine White Waterfall Sintered Stone (80 mm)',
                    description: 'Crisp architectural white waterfall stone island with mitered 80 mm side panels.',
                    colorRgb: [0.95, 0.95, 0.94],
                    edgeColorRgb: [0.80, 0.82, 0.84],
                    wireColorRgba: [0.64, 0.68, 0.72, 0.94],
                    reflectionTintRgb: [1.0, 1.0, 1.0],
                    specularStrength: 0.35,
                    chipColor: '#f1f5f9',
                    swatchClass: 'swatch-calacatta-stone',
                    badgeText: 'CALACATTA WHITE'
                },
                {
                    id: 'anthracite_granite',
                    name: 'Anthracite Slate Stone',
                    technicalName: 'Nero Assoluto / Anthracite Waterfall Stone (80 mm)',
                    description: 'Bold dark anthracite stone waterfall island contrasting with warm oak drawers.',
                    colorRgb: [0.18, 0.19, 0.21],
                    edgeColorRgb: [0.28, 0.30, 0.34],
                    wireColorRgba: [0.35, 0.38, 0.42, 0.94],
                    reflectionTintRgb: [0.75, 0.78, 0.82],
                    specularStrength: 0.40,
                    chipColor: '#27272a',
                    swatchClass: 'swatch-anthracite-stone',
                    badgeText: 'ANTHRACITE SLATE'
                }
            ]
        }
    ];

    function getDefaultSelections() {
        const defaults = {};
        CONFIGURABLE_OBJECTS_CATALOG.forEach(item => {
            defaults[item.objectId] = item.defaultMaterialId;
        });
        return defaults;
    }

    function normalizeSelections(raw) {
        const out = getDefaultSelections();
        if (!raw || typeof raw !== 'object') return out;
        CONFIGURABLE_OBJECTS_CATALOG.forEach(item => {
            const candidate = raw[item.objectId];
            if (typeof candidate === 'string' && item.options.some(opt => opt.id === candidate)) {
                out[item.objectId] = candidate;
            }
        });
        if (!raw.KITCHEN_SPLASHBACK_GLASS_NORTH && out.KITCHEN_SPLASHBACK_GLASS) {
            out.KITCHEN_SPLASHBACK_GLASS_NORTH = out.KITCHEN_SPLASHBACK_GLASS;
        }
        return out;
    }

    let memoryFallback = getDefaultSelections();

    function loadSelections() {
        try {
            if (root && root.localStorage) {
                const rawStr = root.localStorage.getItem(STORAGE_KEY);
                if (rawStr) {
                    const parsed = JSON.parse(rawStr);
                    const normalized = normalizeSelections(parsed);
                    memoryFallback = normalized;
                    return Object.assign({}, normalized);
                }
            }
        } catch (err) {
            // Fallback to in-memory state if localStorage is unavailable
        }
        return Object.assign({}, memoryFallback);
    }

    function saveSelections(nextSelections) {
        const normalized = normalizeSelections(nextSelections);
        memoryFallback = normalized;
        try {
            if (root && root.localStorage) {
                root.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            }
        } catch (err) {
            // Ignore storage write errors
        }
        notifyListeners();
        return Object.assign({}, normalized);
    }

    function getCatalog() {
        return CONFIGURABLE_OBJECTS_CATALOG.map(item => Object.assign({}, item, {
            options: item.options.map(opt => Object.assign({}, opt, {
                colorRgb: opt.colorRgb.slice(),
                edgeColorRgb: opt.edgeColorRgb.slice(),
                wireColorRgba: opt.wireColorRgba.slice(),
                reflectionTintRgb: opt.reflectionTintRgb.slice()
            }))
        }));
    }

    function getCatalogItem(objectId) {
        return CONFIGURABLE_OBJECTS_CATALOG.find(item => item.objectId === objectId) || null;
    }

    function getMaterialId(objectId) {
        const all = loadSelections();
        const item = getCatalogItem(objectId);
        if (!item) return null;
        return all[objectId] || item.defaultMaterialId;
    }

    function getMaterialSpec(objectId) {
        const item = getCatalogItem(objectId);
        if (!item) return null;
        const matId = getMaterialId(objectId);
        const found = item.options.find(opt => opt.id === matId) || item.options[0];
        return Object.assign({}, found, {
            colorRgb: found.colorRgb.slice(),
            edgeColorRgb: found.edgeColorRgb.slice(),
            wireColorRgba: found.wireColorRgba.slice(),
            reflectionTintRgb: found.reflectionTintRgb.slice()
        });
    }

    function setMaterial(objectId, materialId) {
        const item = getCatalogItem(objectId);
        if (!item) return loadSelections();
        if (!item.options.some(opt => opt.id === materialId)) {
            return loadSelections();
        }
        const current = loadSelections();
        const prevVal = current[objectId];
        current[objectId] = materialId;
        if (objectId === 'KITCHEN_SPLASHBACK_GLASS' && current.KITCHEN_SPLASHBACK_GLASS_NORTH === prevVal) {
            current.KITCHEN_SPLASHBACK_GLASS_NORTH = materialId;
        }
        return saveSelections(current);
    }

    function resetDefaults() {
        return saveSelections(getDefaultSelections());
    }

    function notifyListeners() {
        const snapshot = loadSelections();
        listeners.forEach(fn => {
            try {
                fn(snapshot);
            } catch (err) {
                console.error('MaterialStore listener error:', err);
            }
        });
    }

    function subscribe(listener) {
        if (typeof listener !== 'function') return function () {};
        listeners.add(listener);
        return function unsubscribe() {
            listeners.delete(listener);
        };
    }

    if (root && typeof root.addEventListener === 'function') {
        root.addEventListener('storage', function (e) {
            if (e && e.key === STORAGE_KEY) {
                notifyListeners();
            }
        });
    }

    return {
        STORAGE_KEY,
        getCatalog,
        getCatalogItem,
        loadSelections,
        saveSelections,
        getMaterialId,
        getMaterialSpec,
        setMaterial,
        resetDefaults,
        subscribe
    };
}));
