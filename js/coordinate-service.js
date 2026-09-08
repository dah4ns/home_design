/**
 * coordinate-service.js
 * Mathematical transformation engine converting Global Building Coordinates
 * into local View / SVG coordinate spaces for various architectural elevations.
 * 
 * Implements directional coordinate math:
 * - 'west' / 'north': screen displacement = (globalX - leftEdge). Increasing X shifts RIGHT.
 * - 'east' / 'south': screen displacement = (leftEdge - globalX). Increasing X shifts LEFT.
 * Version: 1.1.0
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(require('./window-store.js'));
    } else {
        root.CoordinateService = factory(root.WindowStore);
    }
}(typeof self !== 'undefined' ? self : this, function (WindowStore) {

    // Canonical default view definitions (fallback if WindowStore is unavailable)
    const DEFAULT_VIEWS = {
        'north_facade': {
            id: 'north_facade',
            name: 'North Facade Elevation',
            positionOnMap: 0,
            leftEdge: 0,
            floor: 'all',
            direction: 'west',
            length: 21000,
            scale: 0.1,
            wall: 'north',
            side: 'exterior',
            floorY: 0
        },
        'kitchen_north_wall': {
            id: 'kitchen_north_wall',
            name: 'Kitchen North Wall Elevation',
            positionOnMap: 12150,
            leftEdge: 12150,
            floor: 'ground',
            direction: 'east',
            length: 5400,
            scale: 0.1,
            wall: 'north',
            side: 'interior',
            floorY: 260,
            countertopY: 170
        }
    };

    const VIEW_ALIASES = {
        'kitchen_back_wall': 'kitchen_north_wall'
    };

    function resolveView(viewId) {
        const canonicalId = VIEW_ALIASES[viewId] || viewId;
        if (typeof WindowStore !== 'undefined' && WindowStore && typeof WindowStore.getView === 'function') {
            const storeView = WindowStore.getView(canonicalId);
            if (storeView) {
                // Ensure defaults for rendering parameters
                if (storeView.floorY === undefined) {
                    storeView.floorY = (canonicalId === 'kitchen_north_wall') ? 260 : 0;
                }
                if (storeView.countertopY === undefined && canonicalId === 'kitchen_north_wall') {
                    storeView.countertopY = 170;
                }
                return storeView;
            }
        }
        return DEFAULT_VIEWS[canonicalId] || null;
    }

    const CoordinateService = {
        /**
         * Get view definition by ID
         * @param {string} viewId
         * @returns {object|null}
         */
        getView: function (viewId) {
            return resolveView(viewId);
        },

        /**
         * Determine shift behavior when global X increases by +deltaX:
         * - 'west': +deltaX shifts RIGHT (+1)
         * - 'east': +deltaX shifts LEFT (-1)
         * @param {string} viewId
         * @returns {object} { factor: 1 | -1, label: 'RIGHT' | 'LEFT', direction: string }
         */
        getShiftDirection: function (viewId) {
            const view = resolveView(viewId);
            const dir = (view && view.direction) ? view.direction.toLowerCase() : 'west';
            if (dir === 'east' || dir === 'south') {
                return {
                    factor: -1,
                    label: 'LEFT',
                    direction: dir
                };
            }
            return {
                factor: 1,
                label: 'RIGHT',
                direction: dir
            };
        },

        /**
         * Transform a window's global coordinates into view-specific local and SVG coordinates
         * @param {object} win - Window object with {x, sill, width, height}
         * @param {string} viewId - ID of target view (e.g. 'north_facade' or 'kitchen_north_wall')
         * @returns {object} { x, y, width, height, localX_mm, sillSvgY, distAboveCountertop, scale, ... }
         */
        transform: function (win, viewId) {
            const view = resolveView(viewId);
            if (!view) {
                throw new Error(`CoordinateService: Unknown viewId "${viewId}".`);
            }

            const scale = view.scale || 0.1;
            const leftEdge = (view.positionOnMap !== undefined) ? view.positionOnMap : (view.leftEdge || 0);
            const direction = (view.direction || 'west').toLowerCase();

            // Calculate horizontal offset in mm from the left edge of the elevation
            let localX_mm = 0;
            if (direction === 'west' || direction === 'north') {
                // Growing West: Left edge is lower coordinate, increasing X moves to the RIGHT
                localX_mm = win.x - leftEdge;
            } else if (direction === 'east' || direction === 'south') {
                // Decreasing East: Left edge is higher coordinate, increasing X moves to the LEFT.
                // In inverted views, an object's left edge on screen is its West edge: (win.x + win.width).
                localX_mm = leftEdge - (win.x + (win.width || 0));
            }

            const x = localX_mm * scale;
            const width = win.width * scale;
            const height = win.height * scale;

            // Vertical calculations
            const canonicalId = VIEW_ALIASES[viewId] || viewId;
            let y = 0;
            let sillSvgY = 0;
            let distAboveCountertop = 0;

            if (canonicalId === 'kitchen_north_wall') {
                const floorY = view.floorY !== undefined ? view.floorY : 260;
                sillSvgY = floorY - (win.sill * scale);
                y = sillSvgY - (win.height * scale);
                distAboveCountertop = win.sill - 900;
            } else {
                // Exterior elevation (North Facade)
                const floorY = view.floorY !== undefined ? view.floorY : 0;
                y = floorY - ((win.sill + win.height) * scale);
                sillSvgY = floorY - (win.sill * scale);
            }

            return {
                x: x,
                y: y,
                width: width,
                height: height,
                localX_mm: localX_mm,
                sillSvgY: sillSvgY,
                distAboveCountertop: distAboveCountertop,
                scale: scale,
                view: view
            };
        },

        /**
         * Convert a local view displacement back to global coordinates
         * @param {number} localSvgX
         * @param {string} viewId
         * @returns {number} globalX in mm
         */
        toGlobalX: function (localSvgX, viewId, winWidth) {
            const view = resolveView(viewId);
            if (!view) throw new Error(`Unknown view "${viewId}"`);
            const scale = view.scale || 0.1;
            const leftEdge = (view.positionOnMap !== undefined) ? view.positionOnMap : (view.leftEdge || 0);
            const localMm = localSvgX / scale;
            const direction = (view.direction || 'west').toLowerCase();

            if (direction === 'west' || direction === 'north') {
                return leftEdge + localMm;
            } else {
                return leftEdge - localMm - (winWidth || 0);
            }
        }
    };

    return CoordinateService;
}));
