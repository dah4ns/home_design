/**
 * coordinate-service.js
 * Mathematical transformation engine converting 2D Global Building Coordinates (x, y)
 * into local View / SVG coordinate spaces for architectural elevations.
 * 
 * 2D Building Plan Coordinate System:
 * - Origin (0, 0) is the North-East corner of the building.
 * - X-axis: <east - west> (0 mm at East edge, increasing Westward).
 * - Y-axis: <north - south> (0 mm at North edge, increasing Southward).
 * 
 * Directional View Projection Math:
 * - 'west'  (axis 'x'): screen displacement = (win.x - leftEdge). +ΔX shifts RIGHT.
 * - 'east'  (axis 'x'): screen displacement = (leftEdge - (win.x + win.width)). +ΔX shifts LEFT.
 * - 'south' (axis 'y'): screen displacement = (win.y - leftEdge). +ΔY shifts RIGHT.
 * - 'north' (axis 'y'): screen displacement = (leftEdge - (win.y + win.width)). +ΔY shifts LEFT.
 * Version: 2.0.0
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
            origin: { x: 0, y: 0 },
            axis: 'x',
            floor: 'all',
            direction: 'west',
            length: 20505,
            scale: 0.1,
            wall: 'north',
            side: 'exterior',
            floorY: 0
        },
        'kitchen_north_wall': {
            id: 'kitchen_north_wall',
            name: 'Kitchen North Wall Elevation',
            positionOnMap: 11880,
            leftEdge: 11880,
            origin: { x: 11880, y: 0 },
            axis: 'x',
            floor: 'ground',
            direction: 'east',
            length: 5400,
            scale: 0.1,
            wall: 'north',
            side: 'interior',
            floorY: 260,
            countertopY: 170
        },
        'stairs_north_wall': {
            id: 'stairs_north_wall',
            name: 'Stairs North Wall Elevation',
            positionOnMap: 18910,
            leftEdge: 18910,
            origin: { x: 18910, y: 0 },
            axis: 'x',
            floor: 'all',
            direction: 'east',
            length: 9000,
            scale: 0.1,
            wall: 'north',
            side: 'interior',
            floorY: 640
        },
        'south_facade': {
            id: 'south_facade',
            name: 'South Facade Elevation',
            positionOnMap: 21000,
            leftEdge: 21000,
            origin: { x: 21000, y: 21415 },
            axis: 'x',
            floor: 'all',
            direction: 'east',
            length: 21000,
            scale: 0.1,
            wall: 'south',
            side: 'exterior',
            floorY: 0
        },
        'west_facade': {
            id: 'west_facade',
            name: 'West Facade Elevation',
            positionOnMap: 0,
            leftEdge: 0,
            origin: { x: 20590, y: 0 },
            axis: 'y',
            floor: 'all',
            direction: 'south',
            length: 21415,
            scale: 0.1,
            wall: 'west',
            side: 'exterior',
            floorY: 0
        }
    };

    const VIEW_ALIASES = {
        'kitchen_back_wall': 'kitchen_north_wall'
    };

    function inferAxis(direction, explicitAxis) {
        if (explicitAxis === 'x' || explicitAxis === 'y') return explicitAxis;
        const dir = (direction || 'west').toLowerCase();
        return (dir === 'south' || dir === 'north') ? 'y' : 'x';
    }

    function resolveView(viewId) {
        const canonicalId = VIEW_ALIASES[viewId] || viewId;
        if (typeof WindowStore !== 'undefined' && WindowStore && typeof WindowStore.getView === 'function') {
            const storeView = WindowStore.getView(canonicalId);
            if (storeView) {
                // Ensure defaults for rendering parameters and 2D axis
                if (storeView.floorY === undefined) {
                    if (canonicalId === 'kitchen_north_wall') storeView.floorY = 260;
                    else if (canonicalId === 'stairs_north_wall') storeView.floorY = 640;
                    else storeView.floorY = 0;
                }
                if (storeView.countertopY === undefined && canonicalId === 'kitchen_north_wall') {
                    storeView.countertopY = 170;
                }
                if (!storeView.axis) {
                    storeView.axis = inferAxis(storeView.direction);
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
         * Get the primary horizontal plan axis ('x' for East-West walls, 'y' for North-South walls)
         * @param {string} viewId
         * @returns {'x'|'y'}
         */
        getAxis: function (viewId) {
            const view = resolveView(viewId);
            return inferAxis(view ? view.direction : 'west', view ? view.axis : null);
        },

        /**
         * Determine shift behavior when the view's active global coordinate (X or Y) increases:
         * - 'west'  (axis 'x'): +ΔX shifts RIGHT (+1)
         * - 'east'  (axis 'x'): +ΔX shifts LEFT (-1)
         * - 'south' (axis 'y'): +ΔY shifts RIGHT (+1)
         * - 'north' (axis 'y'): +ΔY shifts LEFT (-1)
         * @param {string} viewId
         * @returns {object} { factor: 1 | -1, label: 'RIGHT' | 'LEFT', direction: string, axis: 'x' | 'y' }
         */
        getShiftDirection: function (viewId) {
            const view = resolveView(viewId);
            const dir = (view && view.direction) ? view.direction.toLowerCase() : 'west';
            const axis = inferAxis(dir, view ? view.axis : null);
            if (dir === 'east' || dir === 'north') {
                return {
                    factor: -1,
                    label: 'LEFT',
                    direction: dir,
                    axis: axis
                };
            }
            return {
                factor: 1,
                label: 'RIGHT',
                direction: dir,
                axis: axis
            };
        },

        /**
         * Transform a window's 2D global coordinates (x, y, sill, width, height) into view-specific local and SVG coordinates
         * @param {object} win - Window object with {x, y, sill, width, height}
         * @param {string} viewId - ID of target view (e.g. 'north_facade', 'south_facade', 'west_facade')
         * @returns {object} { x, y, width, height, localX_mm, axis, globalCoord, sillSvgY, distAboveCountertop, scale, ... }
         */
        transform: function (win, viewId) {
            const view = resolveView(viewId);
            if (!view) {
                throw new Error(`CoordinateService: Unknown viewId "${viewId}".`);
            }

            const scale = view.scale || 0.1;
            const leftEdge = (view.positionOnMap !== undefined) ? view.positionOnMap : (view.leftEdge || 0);
            const direction = (view.direction || 'west').toLowerCase();
            const axis = inferAxis(direction, view.axis);

            // Select the active global horizontal coordinate based on the view's axis:
            // - 'x' axis (<east - west>) for North/South walls (direction 'west' or 'east')
            // - 'y' axis (<north - south>) for West/East walls (direction 'south' or 'north')
            const globalCoord = (axis === 'y')
                ? (win.y !== undefined ? Number(win.y) : 0)
                : (win.x !== undefined ? Number(win.x) : 0);

            // Calculate horizontal offset in mm from the left edge of the elevation
            let localX_mm = 0;
            if (direction === 'west' || direction === 'south') {
                // Growing along positive axis (East->West for 'west', North->South for 'south'):
                // Left edge is lower coordinate (0), increasing coordinate moves to the RIGHT.
                localX_mm = globalCoord - leftEdge;
            } else if (direction === 'east' || direction === 'north') {
                // Decreasing along axis (West->East for 'east', South->North for 'north'):
                // Left edge is higher coordinate, increasing coordinate moves to the LEFT.
                // In inverted views, an object's left edge on screen is its far edge: (globalCoord + win.width).
                localX_mm = leftEdge - (globalCoord + (win.width || 0));
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
            } else if (canonicalId === 'stairs_north_wall') {
                const floorY = view.floorY !== undefined ? view.floorY : 640;
                sillSvgY = floorY - (win.sill * scale);
                y = sillSvgY - (win.height * scale);
            } else {
                // Exterior elevations (north_facade, south_facade, west_facade)
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
                axis: axis,
                globalCoord: globalCoord,
                globalX: win.x !== undefined ? Number(win.x) : 0,
                globalY: win.y !== undefined ? Number(win.y) : 0,
                sillSvgY: sillSvgY,
                distAboveCountertop: distAboveCountertop,
                scale: scale,
                view: view
            };
        },

        /**
         * Convert a local view SVG X displacement back to global coordinate (X or Y depending on view axis)
         * @param {number} localSvgX
         * @param {string} viewId
         * @param {number} [winWidth=0]
         * @returns {number} global coordinate in mm along the view's active axis
         */
        toGlobalCoord: function (localSvgX, viewId, winWidth) {
            const view = resolveView(viewId);
            if (!view) throw new Error(`Unknown view "${viewId}"`);
            const scale = view.scale || 0.1;
            const leftEdge = (view.positionOnMap !== undefined) ? view.positionOnMap : (view.leftEdge || 0);
            const localMm = localSvgX / scale;
            const direction = (view.direction || 'west').toLowerCase();

            if (direction === 'west' || direction === 'south') {
                return leftEdge + localMm;
            } else {
                return leftEdge - localMm - (winWidth || 0);
            }
        },

        /**
         * Backward-compatible alias for converting local SVG X to global X (or active axis coordinate)
         */
        toGlobalX: function (localSvgX, viewId, winWidth) {
            return this.toGlobalCoord(localSvgX, viewId, winWidth);
        },

        /**
         * Convert a local view SVG X displacement on a North-South wall ('west_facade' / 'east_facade') to global Y
         */
        toGlobalY: function (localSvgX, viewId, winWidth) {
            return this.toGlobalCoord(localSvgX, viewId, winWidth);
        }
    };

    return CoordinateService;
}));
