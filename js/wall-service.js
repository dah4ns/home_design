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
            require('./window-store.js')
        );
    } else {
        root.WallService = factory(
            root.DEFAULT_WALLS_DATA,
            root.BUILDING_VIEWS_DATA,
            root.WindowStore
        );
    }
}(typeof self !== 'undefined' ? self : this, function (wallsData, viewsData, WindowStore) {

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const VIEW_CAMERA_PRESETS = {
        north_facade: {
            viewId: 'north_facade',
            name: 'North Facade Elevation (Elewacja Północna)',
            lookDir: [0, 1, 0],      // Standing in North garden looking South (+Y)
            rightDir: [1, 0, 0],     // East (left, X=0) -> West (right, X=20730)
            upDir: [0, 0, 1],        // Vertical height Z
            role: 'exterior',
            svgScale: 0.1            // 10 mm = 1 SVG unit
        },
        south_facade: {
            viewId: 'south_facade',
            name: 'South Facade Elevation (Elewacja Południowa)',
            lookDir: [0, -1, 0],
            rightDir: [-1, 0, 0],
            upDir: [0, 0, 1],
            role: 'exterior',
            svgScale: 0.1
        },
        west_facade: {
            viewId: 'west_facade',
            name: 'West Facade Elevation (Elewacja Zachodnia)',
            lookDir: [-1, 0, 0],
            rightDir: [0, 1, 0],
            upDir: [0, 0, 1],
            role: 'exterior',
            svgScale: 0.1
        },
        east_facade: {
            viewId: 'east_facade',
            name: 'East Facade Elevation (Elewacja Wschodnia)',
            lookDir: [1, 0, 0],
            rightDir: [0, -1, 0],
            upDir: [0, 0, 1],
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
                facadeBounds: s.facadeBounds || null,
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
        // shift sideA along its outward normal so that the 3D B-Rep geometry matches rawWall.thickness.
        if (sideA && sideB && hasExplicitThickness && Math.abs(targetThicknessMm - geomThicknessMm) > 0.5) {
            const deltaMm = targetThicknessMm - geomThicknessMm;
            const shiftX = Math.round(deltaMm * sideA.normal[0] * 100) / 100;
            const shiftY = Math.round(deltaMm * sideA.normal[1] * 100) / 100;

            sideA.p1 = [sideA.p1[0] + shiftX, sideA.p1[1] + shiftY];
            sideA.p2 = [sideA.p2[0] + shiftX, sideA.p2[1] + shiftY];
            sideA.midpoint2D = [
                (sideA.p1[0] + sideA.p2[0]) / 2,
                (sideA.p1[1] + sideA.p2[1]) / 2
            ];
            sideA.outerLoop = sideA.outerLoop.map(pt => [pt[0] + shiftX, pt[1] + shiftY, pt[2]]);
            sideA.outerLoop3D = sideA.outerLoop;
            sideA.holes = sideA.holes.map(h => {
                const shiftedLoop = (h.loop || []).map(pt => [pt[0] + shiftX, pt[1] + shiftY, pt[2]]);
                return Object.assign({}, h, { loop: shiftedLoop, loop3D: shiftedLoop });
            });
            sideA.holes3D = sideA.holes;
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
         * Project all visible 3D wall faces onto an elevation view using dot(side.normal, view.lookDir) < 0,
         * sorted back-to-front by depth along lookDir, and generate each face's SVG <path fill-rule="evenodd">
         * from its 3D outerLoop + 3D window holes.
         */
        getVisibleFacesForView: function (viewIdOrConfig) {
            const preset = (typeof viewIdOrConfig === 'string')
                ? (VIEW_CAMERA_PRESETS[viewIdOrConfig] || VIEW_CAMERA_PRESETS.north_facade)
                : Object.assign({}, VIEW_CAMERA_PRESETS.north_facade, viewIdOrConfig || {});

            const lookDir = preset.lookDir || [0, 1, 0];
            const rightDir = preset.rightDir || [1, 0, 0];
            const roleFilter = preset.role || 'exterior';
            const scale = preset.svgScale || 0.1;

            const allWalls = this.getWalls();
            const visibleFaces = [];

            allWalls.forEach(wall => {
                wall.sides.forEach(side => {
                    if (roleFilter && side.role !== roleFilter) return;

                    const facingCos = dot3(side.normal, lookDir);
                    if (facingCos >= -1e-3) return;

                    if (preset.viewId === 'north_facade' && wall.id === 'EW_ALCOVE_NORTH') {
                        return;
                    }

                    const mid3D = [side.midpoint2D[0], side.midpoint2D[1], (side.zBottom + side.zTop) / 2];
                    const depthMm = dot3(mid3D, lookDir);

                    const u1 = dot3([side.p1[0], side.p1[1], 0], rightDir);
                    const u2 = dot3([side.p2[0], side.p2[1], 0], rightDir);
                    const rawXMinMm = Math.min(u1, u2);
                    const rawXMaxMm = Math.max(u1, u2);

                    const bounds = (preset.viewId === 'north_facade' && side.facadeBounds)
                        ? side.facadeBounds
                        : {
                            xMinMm: rawXMinMm,
                            xMaxMm: rawXMaxMm,
                            lengthMm: Math.round(rawXMaxMm - rawXMinMm),
                            svgGroupId: null
                        };

                    const svgX = bounds.xMinMm * scale;
                    const svgY = -side.zTop * scale;
                    const svgWidth = bounds.lengthMm * scale;
                    const svgHeight = (side.zTop - side.zBottom) * scale;

                    // Build 3D -> 2D SVG path with outerLoop and holes (for fill-rule="evenodd")
                    const facadeOuterLoop3D = (wall.floor === 'first' && Array.isArray(side.outerLoop3D) && side.outerLoop3D.length > 4)
                        ? side.outerLoop3D.map(pt => [
                            Math.max(bounds.xMinMm, Math.min(bounds.xMaxMm, pt[0])),
                            pt[1],
                            pt[2]
                        ])
                        : [
                            [bounds.xMinMm, side.p1[1], (wall.floor === 'ground' ? -20 : side.zBottom)],
                            [bounds.xMaxMm, side.p2[1], (wall.floor === 'ground' ? -20 : side.zBottom)],
                            [bounds.xMaxMm, side.p2[1], side.zTop],
                            [bounds.xMinMm, side.p1[1], side.zTop]
                        ];
                    const svgPathD = buildElevationSvgPathFromLoops(
                        facadeOuterLoop3D,
                        side.holes3D,
                        [1, 0, 0],
                        scale,
                        0
                    );

                    visibleFaces.push({
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
                        zBottom: side.zBottom,
                        zTop: side.zTop,
                        yBottom: side.zBottom,
                        yTop: side.zTop,
                        heightMm: side.heightMm,
                        xMinMm: bounds.xMinMm,
                        xMaxMm: bounds.xMaxMm,
                        lengthMm: bounds.lengthMm,
                        svgGroupId: bounds.svgGroupId || null,
                        svgRect: {
                            x: svgX,
                            y: svgY,
                            width: svgWidth,
                            height: svgHeight
                        },
                        svgPathD,
                        outerLoop: side.outerLoop3D,
                        outerLoop3D: side.outerLoop3D,
                        holes: side.holes3D,
                        holes3D: side.holes3D,
                        rooms: wall.rooms,
                        specs: wall.specs
                    });
                });
            });

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
            const upperLengthMm = upperFaces.reduce((sum, f) => sum + f.lengthMm, 0);

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
                upperLengthMm,
                upperBottomMm,
                upperTopMm,
                upperBreakdown: upperFaces.map(f => `${f.lengthMm.toLocaleString()} mm (${f.wallId})`).join(' + ')
            };
        },

        /**
         * Synchronize North Facade SVG wall bodies using the 3D B-Rep outerLoop + holes
         * (<path fill-rule="evenodd" d="M ... Z M ... Z">) so each wall on north_facade.html
         * is rendered directly with its 3D window holes cut out of the wall geometry.
         */
        syncNorthFacadeSVG: function (doc) {
            const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
            const faces = this.getVisibleFacesForView('north_facade');
            const specs = this.computeFacadeWallSpecs('north_facade');

            if (typeof WindowComponent !== 'undefined' && WindowComponent.FACADE_WALL_SPECS && WindowComponent.FACADE_WALL_SPECS.north_facade) {
                const nfSpec = WindowComponent.FACADE_WALL_SPECS.north_facade;
                nfSpec.lowerLengthMm = specs.lowerLengthMm;
                nfSpec.lowerBottomMm = specs.lowerBottomMm;
                nfSpec.lowerTopMm = specs.lowerTopMm;
                nfSpec.upperLengthMm = specs.upperLengthMm;
                nfSpec.upperBottomMm = specs.upperBottomMm;
                nfSpec.upperTopMm = specs.upperTopMm;
            }

            if (!targetDoc) return { faces, specs };

            faces.forEach(face => {
                if (!face.svgGroupId) return;
                const groupEl = targetDoc.getElementById(face.svgGroupId);
                if (!groupEl) return;

                groupEl.setAttribute('data-wall-id', face.wallId);
                groupEl.setAttribute('data-side-id', face.sideId);
                groupEl.setAttribute('data-normal', face.normal.join(','));
                groupEl.setAttribute('data-depth-y', String(face.depthMm));
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
            });

            return { faces, specs };
        }
    };

    return WallService;
}));
