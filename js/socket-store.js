/**
 * socket-store.js
 * Reactive data access layer for 2D Floor Plan Electrical Sockets ('sockets' entity type).
 * Backed by the abstract PersistenceService (js/persistence.js) and seeded from
 * explicit default definitions in `data/sockets.js` (DEFAULT_SOCKETS_DATA).
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(
            require('./persistence.js'),
            require('../data/sockets.js')
        );
    } else {
        root.SocketStore = factory(
            root.PersistenceService,
            root.DEFAULT_SOCKETS_DATA || root.BUILDING_SOCKETS_DATA
        );
    }
}(typeof self !== 'undefined' ? self : this, function (PersistenceService, initialSocketsData) {
    'use strict';

    const ENTITY_TYPE = 'sockets';
    const LEGACY_STORAGE_KEY = 'home_design_floor_objects_v1';

    const DEFAULT_CATALOG = (initialSocketsData && initialSocketsData.catalog) ? initialSocketsData.catalog : {
        socket_pe: {
            type: 'socket_pe',
            name: 'Gniazdo ze stykiem ochronnym',
            shortCode: 'G',
            color: '#ef4444',
            defaultHeightMm: 300,
            snapToWall: true,
            standard: 'PN-EN 60617 / ProfiCAD 528'
        },
        socket_pe_shutter: {
            type: 'socket_pe_shutter',
            name: 'Gniazdo z klapką (IP44 ze stykiem ochronnym i zaślepką)',
            shortCode: 'GZ',
            color: '#0ea5e9',
            defaultHeightMm: 300,
            snapToWall: true,
            standard: 'PN-EN 60617 / ProfiCAD 1589 (IP44 Covered)'
        },
        socket_floor: {
            type: 'socket_floor',
            name: 'Gniazdo podłogowe',
            shortCode: 'GP',
            color: '#f59e0b',
            defaultHeightMm: 0,
            snapToWall: false,
            standard: 'PN-EN 60617 Floor Box'
        }
    };

    const DEFAULT_SOCKETS = Array.isArray(initialSocketsData && (initialSocketsData.defaultSockets || initialSocketsData.sockets))
        ? (initialSocketsData.defaultSockets || initialSocketsData.sockets)
        : [];

    function normalizeSocketItem(item) {
        if (!item || typeof item !== 'object') return null;
        const copy = { ...item };

        // Migrate legacy socket type identifiers if present
        if (copy.type === 'socket_1' || copy.type === 'socket_2') {
            copy.type = 'socket_pe';
        } else if (copy.type === 'socket_ip44') {
            copy.type = 'socket_pe_shutter';
        } else if (copy.type === 'floor_box') {
            copy.type = 'socket_floor';
        }

        if (typeof copy.id !== 'string' || !copy.id) return null;
        if (copy.floor !== 'ground' && copy.floor !== 'first') return null;
        if (!DEFAULT_CATALOG[copy.type]) return null;

        copy.x = Number(copy.x);
        copy.z = Number(copy.z);
        if (!Number.isFinite(copy.x) || !Number.isFinite(copy.z)) return null;

        const def = DEFAULT_CATALOG[copy.type];
        copy.heightMm = Number.isFinite(Number(copy.heightMm)) ? Number(copy.heightMm) : def.defaultHeightMm;
        copy.rotation = Number.isFinite(Number(copy.rotation)) ? ((Number(copy.rotation) % 360) + 360) % 360 : 0;
        copy.count = Math.max(1, Math.min(6, Math.round(Number(copy.count) || 1)));
        copy.label = typeof copy.label === 'string' ? copy.label : '';
        copy.snappedToWall = Boolean(copy.snappedToWall);
        return copy;
    }

    if (!PersistenceService) {
        throw new Error('SocketStore requires PersistenceService (js/persistence.js) to be loaded first.');
    }

    PersistenceService.registerType(ENTITY_TYPE, {
        collectionKind: 'list',
        defaults: DEFAULT_SOCKETS,
        filePath: 'data/sockets.js',
        legacyStorageKey: LEGACY_STORAGE_KEY,
        normalizeItem: normalizeSocketItem,
        metadata: (initialSocketsData && initialSocketsData.metadata) || {
            isDefaultSeed: false,
            entityType: ENTITY_TYPE
        }
    });

    function _nextSequenceNumber() {
        const all = PersistenceService.getAll(ENTITY_TYPE) || [];
        let maxSeq = all.length;
        all.forEach(item => {
            if (item && typeof item.id === 'string') {
                const m = item.id.match(/^obj_(\d+)_/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n > maxSeq) maxSeq = n;
                }
            }
        });
        return maxSeq + 1;
    }

    function round1(v) {
        return Math.round(Number(v) * 10) / 10;
    }

    /**
     * Build a 6-face 3D axis-aligned or local-frame box part.
     */
    function buildLocalBoxPart(partId, partName, role, colorRgb, pt3DFn, u0, u1, v0, v1, d0, d1, U, V, N, extraWireframe) {
        const p000 = pt3DFn(u0, v0, d0);
        const p100 = pt3DFn(u1, v0, d0);
        const p110 = pt3DFn(u1, v1, d0);
        const p010 = pt3DFn(u0, v1, d0);

        const p001 = pt3DFn(u0, v0, d1);
        const p101 = pt3DFn(u1, v0, d1);
        const p111 = pt3DFn(u1, v1, d1);
        const p011 = pt3DFn(u0, v1, d1);

        const allPts = [p000, p100, p110, p010, p001, p101, p111, p011];
        const xs = allPts.map(p => p[0]);
        const ys = allPts.map(p => p[1]);
        const zs = allPts.map(p => p[2]);

        const faces3D = [
            // Front face (+N)
            { loop3D: [p001, p101, p111, p011], normal: [N[0], N[1], N[2]], noWireframe: false },
            // Back face (-N)
            { loop3D: [p100, p000, p010, p110], normal: [-N[0], -N[1], -N[2]], noWireframe: true },
            // Top face (+V)
            { loop3D: [p011, p111, p110, p010], normal: [V[0], V[1], V[2]], noWireframe: true },
            // Bottom face (-V)
            { loop3D: [p000, p100, p101, p001], normal: [-V[0], -V[1], -V[2]], noWireframe: true },
            // Right face (+U)
            { loop3D: [p101, p100, p110, p111], normal: [U[0], U[1], U[2]], noWireframe: true },
            // Left face (-U)
            { loop3D: [p000, p001, p011, p010], normal: [-U[0], -U[1], -U[2]], noWireframe: true }
        ];

        return {
            id: partId,
            name: partName,
            role: role,
            colorRgb: colorRgb,
            x0: round1(Math.min(...xs)),
            x1: round1(Math.max(...xs)),
            y0: round1(Math.min(...ys)),
            y1: round1(Math.max(...ys)),
            z0: round1(Math.min(...zs)),
            z1: round1(Math.max(...zs)),
            faces3D: faces3D,
            wireframeLines3D: extraWireframe || []
        };
    }

    /**
     * Compile a single cluster of 1..N sockets into a 3D multi-gang frame B-Rep object
     * matching Polish/French Type E standard (white beveled outer frame, 56x56mm inner square
     * insert per gang, Ø42mm recessed circular well, 2 dark phase/neutral holes, central screw,
     * and protruding 3D metallic grounding pin 'bolec').
     */
    function compileSocketClusterTo3D(cluster, clusterIdx) {
        const primary = cluster[0];
        const floor = primary.floor === 'first' ? 'first' : 'ground';
        const zFloor = (floor === 'first') ? 3330 : 0;
        const isFloorSocket = (primary.type === 'socket_floor');

        // Expand individual socket items into gangs (e.g. a socket with count=2 contributes 2 gangs)
        const gangs = [];
        cluster.forEach(sock => {
            const cnt = Math.max(1, Math.min(6, Math.round(Number(sock.count) || 1)));
            for (let i = 0; i < cnt; i++) {
                if (gangs.length < 6) {
                    gangs.push({
                        socketId: sock.id,
                        type: sock.type,
                        label: sock.label || ''
                    });
                }
            }
        });
        const totalGangs = Math.max(1, gangs.length);

        // Average world center (x, y) in canonical mm (note: 2D floor_plan `z` is 3D `y`)
        let sumX = 0;
        let sumY = 0;
        cluster.forEach(s => {
            sumX += Number(s.x) || 0;
            sumY += Number(s.z) || 0;
        });
        let cx = round1(sumX / cluster.length);
        let cy = round1(sumY / cluster.length);
        const heightMm = isFloorSocket ? 0 : (Number.isFinite(Number(primary.heightMm)) ? Number(primary.heightMm) : 300);
        const cz = round1(zFloor + heightMm);

        // Determine local orthonormal basis (U = horizontal right along wall, V = vertical up, N = outward normal into room)
        const rot = (((Math.round((Number(primary.rotation) || 0) / 90) * 90) % 360) + 360) % 360;
        let U, V, N;
        if (isFloorSocket) {
            N = [0, 0, 1];
            if (rot === 90) {
                U = [0, -1, 0]; V = [-1, 0, 0];
            } else if (rot === 180) {
                U = [-1, 0, 0]; V = [0, -1, 0];
            } else if (rot === 270) {
                U = [0, 1, 0]; V = [1, 0, 0];
            } else {
                U = [1, 0, 0]; V = [0, -1, 0];
            }
        } else {
            V = [0, 0, 1];
            if (rot === 90) {
                // Faces East (-X)
                N = [-1, 0, 0];
                U = [0, -1, 0];
            } else if (rot === 180) {
                // Faces South (+Y)
                N = [0, 1, 0];
                U = [-1, 0, 0];
            } else if (rot === 270) {
                // Faces West (+X)
                N = [1, 0, 0];
                U = [0, 1, 0];
            } else {
                // rot === 0: Faces North (-Y)
                N = [0, -1, 0];
                U = [1, 0, 0];
            }

            // Ensure wall-mounted sockets sit on the 2 cm plaster surface if mounted on a plastered wall side
            const ws = (typeof self !== 'undefined' && self.WallService) ? self.WallService : (typeof global !== 'undefined' && global.WallService ? global.WallService : null);
            if (ws && typeof ws.getWalls === 'function') {
                const floorWalls = ws.getWalls({ floor });
                for (let wi = 0; wi < floorWalls.length; wi++) {
                    const w = floorWalls[wi];
                    const sides = [w.sideA, w.sideB];
                    for (let si = 0; si < sides.length; si++) {
                        const side = sides[si];
                        if (!side || !(side.plasterThicknessMm > 0) || !side.plasterP1 || !side.plasterP2 || !side.normal) continue;
                        if (Math.abs(side.normal[0] - N[0]) > 0.1 || Math.abs(side.normal[1] - N[1]) > 0.1) continue;
                        if (w.axis === 'vertical') {
                            const minY = Math.min(side.p1[1], side.p2[1]) - 25;
                            const maxY = Math.max(side.p1[1], side.p2[1]) + 25;
                            if (cy >= minY && cy <= maxY && (Math.abs(cx - side.p1[0]) <= 30 || Math.abs(cx - side.plasterP1[0]) <= 15)) {
                                cx = round1(side.plasterP1[0]);
                            }
                        } else if (w.axis === 'horizontal') {
                            const minX = Math.min(side.p1[0], side.p2[0]) - 25;
                            const maxX = Math.max(side.p1[0], side.p2[0]) + 25;
                            if (cx >= minX && cx <= maxX && (Math.abs(cy - side.p1[1]) <= 30 || Math.abs(cy - side.plasterP1[1]) <= 15)) {
                                cy = round1(side.plasterP1[1]);
                            }
                        }
                    }
                }
            }
        }

        function pt3D(u, v, d) {
            return [
                round1(cx + u * U[0] + v * V[0] + d * N[0]),
                round1(cy + u * U[1] + v * V[1] + d * N[1]),
                round1(cz + u * U[2] + v * V[2] + d * N[2])
            ];
        }

        // Standard multi-gang frame dimensions (in mm):
        // Single frame = 86 x 86 mm; each additional gang adds 71 mm center-to-center pitch
        const pitchMm = 71;
        const frameW = 86 + (totalGangs - 1) * pitchMm;
        const frameH = 86;
        const halfW = frameW / 2;
        const halfH = frameH / 2;

        // Keep back plane 1.5 mm proud of wall/floor surface (or 5 mm glass backsplash on GW_3 / EW_NORTH_RECESSED) to prevent Z-fighting
        const onKitchenWestBacksplash = (!isFloorSocket && rot === 90 && (Math.abs(cx - 11895) <= 25 || Math.abs(cx - 11915) <= 25) && cy >= 3170 && cy <= 6170 && cz >= 900 && cz <= 1500);
        const onKitchenNorthBacksplash = (!isFloorSocket && rot === 180 && (Math.abs(cy - 3190) <= 25 || Math.abs(cy - 3170) <= 25) && cx >= 8315 && cx <= 11915 && cz >= 900 && cz <= 1500);
        const glassOff = (onKitchenWestBacksplash || onKitchenNorthBacksplash) ? 5.0 : 0.0;
        const dWall = 1.5 + glassOff;
        const dFrameFront = 10.5 + glassOff;
        const dInsertFront = 11.2 + glassOff;
        const dWellBottom = 4.2 + glassOff;

        const skeletonParts3D = [];
        const frontParts3D = [];

        const bundleId = cluster.length === 1
            ? ('SOCKET_' + primary.id)
            : ('SOCKET_BUNDLE_' + (clusterIdx + 1) + '_' + primary.id);

        // ---------------------------------------------------------------------
        // 1. OUTER BEVELED MULTI-GANG FRAME (White Polycarbonate or Brushed Floor Box)
        // ---------------------------------------------------------------------
        const frameColor = isFloorSocket ? [0.76, 0.78, 0.81] : [0.96, 0.965, 0.975];
        const bevelInset = 3.5;
        const b00 = pt3D(-halfW, -halfH, dWall);
        const b10 = pt3D(halfW, -halfH, dWall);
        const b11 = pt3D(halfW, halfH, dWall);
        const b01 = pt3D(-halfW, halfH, dWall);

        const f00 = pt3D(-halfW + bevelInset, -halfH + bevelInset, dFrameFront);
        const f10 = pt3D(halfW - bevelInset, -halfH + bevelInset, dFrameFront);
        const f11 = pt3D(halfW - bevelInset, halfH - bevelInset, dFrameFront);
        const f01 = pt3D(-halfW + bevelInset, halfH - bevelInset, dFrameFront);

        const frameFaces = [
            // Front face of outer frame
            { loop3D: [f00, f10, f11, f01], normal: N, noWireframe: false },
            // 4 beveled perimeter rims
            { loop3D: [b01, b11, f11, f01], normal: V, noWireframe: false },
            { loop3D: [b00, f00, f10, b10], normal: [-V[0], -V[1], -V[2]], noWireframe: false },
            { loop3D: [b10, f10, f11, b11], normal: U, noWireframe: false },
            { loop3D: [b00, b01, f01, f00], normal: [-U[0], -U[1], -U[2]], noWireframe: false }
        ];

        const framePts = [b00, b10, b11, b01, f00, f10, f11, f01];
        skeletonParts3D.push({
            id: bundleId + '_FRAME',
            name: `${totalGangs}-Gang Beveled Outer Frame (${frameW}×${frameH}×10 mm)`,
            role: isFloorSocket ? 'sink_basin' : 'socket_frame',
            colorRgb: frameColor,
            x0: round1(Math.min(...framePts.map(p => p[0]))),
            x1: round1(Math.max(...framePts.map(p => p[0]))),
            y0: round1(Math.min(...framePts.map(p => p[1]))),
            y1: round1(Math.max(...framePts.map(p => p[1]))),
            z0: round1(Math.min(...framePts.map(p => p[2]))),
            z1: round1(Math.max(...framePts.map(p => p[2]))),
            faces3D: frameFaces,
            wireframeLines3D: [
                [b00, b10, b11, b01, b00],
                [f00, f10, f11, f01, f00]
            ]
        });

        // ---------------------------------------------------------------------
        // 2. INDIVIDUAL SOCKET GANGS (56x56mm Square Insert + Ø42mm Circular Well + Pins + Grounding Bolec)
        // ---------------------------------------------------------------------
        const insertHalf = 28; // 56 x 56 mm square center plate per gang
        const wellRadius = 21; // Ø 42 mm circular socket recess
        const wellSegs = 16;

        for (let g = 0; g < totalGangs; g++) {
            const uCenter = (g - (totalGangs - 1) / 2) * pitchMm;
            const gangSpec = gangs[g];
            const isShutter = (gangSpec.type === 'socket_pe_shutter');

            // 2A. 56x56 mm Square Insert Plate Rim around the Ø 42 mm Circular Well
            // Divided into 4 corner/edge sectors between the 56x56 square perimeter and the Ø42 circle
            // so the recessed circular well is a true 3D cylindrical depression!
            const sqCorners = [
                [uCenter + insertHalf, insertHalf],   // Q0: top-right (+u, +v)
                [uCenter - insertHalf, insertHalf],   // Q1: top-left (-u, +v)
                [uCenter - insertHalf, -insertHalf],  // Q2: bottom-left (-u, -v)
                [uCenter + insertHalf, -insertHalf]   // Q3: bottom-right (+u, -v)
            ];

            const rimCircleFront = [];
            const wellCircleBottom = [];
            for (let s = 0; s < wellSegs; s++) {
                const ang = (s / wellSegs) * Math.PI * 2;
                const cu = uCenter + Math.cos(ang) * wellRadius;
                const cv = Math.sin(ang) * wellRadius;
                rimCircleFront.push(pt3D(cu, cv, dInsertFront));
                wellCircleBottom.push(pt3D(cu, cv, dWellBottom));
            }

            const plateFaces = [];
            const segsPerQuad = wellSegs / 4; // 4 segments per quadrant
            for (let q = 0; q < 4; q++) {
                const cCurr = pt3D(sqCorners[q][0], sqCorners[q][1], dInsertFront);
                const cNext = pt3D(sqCorners[(q + 1) % 4][0], sqCorners[(q + 1) % 4][1], dInsertFront);
                const startIdx = q * segsPerQuad;
                for (let k = 0; k < segsPerQuad; k++) {
                    const pA = rimCircleFront[(startIdx + k) % wellSegs];
                    const pB = rimCircleFront[(startIdx + k + 1) % wellSegs];
                    plateFaces.push({
                        loop3D: [cCurr, pB, pA],
                        normal: N,
                        noWireframe: true
                    });
                }
                // Bridge triangle between adjacent square corners and quadrant boundary point
                const pMid = rimCircleFront[((q + 1) * segsPerQuad) % wellSegs];
                plateFaces.push({
                    loop3D: [cCurr, cNext, pMid],
                    normal: N,
                    noWireframe: true
                });
            }

            const sq00 = pt3D(uCenter - insertHalf, -insertHalf, dInsertFront);
            const sq10 = pt3D(uCenter + insertHalf, -insertHalf, dInsertFront);
            const sq11 = pt3D(uCenter + insertHalf, insertHalf, dInsertFront);
            const sq01 = pt3D(uCenter - insertHalf, insertHalf, dInsertFront);

            // Thin step walls from outer frame face (dFrameFront) to square insert face (dInsertFront)
            const sqB00 = pt3D(uCenter - insertHalf, -insertHalf, dFrameFront);
            const sqB10 = pt3D(uCenter + insertHalf, -insertHalf, dFrameFront);
            const sqB11 = pt3D(uCenter + insertHalf, insertHalf, dFrameFront);
            const sqB01 = pt3D(uCenter - insertHalf, insertHalf, dFrameFront);
            plateFaces.push(
                { loop3D: [sqB01, sqB11, sq11, sq01], normal: V, noWireframe: true },
                { loop3D: [sqB00, sq00, sq10, sqB10], normal: [-V[0], -V[1], -V[2]], noWireframe: true },
                { loop3D: [sqB10, sq10, sq11, sqB11], normal: U, noWireframe: true },
                { loop3D: [sqB00, sqB01, sq01, sq00], normal: [-U[0], -U[1], -U[2]], noWireframe: true }
            );

            const closedRimLoop = rimCircleFront.concat([rimCircleFront[0]]);
            const sqPts = [sq00, sq10, sq11, sq01, sqB00, sqB10, sqB11, sqB01];
            skeletonParts3D.push({
                id: `${bundleId}_GANG_${g + 1}_PLATE`,
                name: `Gang #${g + 1} Square Socket Insert (56×56 mm${isShutter ? ', IP44 Shutter' : ''})`,
                role: 'socket_insert',
                colorRgb: isFloorSocket ? [0.82, 0.84, 0.87] : [0.975, 0.98, 0.99],
                x0: round1(Math.min(...sqPts.map(p => p[0]))),
                x1: round1(Math.max(...sqPts.map(p => p[0]))),
                y0: round1(Math.min(...sqPts.map(p => p[1]))),
                y1: round1(Math.max(...sqPts.map(p => p[1]))),
                z0: round1(Math.min(...sqPts.map(p => p[2]))),
                z1: round1(Math.max(...sqPts.map(p => p[2]))),
                faces3D: plateFaces,
                wireframeLines3D: [
                    [sq00, sq10, sq11, sq01, sq00],
                    closedRimLoop
                ]
            });

            // 2B. Recessed Circular Socket Cavity (Ø 42 mm cylinder wall + recessed bottom face)
            const wellWallFaces = [];
            for (let s = 0; s < wellSegs; s++) {
                const nextS = (s + 1) % wellSegs;
                const angMid = ((s + 0.5) / wellSegs) * Math.PI * 2;
                const inNorm = [
                    round1(-Math.cos(angMid) * U[0] - Math.sin(angMid) * V[0]),
                    round1(-Math.cos(angMid) * U[1] - Math.sin(angMid) * V[1]),
                    round1(-Math.cos(angMid) * U[2] - Math.sin(angMid) * V[2])
                ];
                wellWallFaces.push({
                    loop3D: [
                        rimCircleFront[s],
                        rimCircleFront[nextS],
                        wellCircleBottom[nextS],
                        wellCircleBottom[s]
                    ],
                    normal: inNorm,
                    noWireframe: true
                });
            }
            // Recessed circular bottom disk at d = dWellBottom
            wellWallFaces.push({
                loop3D: wellCircleBottom,
                normal: N,
                noWireframe: true
            });

            const wellPts = rimCircleFront.concat(wellCircleBottom);
            skeletonParts3D.push({
                id: `${bundleId}_GANG_${g + 1}_WELL`,
                name: `Gang #${g + 1} Recessed Circular Cavity (Ø42 mm, 7 mm deep)`,
                role: 'socket_well',
                colorRgb: [0.89, 0.905, 0.925],
                x0: round1(Math.min(...wellPts.map(p => p[0]))),
                x1: round1(Math.max(...wellPts.map(p => p[0]))),
                y0: round1(Math.min(...wellPts.map(p => p[1]))),
                y1: round1(Math.max(...wellPts.map(p => p[1]))),
                z0: round1(Math.min(...wellPts.map(p => p[2]))),
                z1: round1(Math.max(...wellPts.map(p => p[2]))),
                faces3D: wellWallFaces,
                wireframeLines3D: [
                    wellCircleBottom.concat([wellCircleBottom[0]])
                ]
            });

            // 2C. Two Dark Circular Power Pin Holes (L & N at ±9.5 mm) + Central Screw
            const holeFaces = [];
            const holeRadius = 2.7;
            const holeSegs = 8;
            [-9.5, 9.5].forEach(du => {
                const holeLoop = [];
                for (let hs = 0; hs < holeSegs; hs++) {
                    const ang = (hs / holeSegs) * Math.PI * 2;
                    holeLoop.push(pt3D(
                        uCenter + du + Math.cos(ang) * holeRadius,
                        Math.sin(ang) * holeRadius,
                        dWellBottom + 0.35
                    ));
                }
                holeFaces.push({
                    loop3D: holeLoop,
                    normal: N,
                    noWireframe: true
                });
            });

            skeletonParts3D.push({
                id: `${bundleId}_GANG_${g + 1}_HOLES`,
                name: `Gang #${g + 1} Phase (L) & Neutral (N) Pin Apertures (2× Ø5.4 mm)`,
                role: 'handle_bar',
                colorRgb: [0.11, 0.13, 0.16],
                x0: round1(cx - 14),
                x1: round1(cx + 14),
                y0: round1(cy - 14),
                y1: round1(cy + 14),
                z0: round1(cz - 6),
                z1: round1(cz + 6),
                faces3D: holeFaces,
                wireframeLines3D: []
            });

            // 2D. Protruding 3D Metallic Grounding Pin ('bolec uziemiający PE' at v = +10 mm) + Central Mounting Screw
            const metalFaces = [];
            const pinU = uCenter;
            const pinV = 10.0;
            const pinR = 2.2;
            const pinSegs = 8;
            const pinBaseLoop = [];
            const pinTopLoop = [];
            for (let ps = 0; ps < pinSegs; ps++) {
                const ang = (ps / pinSegs) * Math.PI * 2;
                const pu = pinU + Math.cos(ang) * pinR;
                const pv = pinV + Math.sin(ang) * pinR;
                pinBaseLoop.push(pt3D(pu, pv, dWellBottom + 0.2));
                pinTopLoop.push(pt3D(pu, pv, dInsertFront + 1.6));
            }
            for (let ps = 0; ps < pinSegs; ps++) {
                const nextPs = (ps + 1) % pinSegs;
                const angMid = ((ps + 0.5) / pinSegs) * Math.PI * 2;
                const outNorm = [
                    round1(Math.cos(angMid) * U[0] + Math.sin(angMid) * V[0]),
                    round1(Math.cos(angMid) * U[1] + Math.sin(angMid) * V[1]),
                    round1(Math.cos(angMid) * U[2] + Math.sin(angMid) * V[2])
                ];
                metalFaces.push({
                    loop3D: [pinBaseLoop[ps], pinBaseLoop[nextPs], pinTopLoop[nextPs], pinTopLoop[ps]],
                    normal: outNorm,
                    noWireframe: true
                });
            }
            // Tip cap of the grounding pin
            metalFaces.push({
                loop3D: pinTopLoop,
                normal: N,
                noWireframe: true
            });

            // Central mounting screw disc at (uCenter, -1.5 mm)
            const screwLoop = [];
            const screwR = 1.9;
            for (let ss = 0; ss < pinSegs; ss++) {
                const ang = (ss / pinSegs) * Math.PI * 2;
                screwLoop.push(pt3D(
                    uCenter + Math.cos(ang) * screwR,
                    -1.5 + Math.sin(ang) * screwR,
                    dWellBottom + 0.35
                ));
            }
            metalFaces.push({
                loop3D: screwLoop,
                normal: N,
                noWireframe: true
            });

            const pinPts = pinBaseLoop.concat(pinTopLoop);
            skeletonParts3D.push({
                id: `${bundleId}_GANG_${g + 1}_PIN_PE`,
                name: `Gang #${g + 1} Protruding 3D Grounding Pin (Bolec PE Ø4.4 mm) & Center Screw`,
                role: 'sink_faucet',
                colorRgb: [0.74, 0.77, 0.81],
                x0: round1(Math.min(...pinPts.map(p => p[0]))),
                x1: round1(Math.max(...pinPts.map(p => p[0]))),
                y0: round1(Math.min(...pinPts.map(p => p[1]))),
                y1: round1(Math.max(...pinPts.map(p => p[1]))),
                z0: round1(Math.min(...pinPts.map(p => p[2]))),
                z1: round1(Math.max(...pinPts.map(p => p[2]))),
                faces3D: metalFaces,
                wireframeLines3D: []
            });

            // 2E. Distinct 3D Hinged Protective Cover Flap (Klapka bryzgoszczelna IP44) for `socket_pe_shutter` (GZ)
            if (isShutter) {
                // 1) Top Horizontal Hinge Barrel (Zawias górny klapki IP44) on skeletonParts3D
                skeletonParts3D.push(
                    buildLocalBoxPart(
                        `${bundleId}_GANG_${g + 1}_SHUTTER_HINGE`,
                        `Gang #${g + 1} IP44 Cover Top Hinge Knuckle (52×7×7 mm)`,
                        'socket_shutter',
                        [0.20, 0.32, 0.44],
                        pt3D,
                        uCenter - 26, uCenter + 26,
                        22, 28.5,
                        dFrameFront, dInsertFront + 6.8,
                        U, V, N
                    )
                );

                // 2) Sculpted 3D Hinged Cover Lid (Klapka ochronna IP44) covering the socket opening (in frontParts3D)
                const lidU0 = uCenter - 26, lidU1 = uCenter + 26;
                const lidV0 = -25, lidV1 = 23;
                const lidBackD = dInsertFront + 0.4;
                const lidFrontD = dInsertFront + 6.5;
                const lidBevel = 3.0;

                const lb00 = pt3D(lidU0, lidV0, lidBackD);
                const lb10 = pt3D(lidU1, lidV0, lidBackD);
                const lb11 = pt3D(lidU1, lidV1, lidBackD);
                const lb01 = pt3D(lidU0, lidV1, lidBackD);

                const lf00 = pt3D(lidU0 + lidBevel, lidV0 + lidBevel, lidFrontD);
                const lf10 = pt3D(lidU1 - lidBevel, lidV0 + lidBevel, lidFrontD);
                const lf11 = pt3D(lidU1 - lidBevel, lidV1 - lidBevel, lidFrontD);
                const lf01 = pt3D(lidU0 + lidBevel, lidV1 - lidBevel, lidFrontD);

                // Embossed circular contour on the front of the IP44 protective flap
                const lidCircleWire = [];
                const lidRingR = 16.5;
                for (let ls = 0; ls <= 16; ls++) {
                    const ang = (ls / 16) * Math.PI * 2;
                    lidCircleWire.push(pt3D(
                        uCenter + Math.cos(ang) * lidRingR,
                        -1 + Math.sin(ang) * lidRingR,
                        lidFrontD + 0.15
                    ));
                }

                const lidPts = [lb00, lb10, lb11, lb01, lf00, lf10, lf11, lf01];
                frontParts3D.push({
                    id: `${bundleId}_GANG_${g + 1}_COVER_LID`,
                    name: `Gang #${g + 1} Hinged IP44 Splash-Proof Cover Flap (Klapka ochronna 52×48×6 mm)`,
                    role: 'socket_cover',
                    colorRgb: [0.32, 0.60, 0.82],
                    x0: round1(Math.min(...lidPts.map(p => p[0]))),
                    x1: round1(Math.max(...lidPts.map(p => p[0]))),
                    y0: round1(Math.min(...lidPts.map(p => p[1]))),
                    y1: round1(Math.max(...lidPts.map(p => p[1]))),
                    z0: round1(Math.min(...lidPts.map(p => p[2]))),
                    z1: round1(Math.max(...lidPts.map(p => p[2]))),
                    faces3D: [
                        { loop3D: [lf00, lf10, lf11, lf01], normal: N, noWireframe: false },
                        { loop3D: [lb01, lb11, lf11, lf01], normal: V, noWireframe: false },
                        { loop3D: [lb00, lf00, lf10, lb10], normal: [-V[0], -V[1], -V[2]], noWireframe: false },
                        { loop3D: [lb10, lf10, lf11, lb11], normal: U, noWireframe: false },
                        { loop3D: [lb00, lb01, lf01, lf00], normal: [-U[0], -U[1], -U[2]], noWireframe: false }
                    ],
                    wireframeLines3D: [
                        [lb00, lb10, lb11, lb01, lb00],
                        [lf00, lf10, lf11, lf01, lf00],
                        lidCircleWire
                    ]
                });

                // 3) Protruding Bottom Finger-Lift Lip / Handle (Uchwyt do otwierania klapki)
                frontParts3D.push(
                    buildLocalBoxPart(
                        `${bundleId}_GANG_${g + 1}_COVER_HANDLE`,
                        `Gang #${g + 1} Cover Finger-Lift Tab (Uchwyt klapki 28×4.5×9.5 mm)`,
                        'socket_cover_handle',
                        [0.18, 0.38, 0.56],
                        pt3D,
                        uCenter - 14, uCenter + 14,
                        -28.5, -24.0,
                        dInsertFront + 2.5, dInsertFront + 9.8,
                        U, V, N
                    )
                );
            }
        }

        // Compute overall 3D bounding box of the compiled multi-gang frame (including any protruding cover lids)
        const combinedParts = skeletonParts3D.concat(frontParts3D);
        const allPartX0 = combinedParts.map(p => p.x0);
        const allPartX1 = combinedParts.map(p => p.x1);
        const allPartY0 = combinedParts.map(p => p.y0);
        const allPartY1 = combinedParts.map(p => p.y1);
        const allPartZ0 = combinedParts.map(p => p.z0);
        const allPartZ1 = combinedParts.map(p => p.z1);

        const xMin = round1(Math.min(...allPartX0));
        const xMax = round1(Math.max(...allPartX1));
        const yMin = round1(Math.min(...allPartY0));
        const yMax = round1(Math.max(...allPartY1));
        const zBottom = round1(Math.min(...allPartZ0));
        const zTop = round1(Math.max(...allPartZ1));

        const labelsList = cluster.map(s => s.label || s.id).filter(Boolean);
        const labelSummary = labelsList.join(' + ');
        const catDef = DEFAULT_CATALOG[primary.type] || DEFAULT_CATALOG.socket_pe;
        const hasAnyShutter = gangs.some(g => g.type === 'socket_pe_shutter');

        return {
            id: bundleId,
            socketId: primary.id,
            memberIds: cluster.map(s => s.id),
            name: totalGangs > 1
                ? `${totalGangs}× ${catDef.name} (${labelSummary}) — ${totalGangs}-Gang Frame`
                : `${catDef.name} (${labelSummary})`,
            shortName: totalGangs > 1
                ? `⚡ ${totalGangs}× Socket Frame (${labelSummary})`
                : `⚡ Socket ${labelSummary} (${catDef.shortCode})`,
            category: 'electrical_socket',
            subtype: primary.type,
            isElectricalSocket: true,
            isSocketBundle: true,
            isRoomFurniture: true,
            floor: floor,
            room: floor === 'first' ? 'Piętro (Upper Floor)' : 'Parter (Ground Floor)',
            hostWallId: isFloorSocket ? 'FLOOR_BOX' : (`WALL_${rot}DEG`),
            count: totalGangs,
            gangCount: totalGangs,
            heightMm: frameH,
            mountHeightMm: heightMm,
            centerHeightMm: heightMm,
            widthMm: frameW,
            depthMm: hasAnyShutter ? 21 : 12,
            plinthHeightMm: 0,
            bodyHeightMm: frameH,
            carcassDepthMm: 12,
            boardThicknessMm: 10,
            frontThicknessMm: hasAnyShutter ? 9 : 2,
            rotation: rot,
            normal: N,
            center3D: [cx, cy, cz],
            gangCenters3D: gangs.map((gInfo, gIdx) => {
                const uOff = (gIdx - (totalGangs - 1) / 2) * pitchMm;
                const cPt = pt3D(uOff, 0, 0);
                return {
                    gangIndex: gIdx,
                    socketId: gInfo.socketId,
                    type: gInfo.type,
                    label: gInfo.label ? (totalGangs > 1 ? `${gInfo.label} [${gIdx + 1}/${totalGangs}]` : gInfo.label) : `Socket #${gIdx + 1}`,
                    center3D: cPt,
                    centerHeightMm: heightMm
                };
            }),
            xMin,
            xMax,
            yMin,
            yMax,
            zBottom,
            zTop,
            footprint2D: [
                [xMin, yMin],
                [xMax, yMin],
                [xMax, yMax],
                [xMin, yMax]
            ],
            cornerVertices3D: [b00, b10, b11, b01, f00, f10, f11, f01],
            skeletonParts3D,
            frontParts3D
        };
    }

    const SocketStore = {
        /**
         * Return a copy of the socket type catalog (`socket_pe`, `socket_pe_shutter`, `socket_floor`)
         * @returns {object}
         */
        getCatalog: function () {
            return JSON.parse(JSON.stringify(DEFAULT_CATALOG));
        },

        /**
         * Return canonical default sockets from `data/sockets.js`
         * @returns {Array<object>}
         */
        getDefaults: function () {
            return PersistenceService.getDefaults(ENTITY_TYPE) || [];
        },

        /**
         * Get all active (persisted) sockets across all floors
         * @returns {Array<object>}
         */
        getAll: function () {
            return PersistenceService.getAll(ENTITY_TYPE) || [];
        },

        /**
         * Get all sockets on a specific floor ('ground' | 'first')
         * @param {'ground'|'first'} floor
         * @returns {Array<object>}
         */
        getByFloor: function (floor) {
            return this.getAll().filter(s => s.floor === floor);
        },

        /**
         * Get a single socket by ID
         * @param {string} id
         * @returns {object|null}
         */
        get: function (id) {
            return PersistenceService.getById(ENTITY_TYPE, id);
        },

        /**
         * Add and persist a new electrical socket (or multi-socket bundle when count > 1)
         * @param {object} props - { floor, type, x, z, heightMm, rotation, count, label, snappedToWall }
         * @returns {object} created socket
         */
        add: function (props) {
            const typeKey = (props && DEFAULT_CATALOG[props.type]) ? props.type : 'socket_pe';
            const def = DEFAULT_CATALOG[typeKey];
            const seq = _nextSequenceNumber();
            const id = (props && props.id) ? String(props.id) : ('obj_' + seq + '_' + (Date.now() % 100000));
            const count = Math.max(1, Math.min(6, Math.round(Number(props && props.count) || 1)));
            const defaultLabel = count > 1 ? (`${count}×${def.shortCode}${seq}`) : (def.shortCode + seq);
            const newSocket = {
                id,
                floor: (props && props.floor === 'first') ? 'first' : 'ground',
                type: typeKey,
                x: Math.round(Number(props && props.x !== undefined ? props.x : 0)),
                z: Math.round(Number(props && props.z !== undefined ? props.z : 0)),
                heightMm: (props && props.heightMm !== undefined) ? Number(props.heightMm) : def.defaultHeightMm,
                rotation: (props && props.rotation !== undefined) ? Number(props.rotation) : 0,
                count,
                snappedToWall: Boolean(props && props.snappedToWall),
                label: (props && typeof props.label === 'string') ? props.label : defaultLabel
            };
            return PersistenceService.upsert(ENTITY_TYPE, id, newSocket);
        },

        /**
         * Update an existing socket's properties (e.g. x, z, rotation, heightMm, count, label, type) and persist
         * @param {string} id
         * @param {object} updates
         * @returns {object|null}
         */
        update: function (id, updates) {
            const existing = this.get(id);
            if (!existing) return null;
            return PersistenceService.upsert(ENTITY_TYPE, id, updates);
        },

        /**
         * Replace and persist the entire sockets list
         * @param {Array<object>} socketsList
         * @returns {Array<object>}
         */
        saveAll: function (socketsList) {
            return PersistenceService.saveAll(ENTITY_TYPE, socketsList);
        },

        /**
         * Remove a socket by ID and persist
         * @param {string} id
         * @returns {boolean}
         */
        remove: function (id) {
            return PersistenceService.remove(ENTITY_TYPE, id);
        },

        /**
         * Compile all placed sockets into 3D B-Rep multi-gang socket frame objects.
         * Automatically merges sockets placed next to each other (within 260 mm on the same wall
         * and at the same elevation) as well as sockets with `count > 1` into a single multi-gang frame.
         * @param {object} [options] - { floor?: 'ground'|'first', sockets?: Array, includeSampleIfEmpty?: boolean }
         * @returns {Array<object>}
         */
        getAllCompiled3D: function (options) {
            const opts = options || {};
            let rawList = Array.isArray(opts.sockets) ? opts.sockets : this.getAll();
            if (rawList.length === 0 && opts.includeSampleIfEmpty) {
                rawList = [
                    {
                        id: 'SAMPLE_2GANG_KITCHEN',
                        floor: 'ground',
                        type: 'socket_pe',
                        x: 8650,
                        z: 3170,
                        heightMm: 1150,
                        rotation: 180,
                        count: 2,
                        snappedToWall: true,
                        label: '2×G1 (Standard Open)'
                    },
                    {
                        id: 'SAMPLE_2GANG_COVERED_KITCHEN',
                        floor: 'ground',
                        type: 'socket_pe_shutter',
                        x: 9250,
                        z: 3170,
                        heightMm: 1150,
                        rotation: 180,
                        count: 2,
                        snappedToWall: true,
                        label: '2×GZ1 (With IP44 Cover Flap)'
                    },
                    {
                        id: 'SAMPLE_1GANG_LIVING',
                        floor: 'ground',
                        type: 'socket_pe',
                        x: 6315,
                        z: 7400,
                        heightMm: 300,
                        rotation: 90,
                        count: 1,
                        snappedToWall: true,
                        label: 'G2 (Living Room)'
                    }
                ];
            }
            if (opts.floor) {
                rawList = rawList.filter(s => s && s.floor === opts.floor);
            }
            if (rawList.length === 0) return [];

            // Group adjacent sockets on the same floor, same wall orientation, and same height (within 260 mm)
            const visited = new Array(rawList.length).fill(false);
            const clusters = [];

            for (let i = 0; i < rawList.length; i++) {
                if (visited[i]) continue;
                visited[i] = true;
                const seed = rawList[i];
                const cluster = [seed];
                const isFloorSeed = (seed.type === 'socket_floor');
                const rotSeed = (((Math.round((Number(seed.rotation) || 0) / 90) * 90) % 360) + 360) % 360;

                // Find nearby sockets that belong in the same frame
                let added = true;
                while (added) {
                    added = false;
                    for (let j = 0; j < rawList.length; j++) {
                        if (visited[j]) continue;
                        const cand = rawList[j];
                        if (cand.floor !== seed.floor) continue;
                        if ((cand.type === 'socket_floor') !== isFloorSeed) continue;
                        const rotCand = (((Math.round((Number(cand.rotation) || 0) / 90) * 90) % 360) + 360) % 360;
                        if (rotCand !== rotSeed) continue;
                        if (Math.abs((Number(cand.heightMm) || 0) - (Number(seed.heightMm) || 0)) > 25) continue;

                        // Check if cand is within 260 mm of any member already in cluster
                        const isClose = cluster.some(member => {
                            const dx = Math.abs((Number(cand.x) || 0) - (Number(member.x) || 0));
                            const dz = Math.abs((Number(cand.z) || 0) - (Number(member.z) || 0));
                            if (rotSeed === 0 || rotSeed === 180) {
                                return dz <= 45 && dx <= 260;
                            }
                            return dx <= 45 && dz <= 260;
                        });
                        if (isClose) {
                            visited[j] = true;
                            cluster.push(cand);
                            added = true;
                        }
                    }
                }

                // Sort cluster members along the wall tangent U so labels/gangs read left-to-right
                cluster.sort((a, b) => {
                    if (rotSeed === 0) return a.x - b.x;
                    if (rotSeed === 180) return b.x - a.x;
                    if (rotSeed === 90) return b.z - a.z;
                    return a.z - b.z;
                });

                clusters.push(cluster);
            }

            return clusters.map((c, idx) => compileSocketClusterTo3D(c, idx));
        },

        /**
         * Check whether a socket (or the sockets collection) differs from canonical default values
         * @param {string} [id]
         * @returns {boolean}
         */
        isModified: function (id) {
            if (id) {
                return PersistenceService.isModified(ENTITY_TYPE, id);
            }
            return PersistenceService.hasModifications(ENTITY_TYPE);
        },

        hasSavedChanges: function () {
            return PersistenceService.hasModifications(ENTITY_TYPE);
        },

        /**
         * Reset all sockets back to the canonical defaults in `data/sockets.js`
         * @returns {Array<object>}
         */
        resetToDefaults: function () {
            return PersistenceService.resetToDefaults(ENTITY_TYPE);
        },

        /**
         * Subscribe to socket additions, moves, updates, or resets
         * @param {Function} callback (id, item, allSockets, meta) => void
         * @returns {Function} unsubscribe
         */
        subscribe: function (callback) {
            return PersistenceService.subscribe(ENTITY_TYPE, callback);
        },

        /**
         * Export current sockets collection as formatted JSON matching `data/sockets.json`
         * @returns {string}
         */
        toJSON: function () {
            const payload = PersistenceService.exportFilePayload(ENTITY_TYPE);
            if (payload) {
                payload.catalog = this.getCatalog();
            }
            return JSON.stringify(payload, null, 2);
        }
    };

    return SocketStore;
}));
