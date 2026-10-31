/**
 * views.js - Canonical Default Values for Architectural Views
 * Separated per entity type. Runtime modifications are persisted via PersistenceService (js/persistence.js).
 */
(function (root, factory) {
    const data = factory();
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = data;
    } else {
        root.DEFAULT_VIEWS_DATA = data;
        root.BUILDING_VIEWS_DATA = data;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const defaultViews = {
        "north_facade": {
            "id": "north_facade",
            "name": "North Facade Elevation",
            "axis": "x",
            "origin": { "x": 0, "y": 0 },
            "positionOnMap": 0,
            "leftEdge": 0,
            "floor": "all",
            "direction": "west",
            "length": 20505,
            "scale": 0.1,
            "wall": "north",
            "side": "exterior",
            "description": "Exterior architectural elevation looking South from the garden. Origin (0,0) is Point 0 / Axis 6 (beginning of upper balcony; 270 mm right of the ground-floor wall start at X = -270 mm); X grows Westward (left to right)."
        },
        "kitchen_north_wall": {
            "id": "kitchen_north_wall",
            "name": "Kitchen North Wall Elevation",
            "axis": "x",
            "origin": { "x": 11880, "y": 0 },
            "positionOnMap": 11880,
            "leftEdge": 11880,
            "floor": "ground",
            "direction": "east",
            "length": 5400,
            "scale": 0.1,
            "wall": "north",
            "side": "interior",
            "description": "Interior kitchen back wall elevation looking North. Left edge is at X = 11,880 mm (12,150 mm from ground-floor wall start); X decreases Eastward (left to right)."
        },
        "stairs_north_wall": {
            "id": "stairs_north_wall",
            "name": "Stairs North Wall Elevation",
            "axis": "x",
            "origin": { "x": 18910, "y": 0 },
            "positionOnMap": 18910,
            "leftEdge": 18910,
            "floor": "all",
            "direction": "east",
            "length": 9000,
            "scale": 0.1,
            "wall": "north",
            "side": "interior",
            "floorY": 640,
            "description": "Interior staircase cross-section looking North towards the North wall. Left edge is at X = 18,910 mm; X decreases Eastward (left to right)."
        },
        "south_facade": {
            "id": "south_facade",
            "name": "South Facade Elevation",
            "axis": "x",
            "origin": { "x": 20990, "y": 21130 },
            "positionOnMap": 20990,
            "leftEdge": 20990,
            "floor": "all",
            "direction": "east",
            "length": 20990,
            "scale": 0.1,
            "wall": "south",
            "side": "exterior",
            "description": "Exterior architectural elevation looking North from the southern garden. Left edge is the South-West corner (X = 20,990 mm, Y = 21,130 mm); X decreases Eastward (left to right)."
        },
        "west_facade": {
            "id": "west_facade",
            "name": "West Facade Elevation",
            "axis": "y",
            "origin": { "x": 20505, "y": 0 },
            "positionOnMap": 0,
            "leftEdge": 0,
            "floor": "all",
            "direction": "south",
            "length": 21130,
            "scale": 0.1,
            "wall": "west",
            "side": "exterior",
            "description": "Exterior architectural elevation looking East towards the West facade. Point 0 / Axis A (Y = 0 mm) is 290 mm to the right of the lower-level wall start (Y = -290 mm); Y grows Southward (left to right) to 21,130 mm (total lower-level wall length = 21,420 mm)."
        },
        "east_facade": {
            "id": "east_facade",
            "name": "East Facade Elevation",
            "axis": "y",
            "origin": { "x": 0, "y": 21125 },
            "positionOnMap": 21125,
            "leftEdge": 21125,
            "floor": "all",
            "direction": "north",
            "length": 21415,
            "scale": 0.1,
            "wall": "east",
            "side": "exterior",
            "description": "Exterior architectural elevation looking West towards the East facade. View direction is South to North (left to right). Point 0 / Axis A (Y = 0 mm) is 290 mm from the right edge of the wall (at Screen X = 21,125 mm; total wall length = 21,415 mm)."
        }
    };

    return {
        "_role": "DEFAULT_SEED_VALUES",
        "entityType": "views",
        "metadata": {
            "version": "2.0.0",
            "isDefaultSeed": true,
            "persistenceNote": "This file defines the canonical DEFAULT architectural view definitions. Runtime modifications are persisted via PersistenceService (js/persistence.js)."
        },
        "defaultViews": defaultViews,
        "views": defaultViews
    };
}));
