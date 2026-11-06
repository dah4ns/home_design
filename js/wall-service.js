/**
 * wall-service.js - Unified 3D B-Rep (outerLoop + holes) & Two-Sided Wall Geometry Engine
 *
 * Coordinate System (Right-Handed 3D Architectural / BIM Convention):
 * - X axis: 1st horizontal axis (East -> West in mm; grows to the right in North view)
 * - Y axis: 2nd horizontal axis (North -> South in mm; matches data/windows.js & data/views.js)
 * - Z axis: Vertical height / elevation axis in mm (Parter = 0..2,800 mm, Piętro = 3,430..6,130 mm)
 *
 * Uses the canonical 3D B-Rep wall definitions in data/walls.js where each wall side has:
 * - normal: [nx, ny, nz] outward unit normal vector (nz = 0 for vertical walls)
 * - outerLoop: connected list of 3D [x, y, z] coordinates (including floor-level doorway notches)
 * - holes: list of 3D [x, y, z] window hole loops { id, kind, loop: [[x, y, z], ...] }
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(
            require('../data/walls.js'),
            require('../data/views.js'),
            require('./window-store.js'),
            require('../data/windows.js'),
            require('../data/stairs.js')
        );
    } else {
        root.WallService = factory(
            root.DEFAULT_WALLS_DATA,
            root.BUILDING_VIEWS_DATA,
            root.WindowStore,
            root.DEFAULT_WINDOWS_DATA,
            root.DEFAULT_STAIRS_DATA || root.BUILDING_STAIRS_DATA
        );
    }
}(typeof self !== 'undefined' ? self : this, function (wallsData, viewsData, WindowStore, windowsData, stairsData) {

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const VIEW_CAMERA_PRESETS = {
        north_facade: {
            viewId: 'north_facade',
            name: 'North Facade Elevation (Elewacja Północna)',
            lookDir: [0, 1, 0],      // Standing in North garden looking South (+Y)
            rightDir: [1, 0, 0],     // East (left, X=0) -> West (right, X=20705)
            upDir: [0, 0, 1],        // Vertical height Z
            uOrigin: 0,
            role: 'exterior',
            svgScale: 0.1            // 10 mm = 1 SVG unit
        },
        south_facade: {
            viewId: 'south_facade',
            name: 'South Facade Elevation (Elewacja Południowa)',
            lookDir: [0, -1, 0],     // Standing in South garden looking North (-Y)
            rightDir: [-1, 0, 0],    // West (left, X=20705) -> East (right, X=-285)
            upDir: [0, 0, 1],
            uOrigin: 20705,
            role: 'exterior',
            svgScale: 0.1
        },
        west_facade: {
            viewId: 'west_facade',
            name: 'West Facade Elevation (Elewacja Zachodnia)',
            lookDir: [-1, 0, 0],     // Standing in West driveway looking East (-X)
            rightDir: [0, 1, 0],     // North (left, Y=0) -> South (right, Y=21130)
            upDir: [0, 0, 1],
            uOrigin: 0,
            role: 'exterior',
            svgScale: 0.1
        },
        east_facade: {
            viewId: 'east_facade',
            name: 'East Facade Elevation (Elewacja Wschodnia)',
            lookDir: [1, 0, 0],      // Standing in East garden looking West (+X)
            rightDir: [0, -1, 0],    // South (left, Y=21125) -> North (right, Y=-290)
            upDir: [0, 0, 1],
            uOrigin: 21125,
            role: 'exterior',
            svgScale: 0.1
        }
    };

    function dot3(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function computeSideMetrics(p1, p2, explicitNormal) {
        const x1 = Number(p1[0]) || 0;
        const y1 = Number(p1[1]) || 0;
        const x2 = Number(p2[0]) || 0;
        const y2 = Number(p2[1]) || 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthMm = Math.hypot(dx, dy);
        if (lengthMm < 1e-6) {
            return {
                p1: [x1, y1],
                p2: [x2, y2],
                lengthMm: 0,
                tangent: [1, 0, 0],
                normal: Array.isArray(explicitNormal) ? explicitNormal.slice() : [0, -1, 0],
                midpoint2D: [x1, y1]
            };
        }
        const tx = dx / lengthMm;
        const ty = dy / lengthMm;
        const nx = dy / lengthMm;
        const ny = -dx / lengthMm;
        return {
            p1: [x1, y1],
            p2: [x2, y2],
            lengthMm: Math.round(lengthMm * 100) / 100,
            tangent: [
                Math.abs(tx) < 1e-9 ? 0 : Math.round(tx * 1e6) / 1e6,
                Math.abs(ty) < 1e-9 ? 0 : Math.round(ty * 1e6) / 1e6,
                0
            ],
            normal: Array.isArray(explicitNormal)
                ? explicitNormal.slice()
                : [
                    Math.abs(nx) < 1e-9 ? 0 : Math.round(nx * 1e6) / 1e6,
                    Math.abs(ny) < 1e-9 ? 0 : Math.round(ny * 1e6) / 1e6,
                    0
                ],
            midpoint2D: [(x1 + x2) / 2, (y1 + y2) / 2]
        };
    }

    /**
     * Intersect a 3D vertical face's outerLoop ([[x, y, z], ...]) and holes ([{ loop: [[x, y, z], ...] }])
     * with a horizontal plane Z = zSlice (where Z is vertical height).
     *
     * Uses 1D scanline intersection along the wall's horizontal coordinate axis ('x' or 'y'):
     * every vertical or sloped edge of outerLoop and every hole loop that crosses Z = zSlice
     * yields an intersection point. Sorting these points in pairs [c0, c1], [c2, c3], ...
     * produces the exact solid wall intervals at height Z = zSlice.
     */
    function sliceFace3DAtElevation(outerLoop, holes, axis, zSlice) {
        const coordIdx = (axis === 'x') ? 0 : 1;
        const crossings = [];

        function collectLoopCrossings(loop) {
            if (!Array.isArray(loop) || loop.length < 3) return;
            const n = loop.length;
            for (let i = 0; i < n; i++) {
                const v1 = loop[i];
                const v2 = loop[(i + 1) % n];
                const z1 = Number(v1[2]);
                const z2 = Number(v2[2]);
                // Half-open interval [minZ, maxZ) avoids double-counting horizontal vertices
                if ((z1 <= zSlice && z2 > zSlice) || (z2 <= zSlice && z1 > zSlice)) {
                    const t = (zSlice - z1) / (z2 - z1);
                    const c = Number(v1[coordIdx]) + t * (Number(v2[coordIdx]) - Number(v1[coordIdx]));
                    crossings.push(c);
                }
            }
        }

        collectLoopCrossings(outerLoop);
        if (Array.isArray(holes)) {
            holes.forEach(h => {
                const loop = Array.isArray(h) ? h : (h && h.loop);
                collectLoopCrossings(loop);
            });
        }

        crossings.sort((a, b) => a - b);

        const solidIntervals = [];
        for (let i = 0; i + 1 < crossings.length; i += 2) {
            const start = Math.round(crossings[i] * 10) / 10;
            const end = Math.round(crossings[i + 1] * 10) / 10;
            if (end - start > 1) {
                solidIntervals.push([start, end]);
            }
        }

        // Complement intervals within the overall span are the cut openings (doors/windows) at Z = zSlice
        const cutOpenings = [];
        for (let i = 0; i + 1 < solidIntervals.length; i++) {
            const gapStart = solidIntervals[i][1];
            const gapEnd = solidIntervals[i + 1][0];
            if (gapEnd - gapStart > 1) {
                cutOpenings.push({ start: gapStart, end: gapEnd, widthMm: gapEnd - gapStart });
            }
        }

        return {
            zSlice,
            ySlice: zSlice, // backward-compatible alias
            solidIntervals,
            cutOpenings
        };
    }

    /**
     * Resolve live opening data from WindowStore (for exterior windows/doors)
     * and interior doors defined on the wall, synchronizing any runtime WindowStore
     * edits with the wall's 3D holes/outerLoop.
     */
    function resolveWallOpenings(rawWall) {
        const zBottom = Number(rawWall.zBottom !== undefined ? rawWall.zBottom : rawWall.yBottom) || 0;
        const zTop = Number(rawWall.zTop !== undefined ? rawWall.zTop : rawWall.yTop) || 2800;
        const sideA = rawWall.sides && rawWall.sides[0];
        const mA = sideA ? computeSideMetrics(sideA.p1, sideA.p2, sideA.normal) : null;
        const isHoriz = mA ? (Math.abs(mA.tangent[0]) >= Math.abs(mA.tangent[1])) : (rawWall.axis === 'x');

        const resolved = [];

        if (Array.isArray(rawWall.openings) && WindowStore && typeof WindowStore.get === 'function') {
            rawWall.openings.forEach(opId => {
                const win = WindowStore.get(opId);
                if (!win) return;

                const isInactiveOption = Array.isArray(win.views) && win.views.length === 0;
                const widthMm = Math.max(0, Number(win.width) || 0);
                const heightMm = Math.max(0, Number(win.height) || 0);
                const rawSill = Number(win.sill) || 0;
                const zMin = (rawWall.floor === 'first' && rawSill < zBottom)
                    ? (zBottom + rawSill)
                    : rawSill;
                const zMax = Math.min(zTop, zMin + heightMm);
                const sillRelativeMm = Math.max(0, zMin - zBottom);

                const rawCoordStart = isHoriz ? (Number(win.x) || 0) : (Number(win.y) || 0);
                // South facade window X coordinates in data/windows.js are measured from the East outer face (X = -285 mm)
                const coordStart = (isHoriz && win.wall === 'south') ? (rawCoordStart - 285) : rawCoordStart;
                const coordEnd = coordStart + widthMm;

                const fixedY = sideA ? sideA.p1[1] : 0;
                const fixedX = sideA ? sideA.p1[0] : 0;
                const holeLoop3D = isHoriz
                    ? [
                        [coordStart, fixedY, zMin],
                        [coordEnd, fixedY, zMin],
                        [coordEnd, fixedY, zMax],
                        [coordStart, fixedY, zMax]
                    ]
                    : [
                        [fixedX, coordStart, zMin],
                        [fixedX, coordEnd, zMin],
                        [fixedX, coordEnd, zMax],
                        [fixedX, coordStart, zMax]
                    ];

                resolved.push({
                    id: win.id,
                    name: win.name || win.id,
                    kind: win.openingType || 'window',
                    active: !isInactiveOption,
                    axis: isHoriz ? 'x' : 'y',
                    start: coordStart,
                    end: coordEnd,
                    widthMm,
                    heightMm,
                    sillMm: sillRelativeMm,
                    zMin,
                    zMax,
                    yMin: zMin,
                    yMax: zMax,
                    reachesFloor: zMin <= zBottom + 5,
                    reachesCeiling: zMax >= zTop - 5,
                    jambDepthMm: Number(win.jambDepth) || 200,
                    jambs: Array.isArray(win.jambs) ? win.jambs.slice() : [],
                    holeLoop3D
                });
            });
        }

        if (Array.isArray(rawWall.doors)) {
            rawWall.doors.forEach((d, idx) => {
                const start = Number(d.start) || 0;
                const end = Number(d.end) || 0;
                const widthMm = Math.abs(end - start);
                const sillRelativeMm = Number(d.sillMm) || 0;
                const heightMm = Number(d.heightMm) || 2050;
                const zMin = zBottom + sillRelativeMm;
                const zMax = Math.min(zTop, zMin + heightMm);

                const fixedY = sideA ? sideA.p1[1] : (rawWall.y1 !== undefined ? rawWall.y1 : (rawWall.z1 || 0));
                const fixedX = sideA ? sideA.p1[0] : (rawWall.x1 || 0);
                const holeLoop3D = isHoriz
                    ? [
                        [start, fixedY, zMin],
                        [end, fixedY, zMin],
                        [end, fixedY, zMax],
                        [start, fixedY, zMax]
                    ]
                    : [
                        [fixedX, start, zMin],
                        [fixedX, end, zMin],
                        [fixedX, end, zMax],
                        [fixedX, start, zMax]
                    ];

                resolved.push({
                    id: d.id || `${rawWall.id}_DOOR_${idx + 1}`,
                    name: d.id || `Door ${idx + 1}`,
                    kind: 'interior_door',
                    active: true,
                    axis: isHoriz ? 'x' : 'y',
                    start: Math.min(start, end),
                    end: Math.max(start, end),
                    widthMm,
                    heightMm,
                    sillMm: sillRelativeMm,
                    zMin,
                    zMax,
                    yMin: zMin,
                    yMax: zMax,
                    reachesFloor: zMin <= zBottom + 5,
                    reachesCeiling: zMax >= zTop - 5,
                    swingDir: d.swingDir || 1,
                    hingeStart: Boolean(d.hingeStart),
                    holeLoop3D
                });
            });
        }

        return resolved;
    }

    /**
     * Compile a canonical wall definition from data/walls.js into a full 3D B-Rep Wall object,
     * preserving the explicit 3D outerLoop (with doorway notches) and synchronizing 3D window
     * hole loops with live WindowStore values.
     */
    function compileWall(rawWall) {
        const zBottom = Number(rawWall.zBottom !== undefined ? rawWall.zBottom : rawWall.yBottom) || 0;
        const zTop = Number(rawWall.zTop !== undefined ? rawWall.zTop : rawWall.yTop) || 2800;
        const heightMm = zTop - zBottom;
        const rawSides = Array.isArray(rawWall.sides) ? rawWall.sides : [];

        const resolvedOpenings = resolveWallOpenings(rawWall);
        const activeOpeningsById = {};
        resolvedOpenings.forEach(op => {
            if (op.active) activeOpeningsById[op.id] = op;
        });

        const compiledSides = rawSides.map((s, idx) => {
            const metrics = computeSideMetrics(s.p1, s.p2, s.normal);
            const [x1, y1] = metrics.p1;
            const [x2, y2] = metrics.p2;

            // Use the explicit 3D outerLoop from data/walls.js (which includes 3D doorway notches)
            const outerLoop3D = Array.isArray(s.outerLoop)
                ? s.outerLoop.map(pt => [Number(pt[0]), Number(pt[1]), Number(pt[2])])
                : [
                    [x1, y1, zBottom],
                    [x2, y2, zBottom],
                    [x2, y2, zTop],
                    [x1, y1, zTop]
                ];

            // Synchronize explicit 3D holes from data/walls.js with live WindowStore coordinates
            let holes3D = [];
            if (Array.isArray(s.holes) && s.holes.length > 0) {
                s.holes.forEach(rawHole => {
                    const liveOp = activeOpeningsById[rawHole.id];
                    if (liveOp) {
                        const sideY = s.p1 ? Number(s.p1[1]) : 0;
                        const sideX = s.p1 ? Number(s.p1[0]) : 0;
                        const isHoriz = Math.abs(metrics.tangent[0]) >= Math.abs(metrics.tangent[1]);
                        const sideHoleLoop = isHoriz
                            ? [
                                [liveOp.start, sideY, liveOp.zMin],
                                [liveOp.end, sideY, liveOp.zMin],
                                [liveOp.end, sideY, liveOp.zMax],
                                [liveOp.start, sideY, liveOp.zMax]
                            ]
                            : [
                                [sideX, liveOp.start, liveOp.zMin],
                                [sideX, liveOp.end, liveOp.zMin],
                                [sideX, liveOp.end, liveOp.zMax],
                                [sideX, liveOp.start, liveOp.zMax]
                            ];
                        holes3D.push({
                            id: liveOp.id,
                            name: liveOp.name,
                            kind: rawHole.kind || liveOp.kind,
                            start: liveOp.start,
                            end: liveOp.end,
                            widthMm: liveOp.widthMm,
                            heightMm: liveOp.heightMm,
                            sillMm: liveOp.sillMm,
                            zMin: liveOp.zMin,
                            zMax: liveOp.zMax,
                            yMin: liveOp.zMin,
                            yMax: liveOp.zMax,
                            loop: sideHoleLoop,
                            loop3D: sideHoleLoop
                        });
                    } else if (!WindowStore || !WindowStore.get(rawHole.id)) {
                        const loop = Array.isArray(rawHole.loop)
                            ? rawHole.loop.map(pt => [Number(pt[0]), Number(pt[1]), Number(pt[2])])
                            : [];
                        holes3D.push({
                            id: rawHole.id,
                            name: rawHole.id,
                            kind: rawHole.kind || 'window',
                            loop,
                            loop3D: loop
                        });
                    }
                });

                // If Master Bedroom option swapped O15 <-> O11_1 on UW_NORTH_MAIN, include active O11_1
                if (rawWall.id === 'UW_NORTH_MAIN' && activeOpeningsById['O11_1'] && !holes3D.some(h => h.id === 'O11_1')) {
                    const op11 = activeOpeningsById['O11_1'];
                    const sideY = s.p1 ? Number(s.p1[1]) : 0;
                    const sideHoleLoop = [
                        [op11.start, sideY, op11.zMin],
                        [op11.end, sideY, op11.zMin],
                        [op11.end, sideY, op11.zMax],
                        [op11.start, sideY, op11.zMax]
                    ];
                    holes3D.push({
                        id: op11.id,
                        name: op11.name,
                        kind: op11.kind,
                        start: op11.start,
                        end: op11.end,
                        widthMm: op11.widthMm,
                        heightMm: op11.heightMm,
                        sillMm: op11.sillMm,
                        zMin: op11.zMin,
                        zMax: op11.zMax,
                        yMin: op11.zMin,
                        yMax: op11.zMax,
                        loop: sideHoleLoop,
                        loop3D: sideHoleLoop
                    });
                }
            }

            return {
                id: s.id || `${rawWall.id}_SIDE_${idx}`,
                wallId: rawWall.id,
                wallName: rawWall.name,
                floor: rawWall.floor,
                category: rawWall.category,
                role: s.role || 'interior',
                material: s.material || 'plaster_white',
                materialLabel: s.materialLabel || s.material || 'Plaster',
                p1: metrics.p1,
                p2: metrics.p2,
                lengthMm: metrics.lengthMm,
                tangent: metrics.tangent,
                normal: metrics.normal,
                midpoint2D: metrics.midpoint2D,
                zBottom,
                zTop,
                yBottom: zBottom,
                yTop: zTop,
                heightMm,
                outerLoop: outerLoop3D,
                outerLoop3D,
                holes: holes3D,
                holes3D
            };
        });

        const sideA = compiledSides[0];
        const sideB = compiledSides[1];

        // Compute geometric perpendicular distance between sideA and sideB along sideA.normal
        let geomThicknessMm = 120;
        if (sideA && sideB) {
            const dxAB = sideA.p1[0] - sideB.p1[0];
            const dyAB = sideA.p1[1] - sideB.p1[1];
            geomThicknessMm = Math.round(Math.abs(dxAB * sideA.normal[0] + dyAB * sideA.normal[1]));
        }

        const hasExplicitThickness = rawWall.thickness !== undefined && rawWall.thickness !== null && Number.isFinite(Number(rawWall.thickness));
        const targetThicknessMm = hasExplicitThickness ? Number(rawWall.thickness) : geomThicknessMm;

        // If rawWall.thickness was explicitly edited and differs from the distance between sideA and sideB,
        // shift the movable side so that the 3D B-Rep geometry matches rawWall.thickness.
        // For exterior walls, never move sideA (exterior face); move sideB (interior face) instead.
        if (sideA && sideB && hasExplicitThickness && Math.abs(targetThicknessMm - geomThicknessMm) > 0.5) {
            const deltaMm = targetThicknessMm - geomThicknessMm;
            const moveInterior = rawWall.category === 'exterior';
            const targetSide = moveInterior ? sideB : sideA;
            const dirSign = moveInterior ? -1 : 1;
            const shiftX = Math.round(deltaMm * sideA.normal[0] * dirSign * 100) / 100;
            const shiftY = Math.round(deltaMm * sideA.normal[1] * dirSign * 100) / 100;

            targetSide.p1 = [targetSide.p1[0] + shiftX, targetSide.p1[1] + shiftY];
            targetSide.p2 = [targetSide.p2[0] + shiftX, targetSide.p2[1] + shiftY];
            targetSide.midpoint2D = [
                (targetSide.p1[0] + targetSide.p2[0]) / 2,
                (targetSide.p1[1] + targetSide.p2[1]) / 2
            ];
            targetSide.outerLoop = targetSide.outerLoop.map(pt => [pt[0] + shiftX, pt[1] + shiftY, pt[2]]);
            targetSide.outerLoop3D = targetSide.outerLoop;
            targetSide.holes = targetSide.holes.map(h => {
                const shiftedLoop = (h.loop || []).map(pt => [pt[0] + shiftX, pt[1] + shiftY, pt[2]]);
                return Object.assign({}, h, { loop: shiftedLoop, loop3D: shiftedLoop });
            });
            targetSide.holes3D = targetSide.holes;
        }

        const footprint2D = (sideA && sideB)
            ? [sideA.p1, sideA.p2, sideB.p1, sideB.p2]
            : [];

        const allX = footprint2D.map(pt => pt[0]);
        const allY = footprint2D.map(pt => pt[1]);
        const minX = allX.length ? Math.min(...allX) : (rawWall.x1 || 0);
        const maxX = allX.length ? Math.max(...allX) : (rawWall.x2 || 0);
        const minY = allY.length ? Math.min(...allY) : (rawWall.y1 !== undefined ? rawWall.y1 : (rawWall.z1 || 0));
        const maxY = allY.length ? Math.max(...allY) : (rawWall.y2 !== undefined ? rawWall.y2 : (rawWall.z2 || 0));

        const rawAxis = rawWall.axis === 'z' ? 'y' : rawWall.axis;
        const axis = rawAxis || ((maxX - minX >= maxY - minY) ? 'x' : 'y');

        return {
            id: rawWall.id,
            name: rawWall.name,
            floor: rawWall.floor,
            category: rawWall.category,
            axis,
            x1: minX,
            y1: minY,
            x2: maxX,
            y2: maxY,
            z1: minY, // backward-compatible alias for 2D floor plan consumers
            z2: maxY, // backward-compatible alias for 2D floor plan consumers
            thickness: targetThicknessMm,
            geometricThicknessMm: geomThicknessMm,
            zBottom,
            zTop,
            yBottom: zBottom, // backward-compatible alias
            yTop: zTop,       // backward-compatible alias
            heightMm,
            rooms: rawWall.rooms || '',
            specs: rawWall.specs || '',
            sides: compiledSides,
            sideA,
            sideB,
            footprint2D,
            openings: resolvedOpenings,
            doors: Array.isArray(rawWall.doors) ? rawWall.doors : []
        };
    }

    /**
     * Intersect two 2D infinite lines (defined by p1->p2) to keep adjacent exterior
     * wall miter corners watertight when a wall's thickness is modified.
     */
    function intersect2DLines(a1, a2, b1, b2) {
        const x1 = a1[0], y1 = a1[1], x2 = a2[0], y2 = a2[1];
        const x3 = b1[0], y3 = b1[1], x4 = b2[0], y4 = b2[1];
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-6) return null;
        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
        return [Math.round(px * 100) / 100, Math.round(py * 100) / 100];
    }

    function updateSideEndpoint(side, whichEnd, newPt) {
        const oldPt = side[whichEnd];
        if (!oldPt) return;
        const dx = newPt[0] - oldPt[0];
        const dy = newPt[1] - oldPt[1];
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

        side[whichEnd] = [newPt[0], newPt[1]];
        side.lengthMm = Math.hypot(side.p2[0] - side.p1[0], side.p2[1] - side.p1[1]);
        side.midpoint2D = [(side.p1[0] + side.p2[0]) / 2, (side.p1[1] + side.p2[1]) / 2];
        side.outerLoop = side.outerLoop.map(pt => {
            if (Math.abs(pt[0] - oldPt[0]) < 1 && Math.abs(pt[1] - oldPt[1]) < 1) {
                return [newPt[0], newPt[1], pt[2]];
            }
            return pt;
        });
        side.outerLoop3D = side.outerLoop;
    }

    function reconcileMiterCornersForFloor(compiledWalls) {
        const extWalls = compiledWalls.filter(w => w.category === 'exterior' && w.sideA && w.sideB);
        if (extWalls.length < 2) return compiledWalls;

        for (let i = 0; i < extWalls.length; i++) {
            const curr = extWalls[i];
            const next = extWalls[(i + 1) % extWalls.length];
            const cornerA = intersect2DLines(curr.sideA.p1, curr.sideA.p2, next.sideA.p1, next.sideA.p2);
            if (cornerA) {
                updateSideEndpoint(curr.sideA, 'p2', cornerA);
                updateSideEndpoint(next.sideA, 'p1', cornerA);
            }
        }

        extWalls.forEach(w => {
            w.footprint2D = [w.sideA.p1, w.sideA.p2, w.sideB.p1, w.sideB.p2];
            const allX = w.footprint2D.map(pt => pt[0]);
            const allY = w.footprint2D.map(pt => pt[1]);
            w.x1 = Math.min(...allX);
            w.x2 = Math.max(...allX);
            w.y1 = Math.min(...allY);
            w.y2 = Math.max(...allY);
            w.z1 = w.y1;
            w.z2 = w.y2;
        });

        return compiledWalls;
    }

    /**
     * Build an SVG path string "M x0 y0 L x1 y1 ... Z M hx0 hy0 ... Z" from a projected
     * 3D outerLoop and array of 3D hole loops in SVG elevation coordinates.
     */
    function buildElevationSvgPathFromLoops(outerLoop3D, holes3D, rightDir, scale, xShiftMm) {
        function loopToSubpath(loop3D) {
            if (!Array.isArray(loop3D) || loop3D.length < 3) return '';
            const pts = loop3D.map(pt => {
                const uMm = dot3([pt[0], pt[1], 0], rightDir) + (xShiftMm || 0);
                const sx = Math.round(uMm * scale * 100) / 100;
                const sy = Math.round(-pt[2] * scale * 100) / 100;
                return `${sx},${sy}`;
            });
            return `M ${pts.join(' L ')} Z`;
        }

        const parts = [loopToSubpath(outerLoop3D)];
        if (Array.isArray(holes3D)) {
            holes3D.forEach(h => {
                const sub = loopToSubpath(h.loop || h.loop3D);
                if (sub) parts.push(sub);
            });
        }
        return parts.filter(Boolean).join(' ');
    }

    const WallService = {
        getWalls: function (filter) {
            const rawList = (wallsData && Array.isArray(wallsData.walls)) ? wallsData.walls : [];
            const floors = ['ground', 'first'];
            let allCompiled = [];
            floors.forEach(fl => {
                const floorWalls = rawList.filter(w => w.floor === fl).map(compileWall);
                reconcileMiterCornersForFloor(floorWalls);
                allCompiled = allCompiled.concat(floorWalls);
            });

            if (filter && filter.floor) {
                allCompiled = allCompiled.filter(w => w.floor === filter.floor);
            }
            if (filter && filter.category) {
                allCompiled = allCompiled.filter(w => w.category === filter.category);
            }
            return allCompiled;
        },

        getWallById: function (wallId) {
            const all = this.getWalls();
            return all.find(w => w.id === wallId) || null;
        },

        /**
         * Slice all walls on a floor with the horizontal plane Z = floorDatumZ + cutHeightMm
         * (default cutHeightMm = 1,200 mm).
         *
         * For every wall, we intersect its 3D outerLoop (which notches over doors) and 3D holes
         * (windows) with the horizontal plane Z = zSlice, producing:
         * - solidPolygons2D: exact 2D [x, y] polygons of the solid wall segments at Z = zSlice
         * - cutOpeningsAtSlice: exact doorway/window gaps cut out of the wall at Z = zSlice
         */
        getFloorPlanSlice: function (floor, cutHeightMm = 1200) {
            const floorDatumZ = (floor === 'first') ? 3430 : 0;
            const zSlice = floorDatumZ + cutHeightMm;

            function sliceWall(w) {
                const slicedOpenings = w.openings.filter(op => op.active && op.zMin <= zSlice && op.zMax >= zSlice);
                const scan = w.sideA
                    ? sliceFace3DAtElevation(w.sideA.outerLoop3D, w.sideA.holes3D, w.axis, zSlice)
                    : { solidIntervals: [], cutOpenings: [] };

                // Build exact 2D [x, y] polygons for each solid interval along walls
                const solidPolygons2D = scan.solidIntervals.map(([cStart, cEnd]) => {
                    if (w.axis === 'y' || w.axis === 'z') {
                        return [[w.x1, cStart], [w.x2, cStart], [w.x2, cEnd], [w.x1, cEnd]];
                    }
                    return [[cStart, w.y1], [cEnd, w.y1], [cEnd, w.y2], [cStart, w.y2]];
                });

                return Object.assign({}, w, {
                    zSlice,
                    ySlice: zSlice,
                    slicedOpenings,
                    solidIntervalsAtSlice: scan.solidIntervals,
                    cutOpeningsAtSlice: scan.cutOpenings,
                    solidPolygons2D
                });
            }

            const exteriorWalls = this.getWalls({ floor, category: 'exterior' }).map(sliceWall);
            const internalWalls = this.getWalls({ floor, category: 'internal' }).map(sliceWall);

            const outerPolygon2D = exteriorWalls.map(w => w.sideA.p1);
            const innerPolygon2D = exteriorWalls.map(w => w.sideB.p2);

            return {
                floor,
                floorDatumZ,
                floorDatumY: floorDatumZ,
                cutHeightMm,
                zSlice,
                ySlice: zSlice,
                exteriorWalls,
                internalWalls,
                outerPolygon2D,
                innerPolygon2D
            };
        },

        /**
         * Project all visible 3D wall faces onto an elevation view using:
         * 1. Back-face culling: dot(side.normal, view.lookDir) < 0
         * 2. Direct 3D orthographic vertex projection of side.outerLoop3D + side.holes3D
         *    onto (u, z) where u = dot([x, y, 0], rightDir) and v = -z
         * 3. Front-to-back 3D occlusion culling: faces completely hidden behind closer
         *    foreground walls (smaller depthMm along lookDir) are culled geometrically
         * 4. Back-to-front painter's order sorting (depthMm descending)
         */
        getVisibleFacesForView: function (viewIdOrConfig) {
            const preset = (typeof viewIdOrConfig === 'string')
                ? (VIEW_CAMERA_PRESETS[viewIdOrConfig] || VIEW_CAMERA_PRESETS.north_facade)
                : Object.assign({}, VIEW_CAMERA_PRESETS.north_facade, viewIdOrConfig || {});

            const lookDir = preset.lookDir || [0, 1, 0];
            const rightDir = preset.rightDir || [1, 0, 0];
            const roleFilter = preset.role || 'exterior';
            const scale = preset.svgScale || 0.1;

            const DEFAULT_SVG_GROUP_BY_WALL_ID = {
                EW_NORTH_RECESSED: 'ground-recessed-facade',
                EW_GARAGE_NORTH: 'ground-garage-volume',
                UW_TERRACE_BACK: 'upper-terrace',
                UW_NORTH_MAIN: 'upper-timber-facade'
            };

            const allWalls = this.getWalls();
            const candidateFaces = [];

            allWalls.forEach(wall => {
                wall.sides.forEach(side => {
                    if (roleFilter && side.role !== roleFilter) return;

                    const facingCos = dot3(side.normal, lookDir);
                    if (facingCos >= -1e-3) return;

                    if (!Array.isArray(side.outerLoop3D) || side.outerLoop3D.length < 3) return;

                    // Project actual 3D vertices of outerLoop3D onto (u, z) and camera depth along lookDir
                    const uCoords = side.outerLoop3D.map(pt => dot3([pt[0], pt[1], 0], rightDir));
                    const zCoords = side.outerLoop3D.map(pt => Number(pt[2]) || 0);
                    const depthCoords = side.outerLoop3D.map(pt => dot3(pt, lookDir));

                    const xMinMm = Math.min(...uCoords);
                    const xMaxMm = Math.max(...uCoords);
                    const zMinMm = Math.min(...zCoords);
                    const zMaxMm = Math.max(...zCoords);
                    const lengthMm = Math.round(xMaxMm - xMinMm);
                    const heightMm = Math.round(zMaxMm - zMinMm);
                    if (lengthMm <= 0 || heightMm <= 0) return;

                    const depthMm = Math.round((depthCoords.reduce((acc, d) => acc + d, 0) / depthCoords.length) * 100) / 100;

                    const svgX = Math.round(xMinMm * scale * 100) / 100;
                    const svgY = Math.round(-zMaxMm * scale * 100) / 100;
                    const svgWidth = Math.round(lengthMm * scale * 100) / 100;
                    const svgHeight = Math.round(heightMm * scale * 100) / 100;

                    // Project 3D outerLoop3D + 3D holes3D directly into SVG path (no facadeBounds overrides)
                    const svgPathD = buildElevationSvgPathFromLoops(
                        side.outerLoop3D,
                        side.holes3D,
                        rightDir,
                        scale,
                        0
                    );

                    // Compute any 3D corner jamb returns exposed by corner window notches on this wall
                    const jambReturns = [];
                    const p1u = dot3([side.p1[0], side.p1[1], 0], rightDir);
                    const p2u = dot3([side.p2[0], side.p2[1], 0], rightDir);
                    const wallSpanMaxU = Math.max(p1u, p2u);
                    const fixedY = side.p1[1];
                    const fixedX = side.p1[0];
                    const isHoriz = Math.abs(rightDir[0]) >= Math.abs(rightDir[1]);

                    if (Array.isArray(wall.openings)) {
                        wall.openings.forEach(op => {
                            if (!op.active) return;
                            // If a corner window ends inside the wall's 3D corner notch, the remaining strip
                            // [op.end .. wallSpanMaxU] at [op.zMin .. op.zMax] is the perpendicular wall's exterior jamb return
                            if (op.end < wallSpanMaxU - 1 && op.end >= xMaxMm - 400 && op.zMin > zMinMm && op.zMax <= zMaxMm) {
                                const jStart = op.end;
                                const jEnd = wallSpanMaxU;
                                const returnLoop3D = isHoriz
                                    ? [
                                        [jStart, fixedY, op.zMin],
                                        [jEnd, fixedY, op.zMin],
                                        [jEnd, fixedY, op.zMax],
                                        [jStart, fixedY, op.zMax]
                                    ]
                                    : [
                                        [fixedX, jStart, op.zMin],
                                        [fixedX, jEnd, op.zMin],
                                        [fixedX, jEnd, op.zMax],
                                        [fixedX, jStart, op.zMax]
                                    ];
                                jambReturns.push({
                                    openingId: op.id,
                                    uMinMm: jStart,
                                    uMaxMm: jEnd,
                                    widthMm: Math.round(jEnd - jStart),
                                    zMinMm: op.zMin,
                                    zMaxMm: op.zMax,
                                    heightMm: Math.round(op.zMax - op.zMin),
                                    loop3D: returnLoop3D,
                                    svgPathD: buildElevationSvgPathFromLoops(returnLoop3D, [], rightDir, scale, 0)
                                });
                            }
                        });
                    }

                    candidateFaces.push({
                        wallId: wall.id,
                        wallName: wall.name,
                        sideId: side.id,
                        floor: wall.floor,
                        role: side.role,
                        material: side.material,
                        materialLabel: side.materialLabel,
                        normal: side.normal,
                        facingCos,
                        depthMm,
                        p1: side.p1,
                        p2: side.p2,
                        zBottom: zMinMm,
                        zTop: zMaxMm,
                        yBottom: zMinMm,
                        yTop: zMaxMm,
                        heightMm,
                        xMinMm,
                        xMaxMm,
                        lengthMm,
                        svgGroupId: (preset.viewId === 'north_facade' && DEFAULT_SVG_GROUP_BY_WALL_ID[wall.id]) || null,
                        svgRect: {
                            x: svgX,
                            y: svgY,
                            width: svgWidth,
                            height: svgHeight
                        },
                        svgPathD,
                        jambReturns,
                        outerLoop: side.outerLoop3D,
                        outerLoop3D: side.outerLoop3D,
                        holes: side.holes3D,
                        holes3D: side.holes3D,
                        rooms: wall.rooms,
                        specs: wall.specs
                    });
                });
            });

            // Sort front-to-back (smallest depthMm along lookDir is closest to viewer) for 3D occlusion culling
            candidateFaces.sort((a, b) => {
                if (Math.abs(a.depthMm - b.depthMm) > 1) {
                    return a.depthMm - b.depthMm;
                }
                return a.xMinMm - b.xMinMm;
            });

            function isOccludedByFrontFaces(cand, frontFaces) {
                const blockers = frontFaces.filter(f =>
                    f.depthMm < cand.depthMm - 1 &&
                    f.zBottom <= cand.zBottom + 1 &&
                    f.zTop >= cand.zTop - 1 &&
                    f.xMaxMm > cand.xMinMm &&
                    f.xMinMm < cand.xMaxMm
                );
                if (blockers.length === 0) return false;

                const intervals = blockers
                    .map(f => [Math.max(cand.xMinMm, f.xMinMm), Math.min(cand.xMaxMm, f.xMaxMm)])
                    .sort((a, b) => a[0] - b[0]);

                let coveredUntil = cand.xMinMm;
                for (let i = 0; i < intervals.length; i++) {
                    const [start, end] = intervals[i];
                    if (start > coveredUntil + 1) {
                        return false;
                    }
                    coveredUntil = Math.max(coveredUntil, end);
                    if (coveredUntil >= cand.xMaxMm - 1) {
                        return true;
                    }
                }
                return coveredUntil >= cand.xMaxMm - 1;
            }

            const visibleFaces = [];
            candidateFaces.forEach(cand => {
                if (!isOccludedByFrontFaces(cand, visibleFaces)) {
                    visibleFaces.push(cand);
                }
            });

            // Sort back-to-front (largest depthMm first) for SVG painter's rendering order
            visibleFaces.sort((a, b) => {
                if (Math.abs(b.depthMm - a.depthMm) > 1) {
                    return b.depthMm - a.depthMm;
                }
                return a.xMinMm - b.xMinMm;
            });

            return visibleFaces;
        },

        computeFacadeWallSpecs: function (viewId) {
            const faces = this.getVisibleFacesForView(viewId);
            const lowerFaces = faces.filter(f => f.floor === 'ground');
            const upperFaces = faces.filter(f => f.floor === 'first');

            const lowerLengthMm = lowerFaces.reduce((sum, f) => sum + f.lengthMm, 0);
            const upperSolidSpanMm = upperFaces.reduce((sum, f) => sum + f.lengthMm, 0);

            const lowerBottomMm = lowerFaces.length ? Math.min(...lowerFaces.map(f => f.zBottom)) : 0;
            const lowerTopMm = lowerFaces.length ? Math.max(...lowerFaces.map(f => f.zTop)) : 2800;
            const upperBottomMm = upperFaces.length ? Math.min(...upperFaces.map(f => f.zBottom)) : 3430;
            const upperTopMm = upperFaces.length ? Math.max(...upperFaces.map(f => f.zTop)) : 6130;

            return {
                viewId,
                lowerFaces,
                upperFaces,
                lowerLengthMm,
                lowerBottomMm,
                lowerTopMm,
                lowerBreakdown: lowerFaces.map(f => `${f.lengthMm.toLocaleString()} mm (${f.wallId})`).join(' + '),
                upperLengthMm: upperSolidSpanMm,
                upperBottomMm,
                upperTopMm,
                upperBreakdown: upperFaces.map(f => `${f.lengthMm.toLocaleString()} mm (${f.wallId})`).join(' + ')
            };
        },

        /**
         * Synchronize North Facade SVG wall bodies using true 2D orthographic projection
         * of the 3D B-Rep outerLoop + holes (<path fill-rule="evenodd" d="M ... Z M ... Z">)
         * and 3D corner jamb returns.
         */
        syncNorthFacadeSVG: function (doc) {
            const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
            const faces = this.getVisibleFacesForView('north_facade');
            const specs = this.computeFacadeWallSpecs('north_facade');

            if (!targetDoc) return { faces, specs };

            faces.forEach(face => {
                const groupEl = targetDoc.querySelector(`[data-wall-id="${face.wallId}"]`)
                    || (face.svgGroupId ? targetDoc.getElementById(face.svgGroupId) : null);
                if (!groupEl) return;

                groupEl.setAttribute('data-wall-id', face.wallId);
                groupEl.setAttribute('data-side-id', face.sideId);
                groupEl.setAttribute('data-normal', face.normal.join(','));
                groupEl.setAttribute('data-depth-y', String(face.depthMm));
                groupEl.setAttribute('data-x-range-mm', `${face.xMinMm}..${face.xMaxMm}`);
                groupEl.setAttribute('data-holes-count', String(face.holes3D.length));

                let brepPath = groupEl.querySelector('path[data-brep-wall-surface]');
                const legacyRect = groupEl.querySelector('rect:not([data-keep-rect])');

                if (!brepPath && legacyRect) {
                    brepPath = targetDoc.createElementNS(SVG_NS, 'path');
                    brepPath.setAttribute('data-brep-wall-surface', face.wallId);
                    brepPath.setAttribute('fill-rule', 'evenodd');
                    const fillAttr = legacyRect.getAttribute('fill');
                    const strokeAttr = legacyRect.getAttribute('stroke');
                    const swAttr = legacyRect.getAttribute('stroke-width');
                    const filterAttr = legacyRect.getAttribute('filter');
                    if (fillAttr) brepPath.setAttribute('fill', fillAttr);
                    if (strokeAttr) brepPath.setAttribute('stroke', strokeAttr);
                    if (swAttr) brepPath.setAttribute('stroke-width', swAttr);
                    if (filterAttr) brepPath.setAttribute('filter', filterAttr);
                    groupEl.insertBefore(brepPath, legacyRect);
                    legacyRect.remove();
                }

                if (brepPath) {
                    brepPath.setAttribute('d', face.svgPathD);
                }

                const shadowPath = groupEl.querySelector('path[data-brep-wall-shadow]');
                if (shadowPath) {
                    shadowPath.setAttribute('d', face.svgPathD);
                }

                // Render any 3D corner jamb returns (e.g. 200 mm right jamb of O13a from perpendicular wall UW_WEST)
                if (Array.isArray(face.jambReturns) && face.jambReturns.length > 0) {
                    face.jambReturns.forEach(ret => {
                        const jambEl = groupEl.querySelector(`path[data-brep-jamb-return="${ret.openingId}"]`)
                            || targetDoc.querySelector('path[data-brep-jamb-return]');
                        if (jambEl) {
                            jambEl.setAttribute('d', ret.svgPathD);
                        }
                    });
                }
            });

            return { faces, specs };
        },

        /**
         * Compile a window/door opening into a full 3D CAD / B-Rep object in [x, y, z] coordinates,
         * synchronizing canonical 3D attributes from data/windows.js with any live WindowStore edits.
         *
         * Produces:
         * - outerLoop3D: 4 [x, y, z] vertices on the host wall's exterior plane
         * - setbackLoop3D: 4 [x, y, z] vertices recessed by jambDepthMm (200 mm) into the wall opening
         * - frameFace3D: 3D B-Rep face { outerLoop3D, holes3D, normal, tangent } for the RAL 7021 frame + mullions/pillars
         * - glassPanes3D: array of 3D glass pane loops with 3D casement triangles & HST sliding arrows
         * - jambFaces3D: array of 3D reveal quads (left, right, top) spanning the 200 mm setback + 2D reveal strip loops
         * - sillPlate3D: optional 3D exterior sill loop
         */
        compileWindow3D: function (winOrId) {
            const winId = (typeof winOrId === 'string') ? winOrId : (winOrId && winOrId.id);
            if (!winId) return null;

            const seedMap = (windowsData && (windowsData.defaultWindows || windowsData.windows)) || {};
            const seedWin = seedMap[winId] || {};
            const storeWin = (WindowStore && typeof WindowStore.get === 'function') ? (WindowStore.get(winId) || {}) : {};
            const passedWin = (typeof winOrId === 'object' && winOrId) ? winOrId : {};
            const win = Object.assign({}, seedWin, storeWin, passedWin);

            const rawWallList = (wallsData && Array.isArray(wallsData.walls)) ? wallsData.walls : [];
            const hostWall = rawWallList.find(w => w.id === win.hostWallId)
                || rawWallList.find(w => Array.isArray(w.openings) && w.openings.includes(winId))
                || null;
            const hostWallId = win.hostWallId || (hostWall ? hostWall.id : null);
            const sideA = (hostWall && Array.isArray(hostWall.sides) && hostWall.sides[0]) || null;

            const normal = Array.isArray(win.normal)
                ? win.normal.slice()
                : (sideA && Array.isArray(sideA.normal) ? sideA.normal.slice() : [0, -1, 0]);
            const tangent = Array.isArray(win.tangent)
                ? win.tangent.slice()
                : [-normal[1], normal[0], 0];

            const widthMm = Math.max(0, Number(win.width) || 0);
            const heightMm = Math.max(0, Number(win.height) || 0);
            const zBottom = hostWall ? (Number(hostWall.zBottom) || 0) : (win.floor === 'first' ? 3430 : 0);
            const rawSill = Number(win.sill) || 0;
            const zMin = (win.floor === 'first' && rawSill < zBottom) ? (zBottom + rawSill) : rawSill;
            const zMax = zMin + heightMm;

            const jambDepthMm = Number(win.jambDepth) || 200;
            const frameWidthMm = Number(win.frameWidthMm) || 50;
            const frameDepthMm = Number(win.frameDepthMm) || 80;
            const borderMm = 55; // 55 mm total outer + inner sash border (5.5 SVG units at scale 0.1)

            // Determine 2D [x, y] start point of the window's exterior left edge (u = 0 when viewed from outside)
            const planeX = sideA && sideA.p1 ? Number(sideA.p1[0]) : (Array.isArray(win.outerLoop) && win.outerLoop[0] ? Number(win.outerLoop[0][0]) : 0);
            const planeY = sideA && sideA.p1 ? Number(sideA.p1[1]) : (Array.isArray(win.outerLoop) && win.outerLoop[0] ? Number(win.outerLoop[0][1]) : 0);

            let baseLeft2D;
            if (normal[1] < -0.5) {
                // North wall (normal [0, -1, 0], tangent [1, 0, 0]): left edge is X = win.x
                baseLeft2D = [Number(win.x) || 0, planeY];
            } else if (normal[1] > 0.5) {
                // South wall (normal [0, 1, 0], tangent [-1, 0, 0]): win.x is measured from East outer face X = -285
                const xMin = (Number(win.x) || 0) - 285;
                baseLeft2D = [xMin + widthMm, planeY];
            } else if (normal[0] > 0.5) {
                // West wall (normal [1, 0, 0], tangent [0, 1, 0]): left edge is Y = win.y
                baseLeft2D = [planeX, Number(win.y) || 0];
            } else {
                // East wall (normal [-1, 0, 0], tangent [0, -1, 0]): left edge is Y = win.y + widthMm
                baseLeft2D = [planeX, (Number(win.y) || 0) + widthMm];
            }

            function winPt3D(uFromLeftMm, zMm, depthInwardMm = 0) {
                return [
                    Math.round((baseLeft2D[0] + uFromLeftMm * tangent[0] - depthInwardMm * normal[0]) * 100) / 100,
                    Math.round((baseLeft2D[1] + uFromLeftMm * tangent[1] - depthInwardMm * normal[1]) * 100) / 100,
                    Math.round(zMm * 100) / 100
                ];
            }

            const outerLoop3D = [
                winPt3D(0, zMin, 0),
                winPt3D(widthMm, zMin, 0),
                winPt3D(widthMm, zMax, 0),
                winPt3D(0, zMax, 0)
            ];

            const setbackLoop3D = [
                winPt3D(0, zMin, jambDepthMm),
                winPt3D(widthMm, zMin, jambDepthMm),
                winPt3D(widthMm, zMax, jambDepthMm),
                winPt3D(0, zMax, jambDepthMm)
            ];

            // 1. 3D Window Jamb Reveal Faces (left, right, top) spanning d = 0..jambDepthMm
            const jambSides = Array.isArray(win.jambs) ? win.jambs : [];
            const jambFaces3D = [];
            const revealBandMm = 55; // 5.5 SVG units on 2D facade elevation

            if (jambSides.includes('left')) {
                jambFaces3D.push({
                    side: 'left',
                    normal: [tangent[0], tangent[1], 0],
                    lengthMm: heightMm,
                    depthMm: jambDepthMm,
                    areaM2: Math.round(((heightMm * jambDepthMm) / 1e6 + Number.EPSILON) * 10000) / 10000,
                    loop3D: [
                        winPt3D(0, zMin, 0),
                        winPt3D(0, zMin, jambDepthMm),
                        winPt3D(0, zMax, jambDepthMm),
                        winPt3D(0, zMax, 0)
                    ],
                    revealStripLoop3D: [
                        winPt3D(0, zMin, 0),
                        winPt3D(Math.min(widthMm, revealBandMm), zMin, 0),
                        winPt3D(Math.min(widthMm, revealBandMm), zMax, 0),
                        winPt3D(0, zMax, 0)
                    ]
                });
            }

            if (jambSides.includes('right')) {
                jambFaces3D.push({
                    side: 'right',
                    normal: [-tangent[0], -tangent[1], 0],
                    lengthMm: heightMm,
                    depthMm: jambDepthMm,
                    areaM2: Math.round(((heightMm * jambDepthMm) / 1e6 + Number.EPSILON) * 10000) / 10000,
                    loop3D: [
                        winPt3D(widthMm, zMin, jambDepthMm),
                        winPt3D(widthMm, zMin, 0),
                        winPt3D(widthMm, zMax, 0),
                        winPt3D(widthMm, zMax, jambDepthMm)
                    ],
                    revealStripLoop3D: [
                        winPt3D(Math.max(0, widthMm - revealBandMm), zMin, 0),
                        winPt3D(widthMm, zMin, 0),
                        winPt3D(widthMm, zMax, 0),
                        winPt3D(Math.max(0, widthMm - revealBandMm), zMax, 0)
                    ]
                });
            }

            if (jambSides.includes('top')) {
                jambFaces3D.push({
                    side: 'top',
                    normal: [0, 0, -1],
                    lengthMm: widthMm,
                    depthMm: jambDepthMm,
                    areaM2: Math.round(((widthMm * jambDepthMm) / 1e6 + Number.EPSILON) * 10000) / 10000,
                    loop3D: [
                        winPt3D(0, zMax, 0),
                        winPt3D(widthMm, zMax, 0),
                        winPt3D(widthMm, zMax, jambDepthMm),
                        winPt3D(0, zMax, jambDepthMm)
                    ],
                    revealStripLoop3D: [
                        winPt3D(0, Math.max(zMin, zMax - revealBandMm), 0),
                        winPt3D(widthMm, Math.max(zMin, zMax - revealBandMm), 0),
                        winPt3D(widthMm, zMax, 0),
                        winPt3D(0, zMax, 0)
                    ]
                });
            }

            // 2. 3D Sashes, Mullions/Pillars, Glass Panes & Casement/Sliding Lines
            const numSashes = Math.max(1, Number(win.sashes) || 1);
            const pillarMm = Number(win.pillarWidth) || 0;
            const hasMullion = Boolean(win.hasMullion) && numSashes >= 2;
            const tiltTurnSet = Array.isArray(win.tiltTurnSashes) ? win.tiltTurnSashes.map(Number) : [];

            const paneSpansMm = []; // [{ sashIndex, nominalWidthMm, uNom0, uNom1, uGlass0, uGlass1, showSplitLabel }]
            if (win.openingType === 'garage_door') {
                // Sectional garage door has solid insulated panels (no glass holes)
            } else if (win.openingType === 'entrance_door') {
                // Entrance door Z1: 60% solid door leaf on left + 40% glazed sidelight on right
                const doorW = Math.round(widthMm * 0.60);
                paneSpansMm.push({
                    sashIndex: 2,
                    nominalWidthMm: widthMm - doorW,
                    uNom0: doorW,
                    uNom1: widthMm,
                    uGlass0: doorW + 25,
                    uGlass1: Math.max(doorW + 30, widthMm - borderMm),
                    showSplitLabel: false
                });
            } else if (pillarMm > 0 && numSashes >= 2) {
                const customPanes = (Array.isArray(win.sashWidths) && win.sashWidths.length === numSashes)
                    ? win.sashWidths.map(Number)
                    : null;
                let paneWidthsMm;
                if (customPanes) {
                    const sumCustom = customPanes.reduce((a, b) => a + b, 0);
                    const totalPillarMm = (numSashes - 1) * pillarMm;
                    if (Math.abs(sumCustom + totalPillarMm - widthMm) < 1) {
                        paneWidthsMm = customPanes;
                    } else if (Math.abs(sumCustom - widthMm) < 1) {
                        paneWidthsMm = customPanes.slice();
                        paneWidthsMm[0] = Math.max(0, paneWidthsMm[0] - totalPillarMm);
                    } else {
                        paneWidthsMm = customPanes;
                    }
                } else {
                    const eqPaneMm = (widthMm - (numSashes - 1) * pillarMm) / numSashes;
                    paneWidthsMm = Array(numSashes).fill(eqPaneMm);
                }

                let cursorU = 0;
                for (let i = 0; i < numSashes; i++) {
                    const wPane = paneWidthsMm[i];
                    const u0 = cursorU;
                    const u1 = cursorU + wPane;
                    paneSpansMm.push({
                        sashIndex: i + 1,
                        nominalWidthMm: wPane,
                        uNom0: u0,
                        uNom1: u1,
                        uGlass0: (i === 0) ? Math.min(u1 - 10, borderMm) : u0,
                        uGlass1: (i === numSashes - 1) ? Math.max(u0 + 10, widthMm - borderMm) : u1,
                        showSplitLabel: true
                    });
                    cursorU = u1 + pillarMm;
                }
            } else if (hasMullion && numSashes >= 2) {
                const customSashWidths = (Array.isArray(win.sashWidths) && win.sashWidths.length >= 2)
                    ? win.sashWidths.map(Number)
                    : ((win.id === 'O1' && Math.round(widthMm) === 2100)
                        ? [1050, 1050]
                        : ((win.id === 'O1' && Math.round(widthMm) === 2500) ? [900, 1600] : null));
                const mullionHalfMm = 15; // 30 mm mullion bar (3 SVG units at 0.1 scale)
                if (customSashWidths) {
                    const totalSplit = customSashWidths.reduce((a, b) => a + (Number(b) || 0), 0) || widthMm;
                    let accum = 0;
                    for (let i = 0; i < customSashWidths.length; i++) {
                        const partMm = (widthMm * Number(customSashWidths[i] || 0)) / totalSplit;
                        const u0 = accum;
                        const u1 = accum + partMm;
                        accum = u1;
                        paneSpansMm.push({
                            sashIndex: i + 1,
                            nominalWidthMm: Number(customSashWidths[i] || partMm),
                            uNom0: u0,
                            uNom1: u1,
                            uGlass0: (i === 0) ? borderMm : (u0 + mullionHalfMm),
                            uGlass1: (i === customSashWidths.length - 1) ? (widthMm - borderMm) : (u1 - mullionHalfMm),
                            showSplitLabel: heightMm >= 1000
                        });
                    }
                } else {
                    const partMm = widthMm / numSashes;
                    for (let i = 0; i < numSashes; i++) {
                        const u0 = i * partMm;
                        const u1 = (i + 1) * partMm;
                        paneSpansMm.push({
                            sashIndex: i + 1,
                            nominalWidthMm: partMm,
                            uNom0: u0,
                            uNom1: u1,
                            uGlass0: (i === 0) ? borderMm : (u0 + mullionHalfMm),
                            uGlass1: (i === numSashes - 1) ? (widthMm - borderMm) : (u1 - mullionHalfMm),
                            showSplitLabel: false
                        });
                    }
                }
            } else {
                paneSpansMm.push({
                    sashIndex: 1,
                    nominalWidthMm: widthMm,
                    uNom0: 0,
                    uNom1: widthMm,
                    uGlass0: Math.min(widthMm / 2 - 5, borderMm),
                    uGlass1: Math.max(widthMm / 2 + 5, widthMm - borderMm),
                    showSplitLabel: false
                });
            }

            const zGlass0 = Math.min((zMin + zMax) / 2 - 5, zMin + borderMm);
            const zGlass1 = Math.max((zMin + zMax) / 2 + 5, zMax - borderMm);

            const frameHoles3D = [];
            const exteriorHoles3D = [];
            const glassPanes3D = [];

            paneSpansMm.forEach(sp => {
                const loopSetback = [
                    winPt3D(sp.uGlass0, zGlass0, jambDepthMm),
                    winPt3D(sp.uGlass1, zGlass0, jambDepthMm),
                    winPt3D(sp.uGlass1, zGlass1, jambDepthMm),
                    winPt3D(sp.uGlass0, zGlass1, jambDepthMm)
                ];
                const loopExt = [
                    winPt3D(sp.uGlass0, zGlass0, 0),
                    winPt3D(sp.uGlass1, zGlass0, 0),
                    winPt3D(sp.uGlass1, zGlass1, 0),
                    winPt3D(sp.uGlass0, zGlass1, 0)
                ];

                const holeId = `${win.id}_PANE_${sp.sashIndex}`;
                frameHoles3D.push({ id: holeId, sashIndex: sp.sashIndex, loop: loopSetback, loop3D: loopSetback });
                exteriorHoles3D.push({ id: holeId, sashIndex: sp.sashIndex, loop: loopExt, loop3D: loopExt });

                const isTiltTurn = tiltTurnSet.includes(sp.sashIndex);
                const casementLines3D = [];
                if (isTiltTurn) {
                    const uMid = (sp.uGlass0 + sp.uGlass1) / 2;
                    const zMid = (zGlass0 + zGlass1) / 2;
                    // Bottom-left -> top-center -> bottom-right (tilt triangle)
                    casementLines3D.push([
                        winPt3D(sp.uGlass0 + 15, zGlass0 + 15, jambDepthMm),
                        winPt3D(uMid, zGlass1 - 15, jambDepthMm),
                        winPt3D(sp.uGlass1 - 15, zGlass0 + 15, jambDepthMm)
                    ]);
                    // Top-left -> right-center -> bottom-left (turn triangle)
                    casementLines3D.push([
                        winPt3D(sp.uGlass0 + 15, zGlass1 - 15, jambDepthMm),
                        winPt3D(sp.uGlass1 - 15, zMid, jambDepthMm),
                        winPt3D(sp.uGlass0 + 15, zGlass0 + 15, jambDepthMm)
                    ]);
                }

                let slidingArrow3D = null;
                if (win.slidingArrows && ((numSashes >= 4 && (sp.sashIndex === 2 || sp.sashIndex === 3)) || (numSashes === 3 && sp.sashIndex === 2))) {
                    const uMid = (sp.uNom0 + sp.uNom1) / 2;
                    const zArrow = zMax - heightMm * 0.62;
                    const dirSign = (sp.sashIndex === 3) ? 1 : -1; // sash 2 slides left (-1), sash 3 slides right (+1)
                    const halfLen = 160;
                    const headBack = 70;
                    const headHalfH = 50;
                    const uStart = uMid - dirSign * halfLen;
                    const uTip = uMid + dirSign * halfLen;
                    slidingArrow3D = {
                        direction: dirSign < 0 ? 'left' : 'right',
                        line3D: [
                            winPt3D(uStart, zArrow, jambDepthMm),
                            winPt3D(uTip, zArrow, jambDepthMm)
                        ],
                        head3D: [
                            winPt3D(uTip - dirSign * headBack, zArrow + headHalfH, jambDepthMm),
                            winPt3D(uTip, zArrow, jambDepthMm),
                            winPt3D(uTip - dirSign * headBack, zArrow - headHalfH, jambDepthMm)
                        ]
                    };
                }

                const uNomMid = (sp.uNom0 + sp.uNom1) / 2;
                glassPanes3D.push({
                    id: holeId,
                    sashIndex: sp.sashIndex,
                    nominalWidthMm: sp.nominalWidthMm,
                    clearWidthMm: Math.round((sp.uGlass1 - sp.uGlass0) * 10) / 10,
                    clearHeightMm: Math.round((zGlass1 - zGlass0) * 10) / 10,
                    showSplitLabel: sp.showSplitLabel,
                    loop3D: loopSetback,
                    exteriorLoop3D: loopExt,
                    center3D: winPt3D(uNomMid, (zMin + zMax) / 2, jambDepthMm),
                    labelBottom3D: winPt3D(uNomMid, zMin + 110, 0),
                    isTiltTurn,
                    casementLines3D,
                    slidingArrow3D
                });
            });

            // 3. Optional 3D Exterior Sill Plate
            const isCorner = win.id === 'O13a' || win.id === 'O13a_2' || win.id === 'O13b' || win.id === 'O13b_1' || win.id === 'O13b_2';
            const isFullHeight = win.id === '14a'
                || (win.floor === 'first' && zMin <= 3430)
                || (win.floor === 'ground' && zMin <= 0);
            const sillPlate3D = (!isFullHeight && !isCorner && win.openingType !== 'garage_door' && win.openingType !== 'entrance_door')
                ? [
                    winPt3D(-20, zMin - 40, 0),
                    winPt3D(widthMm + 20, zMin - 40, 0),
                    winPt3D(widthMm + 20, zMin, 0),
                    winPt3D(-20, zMin, 0)
                ]
                : null;

            const frameFace3D = {
                id: `${win.id}_FRAME`,
                material: 'ral7021',
                colorHex: '#1f2421',
                normal,
                tangent,
                p1: [setbackLoop3D[0][0], setbackLoop3D[0][1]],
                p2: [setbackLoop3D[1][0], setbackLoop3D[1][1]],
                frameWidthMm,
                frameDepthMm,
                jambDepthMm,
                outerLoop: setbackLoop3D,
                outerLoop3D: setbackLoop3D,
                holes: frameHoles3D,
                holes3D: frameHoles3D,
                exteriorOuterLoop3D: outerLoop3D,
                exteriorHoles3D
            };

            const isInactive = Array.isArray(win.views) && win.views.length === 0;

            return {
                id: win.id,
                name: win.name || win.id,
                hostWallId,
                floor: win.floor || (hostWall ? hostWall.floor : 'ground'),
                wall: win.wall || 'north',
                room: win.room || '',
                openingType: win.openingType || 'window',
                active: !isInactive,
                views: Array.isArray(win.views) ? win.views.slice() : [],
                normal,
                tangent,
                x: Number(win.x) || 0,
                y: Number(win.y) || 0,
                sill: rawSill,
                width: widthMm,
                height: heightMm,
                widthMm,
                heightMm,
                zMin,
                zMax,
                jambs: jambSides.slice(),
                jambDepthMm,
                frameWidthMm,
                frameDepthMm,
                sashes: numSashes,
                pillarWidth: pillarMm,
                hasMullion,
                tiltTurnSashes: tiltTurnSet,
                slidingArrows: Boolean(win.slidingArrows),
                outerLoop: outerLoop3D,
                outerLoop3D,
                setbackLoop3D,
                center3D: winPt3D(widthMm / 2, (zMin + zMax) / 2, 0),
                frameFace3D,
                glassPanes3D,
                jambFaces3D,
                sillPlate3D,
                specs: win.specs || {},
                description: win.description || ''
            };
        },

        /**
         * Retrieve all compiled 3D B-Rep window/door objects, optionally filtered by
         * { floor, hostWallId, viewId, activeOnly }.
         */
        getWindows3D: function (filter) {
            const seedMap = (windowsData && (windowsData.defaultWindows || windowsData.windows)) || {};
            const ids = Object.keys(seedMap);
            let list = ids.map(id => this.compileWindow3D(id)).filter(Boolean);

            if (filter) {
                if (filter.floor) {
                    list = list.filter(w => w.floor === filter.floor);
                }
                if (filter.hostWallId) {
                    list = list.filter(w => w.hostWallId === filter.hostWallId);
                }
                if (Array.isArray(filter.hostWallIds)) {
                    const set = new Set(filter.hostWallIds);
                    list = list.filter(w => set.has(w.hostWallId));
                }
                if (filter.viewId) {
                    list = list.filter(w => Array.isArray(w.views) && w.views.includes(filter.viewId));
                }
                if (filter.activeOnly) {
                    list = list.filter(w => w.active);
                }
            }
            return list;
        },

        getWindow3DById: function (winId) {
            return this.compileWindow3D(winId);
        },

        /**
         * Project a single 3D B-Rep Window Object onto a 2D orthographic elevation view
         * ('north_facade', 'south_facade', 'west_facade', 'east_facade'), returning
         * projected SVG paths for its frame + mullions (with glass holes), glass panes,
         * 3D casement triangles, 3D HST sliding arrows, 3D jamb reveals, and sill plate.
         */
        projectWindowForView: function (winOrId, viewIdOrConfig) {
            const win3D = (winOrId && winOrId.frameFace3D) ? winOrId : this.compileWindow3D(winOrId);
            if (!win3D) return null;

            const preset = (typeof viewIdOrConfig === 'string')
                ? (VIEW_CAMERA_PRESETS[viewIdOrConfig] || VIEW_CAMERA_PRESETS.north_facade)
                : Object.assign({}, VIEW_CAMERA_PRESETS.north_facade, viewIdOrConfig || {});

            const rightDir = preset.rightDir || [1, 0, 0];
            const lookDir = preset.lookDir || [0, 1, 0];
            const uOrigin = Number(preset.uOrigin) || 0;
            const scale = preset.svgScale || 0.1;

            function projPt(pt3D) {
                const uMm = dot3([pt3D[0], pt3D[1], 0], rightDir) + uOrigin;
                return [
                    Math.round(uMm * scale * 100) / 100,
                    Math.round(-pt3D[2] * scale * 100) / 100
                ];
            }

            function projPolylineSvgPoints(pts3D) {
                return pts3D.map(p => {
                    const [sx, sy] = projPt(p);
                    return `${sx},${sy}`;
                }).join(' ');
            }

            const uCoords = win3D.outerLoop3D.map(pt => dot3([pt[0], pt[1], 0], rightDir) + uOrigin);
            const zCoords = win3D.outerLoop3D.map(pt => Number(pt[2]) || 0);
            const depthCoords = win3D.outerLoop3D.map(pt => dot3(pt, lookDir));

            const uMinMm = Math.min(...uCoords);
            const uMaxMm = Math.max(...uCoords);
            const zMinMm = Math.min(...zCoords);
            const zMaxMm = Math.max(...zCoords);
            const depthMm = Math.round((depthCoords.reduce((a, b) => a + b, 0) / depthCoords.length) * 100) / 100;

            const svgRect = {
                x: Math.round(uMinMm * scale * 100) / 100,
                y: Math.round(-zMaxMm * scale * 100) / 100,
                width: Math.round((uMaxMm - uMinMm) * scale * 100) / 100,
                height: Math.round((zMaxMm - zMinMm) * scale * 100) / 100
            };

            const outerPathD = buildElevationSvgPathFromLoops(win3D.outerLoop3D, [], rightDir, scale, uOrigin);
            const framePathD = buildElevationSvgPathFromLoops(
                win3D.frameFace3D.exteriorOuterLoop3D,
                win3D.frameFace3D.exteriorHoles3D,
                rightDir,
                scale,
                uOrigin
            );

            const glassPanes = win3D.glassPanes3D.map(pane => {
                const [lblX, lblY] = projPt(pane.labelBottom3D);
                return {
                    id: pane.id,
                    sashIndex: pane.sashIndex,
                    nominalWidthMm: pane.nominalWidthMm,
                    showSplitLabel: pane.showSplitLabel,
                    svgPathD: buildElevationSvgPathFromLoops(pane.exteriorLoop3D, [], rightDir, scale, uOrigin),
                    labelSvgPos: { x: lblX, y: lblY },
                    casementPolylinesSvg: pane.casementLines3D.map(poly3D => projPolylineSvgPoints(poly3D)),
                    slidingArrowSvg: pane.slidingArrow3D
                        ? {
                            linePoints: projPolylineSvgPoints(pane.slidingArrow3D.line3D),
                            headPoints: projPolylineSvgPoints(pane.slidingArrow3D.head3D)
                        }
                        : null
                };
            });

            const jambReveals = win3D.jambFaces3D.map(jf => ({
                side: jf.side,
                lengthMm: jf.lengthMm,
                depthMm: jf.depthMm,
                areaM2: jf.areaM2,
                svgPathD: buildElevationSvgPathFromLoops(jf.revealStripLoop3D, [], rightDir, scale, uOrigin)
            }));

            const sillPathD = win3D.sillPlate3D
                ? buildElevationSvgPathFromLoops(win3D.sillPlate3D, [], rightDir, scale, uOrigin)
                : null;

            return {
                id: win3D.id,
                name: win3D.name,
                hostWallId: win3D.hostWallId,
                floor: win3D.floor,
                openingType: win3D.openingType,
                normal: win3D.normal,
                depthMm,
                uMinMm,
                uMaxMm,
                zMinMm,
                zMaxMm,
                svgRect,
                outerPathD,
                framePathD,
                glassPanes,
                jambReveals,
                sillPathD,
                win3D
            };
        },

        /**
         * Project all visible 3D B-Rep windows for a given elevation view ('north_facade', etc.)
         * using back-face culling (dot(win.normal, lookDir) < 0) and back-to-front painter's order.
         */
        getVisibleWindowsForView: function (viewIdOrConfig) {
            const viewId = (typeof viewIdOrConfig === 'string')
                ? viewIdOrConfig
                : (viewIdOrConfig && viewIdOrConfig.viewId) || 'north_facade';
            const preset = (typeof viewIdOrConfig === 'string')
                ? (VIEW_CAMERA_PRESETS[viewIdOrConfig] || VIEW_CAMERA_PRESETS.north_facade)
                : Object.assign({}, VIEW_CAMERA_PRESETS.north_facade, viewIdOrConfig || {});
            const lookDir = preset.lookDir || [0, 1, 0];

            const wins = this.getWindows3D({ viewId, activeOnly: true });
            const projected = [];

            wins.forEach(w => {
                if (dot3(w.normal, lookDir) >= -1e-3) return;
                const proj = this.projectWindowForView(w, preset);
                if (proj) projected.push(proj);
            });

            projected.sort((a, b) => {
                if (Math.abs(b.depthMm - a.depthMm) > 1) {
                    return b.depthMm - a.depthMm;
                }
                return a.uMinMm - b.uMinMm;
            });

            return projected;
        },

        /**
         * Compile a staircase object from data/stairs.js into a full 3D B-Rep / Mesh solid
         * in the canonical Right-Handed Building Coordinate System:
         * - X: East -> West (11,665 .. 16,175 mm)
         * - Y: North -> South (8,360 .. 9,640 mm)
         * - Z: Vertical Elevation (0 .. 3,330 mm steps + 900 mm balustrade)
         */
        compileStair3D: function (stairOrId) {
            const rawStairsMap = (stairsData && (stairsData.defaultStairs || stairsData.stairs)) || {};
            const rawStair = (typeof stairOrId === 'object' && stairOrId)
                ? stairOrId
                : (rawStairsMap[stairOrId] || rawStairsMap.main_staircase || {});

            const spec = (rawStair && rawStair.brep3D) ? rawStair.brep3D : {
                id: 'STAIRS_1',
                stairId: 'main_staircase',
                name: 'STAIRS_1 — Main Winder Staircase (Schody 18×18.5×27)',
                cadSpecLabel: '18×18,5×27',
                balustradeLabel: 'balustrada h=90',
                floor: 'ground',
                connectsFloors: ['ground', 'first'],
                rooms: '0.07 Komunikacja -> 1.06 Korytarz',
                northWallId: 'GW_7',
                westWallId: 'GW_5',
                underStairDoorId: 'D_GW7_2',
                xMin: 11910,
                xPivot: 15175,
                xTurnMid: 15675,
                xMax: 16175,
                yMin: 8360,
                yPivot: 9370,
                yMax: 9640,
                zBottom: 0,
                zTop: 3330,
                upperFloorDatumZ: 3430,
                flightWidthMm: 1010,
                turnWidthMm: 1000,
                riserCount: 18,
                treadCount: 17,
                turnStepsCount: 4,
                straightTreadsCount: 13,
                straightRisersCount: 14,
                riserHeightMm: 185,
                treadDepthMm: 251.15,
                plankThicknessMm: 40,
                waistSlabThicknessMm: 160,
                balustradeHeightMm: 900,
                balustradeThicknessMm: 60,
                planCutLine2D: [[13919, 8360], [13668, 9370]],
                turnSteps2D: [
                    {
                        stepNumber: 1,
                        kind: 'straight_entry',
                        zBottom: 0,
                        zTop: 185,
                        riserLine2D: [[15175, 9640], [16175, 9640]],
                        riserNormal: [0, 1, 0],
                        treadPolygon2D: [[15175, 9640], [16175, 9640], [16175, 9370], [15175, 9370]]
                    },
                    {
                        stepNumber: 2,
                        kind: 'winder',
                        zBottom: 185,
                        zTop: 370,
                        riserLine2D: [[15175, 9370], [16175, 9370]],
                        riserNormal: [0, 1, 0],
                        treadPolygon2D: [[15175, 9370], [16175, 9370], [16175, 8750]]
                    },
                    {
                        stepNumber: 3,
                        kind: 'winder',
                        zBottom: 370,
                        zTop: 555,
                        riserLine2D: [[15175, 9370], [16175, 8750]],
                        riserNormal: [0.527, 0.85, 0],
                        treadPolygon2D: [[15175, 9370], [16175, 8750], [16175, 8360], [15675, 8360]]
                    },
                    {
                        stepNumber: 4,
                        kind: 'winder',
                        zBottom: 555,
                        zTop: 740,
                        riserLine2D: [[15175, 9370], [15675, 8360]],
                        riserNormal: [0.896, 0.444, 0],
                        treadPolygon2D: [[15175, 9370], [15675, 8360], [15175, 8360]]
                    }
                ],
                walkingLine3D: [
                    [15675, 9640, 0],
                    [15675, 9505, 185],
                    [15675, 8865, 555],
                    [15175, 8865, 740],
                    [11910, 8865, 3330]
                ]
            };

            const plankH = Number(spec.plankThicknessMm) || 40;
            const riserH = Number(spec.riserHeightMm) || 185;
            const exactTreadD = (spec.xPivot - spec.xMin) / (spec.straightTreadsCount || 13);
            const treadD = Math.round(exactTreadD * 100) / 100;
            const waistH = Number(spec.waistSlabThicknessMm) || 160;
            const balH = Number(spec.balustradeHeightMm) || 900;
            const balThick = Number(spec.balustradeThicknessMm) || 60;

            function buildExtrudedPolygonFaces(poly2D, z0, z1) {
                const topLoop = poly2D.map(p => [p[0], p[1], z1]);
                const botLoop = poly2D.map(p => [p[0], p[1], z0]);
                const sideQuads = [];
                for (let i = 0; i < poly2D.length; i++) {
                    const a = poly2D[i];
                    const b = poly2D[(i + 1) % poly2D.length];
                    const dx = b[0] - a[0];
                    const dy = b[1] - a[1];
                    const len = Math.hypot(dx, dy) || 1;
                    const normal = [
                        Math.round((dy / len) * 1000) / 1000,
                        Math.round((-dx / len) * 1000) / 1000,
                        0
                    ];
                    sideQuads.push({
                        loop3D: [
                            [a[0], a[1], z0],
                            [b[0], b[1], z0],
                            [b[0], b[1], z1],
                            [a[0], a[1], z1]
                        ],
                        normal
                    });
                }
                return { topLoop, botLoop, sideQuads };
            }

            const steps3D = [];

            // A. 4 Turn Steps (1 Straight Entry + 3 Winder Steps in 1,000 × 1,280 mm West Bay)
            (spec.turnSteps2D || []).forEach(ts => {
                const zTop = Number(ts.zTop);
                const zBottom = Number(ts.zBottom);
                const zConcreteTop = zTop - plankH;
                const poly2D = ts.treadPolygon2D;

                const plank = buildExtrudedPolygonFaces(poly2D, zConcreteTop, zTop);
                const concrete = buildExtrudedPolygonFaces(poly2D, 0, zConcreteTop);

                const r1 = ts.riserLine2D[0];
                const r2 = ts.riserLine2D[1];
                const riserQuad3D = {
                    loop3D: [
                        [r1[0], r1[1], zBottom],
                        [r2[0], r2[1], zBottom],
                        [r2[0], r2[1], zTop],
                        [r1[0], r1[1], zTop]
                    ],
                    normal: ts.riserNormal || [0, 1, 0]
                };

                const concreteFaces3D = [
                    { loop3D: concrete.topLoop, normal: [0, 0, 1] },
                    { loop3D: concrete.botLoop.slice().reverse(), normal: [0, 0, -1] }
                ].concat(concrete.sideQuads);

                steps3D.push({
                    stepNumber: ts.stepNumber,
                    kind: ts.kind,
                    zBottom,
                    zTop,
                    zConcreteBottom: 0,
                    zConcreteTop,
                    riserLine2D: ts.riserLine2D,
                    riserNormal: ts.riserNormal || [0, 1, 0],
                    treadPolygon2D: poly2D,
                    treadLoop3D: plank.topLoop,
                    plankBottomLoop3D: plank.botLoop,
                    plankSideQuads3D: plank.sideQuads,
                    riserQuad3D,
                    concreteFaces3D
                });
            });

            // B. 13 Straight Flight Treads (Steps 5 to 17) going East (-X) from X = 15,175 to X = 11,910 mm
            const yNorth = spec.yMin; // 8360
            const ySouth = spec.yPivot; // 9370
            for (let k = 0; k < spec.straightTreadsCount; k++) {
                const stepNum = 5 + k;
                const xWest = Math.round((spec.xPivot - k * exactTreadD) * 10) / 10;
                const xEast = (k === spec.straightTreadsCount - 1)
                    ? spec.xMin
                    : Math.round((spec.xPivot - (k + 1) * exactTreadD) * 10) / 10;
                const zBottom = (stepNum - 1) * riserH;
                const zTop = stepNum * riserH;
                const zConcreteBottom = zBottom - plankH;
                const zConcreteTop = zTop - plankH;

                const poly2D = [
                    [xWest, yNorth],
                    [xWest, ySouth],
                    [xEast, ySouth],
                    [xEast, yNorth]
                ];

                const plank = buildExtrudedPolygonFaces(poly2D, zConcreteTop, zTop);
                const riserQuad3D = {
                    loop3D: [
                        [xWest, yNorth, zBottom],
                        [xWest, ySouth, zBottom],
                        [xWest, ySouth, zTop],
                        [xWest, yNorth, zTop]
                    ],
                    normal: [1, 0, 0]
                };

                // Triangular concrete step wedge sitting atop the sloped waist slab
                const concreteFaces3D = [
                    // Top horizontal concrete face under plank
                    {
                        loop3D: [
                            [xWest, yNorth, zConcreteTop],
                            [xWest, ySouth, zConcreteTop],
                            [xEast, ySouth, zConcreteTop],
                            [xEast, yNorth, zConcreteTop]
                        ],
                        normal: [0, 0, 1]
                    },
                    // West vertical concrete riser face
                    {
                        loop3D: [
                            [xWest, yNorth, zConcreteBottom],
                            [xWest, ySouth, zConcreteBottom],
                            [xWest, ySouth, zConcreteTop],
                            [xWest, yNorth, zConcreteTop]
                        ],
                        normal: [1, 0, 0]
                    },
                    // North vertical triangular cheek face (against GW_7)
                    {
                        loop3D: [
                            [xWest, yNorth, zConcreteBottom],
                            [xWest, yNorth, zConcreteTop],
                            [xEast, yNorth, zConcreteTop]
                        ],
                        normal: [0, -1, 0]
                    },
                    // South vertical triangular cheek face (facing hallway)
                    {
                        loop3D: [
                            [xWest, ySouth, zConcreteBottom],
                            [xEast, ySouth, zConcreteTop],
                            [xWest, ySouth, zConcreteTop]
                        ],
                        normal: [0, 1, 0]
                    }
                ];

                steps3D.push({
                    stepNumber: stepNum,
                    kind: 'straight',
                    xWest,
                    xEast,
                    zBottom,
                    zTop,
                    zConcreteBottom,
                    zConcreteTop,
                    riserLine2D: [[xWest, yNorth], [xWest, ySouth]],
                    riserNormal: [1, 0, 0],
                    treadPolygon2D: poly2D,
                    treadLoop3D: plank.topLoop,
                    plankBottomLoop3D: plank.botLoop,
                    plankSideQuads3D: plank.sideQuads,
                    riserQuad3D,
                    concreteFaces3D
                });
            }

            // C. Final Arrival Riser 18 at X = 11,665 mm (Z = 3,145 -> 3,330 mm)
            const zLastConcrete = (spec.riserCount - 1) * riserH - plankH; // 3,105 mm
            const topRiser3D = {
                stepNumber: spec.riserCount,
                kind: 'arrival_riser',
                x: spec.xMin,
                zBottom: (spec.riserCount - 1) * riserH,
                zTop: spec.zTop,
                riserLine2D: [[spec.xMin, yNorth], [spec.xMin, ySouth]],
                riserNormal: [1, 0, 0],
                loop3D: [
                    [spec.xMin, yNorth, zLastConcrete],
                    [spec.xMin, ySouth, zLastConcrete],
                    [spec.xMin, ySouth, spec.zTop],
                    [spec.xMin, yNorth, spec.zTop]
                ]
            };

            // D. Monolithic Reinforced Concrete Waist Slab (193 mm vertical thickness under straight flight)
            // Runs from X = 15,175 (zTop = 700, zBot = 507) to X = 11,665 (zTop = 3,105, zBot = 2,912)
            const zSlabWestTop = 4 * riserH - plankH; // 700 mm
            const zSlabWestBot = zSlabWestTop - waistH; // 507 mm
            const zSlabEastTop = zLastConcrete; // 3,105 mm
            const zSlabEastBot = zSlabEastTop - waistH; // 2,912 mm

            const waistSlab3D = {
                thicknessMm: waistH,
                zWestTop: zSlabWestTop,
                zWestBot: zSlabWestBot,
                zEastTop: zSlabEastTop,
                zEastBot: zSlabEastBot,
                faces3D: [
                    // Sloped soffit (underside ceiling face)
                    {
                        id: 'soffit',
                        normal: [0.566, 0, -0.824],
                        loop3D: [
                            [spec.xPivot, yNorth, zSlabWestBot],
                            [spec.xPivot, ySouth, zSlabWestBot],
                            [spec.xMin, ySouth, zSlabEastBot],
                            [spec.xMin, yNorth, zSlabEastBot]
                        ]
                    },
                    // Sloped top interface
                    {
                        id: 'top',
                        normal: [-0.566, 0, 0.824],
                        loop3D: [
                            [spec.xPivot, yNorth, zSlabWestTop],
                            [spec.xMin, yNorth, zSlabEastTop],
                            [spec.xMin, ySouth, zSlabEastTop],
                            [spec.xPivot, ySouth, zSlabWestTop]
                        ]
                    },
                    // North face (against GW_7)
                    {
                        id: 'north',
                        normal: [0, -1, 0],
                        loop3D: [
                            [spec.xPivot, yNorth, zSlabWestBot],
                            [spec.xMin, yNorth, zSlabEastBot],
                            [spec.xMin, yNorth, zSlabEastTop],
                            [spec.xPivot, yNorth, zSlabWestTop]
                        ]
                    },
                    // South face (visible in hallway)
                    {
                        id: 'south',
                        normal: [0, 1, 0],
                        loop3D: [
                            [spec.xPivot, ySouth, zSlabWestBot],
                            [spec.xPivot, ySouth, zSlabWestTop],
                            [spec.xMin, ySouth, zSlabEastTop],
                            [spec.xMin, ySouth, zSlabEastBot]
                        ]
                    },
                    // West end cap at X = 15,175
                    {
                        id: 'west',
                        normal: [1, 0, 0],
                        loop3D: [
                            [spec.xPivot, yNorth, zSlabWestBot],
                            [spec.xPivot, yNorth, zSlabWestTop],
                            [spec.xPivot, ySouth, zSlabWestTop],
                            [spec.xPivot, ySouth, zSlabWestBot]
                        ]
                    },
                    // East arrival end cap at X = 11,665
                    {
                        id: 'east',
                        normal: [-1, 0, 0],
                        loop3D: [
                            [spec.xMin, yNorth, zSlabEastBot],
                            [spec.xMin, ySouth, zSlabEastBot],
                            [spec.xMin, ySouth, zSlabEastTop],
                            [spec.xMin, yNorth, zSlabEastTop]
                        ]
                    }
                ]
            };

            // E. 3D Balustrade (h = 900 mm along open South edge Y = 9,310..9,370, X = 11,665..15,175)
            const yBalNorth = ySouth - balThick; // 9310
            const yBalSouth = ySouth;            // 9370
            const yBalMid = (yBalNorth + yBalSouth) / 2; // 9340
            const zRailWestTop = 4 * riserH + balH; // 740 + 900 = 1640
            const zRailWestBot = zRailWestTop - 50; // 1590
            const zRailEastTop = spec.zTop + balH;  // 3330 + 900 = 4230
            const zRailEastBot = zRailEastTop - 50; // 4180

            const balustrade3D = {
                heightMm: balH,
                thicknessMm: balThick,
                yMin: yBalNorth,
                yMax: yBalSouth,
                xMin: spec.xMin,
                xMax: spec.xPivot,
                planLoop2D: [
                    [spec.xMin, yBalNorth],
                    [spec.xPivot, yBalNorth],
                    [spec.xPivot, yBalSouth],
                    [spec.xMin, yBalSouth]
                ],
                handrailFaces3D: [
                    // Top of handrail
                    {
                        normal: [0, 0, 1],
                        loop3D: [
                            [spec.xPivot, yBalNorth, zRailWestTop],
                            [spec.xMin, yBalNorth, zRailEastTop],
                            [spec.xMin, yBalSouth, zRailEastTop],
                            [spec.xPivot, yBalSouth, zRailWestTop]
                        ]
                    },
                    // Bottom of handrail
                    {
                        normal: [0, 0, -1],
                        loop3D: [
                            [spec.xPivot, yBalNorth, zRailWestBot],
                            [spec.xPivot, yBalSouth, zRailWestBot],
                            [spec.xMin, yBalSouth, zRailEastBot],
                            [spec.xMin, yBalNorth, zRailEastBot]
                        ]
                    },
                    // South face of handrail
                    {
                        normal: [0, 1, 0],
                        loop3D: [
                            [spec.xPivot, yBalSouth, zRailWestBot],
                            [spec.xPivot, yBalSouth, zRailWestTop],
                            [spec.xMin, yBalSouth, zRailEastTop],
                            [spec.xMin, yBalSouth, zRailEastBot]
                        ]
                    },
                    // North face of handrail
                    {
                        normal: [0, -1, 0],
                        loop3D: [
                            [spec.xPivot, yBalNorth, zRailWestBot],
                            [spec.xMin, yBalNorth, zRailEastBot],
                            [spec.xMin, yBalNorth, zRailEastTop],
                            [spec.xPivot, yBalNorth, zRailWestTop]
                        ]
                    }
                ],
                glassPanelLoop3D: [
                    [spec.xPivot, yBalMid, 4 * riserH + 80],
                    [spec.xMin, yBalMid, spec.zTop + 80],
                    [spec.xMin, yBalMid, zRailEastBot],
                    [spec.xPivot, yBalMid, zRailWestBot]
                ],
                posts3D: [
                    { x: spec.xPivot - 20, zBot: 4 * riserH, zTop: zRailWestTop },
                    { x: Math.round((spec.xPivot + spec.xMin) / 2), zBot: Math.round((4 * riserH + spec.zTop) / 2), zTop: Math.round((zRailWestTop + zRailEastTop) / 2) },
                    { x: spec.xMin + 20, zBot: spec.zTop - riserH, zTop: zRailEastTop }
                ].map(p => {
                    const postFaces = buildExtrudedPolygonFaces(
                        [
                            [p.x - 20, yBalNorth],
                            [p.x + 20, yBalNorth],
                            [p.x + 20, yBalSouth],
                            [p.x - 20, yBalSouth]
                        ],
                        p.zBot,
                        p.zTop
                    );
                    return postFaces.sideQuads;
                })
            };

            const footprint2D = [
                [spec.xPivot, spec.yMax],
                [spec.xMax, spec.yMax],
                [spec.xMax, spec.yMin],
                [spec.xMin, spec.yMin],
                [spec.xMin, spec.yPivot],
                [spec.xPivot, spec.yPivot]
            ];

            return {
                id: spec.id || 'STAIRS_1',
                stairId: spec.stairId || 'main_staircase',
                name: spec.name,
                cadSpecLabel: spec.cadSpecLabel || '18×18,5×27',
                balustradeLabel: spec.balustradeLabel || 'balustrada h=90',
                floor: spec.floor || 'ground',
                category: 'staircase',
                rooms: spec.rooms || '0.07 Komunikacja -> 1.06 Korytarz',
                northWallId: spec.northWallId || 'GW_7',
                westWallId: spec.westWallId || 'GW_5',
                underStairDoorId: spec.underStairDoorId || 'D_GW7_2',
                x1: spec.xMin,
                x2: spec.xMax,
                y1: spec.yMin,
                y2: spec.yMax,
                xMin: spec.xMin,
                xPivot: spec.xPivot,
                xTurnMid: spec.xTurnMid || 15675,
                xMax: spec.xMax,
                yMin: spec.yMin,
                yPivot: spec.yPivot,
                yMax: spec.yMax,
                zBottom: spec.zBottom,
                zTop: spec.zTop,
                flightWidthMm: spec.flightWidthMm,
                turnWidthMm: spec.turnWidthMm,
                riserCount: spec.riserCount,
                treadCount: spec.treadCount,
                turnStepsCount: spec.turnStepsCount,
                straightTreadsCount: spec.straightTreadsCount,
                straightRisersCount: spec.straightRisersCount,
                riserHeightMm: riserH,
                treadDepthMm: treadD,
                plankThicknessMm: plankH,
                waistSlabThicknessMm: waistH,
                balustradeHeightMm: balH,
                balustradeThicknessMm: balThick,
                planCutLine2D: spec.planCutLine2D,
                footprint2D,
                steps3D,
                topRiser3D,
                waistSlab3D,
                balustrade3D,
                walkingLine3D: spec.walkingLine3D,
                materials: rawStair.materials || {}
            };
        },

        getStairs3D: function () {
            return [this.compileStair3D('main_staircase')];
        },

        getStair3DById: function (id) {
            if (!id || id === 'STAIRS_1' || id === 'main_staircase') {
                return this.compileStair3D('main_staircase');
            }
            return null;
        },

        /**
         * Intersect the 3D Staircase solid (turn block + sloped waist slab + steps)
         * with a horizontal cut plane Z = zSlice, returning the exact 2D polygons
         * sliced at that elevation (used by both walls_3d.html slice plane and 2D floor plans).
         */
        sliceStair3DAtElevation: function (stairOrId, zSlice) {
            const st = (stairOrId && stairOrId.steps3D) ? stairOrId : this.compileStair3D(stairOrId);
            const polygons2D = [];

            // 1. Check 4 turn steps (each extends from Z = 0 to step.zTop)
            st.steps3D.forEach(step => {
                if (step.stepNumber <= 4) {
                    if (zSlice >= 0 && zSlice <= step.zTop) {
                        polygons2D.push(step.treadPolygon2D.map(p => [p[0], p[1]]));
                    }
                } else {
                    // Straight step + waist slab interval at step's X span [xEast, xWest]
                    const tWest = (st.xPivot - step.xWest) / (st.xPivot - st.xMin);
                    const tEast = (st.xPivot - step.xEast) / (st.xPivot - st.xMin);
                    const zSoffitWest = st.waistSlab3D.zWestBot + tWest * (st.waistSlab3D.zEastBot - st.waistSlab3D.zWestBot);
                    const zSoffitEast = st.waistSlab3D.zWestBot + tEast * (st.waistSlab3D.zEastBot - st.waistSlab3D.zWestBot);
                    const zMinStep = Math.min(zSoffitWest, zSoffitEast);
                    if (zSlice >= zMinStep && zSlice <= step.zTop) {
                        polygons2D.push(step.treadPolygon2D.map(p => [p[0], p[1]]));
                    }
                }
            });

            return {
                zSlice,
                polygons2D
            };
        },

        /**
         * Project the 3D Staircase onto the 2D Floor Plan for either 'ground' (Parter)
         * or 'first' (Piętro) using standard architectural 2D section conventions:
         * - Ground Floor ('ground'):
         *   * Shows the 4-step winder turn in the West bay (X = 15,175..16,175, Y = 8,360..9,640)
         *     and the lower straight steps (Steps 5..9) with SOLID lines below the diagonal cut line.
         *   * Clips Step 10 along the diagonal break line [[13690, 8360], [13420, 9370]].
         *   * Shows Steps 10..18 East of the diagonal cut line (passing overhead above the WC door D_GW7_2)
         *     with DASHED lines so the WC doorway and swing arc underneath remain clearly readable.
         * - Upper Floor ('first'):
         *   * Looking down into the stairwell from +3.33 m: all 17 treads and 18 risers are visible
         *     from above and rendered with SOLID lines, arriving at X = 11,665 mm.
         */
        projectStairTo2DPlan: function (stairOrId, options) {
            const opts = options || {};
            const floor = opts.floor || 'ground';
            const st = (stairOrId && stairOrId.steps3D) ? stairOrId : this.compileStair3D(stairOrId);

            // Diagonal cut line on Ground Floor: X(y) from (13690, 8360) to (13420, 9370)
            const cutP1 = st.planCutLine2D[0]; // [13690, 8360]
            const cutP2 = st.planCutLine2D[1]; // [13420, 9370]
            function cutXAtY(y) {
                const t = (y - cutP1[1]) / ((cutP2[1] - cutP1[1]) || 1);
                return cutP1[0] + t * (cutP2[0] - cutP1[0]);
            }

            const turnSteps = st.steps3D.filter(s => s.stepNumber <= 4);
            const straightSteps = st.steps3D.filter(s => s.stepNumber >= 5);

            const solidRisers2D = [];
            const dashedRisers2D = [];
            const solidTreads2D = [];
            const dashedTreads2D = [];

            // 1. Turn steps (1..4) are always below the cut plane -> solid on both floors
            turnSteps.forEach(s => {
                solidTreads2D.push({
                    stepNumber: s.stepNumber,
                    kind: s.kind,
                    zTop: s.zTop,
                    polygon2D: s.treadPolygon2D
                });
                solidRisers2D.push({
                    stepNumber: s.stepNumber,
                    p1: s.riserLine2D[0],
                    p2: s.riserLine2D[1]
                });
            });

            // 2. Straight steps (5..17) + Riser 18
            const allStraightRisersX = straightSteps.map(s => ({
                stepNumber: s.stepNumber,
                x: s.xWest,
                xEast: s.xEast,
                zTop: s.zTop,
                polygon2D: s.treadPolygon2D
            }));
            allStraightRisersX.push({
                stepNumber: st.topRiser3D.stepNumber,
                x: st.topRiser3D.x,
                xEast: st.topRiser3D.x,
                zTop: st.topRiser3D.zTop,
                polygon2D: null
            });

            const yN = st.yMin;   // 8360
            const yS = st.yPivot; // 9370
            const xCutNorth = cutXAtY(yN); // 13690
            const xCutSouth = cutXAtY(yS); // 13420

            allStraightRisersX.forEach(item => {
                const x = item.x;
                if (floor === 'first') {
                    solidRisers2D.push({ stepNumber: item.stepNumber, p1: [x, yN], p2: [x, yS] });
                    if (item.polygon2D) {
                        solidTreads2D.push({ stepNumber: item.stepNumber, kind: 'straight', zTop: item.zTop, polygon2D: item.polygon2D });
                    }
                    return;
                }

                // Ground floor: compare riser X against diagonal cut line [xCutNorth=13690 at yN .. xCutSouth=13420 at yS]
                if (x >= xCutNorth) {
                    // Completely West of (below) cut line -> solid
                    solidRisers2D.push({ stepNumber: item.stepNumber, p1: [x, yN], p2: [x, yS] });
                    if (item.polygon2D && item.xEast >= xCutSouth) {
                        solidTreads2D.push({ stepNumber: item.stepNumber, kind: 'straight', zTop: item.zTop, polygon2D: item.polygon2D });
                    }
                } else if (x <= xCutSouth) {
                    // Completely East of (above) cut line -> dashed
                    dashedRisers2D.push({ stepNumber: item.stepNumber, p1: [x, yN], p2: [x, yS] });
                    if (item.polygon2D) {
                        dashedTreads2D.push({ stepNumber: item.stepNumber, kind: 'straight', zTop: item.zTop, polygon2D: item.polygon2D });
                    }
                } else {
                    // Intersects diagonal cut line at yCross (e.g. Riser 10 at X = 13,555 crosses at Y = 8,865)
                    const tCross = (x - cutP1[0]) / ((cutP2[0] - cutP1[0]) || 1);
                    const yCross = Math.round(cutP1[1] + tCross * (cutP2[1] - cutP1[1]));
                    // North segment [yN .. yCross] is above cut line (dashed); South segment [yCross .. yS] is below cut line (solid)
                    dashedRisers2D.push({ stepNumber: item.stepNumber, p1: [x, yN], p2: [x, yCross] });
                    solidRisers2D.push({ stepNumber: item.stepNumber, p1: [x, yCross], p2: [x, yS] });
                }
            });

            // Polygon for the solid lower portion of the straight flight on Ground Floor (from X = 15,175 to the diagonal cut line)
            const groundSolidStraightPolygon2D = [
                [st.xPivot, yN],
                [xCutNorth, yN],
                [xCutSouth, yS],
                [st.xPivot, yS]
            ];
            // Polygon for the dashed upper portion of the straight flight on Ground Floor (from the diagonal cut line to X = 11,665)
            const groundDashedStraightPolygon2D = [
                [xCutNorth, yN],
                [st.xMin, yN],
                [st.xMin, yS],
                [xCutSouth, yS]
            ];

            const yCenter = Math.round((yN + yS) / 2); // 8865
            const xCutMid = Math.round(cutXAtY(yCenter)); // 13555
            const xTurnCenter = st.xTurnMid; // 15675

            return {
                stair3D: st,
                floor,
                footprint2D: st.footprint2D,
                turnBoxPolygon2D: [
                    [st.xPivot, st.yMax],
                    [st.xMax, st.yMax],
                    [st.xMax, st.yMin],
                    [st.xPivot, st.yMin]
                ],
                fullStraightPolygon2D: [
                    [st.xMin, yN],
                    [st.xPivot, yN],
                    [st.xPivot, yS],
                    [st.xMin, yS]
                ],
                groundSolidStraightPolygon2D,
                groundDashedStraightPolygon2D,
                cutLine2D: floor === 'ground' ? [cutP1, cutP2] : null,
                solidTreads2D,
                dashedTreads2D,
                solidRisers2D,
                dashedRisers2D,
                balustradeLoop2D: st.balustrade3D.planLoop2D,
                walkingLine: {
                    startCircle2D: [xTurnCenter, st.yMax],
                    solidPoints2D: floor === 'ground'
                        ? [[xTurnCenter, st.yMax], [xTurnCenter, yCenter], [xCutMid, yCenter]]
                        : [[xTurnCenter, st.yMax], [xTurnCenter, yCenter], [st.xMin, yCenter]],
                    dashedPoints2D: floor === 'ground'
                        ? [[xCutMid, yCenter], [st.xMin, yCenter]]
                        : [],
                    arrowTip2D: floor === 'ground'
                        ? [xCutMid, yCenter]
                        : [st.xMin, yCenter]
                },
                labels: {
                    cadSpec: st.cadSpecLabel,
                    balustrade: st.balustradeLabel,
                    specPos2D: [14450, yN + 250],
                    balustradePos2D: [13950, yS + 230]
                }
            };
        }
    };

    return WallService;
}));
