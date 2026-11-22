// =============================================================================
// ROOM FURNITURE STORE — PERSISTENCE, CRUD, 2D FOOTPRINTS & CURVED 3D B-REP
// =============================================================================
// Manages movable room furniture (Corner Sofas, Armchairs, Tables, Consoles)
// with arbitrary rotation angles (0°..360°), drag-and-drop (X, Y) positioning,
// and type-specific dynamic properties (such as upholsteryColor).
//
// Coordinate Mapping Note:
// - Canonical world coordinates: X = East (0) -> West (20,420 mm), Y = North (0) -> South (20,840 mm).
// - On the 2D floor plan (West on Left, East on Right, North on Top, South on Bottom):
//   svgX = 20420 - worldX (grows to the right = East, -worldX)
//   svgY = worldY         (grows downward = South, +worldY)
// - Local furniture coordinates (lx, ly) use the 2D floor plan convention:
//   +lx = Right on 2D plan (-worldX, East)
//   +ly = Down on 2D plan  (+worldY, South)
//   rotation = Clockwise angle in degrees (0°..360°) on the 2D floor plan.

const RoomFurnitureStore = (() => {
  'use strict';

  const DOMAIN = 'room_furniture';

  function getRawCatalog() {
    if (typeof ROOM_FURNITURE_CATALOG !== 'undefined' && Array.isArray(ROOM_FURNITURE_CATALOG)) {
      return ROOM_FURNITURE_CATALOG;
    }
    if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.ROOM_FURNITURE_CATALOG)) {
      return globalThis.ROOM_FURNITURE_CATALOG;
    }
    if (typeof require === 'function') {
      try {
        const mod = require('../data/room_furniture.js');
        if (mod && Array.isArray(mod.ROOM_FURNITURE_CATALOG)) return mod.ROOM_FURNITURE_CATALOG;
      } catch (_e) { /* ignore */ }
    }
    return [];
  }

  function getRawDefaults() {
    if (typeof DEFAULT_ROOM_FURNITURE !== 'undefined' && Array.isArray(DEFAULT_ROOM_FURNITURE)) {
      return DEFAULT_ROOM_FURNITURE;
    }
    if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.DEFAULT_ROOM_FURNITURE)) {
      return globalThis.DEFAULT_ROOM_FURNITURE;
    }
    if (typeof require === 'function') {
      try {
        const mod = require('../data/room_furniture.js');
        if (mod && Array.isArray(mod.DEFAULT_ROOM_FURNITURE)) return mod.DEFAULT_ROOM_FURNITURE;
      } catch (_e) { /* ignore */ }
    }
    return [];
  }

  // Register domain with PersistenceService when available
  if (typeof PersistenceService !== 'undefined' && typeof PersistenceService.registerType === 'function') {
    PersistenceService.registerType(DOMAIN, {
      defaults: getRawDefaults(),
      collectionKind: 'list',
      filePath: 'data/room_furniture.js'
    });
  }

  const _listeners = [];
  function _notify() {
    const all = getAll();
    _listeners.forEach(fn => {
      try {
        fn(all);
      } catch (_err) { /* ignore listener errors */ }
    });
  }

  // Listen to cross-tab localStorage updates so 3D views update live when edited in 2D
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (ev) => {
      if (!ev || !ev.key || ev.key.indexOf(DOMAIN) !== -1) {
        _notify();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Color & Math Helpers
  // ---------------------------------------------------------------------------
  function sanitizeHexColor(hex, fallback) {
    if (typeof hex !== 'string') return fallback || '#EFEAE1';
    const trimmed = hex.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
      const r = trimmed[1], g = trimmed[2], b = trimmed[3];
      return ('#' + r + r + g + g + b + b).toUpperCase();
    }
    return fallback || '#EFEAE1';
  }

  function hexToRgb01(hex, scale) {
    const clean = sanitizeHexColor(hex, '#EFEAE1').slice(1);
    const s = (typeof scale === 'number') ? scale : 1.0;
    const r = Math.min(1, Math.max(0, (parseInt(clean.slice(0, 2), 16) / 255) * s));
    const g = Math.min(1, Math.max(0, (parseInt(clean.slice(2, 4), 16) / 255) * s));
    const b = Math.min(1, Math.max(0, (parseInt(clean.slice(4, 6), 16) / 255) * s));
    return [
      Math.round(r * 1000) / 1000,
      Math.round(g * 1000) / 1000,
      Math.round(b * 1000) / 1000
    ];
  }

  function normalizeAngleDeg(deg) {
    const num = Number(deg);
    if (!Number.isFinite(num)) return 0;
    let a = num % 360;
    if (a < 0) a += 360;
    return Math.round(a * 10) / 10;
  }

  function clampCoord(val, min, max, fallback) {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.round(Math.min(max, Math.max(min, num)));
  }

  function normalizeVec3(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [
      Math.round((v[0] / len) * 1000) / 1000,
      Math.round((v[1] / len) * 1000) / 1000,
      Math.round((v[2] / len) * 1000) / 1000
    ];
  }

  // ---------------------------------------------------------------------------
  // Catalog Lookup & Instance Normalization
  // ---------------------------------------------------------------------------
  function getCatalog() {
    return getRawCatalog();
  }

  function getCatalogType(typeId) {
    const cat = getRawCatalog();
    return cat.find(t => t.typeId === typeId) || cat[0] || null;
  }

  function normalizeInstance(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const spec = getCatalogType(raw.typeId);
    if (!spec) return null;

    const props = Object.assign({}, spec.defaultProperties || {});
    if (raw.properties && typeof raw.properties === 'object') {
      (spec.propertiesSchema || []).forEach(field => {
        const val = raw.properties[field.key];
        if (val !== undefined && val !== null) {
          if (field.type === 'color_swatches' || field.type === 'color') {
            props[field.key] = sanitizeHexColor(String(val), field.default);
          } else if (field.type === 'select' && Array.isArray(field.options)) {
            const valid = field.options.some(o => o.value === val);
            props[field.key] = valid ? val : field.default;
          } else {
            props[field.key] = String(val).slice(0, 64);
          }
        }
      });
    }

    const floor = (raw.floor === 'first' || raw.floor === 1) ? 'first' : 'ground';
    return {
      id: String(raw.id || 'FURN_1').replace(/[^a-zA-Z0-9_-]/g, '_'),
      typeId: spec.typeId,
      name: String(raw.name || spec.name).slice(0, 80),
      floor: floor,
      room: String(raw.room || (floor === 'first' ? '1.01 Sypialnia' : '0.11 Salon')).slice(0, 48),
      x: clampCoord(raw.x, -500, 21000, 3150),
      y: clampCoord(raw.y, -500, 21500, 8550),
      rotation: normalizeAngleDeg(raw.rotation),
      properties: props
    };
  }

  function _readAllNormalized() {
    let rawList = [];
    if (typeof PersistenceService !== 'undefined') {
      rawList = PersistenceService.getAll(DOMAIN);
    } else {
      rawList = getRawDefaults();
    }
    if (!Array.isArray(rawList)) rawList = getRawDefaults();
    return rawList.map(normalizeInstance).filter(Boolean);
  }

  function _saveAll(list) {
    if (typeof PersistenceService !== 'undefined') {
      PersistenceService.saveAll(DOMAIN, list);
    }
    _notify();
  }

  // ---------------------------------------------------------------------------
  // 3D Part Builders: Standard Box & Curved / Rounded Cushion Loft Compiler
  // ---------------------------------------------------------------------------
  // Note: Because +lx maps to -worldX (East, right on 2D plan) and +ly maps to +worldY (South, down on 2D plan),
  // we wind loops so outward normals remain right-handed in 3D world space.
  function createLocalTransform(spec, transformFn, normalFn) {
    const x0 = spec.lx0, x1 = spec.lx1;
    const y0 = spec.ly0, y1 = spec.ly1;
    const localRotDeg = spec.localRotDeg || 0;
    if (!localRotDeg) {
      return { mapPt: transformFn, mapN: normalFn };
    }
    const cx = 0.5 * (x0 + x1);
    const cy = 0.5 * (y0 + y1);
    const rad = localRotDeg * Math.PI / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    return {
      mapPt: (lx, ly, lz) => {
        const dx = lx - cx, dy = ly - cy;
        return transformFn(cx + dx * c - dy * s, cy + dx * s + dy * c, lz);
      },
      mapN: (nx, ny, nz) => {
        return normalFn(nx * c - ny * s, nx * s + ny * c, nz);
      }
    };
  }

  function computePartBounds(faces3D, footprintPts, id, role, label, colorHex, colorRgb, wireframeLines3D) {
    let wx0 = Infinity, wx1 = -Infinity, wy0 = Infinity, wy1 = -Infinity, wz0 = Infinity, wz1 = -Infinity;
    faces3D.forEach(f => {
      (f.loop3D || []).forEach(p => {
        if (p[0] < wx0) wx0 = p[0];
        if (p[0] > wx1) wx1 = p[0];
        if (p[1] < wy0) wy0 = p[1];
        if (p[1] > wy1) wy1 = p[1];
        if (p[2] < wz0) wz0 = p[2];
        if (p[2] > wz1) wz1 = p[2];
      });
    });
    return {
      id: id,
      role: role || 'sofa_upholstery',
      label: label || id,
      colorHex: colorHex || '#EFEAE1',
      colorRgb: colorRgb || hexToRgb01(colorHex || '#EFEAE1', 1.0),
      x0: Math.round(wx0),
      x1: Math.round(wx1),
      y0: Math.round(wy0),
      y1: Math.round(wy1),
      z0: Math.round(wz0),
      z1: Math.round(wz1),
      footprint2D: footprintPts,
      faces3D: faces3D,
      wireframeLines3D: wireframeLines3D || []
    };
  }

  function mixHexColors(hexA, hexB, t) {
    const a = hexToRgb01(hexA, 1.0);
    const b = hexToRgb01(hexB, 1.0);
    const k = Math.max(0, Math.min(1, t));
    const r = Math.round((a[0] * (1 - k) + b[0] * k) * 255);
    const g = Math.round((a[1] * (1 - k) + b[1] * k) * 255);
    const bl = Math.round((a[2] * (1 - k) + b[2] * k) * 255);
    const toHex = n => n.toString(16).padStart(2, '0').toUpperCase();
    return '#' + toHex(r) + toHex(g) + toHex(bl);
  }

  function cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  // Emit a 3D quad whose winding is mathematically guaranteed to match the outward normal
  function emitOrientedQuad(faces3D, p0, p1, p2, p3, n0, n1, n2, n3, noWireframe) {
    const g1 = cross3(sub3(p1, p0), sub3(p2, p0));
    const g2 = cross3(sub3(p2, p0), sub3(p3, p0));
    const gN = [g1[0] + g2[0], g1[1] + g2[1], g1[2] + g2[2]];
    if (Math.hypot(gN[0], gN[1], gN[2]) < 1e-4) return;
    const avgN = normalizeVec3([
      n0[0] + n1[0] + n2[0] + n3[0],
      n0[1] + n1[1] + n2[1] + n3[1],
      n0[2] + n1[2] + n2[2] + n3[2]
    ]);
    if (dot3(gN, avgN) < 0) {
      faces3D.push({
        name: 'sculpted_quad',
        noWireframe: noWireframe !== false,
        normal: avgN,
        loop3D: [p0, p3, p2, p1],
        vertexNormals3D: [n0, n3, n2, n1]
      });
    } else {
      faces3D.push({
        name: 'sculpted_quad',
        noWireframe: noWireframe !== false,
        normal: avgN,
        loop3D: [p0, p1, p2, p3],
        vertexNormals3D: [n0, n1, n2, n3]
      });
    }
  }

  function emitOrientedTri(faces3D, p0, p1, p2, n0, n1, n2, noWireframe) {
    const gN = cross3(sub3(p1, p0), sub3(p2, p0));
    if (Math.hypot(gN[0], gN[1], gN[2]) < 1e-4) return;
    const avgN = normalizeVec3([
      n0[0] + n1[0] + n2[0],
      n0[1] + n1[1] + n2[1],
      n0[2] + n1[2] + n2[2]
    ]);
    if (dot3(gN, avgN) < 0) {
      faces3D.push({
        name: 'sculpted_tri',
        noWireframe: noWireframe !== false,
        normal: avgN,
        loop3D: [p0, p2, p1],
        vertexNormals3D: [n0, n2, n1]
      });
    } else {
      faces3D.push({
        name: 'sculpted_tri',
        noWireframe: noWireframe !== false,
        normal: avgN,
        loop3D: [p0, p1, p2],
        vertexNormals3D: [n0, n1, n2]
      });
    }
  }

  // Compute smooth per-vertex normals for a 2D surface grid of world points
  // given a desired local-to-world outward hint normal per vertex or uniform orientation sign.
  function computeGridSurfaceNormals(gridPts, nRows, nCols, hintNormFn) {
    const norms = [];
    for (let r = 0; r <= nRows; r++) {
      const rowN = [];
      for (let c = 0; c <= nCols; c++) {
        const pPrevC = gridPts[r][Math.max(0, c - 1)];
        const pNextC = gridPts[r][Math.min(nCols, c + 1)];
        const pPrevR = gridPts[Math.max(0, r - 1)][c];
        const pNextR = gridPts[Math.min(nRows, r + 1)][c];
        const tC = sub3(pNextC, pPrevC);
        const tR = sub3(pNextR, pPrevR);
        let n = cross3(tC, tR);
        const len = Math.hypot(n[0], n[1], n[2]);
        const hint = hintNormFn(r, c);
        if (len < 1e-4) {
          n = hint;
        } else {
          n = normalizeVec3(n);
          if (dot3(n, hint) < 0) {
            n = [-n[0], -n[1], -n[2]];
          }
        }
        rowN.push(n);
      }
      norms.push(rowN);
    }
    return norms;
  }

  // Extrude a 2D cross-section profile (with smooth per-vertex normals) along a local axis
  // or build a rounded cushion / bolster / armrest / sculpted bed component with soft curved edges!
  function buildRoundedBoxPart(spec, transformFn, normalFn) {
    const x0 = spec.lx0, x1 = spec.lx1;
    const y0 = spec.ly0, y1 = spec.ly1;
    const z0 = spec.lz0, z1 = spec.lz1;
    const w = x1 - x0;
    const d = y1 - y0;
    const h = z1 - z0;
    const shape = spec.shape || 'box';

    const { mapPt, mapN } = createLocalTransform(spec, transformFn, normalFn);

    // -------------------------------------------------------------------------
    // A. Sleek Upholstered Beveled Panel (crisp flat rails & footboard with 5 mm upholstered chamfer)
    // -------------------------------------------------------------------------
    if (shape === 'beveled_panel') {
      const b = spec.bevelMm !== undefined ? spec.bevelMm : 5;
      const bx = Math.min(b, w * 0.28);
      const by = Math.min(b, d * 0.28);
      const bz = Math.min(b, h * 0.22);

      // 8 outer corners inset on each axis for exact 26-face chamfered upholstered prism
      const xi0 = x0 + bx, xi1 = x1 - bx;
      const yi0 = y0 + by, yi1 = y1 - by;
      const zi0 = z0 + bz, zi1 = z1 - bz;

      const nTop = normalizeVec3(mapN(0, 0, 1));
      const nBot = normalizeVec3(mapN(0, 0, -1));
      const nNor = normalizeVec3(mapN(0, -1, 0));
      const nSou = normalizeVec3(mapN(0, 1, 0));
      const nWes = normalizeVec3(mapN(-1, 0, 0));
      const nEas = normalizeVec3(mapN(1, 0, 0));

      const faces3D = [];

      // 6 Main Flat Faces
      const topPts = [mapPt(xi0, yi0, z1), mapPt(xi1, yi0, z1), mapPt(xi1, yi1, z1), mapPt(xi0, yi1, z1)];
      const botPts = [mapPt(xi0, yi0, z0), mapPt(xi1, yi0, z0), mapPt(xi1, yi1, z0), mapPt(xi0, yi1, z0)];
      const norPts = [mapPt(xi0, y0, zi0), mapPt(xi1, y0, zi0), mapPt(xi1, y0, zi1), mapPt(xi0, y0, zi1)];
      const souPts = [mapPt(xi0, y1, zi0), mapPt(xi1, y1, zi0), mapPt(xi1, y1, zi1), mapPt(xi0, y1, zi1)];
      const wesPts = [mapPt(x0, yi0, zi0), mapPt(x0, yi1, zi0), mapPt(x0, yi1, zi1), mapPt(x0, yi0, zi1)];
      const easPts = [mapPt(x1, yi0, zi0), mapPt(x1, yi1, zi0), mapPt(x1, yi1, zi1), mapPt(x1, yi0, zi1)];

      emitOrientedQuad(faces3D, topPts[0], topPts[1], topPts[2], topPts[3], nTop, nTop, nTop, nTop, true);
      emitOrientedQuad(faces3D, botPts[0], botPts[1], botPts[2], botPts[3], nBot, nBot, nBot, nBot, true);
      emitOrientedQuad(faces3D, norPts[0], norPts[1], norPts[2], norPts[3], nNor, nNor, nNor, nNor, true);
      emitOrientedQuad(faces3D, souPts[0], souPts[1], souPts[2], souPts[3], nSou, nSou, nSou, nSou, true);
      emitOrientedQuad(faces3D, wesPts[0], wesPts[1], wesPts[2], wesPts[3], nWes, nWes, nWes, nWes, true);
      emitOrientedQuad(faces3D, easPts[0], easPts[1], easPts[2], easPts[3], nEas, nEas, nEas, nEas, true);

      // 12 Smooth Chamfer Edge Strips (interpolated vertex normals between adjacent faces!)
      // Top 4 bevels
      emitOrientedQuad(faces3D, norPts[3], norPts[2], topPts[1], topPts[0], nNor, nNor, nTop, nTop, true);
      emitOrientedQuad(faces3D, souPts[2], souPts[3], topPts[3], topPts[2], nSou, nSou, nTop, nTop, true);
      emitOrientedQuad(faces3D, wesPts[3], wesPts[2], topPts[3], topPts[0], nWes, nWes, nTop, nTop, true);
      emitOrientedQuad(faces3D, easPts[2], easPts[3], topPts[1], topPts[2], nEas, nEas, nTop, nTop, true);
      // Bottom 4 bevels
      emitOrientedQuad(faces3D, norPts[0], norPts[1], botPts[1], botPts[0], nNor, nNor, nBot, nBot, true);
      emitOrientedQuad(faces3D, souPts[1], souPts[0], botPts[0], botPts[1], nSou, nSou, nBot, nBot, true);
      emitOrientedQuad(faces3D, wesPts[0], wesPts[1], botPts[3], botPts[0], nWes, nWes, nBot, nBot, true);
      emitOrientedQuad(faces3D, easPts[1], easPts[0], botPts[1], botPts[2], nEas, nEas, nBot, nBot, true);
      // Vertical 4 corner bevels
      emitOrientedQuad(faces3D, wesPts[0], norPts[0], norPts[3], wesPts[3], nWes, nNor, nNor, nWes, true);
      emitOrientedQuad(faces3D, norPts[1], easPts[0], easPts[3], norPts[2], nNor, nEas, nEas, nNor, true);
      emitOrientedQuad(faces3D, easPts[1], souPts[1], souPts[2], easPts[2], nEas, nSou, nSou, nEas, true);
      emitOrientedQuad(faces3D, souPts[0], wesPts[1], wesPts[2], souPts[3], nSou, nWes, nWes, nSou, true);

      // 8 Corner Micro-Bevel Triangles
      emitOrientedTri(faces3D, topPts[0], norPts[3], wesPts[3], nTop, nNor, nWes, true);
      emitOrientedTri(faces3D, topPts[1], easPts[3], norPts[2], nTop, nEas, nNor, true);
      emitOrientedTri(faces3D, topPts[2], souPts[2], easPts[2], nTop, nSou, nEas, true);
      emitOrientedTri(faces3D, topPts[3], wesPts[2], souPts[3], nTop, nWes, nSou, true);
      emitOrientedTri(faces3D, botPts[0], wesPts[0], norPts[0], nBot, nWes, nNor, true);
      emitOrientedTri(faces3D, botPts[1], norPts[1], easPts[0], nBot, nNor, nEas, true);
      emitOrientedTri(faces3D, botPts[2], easPts[1], souPts[1], nBot, nEas, nSou, true);
      emitOrientedTri(faces3D, botPts[3], souPts[0], wesPts[1], nBot, nSou, nWes, true);

      const wf = [];
      if (spec.showTopRimLine) {
        const r0 = mapPt(x0, y0, z1), r1 = mapPt(x1, y0, z1), r2 = mapPt(x1, y1, z1), r3 = mapPt(x0, y1, z1);
        wf.push([r0, r1, r2, r3, r0]);
      }

      const fp2D = [
        [Math.round(mapPt(x0, y0, z0)[0]), Math.round(mapPt(x0, y0, z0)[1])],
        [Math.round(mapPt(x1, y0, z0)[0]), Math.round(mapPt(x1, y0, z0)[1])],
        [Math.round(mapPt(x1, y1, z0)[0]), Math.round(mapPt(x1, y1, z0)[1])],
        [Math.round(mapPt(x0, y1, z0)[0]), Math.round(mapPt(x0, y1, z0)[1])]
      ];
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, wf);
    }

    // -------------------------------------------------------------------------
    // B. Vertically Channeled Upholstered Headboard Flute (plush pillowed vertical panel)
    // -------------------------------------------------------------------------
    if (shape === 'headboard_channel') {
      const nS = 10; // Horizontal curve segments across each vertical channel flute
      const nT = 12; // Vertical profile segments from frame rim to headboard top
      const gridPts = [];

      for (let it = 0; it <= nT; it++) {
        const t = it / nT;
        let archZ;
        if (t > 0.93) {
          const u = (1 - t) / 0.07;
          archZ = Math.pow(Math.sin(u * Math.PI / 2), 0.52);
        } else if (t < 0.04) {
          const u = t / 0.04;
          archZ = Math.pow(Math.sin(u * Math.PI / 2), 0.55);
        } else {
          archZ = 0.95 + 0.05 * Math.sin(t * Math.PI);
        }

        const row = [];
        for (let is = 0; is <= nS; is++) {
          const s = is / nS;
          // Plush flat-crowned cylinder profile tucking cleanly into vertical channel seams
          const archX = Math.pow(Math.sin(s * Math.PI), 0.34);
          const lx = x0 + s * w;
          const ly = y0 + d * archX * archZ;
          // Subtle 3 mm dip right at the top seam edges so channel notches read cleanly on silhouette
          const topDip = (t > 0.85) ? (3.5 * ((t - 0.85) / 0.15) * (1 - archX)) : 0;
          const lz = z0 + t * h - topDip;
          row.push(mapPt(lx, ly, lz));
        }
        gridPts.push(row);
      }

      const nFrontHint = normalizeVec3(mapN(0, 1, 0));
      const nTopHint = normalizeVec3(mapN(0, 0, 1));
      const nBotHint = normalizeVec3(mapN(0, 0, -1));
      const nLeftHint = normalizeVec3(mapN(-1, 0, 0));
      const nRightHint = normalizeVec3(mapN(1, 0, 0));

      const gridNorms = computeGridSurfaceNormals(gridPts, nT, nS, (r, c) => {
        if (r === nT) return normalizeVec3([nFrontHint[0] * 0.3 + nTopHint[0], nFrontHint[1] * 0.3 + nTopHint[1], nFrontHint[2] * 0.3 + nTopHint[2]]);
        if (r === 0) return normalizeVec3([nFrontHint[0] * 0.3 + nBotHint[0], nFrontHint[1] * 0.3 + nBotHint[1], nFrontHint[2] * 0.3 + nBotHint[2]]);
        if (c === 0) return normalizeVec3([nFrontHint[0] * 0.35 + nLeftHint[0], nFrontHint[1] * 0.35 + nLeftHint[1], nFrontHint[2] * 0.35 + nLeftHint[2]]);
        if (c === nS) return normalizeVec3([nFrontHint[0] * 0.35 + nRightHint[0], nFrontHint[1] * 0.35 + nRightHint[1], nFrontHint[2] * 0.35 + nRightHint[2]]);
        return nFrontHint;
      });

      const faces3D = [];
      for (let it = 0; it < nT; it++) {
        for (let is = 0; is < nS; is++) {
          emitOrientedQuad(
            faces3D,
            gridPts[it][is], gridPts[it][is + 1], gridPts[it + 1][is + 1], gridPts[it + 1][is],
            gridNorms[it][is], gridNorms[it][is + 1], gridNorms[it + 1][is + 1], gridNorms[it + 1][is],
            true
          );
        }
      }

      // Subtle vertical seam crease line along the right channel seam if requested
      const wf = [];
      if (spec.seamLineRight) {
        const seamPts = [];
        for (let it = 1; it < nT; it++) {
          seamPts.push(gridPts[it][nS]);
        }
        wf.push(seamPts);
      }

      const fp2D = [
        [Math.round(mapPt(x0, y0, z0)[0]), Math.round(mapPt(x0, y0, z0)[1])],
        [Math.round(mapPt(x1, y0, z0)[0]), Math.round(mapPt(x1, y0, z0)[1])],
        [Math.round(mapPt(x1, y1, z0)[0]), Math.round(mapPt(x1, y1, z0)[1])],
        [Math.round(mapPt(x0, y1, z0)[0]), Math.round(mapPt(x0, y1, z0)[1])]
      ];
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, wf);
    }

    // -------------------------------------------------------------------------
    // C. High-Resolution Sculpted Organic Linen Duvet (soft folds & tucked curved shoulders)
    // -------------------------------------------------------------------------
    if (shape === 'sculpted_duvet') {
      const nU = 24;
      const nV = 22;
      const gridPts = [];

      function edgeRamp(t, margin) {
        if (t >= margin) return 1.0;
        if (t <= 0) return 0.0;
        return Math.sin((t / margin) * Math.PI / 2);
      }

      for (let iv = 0; iv <= nV; iv++) {
        const v = iv / nV;
        const eV0 = edgeRamp(v, 0.09);
        const eV1 = edgeRamp(1 - v, 0.11);
        const row = [];
        for (let iu = 0; iu <= nU; iu++) {
          const u = iu / nU;
          const eU = edgeRamp(Math.min(u, 1 - u), 0.11);
          const env = Math.pow(eU, 0.62) * Math.pow(eV0, 0.55) * Math.pow(eV1, 0.65);

          // Organic multi-frequency linen folds across top surface (smoothly attenuated to 0 at tucked rim)
          const mask = Math.pow(Math.sin(u * Math.PI), 0.6) * Math.pow(Math.sin(v * Math.PI), 0.55);
          const fold1 = 8.5 * Math.sin(u * Math.PI * 3.1 + 0.4) * Math.cos(v * Math.PI * 2.3 - 0.35);
          const fold2 = 5.0 * Math.sin(u * Math.PI * 6.4 - v * Math.PI * 3.2 + 0.9);
          const fold3 = 4.2 * Math.cos(v * Math.PI * 4.6 + u * Math.PI * 1.9);
          const centerLoft = 10.0 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
          const wrinkle = mask * (fold1 + fold2 + fold3) + centerLoft * env;

          const lx = x0 + u * w;
          const ly = y0 + v * d;
          const lz = z0 + h * env + wrinkle;
          row.push(mapPt(lx, ly, lz));
        }
        gridPts.push(row);
      }

      const nUp = normalizeVec3(mapN(0, 0, 1));
      const nLeft = normalizeVec3(mapN(-1, 0, 0));
      const nRight = normalizeVec3(mapN(1, 0, 0));
      const nBack = normalizeVec3(mapN(0, -1, 0));
      const nFront = normalizeVec3(mapN(0, 1, 0));

      const gridNorms = computeGridSurfaceNormals(gridPts, nV, nU, (r, c) => {
        if (c === 0) return normalizeVec3([nLeft[0] + nUp[0] * 0.25, nLeft[1] + nUp[1] * 0.25, nLeft[2] + nUp[2] * 0.25]);
        if (c === nU) return normalizeVec3([nRight[0] + nUp[0] * 0.25, nRight[1] + nUp[1] * 0.25, nRight[2] + nUp[2] * 0.25]);
        if (r === 0) return normalizeVec3([nBack[0] + nUp[0] * 0.25, nBack[1] + nUp[1] * 0.25, nBack[2] + nUp[2] * 0.25]);
        if (r === nV) return normalizeVec3([nFront[0] + nUp[0] * 0.25, nFront[1] + nUp[1] * 0.25, nFront[2] + nUp[2] * 0.25]);
        return nUp;
      });

      const faces3D = [];
      for (let iv = 0; iv < nV; iv++) {
        for (let iu = 0; iu < nU; iu++) {
          emitOrientedQuad(
            faces3D,
            gridPts[iv][iu], gridPts[iv][iu + 1], gridPts[iv + 1][iu + 1], gridPts[iv + 1][iu],
            gridNorms[iv][iu], gridNorms[iv][iu + 1], gridNorms[iv + 1][iu + 1], gridNorms[iv + 1][iu],
            true
          );
        }
      }

      const fp2D = [
        [Math.round(mapPt(x0, y0, z0)[0]), Math.round(mapPt(x0, y0, z0)[1])],
        [Math.round(mapPt(x1, y0, z0)[0]), Math.round(mapPt(x1, y0, z0)[1])],
        [Math.round(mapPt(x1, y1, z0)[0]), Math.round(mapPt(x1, y1, z0)[1])],
        [Math.round(mapPt(x0, y1, z0)[0]), Math.round(mapPt(x0, y1, z0)[1])]
      ];
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, []);
    }

    // -------------------------------------------------------------------------
    // D. Sculpted Wavy Draped Throw Blanket (thickened cloth shell with natural folds & side cascades)
    // -------------------------------------------------------------------------
    if (shape === 'sculpted_throw') {
      const nU = 26;
      const nV = 14;
      const clothThick = spec.clothThicknessMm || 15;
      const topPts = [];
      const botPts = [];

      function sideDrop(u) {
        const edge = Math.min(u, 1 - u);
        if (edge >= 0.085) return 1.0;
        return Math.pow(Math.sin((edge / 0.085) * Math.PI / 2), 0.72);
      }

      for (let iv = 0; iv <= nV; iv++) {
        const v = iv / nV;
        const rowT = [];
        const rowB = [];
        for (let iu = 0; iu <= nU; iu++) {
          const u = iu / nU;
          const drop = sideDrop(u);
          // Organic hand-draped wavy front & back silhouette edges
          const waveY = (20 * Math.sin(u * Math.PI * 3.1 + (v > 0.5 ? 0.55 : -0.45)) +
            9 * Math.cos(u * Math.PI * 5.7 + v * 2.4)) * (0.4 + 0.6 * Math.abs(v - 0.5) * 2);
          // Soft horizontal fabric gather folds (3 lush draped waves across depth)
          const vEnv = Math.pow(Math.sin(v * Math.PI), 0.42);
          const gather = vEnv * (10 + 13 * Math.sin(v * Math.PI * 3.4 + 0.8 * Math.sin(u * Math.PI * 2.2) + 0.35));
          const micro = vEnv * 4.5 * Math.cos(u * Math.PI * 5.2 - v * Math.PI * 2.1);

          const lx = x0 + u * w;
          const ly = y0 + v * d + waveY;
          const lzTop = z0 + h * drop + (gather + micro) * (0.35 + 0.65 * drop);
          // Taper thickness smoothly near outer front/back hems
          const localThick = clothThick * (0.45 + 0.55 * Math.sin(v * Math.PI));
          const lzBot = lzTop - localThick;

          rowT.push(mapPt(lx, ly, lzTop));
          rowB.push(mapPt(lx, ly, lzBot));
        }
        topPts.push(rowT);
        botPts.push(rowB);
      }

      const nUp = normalizeVec3(mapN(0, 0, 1));
      const nDown = normalizeVec3(mapN(0, 0, -1));
      const nLeft = normalizeVec3(mapN(-1, 0, 0));
      const nRight = normalizeVec3(mapN(1, 0, 0));
      const nBack = normalizeVec3(mapN(0, -1, 0));
      const nFront = normalizeVec3(mapN(0, 1, 0));

      const topNorms = computeGridSurfaceNormals(topPts, nV, nU, (_r, c) => {
        if (c === 0) return nLeft;
        if (c === nU) return nRight;
        return nUp;
      });
      const botNorms = computeGridSurfaceNormals(botPts, nV, nU, () => nDown);

      const faces3D = [];
      for (let iv = 0; iv < nV; iv++) {
        for (let iu = 0; iu < nU; iu++) {
          emitOrientedQuad(
            faces3D,
            topPts[iv][iu], topPts[iv][iu + 1], topPts[iv + 1][iu + 1], topPts[iv + 1][iu],
            topNorms[iv][iu], topNorms[iv][iu + 1], topNorms[iv + 1][iu + 1], topNorms[iv + 1][iu],
            true
          );
          emitOrientedQuad(
            faces3D,
            botPts[iv][iu], botPts[iv + 1][iu], botPts[iv + 1][iu + 1], botPts[iv][iu + 1],
            botNorms[iv][iu], botNorms[iv + 1][iu], botNorms[iv + 1][iu + 1], botNorms[iv][iu + 1],
            true
          );
        }
      }
      // Stitch front, back, left & right hems closed
      for (let iu = 0; iu < nU; iu++) {
        emitOrientedQuad(faces3D, topPts[0][iu], topPts[0][iu + 1], botPts[0][iu + 1], botPts[0][iu], nBack, nBack, nBack, nBack, true);
        emitOrientedQuad(faces3D, topPts[nV][iu], botPts[nV][iu], botPts[nV][iu + 1], topPts[nV][iu + 1], nFront, nFront, nFront, nFront, true);
      }
      for (let iv = 0; iv < nV; iv++) {
        emitOrientedQuad(faces3D, topPts[iv][0], botPts[iv][0], botPts[iv + 1][0], topPts[iv + 1][0], nLeft, nLeft, nLeft, nLeft, true);
        emitOrientedQuad(faces3D, topPts[iv][nU], topPts[iv + 1][nU], botPts[iv + 1][nU], botPts[iv][nU], nRight, nRight, nRight, nRight, true);
      }

      const fp2D = [
        [Math.round(mapPt(x0, y0, z0)[0]), Math.round(mapPt(x0, y0, z0)[1])],
        [Math.round(mapPt(x1, y0, z0)[0]), Math.round(mapPt(x1, y0, z0)[1])],
        [Math.round(mapPt(x1, y1, z0)[0]), Math.round(mapPt(x1, y1, z0)[1])],
        [Math.round(mapPt(x0, y1, z0)[0]), Math.round(mapPt(x0, y1, z0)[1])]
      ];
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, []);
    }

    // -------------------------------------------------------------------------
    // E. Plump Reclined Bed Pillow / Accent Cushion (pitch + yaw + pinched seam + chop crease!)
    // -------------------------------------------------------------------------
    if (shape === 'tilted_pillow') {
      const cx = 0.5 * (x0 + x1);
      const cy = 0.5 * (y0 + y1);
      const cz = 0.5 * (z0 + z1);
      const rx = w / 2;
      const ry = d / 2;
      const rz = h / 2;
      const pitchRad = ((spec.pitchDeg || 0) * Math.PI) / 180;
      const cosP = Math.cos(pitchRad);
      const sinP = Math.sin(pitchRad);
      const chopMm = spec.chopMm || 0;
      const pXY = spec.pXY || 0.56;
      const pZ = spec.pZ || 0.68;

      function sgnPowLocal(val, p) {
        return (val < 0 ? -1 : 1) * Math.pow(Math.abs(val), p);
      }

      const nU = 20;
      const nV = 10;
      const gridPts = [];
      const gridNorms = [];

      for (let iv = 0; iv <= nV; iv++) {
        const phi = -Math.PI / 2 + (iv / nV) * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const zFactor = sgnPowLocal(sinPhi, pZ);
        const ringScale = sgnPowLocal(cosPhi, pZ * 0.72);

        const rowPts = [];
        const rowNorms = [];
        for (let iu = 0; iu < nU; iu++) {
          const theta = (iu / nU) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const ux = sgnPowLocal(cosT, pXY);
          const uy = sgnPowLocal(sinT, pXY);

          // Pinched pillow corners slightly wider & thinner along perimeter seam
          const cornerPinch = 1.0 + 0.06 * Math.abs(ux * zFactor);
          const dx = rx * ringScale * ux * cornerPinch;
          // Gentle thickness taper toward top/left/right stitched edges
          const dy = ry * ringScale * uy * (1.0 - 0.14 * Math.abs(zFactor));
          // Classic interior-designer top-center pillow chop / soft natural slouch (converges smoothly at top pole)
          const chopIndent = (chopMm > 0 && sinPhi > 0.25)
            ? chopMm * Math.pow((sinPhi - 0.25) / 0.75, 1.4) * Math.exp(-Math.pow(ringScale * ux * 2.6, 2))
            : 0;
          const dz = rz * zFactor - chopIndent;

          // Apply pitch rotation around local X axis (positive pitchDeg leans top back toward -ly headboard!)
          const dyRot = dy * cosP - dz * sinP;
          const dzRot = dy * sinP + dz * cosP;

          const nxL = (cosPhi * cosT) / (rx || 1);
          const nyL = (cosPhi * sinT) / (ry || 1);
          const nzL = sinPhi / (rz || 1);
          const nyRot = nyL * cosP - nzL * sinP;
          const nzRot = nyL * sinP + nzL * cosP;

          rowPts.push(mapPt(cx + dx, cy + dyRot, cz + dzRot));
          rowNorms.push(normalizeVec3(mapN(nxL, nyRot, nzRot)));
        }
        gridPts.push(rowPts);
        gridNorms.push(rowNorms);
      }

      const faces3D = [];
      for (let iv = 0; iv < nV; iv++) {
        for (let iu = 0; iu < nU; iu++) {
          const iuNext = (iu + 1) % nU;
          if (iv === 0) {
            emitOrientedTri(
              faces3D,
              gridPts[0][0], gridPts[1][iuNext], gridPts[1][iu],
              gridNorms[0][0], gridNorms[1][iuNext], gridNorms[1][iu],
              true
            );
          } else if (iv === nV - 1) {
            emitOrientedTri(
              faces3D,
              gridPts[iv][iu], gridPts[iv][iuNext], gridPts[nV][0],
              gridNorms[iv][iu], gridNorms[iv][iuNext], gridNorms[nV][0],
              true
            );
          } else {
            emitOrientedQuad(
              faces3D,
              gridPts[iv][iu], gridPts[iv][iuNext], gridPts[iv + 1][iuNext], gridPts[iv + 1][iu],
              gridNorms[iv][iu], gridNorms[iv][iuNext], gridNorms[iv + 1][iuNext], gridNorms[iv + 1][iu],
              true
            );
          }
        }
      }

      const midRing = gridPts[Math.floor(nV / 2)];
      const fp2D = midRing.map(p => [Math.round(p[0]), Math.round(p[1])]);
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, []);
    }

    // -------------------------------------------------------------------------
    // F. Quilted 23 cm Mattress (plush bullnose top/bottom with crisp piped perimeter seam)
    // -------------------------------------------------------------------------
    if (shape === 'mattress') {
      const cx = 0.5 * (x0 + x1);
      const cy = 0.5 * (y0 + y1);
      const cz = 0.5 * (z0 + z1);
      const rx = w / 2;
      const ry = d / 2;
      const rz = h / 2;
      const pXY = 0.18;
      const pZ = 0.28;

      function sgnPowM(val, p) {
        return (val < 0 ? -1 : 1) * Math.pow(Math.abs(val), p);
      }

      const nU = 24;
      const nV = 8;
      const gridPts = [];
      const gridNorms = [];

      for (let iv = 0; iv <= nV; iv++) {
        const phi = -Math.PI / 2 + (iv / nV) * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const zFactor = sgnPowM(sinPhi, pZ);
        const ringScale = sgnPowM(cosPhi, pZ * 0.65);

        const rowPts = [];
        const rowNorms = [];
        for (let iu = 0; iu < nU; iu++) {
          const theta = (iu / nU) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          const ux = sgnPowM(cosT, pXY);
          const uy = sgnPowM(sinT, pXY);

          const lx = cx + rx * ringScale * ux;
          const ly = cy + ry * ringScale * uy;
          const crown = sinPhi > 0 ? (8 * Math.pow(cosPhi, 1.4)) : 0;
          const lz = cz + rz * zFactor + crown;

          rowPts.push(mapPt(lx, ly, lz));
          rowNorms.push(normalizeVec3(mapN((cosPhi * cosT) / (rx || 1), (cosPhi * sinT) / (ry || 1), sinPhi / (rz || 1))));
        }
        gridPts.push(rowPts);
        gridNorms.push(rowNorms);
      }

      const faces3D = [];
      for (let iv = 0; iv < nV; iv++) {
        for (let iu = 0; iu < nU; iu++) {
          const iuNext = (iu + 1) % nU;
          if (iv === 0) {
            emitOrientedTri(
              faces3D,
              gridPts[0][0], gridPts[1][iuNext], gridPts[1][iu],
              gridNorms[0][0], gridNorms[1][iuNext], gridNorms[1][iu],
              true
            );
          } else if (iv === nV - 1) {
            emitOrientedTri(
              faces3D,
              gridPts[iv][iu], gridPts[iv][iuNext], gridPts[nV][0],
              gridNorms[iv][iu], gridNorms[iv][iuNext], gridNorms[nV][0],
              true
            );
          } else {
            emitOrientedQuad(
              faces3D,
              gridPts[iv][iu], gridPts[iv][iuNext], gridPts[iv + 1][iuNext], gridPts[iv + 1][iu],
              gridNorms[iv][iu], gridNorms[iv][iuNext], gridNorms[iv + 1][iuNext], gridNorms[iv + 1][iu],
              true
            );
          }
        }
      }

      // Crisp upper mattress piping welt ring
      const topWeltRing = gridPts[nV - 1].concat([gridPts[nV - 1][0]]);
      const midRing = gridPts[Math.floor(nV / 2)];
      const fp2D = midRing.map(p => [Math.round(p[0]), Math.round(p[1])]);
      return computePartBounds(faces3D, fp2D, spec.id, spec.role, spec.label, spec.colorHex, spec.colorRgb, [topWeltRing]);
    }

    // If shape is a soft rounded cushion, bolster, pillow, or arched armrest,
    // generate a smooth multi-ring rounded superellipsoid / lofted cushion mesh with smooth vertexNormals3D!
    if (shape === 'cushion' || shape === 'pillow' || shape === 'bolster_x' || shape === 'bolster_y' || shape === 'armrest_x' || shape === 'armrest_y') {
      const cx = 0.5 * (x0 + x1);
      const cy = 0.5 * (y0 + y1);
      const cz = 0.5 * (z0 + z1);
      const rx = w / 2;
      const ry = d / 2;
      const rz = h / 2;

      // Superquadric / rounded-box parameters:
      // Lower power = more curved/rounded; higher power = flatter middle with rounded corners.
      let pXY = 0.32; // Plan-view corner roundness (0.32 gives generous soft rounded corners, 1.0 is an ellipse)
      let pZ  = 0.42; // Vertical profile roundness (bullnose top & bottom)
      if (shape === 'pillow') {
        pXY = 0.62;
        pZ  = 0.68;
      } else if (shape === 'bolster_x' || shape === 'bolster_y') {
        pXY = 0.46;
        pZ  = 0.52;
      } else if (shape === 'armrest_x' || shape === 'armrest_y') {
        pXY = 0.38;
        pZ  = 0.36;
      }

      function sgnPow(val, p) {
        const s = val < 0 ? -1 : 1;
        return s * Math.pow(Math.abs(val), p);
      }

      const nU = 16; // Azimuthal segments around XY perimeter (gives smooth rounded corners!)
      const nV = 6;  // Elevation rings from bottom to top (gives smooth bullnose crown!)

      const gridPts = [];
      const gridNorms = [];

      for (let iv = 0; iv <= nV; iv++) {
        // vAngle from -PI/2 (bottom) to +PI/2 (top)
        const vFrac = iv / nV;
        const phi = -Math.PI / 2 + vFrac * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const zFactor = sgnPow(sinPhi, pZ);
        const ringScale = sgnPow(cosPhi, pZ * 0.75);
        const nzLocal = sinPhi / (rz || 1);

        const rowPts = [];
        const rowNorms = [];

        for (let iu = 0; iu < nU; iu++) {
          const theta = (iu / nU) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const ux = sgnPow(cosT, pXY);
          const uy = sgnPow(sinT, pXY);

          const lx = cx + rx * ringScale * ux;
          const ly = cy + ry * ringScale * uy;
          // Slight extra crown in the center of seat/back cushions
          const crown = (shape === 'cushion' && sinPhi > 0) ? (18 * Math.pow(cosPhi, 1.5)) : 0;
          const lz = cz + rz * zFactor + crown;

          const nxLocal = (cosPhi * cosT) / (rx || 1);
          const nyLocal = (cosPhi * sinT) / (ry || 1);

          rowPts.push(mapPt(lx, ly, lz));
          rowNorms.push(normalizeVec3(mapN(nxLocal, nyLocal, nzLocal)));
        }

        gridPts.push(rowPts);
        gridNorms.push(rowNorms);
      }

      const faces3D = [];
      for (let iv = 0; iv < nV; iv++) {
        for (let iu = 0; iu < nU; iu++) {
          const iuNext = (iu + 1) % nU;
          const p00 = gridPts[iv][iu];
          const p10 = gridPts[iv][iuNext];
          const p11 = gridPts[iv + 1][iuNext];
          const p01 = gridPts[iv + 1][iu];

          const n00 = gridNorms[iv][iu];
          const n10 = gridNorms[iv][iuNext];
          const n11 = gridNorms[iv + 1][iuNext];
          const n01 = gridNorms[iv + 1][iu];

          const avgN = normalizeVec3([
            n00[0] + n10[0] + n11[0] + n01[0],
            n00[1] + n10[1] + n11[1] + n01[1],
            n00[2] + n10[2] + n11[2] + n01[2]
          ]);

          faces3D.push({
            name: 'curved_quad',
            noWireframe: true,
            normal: avgN,
            loop3D: [p00, p01, p11, p10],
            vertexNormals3D: [n00, n01, n11, n10]
          });
        }
      }

      // Add a single subtle equator seam line so the cushion silhouette is crisp without boxy edges
      const midRing = gridPts[Math.floor(nV / 2)];
      const seamLoop = midRing.concat([midRing[0]]);
      const fp2D = midRing.map(p => [Math.round(p[0]), Math.round(p[1])]);

      return computePartBounds(
        faces3D,
        fp2D,
        spec.id,
        spec.role,
        spec.label,
        spec.colorHex,
        spec.colorRgb,
        [seamLoop]
      );
    }

    // Standard box (for feet, table legs, cabinet carcasses)
    const p000 = mapPt(x0, y0, z0);
    const p100 = mapPt(x1, y0, z0);
    const p110 = mapPt(x1, y1, z0);
    const p010 = mapPt(x0, y1, z0);
    const p001 = mapPt(x0, y0, z1);
    const p101 = mapPt(x1, y0, z1);
    const p111 = mapPt(x1, y1, z1);
    const p011 = mapPt(x0, y1, z1);

    const faces3D = [
      { name: 'top',    normal: mapN(0, 0, 1),  loop3D: [p001, p011, p111, p101] },
      { name: 'bottom', normal: mapN(0, 0, -1), loop3D: [p000, p100, p110, p010] },
      { name: 'north',  normal: mapN(0, -1, 0), loop3D: [p000, p001, p101, p100] },
      { name: 'south',  normal: mapN(0, 1, 0),  loop3D: [p110, p111, p011, p010] },
      { name: 'west',   normal: mapN(-1, 0, 0), loop3D: [p010, p011, p001, p000] },
      { name: 'east',   normal: mapN(1, 0, 0),  loop3D: [p100, p101, p111, p110] }
    ];

    const wireframeLines3D = [
      [p000, p100, p110, p010, p000],
      [p001, p101, p111, p011, p001],
      [p000, p001],
      [p100, p101],
      [p110, p111],
      [p010, p011]
    ];

    return computePartBounds(
      faces3D,
      [[p000[0], p000[1]], [p100[0], p100[1]], [p110[0], p110[1]], [p010[0], p010[1]]],
      spec.id,
      spec.role,
      spec.label,
      spec.colorHex,
      spec.colorRgb,
      wireframeLines3D
    );
  }

  // Generate a smooth rounded 2D polygon for an L-shape with rounded outer/inner corners
  function buildCurvedLPolygon2D(ox, oy, rightWing, leftWing, depth) {
    const pts = [];
    const rOuter = 130;  // 13 cm outer corner radius
    const rEnd   = 85;   // 8.5 cm wing end corner radius
    const rInner = 160;  // 16 cm smooth inner L-corner radius

    function addArc(cx, cy, r, a0Deg, a1Deg, steps) {
      for (let i = 0; i <= steps; i++) {
        const a = (a0Deg + (a1Deg - a0Deg) * (i / steps)) * Math.PI / 180;
        pts.push([
          Math.round(ox + cx + r * Math.cos(a)),
          Math.round(oy + cy + r * Math.sin(a))
        ]);
      }
    }

    // 1. Outer North-West corner (u = 0, v = 0)
    addArc(rOuter, rOuter, rOuter, 180, 270, 5);
    // 2. Right wing outer top-right corner (u = rightWing, v = 0)
    addArc(rightWing - rEnd, rEnd, rEnd, 270, 360, 4);
    // 3. Right wing front-right corner (u = rightWing, v = depth)
    addArc(rightWing - rEnd, depth - rEnd, rEnd, 0, 90, 4);
    // 4. Concave inner L-corner (u = depth, v = depth)
    addArc(depth + rInner, depth + rInner, rInner, 270, 180, 6);
    // 5. Left wing front-bottom corner (u = depth, v = leftWing)
    addArc(depth - rEnd, leftWing - rEnd, rEnd, 0, 90, 4);
    // 6. Left wing outer bottom-left corner (u = 0, v = leftWing)
    addArc(rEnd, leftWing - rEnd, rEnd, 90, 180, 4);

    return pts;
  }

  // ---------------------------------------------------------------------------
  // Type-Specific Local 3D & 2D Geometry Builders
  // ---------------------------------------------------------------------------
  function buildCornerSofaL226Local(inst) {
    const props = inst.properties || {};
    const mainHex = sanitizeHexColor(props.upholsteryColor, '#EFEAE1');
    const pillowHex = sanitizeHexColor(props.pillowColor, '#E2DBD0');
    const legHex = sanitizeHexColor(props.legColor, '#232528');
    const variant = props.wingVariant || '226x226';

    // Exact dimensions from attached specification plan (in mm, 1 cm = 10 mm):
    // L226 x 226 x H81 cm (or 226 x 260 cm header option)
    const rightWing = (variant === '226x260') ? 2600 : 2260;
    const leftWing  = (variant === '260x226') ? 2600 : 2260;
    const depth = 710;          // 71 cm wing depth (52 cm seat + 19 cm backrest zone)
    const backFrameT = 105;     // 10.5 cm structural rear backrest frame
    const backCushDepth = 195;  // 19 cm total back zone -> 520 mm (52 cm) clear seat depth
    const footH = 65;           // 6.5 cm feet
    const baseTopZ = 240;       // lower upholstered rail top
    const seatTopZ = 430;       // 43 cm seat height from floor
    const armW = 95;            // 9 cm rounded armrest thickness
    const armD = 680;           // 68 cm armrest depth
    const armTopZ = 630;        // 63 cm armrest height from floor
    const backFrameTopZ = 725;  // structural rear backrest frame top
    const totalTopZ = 810;      // 81 cm overall height (44 cm backrest cushions: Z=370..810)

    const ox = -rightWing / 2;
    const oy = -leftWing / 2;

    const rgbBase = hexToRgb01(mainHex, 0.93);
    const rgbSeat = hexToRgb01(mainHex, 1.00);
    const rgbBack = hexToRgb01(mainHex, 0.97);
    const rgbArm  = hexToRgb01(mainHex, 0.95);
    const rgbPocket = hexToRgb01(mainHex, 0.87);
    const rgbPillow = hexToRgb01(pillowHex, 1.02);
    const rgbLeg = hexToRgb01(legHex, 1.0);

    const skeletonBoxes = [];
    const frontBoxes = [];

    function addSkel(id, label, u0, u1, v0, v1, z0, z1, rgb, hex, role, shape) {
      skeletonBoxes.push({
        id: id,
        label: label,
        role: role || 'sofa_base',
        shape: shape || 'cushion',
        lx0: ox + u0,
        lx1: ox + u1,
        ly0: oy + v0,
        ly1: oy + v1,
        lz0: z0,
        lz1: z1,
        colorHex: hex || mainHex,
        colorRgb: rgb
      });
    }

    function addFront(id, label, u0, u1, v0, v1, z0, z1, rgb, hex, role, localRotDeg, shape) {
      frontBoxes.push({
        id: id,
        label: label,
        role: role || 'sofa_cushion',
        shape: shape || 'cushion',
        lx0: ox + u0,
        lx1: ox + u1,
        ly0: oy + v0,
        ly1: oy + v1,
        lz0: z0,
        lz1: z1,
        localRotDeg: localRotDeg || 0,
        colorHex: hex || mainHex,
        colorRgb: rgb
      });
    }

    // 1. Dark 6.5 cm Block Feet (Z = 0..65 mm)
    const footSize = 65;
    const footCoords = [
      [35, 35],
      [625, 35],
      [35, 625],
      [625, 625],
      [Math.round((710 + rightWing - 90) / 2) - 32, 35],
      [Math.round((710 + rightWing - 90) / 2) - 32, depth - 95],
      [rightWing - 100, 35],
      [rightWing - 100, depth - 95],
      [35, Math.round((710 + leftWing - 90) / 2) - 32],
      [depth - 95, Math.round((710 + leftWing - 90) / 2) - 32],
      [35, leftWing - 100],
      [depth - 95, leftWing - 100]
    ];
    footCoords.forEach((fc, idx) => {
      addSkel(
        inst.id + '_FOOT_' + (idx + 1),
        'Sofa Foot 6.5 cm #' + (idx + 1),
        fc[0], fc[0] + footSize,
        fc[1], fc[1] + footSize,
        0, footH,
        rgbLeg, legHex, 'sofa_foot', 'box'
      );
    });

    // 2. Rounded Upholstered Base Deck (Z = 65..245 mm)
    addSkel(inst.id + '_BASE_CORNER', 'Corner Rounded Base (71×71 cm)', 0, depth, 0, depth, footH, baseTopZ, rgbBase, mainHex, 'sofa_base', 'cushion');
    addSkel(inst.id + '_BASE_WING_A', 'Right Wing Rounded Base', depth - 20, rightWing - armW + 10, 0, depth, footH, baseTopZ, rgbBase, mainHex, 'sofa_base', 'cushion');
    addSkel(inst.id + '_BASE_WING_B', 'Left Wing Rounded Base', 0, depth, depth - 20, leftWing - armW + 10, footH, baseTopZ, rgbBase, mainHex, 'sofa_base', 'cushion');

    // 3. Softly Curved Rear Backrest L-Frame (Z = 220..725 mm)
    addSkel(inst.id + '_BACK_FRAME_A', 'Right Wing Curved Backrest', 0, rightWing - armW + 10, 0, backFrameT + 10, baseTopZ - 20, backFrameTopZ, rgbBase, mainHex, 'sofa_base', 'bolster_x');
    addSkel(inst.id + '_BACK_FRAME_B', 'Left Wing Curved Backrest', 0, backFrameT + 10, 0, leftWing - armW + 10, baseTopZ - 20, backFrameTopZ, rgbBase, mainHex, 'sofa_base', 'bolster_y');

    // 4. Sculpted Curved Armrests (9 cm wide × 68 cm deep × 63 cm high, Z = 65..630 mm) + Side Storage Pocket
    addSkel(inst.id + '_ARM_RIGHT', 'Right Curved Armrest (9×68×63 cm)', rightWing - armW - 5, rightWing, 15, 15 + armD, footH, armTopZ, rgbArm, mainHex, 'sofa_base', 'armrest_y');
    addSkel(inst.id + '_ARM_LEFT', 'Left Curved Armrest (9×68×63 cm)', 15, 15 + armD, leftWing - armW - 5, leftWing, footH, armTopZ, rgbArm, mainHex, 'sofa_base', 'armrest_x');
    addSkel(inst.id + '_ARM_POCKET_L', 'Side Magazine Pocket', 185, 525, leftWing - 4, leftWing + 14, 145, 395, rgbPocket, mainHex, 'sofa_base', 'cushion');

    // 5. Plush Bullnose Seat Cushions (Z = 235..430 mm, 43 cm seat top height, 52 cm usable seat depth)
    // Corner rounded seat cushion
    addFront(
      inst.id + '_SEAT_CORNER',
      'Corner Bullnose Seat Cushion',
      backFrameT - 10, depth + 2,
      backFrameT - 10, depth + 2,
      baseTopZ - 10, seatTopZ,
      rgbSeat, mainHex, 'sofa_cushion', 0, 'cushion'
    );

    // Wing A (Right wing) modular bullnose seat cushions (70 cm wide × 52 cm usable depth)
    const wingASpan = (rightWing - armW) - depth;
    const wingACount = 2;
    const modAW = Math.floor(wingASpan / wingACount);
    for (let i = 0; i < wingACount; i++) {
      const u0 = depth + i * modAW;
      const u1 = (i === wingACount - 1) ? (rightWing - armW) : (u0 + modAW);
      addFront(
        inst.id + '_SEAT_A' + (i + 1),
        'Right Wing Bullnose Seat #' + (i + 1) + ' (70×52 cm)',
        u0 - 2, u1 + 2,
        backFrameT - 8, depth + 6,
        baseTopZ - 10, seatTopZ,
        rgbSeat, mainHex, 'sofa_cushion', 0, 'cushion'
      );
      // Plump curved backrest cushion (68 cm wide × 44 cm high, Z = 370..810 mm)
      addFront(
        inst.id + '_BACK_CUSH_A' + (i + 1),
        'Right Wing Curved Back Cushion #' + (i + 1) + ' (68×44 cm)',
        u0 + 8, u1 - 8,
        backFrameT - 6, backCushDepth + 12,
        totalTopZ - 440, totalTopZ,
        rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_x'
      );
    }

    // Wing B (Left wing) modular bullnose seat cushions (70 cm wide × 52 cm usable depth)
    const wingBSpan = (leftWing - armW) - depth;
    const wingBCount = 2;
    const modBW = Math.floor(wingBSpan / wingBCount);
    for (let j = 0; j < wingBCount; j++) {
      const v0 = depth + j * modBW;
      const v1 = (j === wingBCount - 1) ? (leftWing - armW) : (v0 + modBW);
      addFront(
        inst.id + '_SEAT_B' + (j + 1),
        'Left Wing Bullnose Seat #' + (j + 1) + ' (70×52 cm)',
        backFrameT - 8, depth + 6,
        v0 - 2, v1 + 2,
        baseTopZ - 10, seatTopZ,
        rgbSeat, mainHex, 'sofa_cushion', 0, 'cushion'
      );
      // Plump curved backrest cushion (68 cm wide × 44 cm high, Z = 370..810 mm)
      addFront(
        inst.id + '_BACK_CUSH_B' + (j + 1),
        'Left Wing Curved Back Cushion #' + (j + 1) + ' (68×44 cm)',
        backFrameT - 6, backCushDepth + 12,
        v0 + 8, v1 - 8,
        totalTopZ - 440, totalTopZ,
        rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_y'
      );
    }

    // Corner module curved backrest cushions (Z = 370..810 mm)
    addFront(
      inst.id + '_BACK_CUSH_CORNER_A',
      'Corner Curved Back Cushion A',
      backFrameT + 4, depth - 4,
      backFrameT - 6, backCushDepth + 12,
      totalTopZ - 440, totalTopZ,
      rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_x'
    );
    addFront(
      inst.id + '_BACK_CUSH_CORNER_B',
      'Corner Curved Back Cushion B',
      backFrameT - 6, backCushDepth + 12,
      backCushDepth - 10, depth - 4,
      totalTopZ - 440, totalTopZ,
      rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_y'
    );

    // 6. Curved Side Arm Bolster Pillows (65 × 44 cm, resting inside left and right armrests, Z = 365..785 mm)
    addFront(
      inst.id + '_ARM_PILLOW_R',
      'Right Curved Arm Cushion (65×44 cm)',
      rightWing - armW - 105, rightWing - armW + 4,
      115, 685,
      365, 785,
      rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_y'
    );
    addFront(
      inst.id + '_ARM_PILLOW_L',
      'Left Curved Arm Cushion (65×44 cm)',
      115, 685,
      leftWing - armW - 105, leftWing - armW + 4,
      365, 785,
      rgbBack, mainHex, 'sofa_cushion', 0, 'bolster_x'
    );

    // 7. Three Puffed Square Throw Pillows (40 × 40 cm = 400 × 400 mm, Z = 420..790 mm)
    addFront(
      inst.id + '_PILLOW_CORNER',
      'Corner Puffed Throw Pillow (40×40 cm)',
      175, 575,
      275, 405,
      seatTopZ - 10, seatTopZ + 365,
      rgbPillow, pillowHex, 'sofa_pillow',
      -45, 'pillow'
    );
    addFront(
      inst.id + '_PILLOW_RIGHT',
      'Right Wing Puffed Throw Pillow (40×40 cm)',
      rightWing - armW - 525, rightWing - armW - 125,
      backCushDepth - 5, backCushDepth + 115,
      seatTopZ - 10, seatTopZ + 365,
      rgbPillow, pillowHex, 'sofa_pillow',
      -8, 'pillow'
    );
    addFront(
      inst.id + '_PILLOW_LEFT',
      'Left Wing Puffed Throw Pillow (40×40 cm)',
      backCushDepth - 5, backCushDepth + 115,
      leftWing - armW - 525, leftWing - armW - 125,
      seatTopZ - 10, seatTopZ + 365,
      rgbPillow, pillowHex, 'sofa_pillow',
      8, 'pillow'
    );

    // Smooth curved L-shaped 2D floor footprint in local coordinates
    const localFootprint2D = buildCurvedLPolygon2D(ox, oy, rightWing, leftWing, depth);

    return {
      widthMm: rightWing,
      depthMm: leftWing,
      heightMm: totalTopZ,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: frontBoxes,
      localFootprint2D: localFootprint2D
    };
  }

  function buildChaiseSofaLocal(inst) {
    const props = inst.properties || {};
    const mainHex = sanitizeHexColor(props.upholsteryColor, '#D8CFC2');
    const pillowHex = sanitizeHexColor(props.pillowColor, '#EFECE6');
    const legHex = sanitizeHexColor(props.legColor, '#232528');
    const chaiseSide = props.chaiseSide === 'left' ? 'left' : 'right';

    const totalW = 2750;
    const chaiseD = 1750;
    const seatD = 950;
    const chaiseW = 1020;
    const heightMm = 800;
    const footH = 55;
    const baseTopZ = 240;
    const seatTopZ = 420;
    const armW = 140;
    const armTopZ = 610;
    const backT = 180;

    const ox = -totalW / 2;
    const oy = -chaiseD / 2;

    const rgbBase = hexToRgb01(mainHex, 0.92);
    const rgbSeat = hexToRgb01(mainHex, 1.00);
    const rgbBack = hexToRgb01(mainHex, 0.96);
    const rgbPillow = hexToRgb01(pillowHex, 1.02);
    const rgbLeg = hexToRgb01(legHex, 1.0);

    const skeletonBoxes = [];
    const frontBoxes = [];

    const chU0 = chaiseSide === 'right' ? (totalW - chaiseW) : 0;
    const chU1 = chaiseSide === 'right' ? totalW : chaiseW;
    const mainU0 = chaiseSide === 'right' ? 0 : chaiseW;
    const mainU1 = chaiseSide === 'right' ? (totalW - chaiseW) : totalW;

    // Base & Backrest (rounded)
    skeletonBoxes.push(
      { id: inst.id + '_BASE_MAIN', label: 'Sofa Base', role: 'sofa_base', shape: 'cushion', lx0: ox + mainU0, lx1: ox + mainU1, ly0: oy, ly1: oy + seatD, lz0: footH, lz1: baseTopZ, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_BASE_CHAISE', label: 'Chaise Base', role: 'sofa_base', shape: 'cushion', lx0: ox + chU0, lx1: ox + chU1, ly0: oy, ly1: oy + chaiseD, lz0: footH, lz1: baseTopZ, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_BACK_MAIN', label: 'Backrest Frame', role: 'sofa_base', shape: 'bolster_x', lx0: ox + armW, lx1: ox + totalW - armW, ly0: oy, ly1: oy + 115, lz0: baseTopZ, lz1: 730, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_ARM_L', label: 'Left Armrest', role: 'sofa_base', shape: 'armrest_y', lx0: ox, lx1: ox + armW, ly0: oy + 20, ly1: oy + seatD - 20, lz0: footH, lz1: armTopZ, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_ARM_R', label: 'Right Armrest', role: 'sofa_base', shape: 'armrest_y', lx0: ox + totalW - armW, lx1: ox + totalW, ly0: oy + 20, ly1: oy + seatD - 20, lz0: footH, lz1: armTopZ, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_FOOT_1', label: 'Foot 1', role: 'sofa_foot', shape: 'box', lx0: ox + 30, lx1: ox + 95, ly0: oy + 30, ly1: oy + 95, lz0: 0, lz1: footH, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_FOOT_2', label: 'Foot 2', role: 'sofa_foot', shape: 'box', lx0: ox + totalW - 95, lx1: ox + totalW - 30, ly0: oy + 30, ly1: oy + 95, lz0: 0, lz1: footH, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_FOOT_3', label: 'Foot 3', role: 'sofa_foot', shape: 'box', lx0: ox + chU0 + 30, lx1: ox + chU0 + 95, ly0: oy + chaiseD - 95, ly1: oy + chaiseD - 30, lz0: 0, lz1: footH, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_FOOT_4', label: 'Foot 4', role: 'sofa_foot', shape: 'box', lx0: ox + chU1 - 95, lx1: ox + chU1 - 30, ly0: oy + chaiseD - 95, ly1: oy + chaiseD - 30, lz0: 0, lz1: footH, colorHex: legHex, colorRgb: rgbLeg }
    );

    const seatSpanU0 = chaiseSide === 'right' ? armW : chaiseW;
    const seatSpanU1 = chaiseSide === 'right' ? (totalW - chaiseW) : (totalW - armW);
    const midU = Math.round((seatSpanU0 + seatSpanU1) / 2);

    frontBoxes.push(
      { id: inst.id + '_SEAT_1', label: 'Seat Cushion 1', role: 'sofa_cushion', shape: 'cushion', lx0: ox + seatSpanU0, lx1: ox + midU, ly0: oy + 100, ly1: oy + seatD + 5, lz0: baseTopZ - 8, lz1: seatTopZ, colorHex: mainHex, colorRgb: rgbSeat },
      { id: inst.id + '_SEAT_2', label: 'Seat Cushion 2', role: 'sofa_cushion', shape: 'cushion', lx0: ox + midU, lx1: ox + seatSpanU1, ly0: oy + 100, ly1: oy + seatD + 5, lz0: baseTopZ - 8, lz1: seatTopZ, colorHex: mainHex, colorRgb: rgbSeat },
      { id: inst.id + '_SEAT_CHAISE', label: 'Chaise Cushion', role: 'sofa_cushion', shape: 'cushion', lx0: ox + (chaiseSide === 'right' ? chU0 : armW), lx1: ox + (chaiseSide === 'right' ? totalW - armW : chU1), ly0: oy + 100, ly1: oy + chaiseD + 5, lz0: baseTopZ - 8, lz1: seatTopZ, colorHex: mainHex, colorRgb: rgbSeat },
      { id: inst.id + '_BACK_1', label: 'Back Cushion 1', role: 'sofa_cushion', shape: 'bolster_x', lx0: ox + seatSpanU0 + 10, lx1: ox + midU - 6, ly0: oy + 95, ly1: oy + backT + 15, lz0: 360, lz1: heightMm, colorHex: mainHex, colorRgb: rgbBack },
      { id: inst.id + '_BACK_2', label: 'Back Cushion 2', role: 'sofa_cushion', shape: 'bolster_x', lx0: ox + midU + 6, lx1: ox + seatSpanU1 - 10, ly0: oy + 95, ly1: oy + backT + 15, lz0: 360, lz1: heightMm, colorHex: mainHex, colorRgb: rgbBack },
      { id: inst.id + '_BACK_3', label: 'Chaise Back Cushion', role: 'sofa_cushion', shape: 'bolster_x', lx0: ox + chU0 + 20, lx1: ox + chU1 - 20, ly0: oy + 95, ly1: oy + backT + 15, lz0: 360, lz1: heightMm, colorHex: mainHex, colorRgb: rgbBack },
      { id: inst.id + '_PILLOW_1', label: 'Throw Pillow 1', role: 'sofa_pillow', shape: 'pillow', lx0: ox + seatSpanU0 + 60, lx1: ox + seatSpanU0 + 460, ly0: oy + backT, ly1: oy + backT + 115, lz0: seatTopZ - 8, lz1: seatTopZ + 360, colorHex: pillowHex, colorRgb: rgbPillow, localRotDeg: 8 },
      { id: inst.id + '_PILLOW_2', label: 'Throw Pillow 2', role: 'sofa_pillow', shape: 'pillow', lx0: ox + chU0 + 180, lx1: ox + chU0 + 580, ly0: oy + backT, ly1: oy + backT + 115, lz0: seatTopZ - 8, lz1: seatTopZ + 360, colorHex: pillowHex, colorRgb: rgbPillow, localRotDeg: -8 }
    );

    const localFootprint2D = chaiseSide === 'right'
      ? [
          [ox + 0,               oy + 0],
          [ox + totalW,          oy + 0],
          [ox + totalW,          oy + chaiseD],
          [ox + totalW - chaiseW, oy + chaiseD],
          [ox + totalW - chaiseW, oy + seatD],
          [ox + 0,               oy + seatD]
        ]
      : [
          [ox + 0,       oy + 0],
          [ox + totalW,  oy + 0],
          [ox + totalW,  oy + seatD],
          [ox + chaiseW, oy + seatD],
          [ox + chaiseW, oy + chaiseD],
          [ox + 0,       oy + chaiseD]
        ];

    return {
      widthMm: totalW,
      depthMm: chaiseD,
      heightMm: heightMm,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: frontBoxes,
      localFootprint2D: localFootprint2D
    };
  }

  function buildArmchairLocal(inst) {
    const props = inst.properties || {};
    const mainHex = sanitizeHexColor(props.upholsteryColor, '#C46D53');
    const legHex = sanitizeHexColor(props.legColor, '#4A3525');
    const w = 840, d = 820, h = 780;
    const ox = -w / 2, oy = -d / 2;
    const rgbBase = hexToRgb01(mainHex, 0.92);
    const rgbSeat = hexToRgb01(mainHex, 1.00);
    const rgbLeg = hexToRgb01(legHex, 1.0);

    const skeletonBoxes = [
      { id: inst.id + '_BASE', label: 'Armchair Frame', role: 'sofa_base', shape: 'cushion', lx0: ox, lx1: ox + w, ly0: oy, ly1: oy + d, lz0: 140, lz1: 270, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_ARM_L', label: 'Left Arm', role: 'sofa_base', shape: 'armrest_y', lx0: ox, lx1: ox + 105, ly0: oy, ly1: oy + d - 20, lz0: 250, lz1: 610, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_ARM_R', label: 'Right Arm', role: 'sofa_base', shape: 'armrest_y', lx0: ox + w - 105, lx1: ox + w, ly0: oy, ly1: oy + d - 20, lz0: 250, lz1: 610, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_BACK_SHELL', label: 'Back Shell', role: 'sofa_base', shape: 'bolster_x', lx0: ox + 90, lx1: ox + w - 90, ly0: oy, ly1: oy + 120, lz0: 250, lz1: 710, colorHex: mainHex, colorRgb: rgbBase },
      { id: inst.id + '_LEG_1', label: 'Leg 1', role: 'sofa_foot', shape: 'box', lx0: ox + 35, lx1: ox + 85, ly0: oy + 35, ly1: oy + 85, lz0: 0, lz1: 140, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_LEG_2', label: 'Leg 2', role: 'sofa_foot', shape: 'box', lx0: ox + w - 85, lx1: ox + w - 35, ly0: oy + 35, ly1: oy + 85, lz0: 0, lz1: 140, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_LEG_3', label: 'Leg 3', role: 'sofa_foot', shape: 'box', lx0: ox + 35, lx1: ox + 85, ly0: oy + d - 85, ly1: oy + d - 35, lz0: 0, lz1: 140, colorHex: legHex, colorRgb: rgbLeg },
      { id: inst.id + '_LEG_4', label: 'Leg 4', role: 'sofa_foot', shape: 'box', lx0: ox + w - 85, lx1: ox + w - 35, ly0: oy + d - 85, ly1: oy + d - 35, lz0: 0, lz1: 140, colorHex: legHex, colorRgb: rgbLeg }
    ];
    const frontBoxes = [
      { id: inst.id + '_SEAT', label: 'Seat Cushion', role: 'sofa_cushion', shape: 'cushion', lx0: ox + 98, lx1: ox + w - 98, ly0: oy + 100, ly1: oy + d, lz0: 260, lz1: 420, colorHex: mainHex, colorRgb: rgbSeat },
      { id: inst.id + '_BACK_CUSH', label: 'Back Cushion', role: 'sofa_cushion', shape: 'bolster_x', lx0: ox + 105, lx1: ox + w - 105, ly0: oy + 100, ly1: oy + 245, lz0: 380, lz1: h, colorHex: mainHex, colorRgb: rgbSeat }
    ];
    return {
      widthMm: w,
      depthMm: d,
      heightMm: h,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: frontBoxes,
      localFootprint2D: [[ox, oy], [ox + w, oy], [ox + w, oy + d], [ox, oy + d]]
    };
  }

  function buildTableLocal(inst, w, d, h) {
    const props = inst.properties || {};
    const topHex = sanitizeHexColor(props.topColor, '#E8E2D5');
    const baseHex = sanitizeHexColor(props.baseColor, '#4A3525');
    const ox = -w / 2, oy = -d / 2;
    const topT = 38;
    const rgbTop = hexToRgb01(topHex, 1.0);
    const rgbBase = hexToRgb01(baseHex, 1.0);

    const legInsetX = Math.round(w * 0.16);
    const legInsetY = Math.round(d * 0.14);
    const legW = Math.min(180, Math.round(w * 0.14));

    const skeletonBoxes = [
      { id: inst.id + '_TOP', label: 'Tabletop Slab', role: 'countertop_slab', shape: 'box', lx0: ox, lx1: ox + w, ly0: oy, ly1: oy + d, lz0: h - topT, lz1: h, colorHex: topHex, colorRgb: rgbTop },
      { id: inst.id + '_BASE_L', label: 'Left Pedestal Leg', role: 'carcass_panel', shape: 'box', lx0: ox + legInsetX, lx1: ox + legInsetX + legW, ly0: oy + legInsetY, ly1: oy + d - legInsetY, lz0: 0, lz1: h - topT, colorHex: baseHex, colorRgb: rgbBase },
      { id: inst.id + '_BASE_R', label: 'Right Pedestal Leg', role: 'carcass_panel', shape: 'box', lx0: ox + w - legInsetX - legW, lx1: ox + w - legInsetX, ly0: oy + legInsetY, ly1: oy + d - legInsetY, lz0: 0, lz1: h - topT, colorHex: baseHex, colorRgb: rgbBase }
    ];
    return {
      widthMm: w,
      depthMm: d,
      heightMm: h,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: [],
      localFootprint2D: [[ox, oy], [ox + w, oy], [ox + w, oy + d], [ox, oy + d]]
    };
  }

  function buildMediaConsoleLocal(inst) {
    const props = inst.properties || {};
    const bodyHex = sanitizeHexColor(props.bodyColor, '#B5895A');
    const frontHex = sanitizeHexColor(props.frontColor, '#9E7347');
    const w = 2000, d = 450, h = 480, footH = 100;
    const ox = -w / 2, oy = -d / 2;
    const rgbBody = hexToRgb01(bodyHex, 1.0);
    const rgbFront = hexToRgb01(frontHex, 1.0);
    const rgbLeg = hexToRgb01('#232528', 1.0);

    const skeletonBoxes = [
      { id: inst.id + '_BODY', label: 'Console Carcass', role: 'carcass_panel', shape: 'box', lx0: ox, lx1: ox + w, ly0: oy, ly1: oy + d - 20, lz0: footH, lz1: h, colorHex: bodyHex, colorRgb: rgbBody },
      { id: inst.id + '_LEG_L', label: 'Left Frame Leg', role: 'sofa_foot', shape: 'box', lx0: ox + 80, lx1: ox + 125, ly0: oy + 35, ly1: oy + d - 45, lz0: 0, lz1: footH, colorHex: '#232528', colorRgb: rgbLeg },
      { id: inst.id + '_LEG_R', label: 'Right Frame Leg', role: 'sofa_foot', shape: 'box', lx0: ox + w - 125, lx1: ox + w - 80, ly0: oy + 35, ly1: oy + d - 45, lz0: 0, lz1: footH, colorHex: '#232528', colorRgb: rgbLeg }
    ];
    const doorW = Math.floor((w - 24) / 4);
    const frontBoxes = [];
    for (let i = 0; i < 4; i++) {
      const lx0 = ox + 6 + i * (doorW + 4);
      frontBoxes.push({
        id: inst.id + '_DOOR_' + (i + 1),
        label: 'Console Door #' + (i + 1),
        role: 'door_front',
        shape: 'box',
        lx0: lx0,
        lx1: lx0 + doorW,
        ly0: oy + d - 20,
        ly1: oy + d,
        lz0: footH + 8,
        lz1: h - 8,
        colorHex: frontHex,
        colorRgb: rgbFront
      });
    }
    return {
      widthMm: w,
      depthMm: d,
      heightMm: h,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: frontBoxes,
      localFootprint2D: [[ox, oy], [ox + w, oy], [ox + w, oy + d], [ox, oy + d]]
    };
  }

  function buildChanneledBedLocal(inst) {
    const props = inst.properties || {};
    const isQueen = props.bedSize === 'queen';
    const uphHex = sanitizeHexColor(props.upholsteryColor, '#D5CEC5');
    const bedHex = sanitizeHexColor(props.beddingColor, '#F2F0EC');
    const throwHex = sanitizeHexColor(props.throwColor, '#7D7265');
    const accentHex = sanitizeHexColor(props.accentPillowColor, '#6D6B44');

    // Exact dimensions from architectural specification diagram & request (in mm):
    // King:  180 × 200 cm mattress -> 185 × 209.5 × H110 cm outer frame (8 vertical channels)
    // Queen: 160 × 200 cm mattress -> 165 × 209.5 × H110 cm outer frame (7 vertical channels)
    // Frame panel = 41 cm on 1.5 cm recessed floor glides -> 42.5 cm rail top; Mattress = 23 cm high!
    const railT = 25;
    const mattressW = isQueen ? 1600 : 1800;
    const mattressL = 2000;
    const mattressH = 230;
    const headboardT = 70;
    const headboardCoreT = 38;
    const headboardH = 1100;
    const footH = 15;
    const railTopZ = 425; // 15 mm glides + 410 mm upholstered box panel = 425 mm (42.5 cm)
    const slatTopZ = 325; // 230 mm mattress sits 100 mm tucked in box, rising 130 mm above rail to 555 mm
    const mattressTopZ = slatTopZ + mattressH; // 555 mm
    const channelCount = isQueen ? 7 : 8;

    const totalW = mattressW + 2 * railT; // 1650 (Queen) or 1850 (King)
    const totalD = headboardT + mattressL + railT; // 2095 mm (209.5 cm)
    const ox = -totalW / 2;
    const oy = -totalD / 2;

    // Curated tonal shades so upholstery channels, frame rails, seams, bedding & pillows have rich visual depth
    const rgbFrame = hexToRgb01(uphHex, 0.96);
    const rgbHeadCore = hexToRgb01(uphHex, 0.93);
    const rgbChannel = hexToRgb01(uphHex, 1.01);
    const rgbSeam = hexToRgb01(uphHex, 0.72);
    const rgbInnerLiner = hexToRgb01(uphHex, 0.80);
    const rgbGlide = hexToRgb01('#1C1E22', 1.0);
    const rgbSteel = hexToRgb01('#22252A', 1.0);
    const rgbSlatWood = hexToRgb01('#D4B48C', 1.0);
    const mattressHex = mixHexColors('#FFFFFF', bedHex, 0.35);
    const rgbMattress = hexToRgb01(mattressHex, 1.0);
    const rgbDuvet = hexToRgb01(bedHex, 0.99);
    const rgbDuvetCuff = hexToRgb01(bedHex, 1.02);
    const rgbSleepPillow = hexToRgb01(bedHex, 1.03);
    const rgbThrow = hexToRgb01(throwHex, 0.98);
    const sidePillowLeftHex = mixHexColors(throwHex, bedHex, 0.44);
    const sidePillowRightHex = mixHexColors(bedHex, uphHex, 0.36);
    const rgbSidePillowL = hexToRgb01(sidePillowLeftHex, 1.0);
    const rgbSidePillowR = hexToRgb01(sidePillowRightHex, 1.0);
    const rgbAccentPillow = hexToRgb01(accentHex, 1.0);

    const skeletonBoxes = [];
    const frontBoxes = [];

    function addSkel(id, label, u0, u1, v0, v1, z0, z1, rgb, hex, role, shape, extra) {
      skeletonBoxes.push(Object.assign({
        id: id,
        label: label,
        role: role || 'bed_frame',
        shape: shape || 'beveled_panel',
        lx0: ox + u0,
        lx1: ox + u1,
        ly0: oy + v0,
        ly1: oy + v1,
        lz0: z0,
        lz1: z1,
        colorHex: hex || uphHex,
        colorRgb: rgb
      }, extra || {}));
    }

    function addFront(id, label, u0, u1, v0, v1, z0, z1, rgb, hex, role, shape, extra) {
      frontBoxes.push(Object.assign({
        id: id,
        label: label,
        role: role || 'bed_duvet',
        shape: shape || 'box',
        lx0: ox + u0,
        lx1: ox + u1,
        ly0: oy + v0,
        ly1: oy + v1,
        lz0: z0,
        lz1: z1,
        colorHex: hex || bedHex,
        colorRgb: rgb
      }, extra || {}));
    }

    // -------------------------------------------------------------------------
    // 1. SKELETON: Recessed 1.5 cm Glides, 41 cm Box Frame, Storage Cavity & Metal Slat Base
    // -------------------------------------------------------------------------
    const glideW = 55;
    const glidePts = [
      [35, 35],
      [totalW - 35 - glideW, 35],
      [35, Math.round(totalD / 2) - 28],
      [totalW - 35 - glideW, Math.round(totalD / 2) - 28],
      [35, totalD - 35 - glideW],
      [totalW - 35 - glideW, totalD - 35 - glideW]
    ];
    glidePts.forEach((gp, idx) => {
      addSkel(
        inst.id + '_GLIDE_' + (idx + 1),
        'Recessed Floor Glide (1.5 cm) #' + (idx + 1),
        gp[0], gp[0] + glideW,
        gp[1], gp[1] + glideW,
        1.5, footH + 1,
        rgbGlide, '#1C1E22', 'bed_foot', 'box'
      );
    });

    // Upholstered Structural Headboard Core (Z = 15..1,100 mm, 38 mm rear upholstered shell)
    addSkel(
      inst.id + '_HB_BACK',
      'Upholstered Headboard Structural Back (110 cm)',
      0, totalW,
      0, headboardCoreT,
      footH, headboardH,
      rgbHeadCore, uphHex, 'bed_headboard', 'beveled_panel',
      { bevelMm: 5 }
    );

    // Lower Upholstered Headboard Apron behind mattress (Z = 15..425 mm)
    addSkel(
      inst.id + '_HB_LOWER',
      'Headboard Lower Apron',
      2, totalW - 2,
      headboardCoreT - 2, headboardT,
      footH, railTopZ,
      rgbHeadCore, uphHex, 'bed_frame', 'beveled_panel',
      { bevelMm: 3 }
    );

    // Left & Right Upholstered Box Side Rails (25 mm thick × 410 mm tall, Z = 15..425 mm)
    addSkel(
      inst.id + '_RAIL_L',
      'Left Upholstered Side Rail (41 cm panel / 42.5 cm top)',
      0, railT,
      headboardT - 2, totalD - railT + 2,
      footH, railTopZ,
      rgbFrame, uphHex, 'bed_frame', 'beveled_panel',
      { bevelMm: 4 }
    );
    addSkel(
      inst.id + '_RAIL_R',
      'Right Upholstered Side Rail (41 cm panel / 42.5 cm top)',
      totalW - railT, totalW,
      headboardT - 2, totalD - railT + 2,
      footH, railTopZ,
      rgbFrame, uphHex, 'bed_frame', 'beveled_panel',
      { bevelMm: 4 }
    );

    // Upholstered Footboard (25 mm thick × 410 mm tall, Z = 15..425 mm)
    addSkel(
      inst.id + '_FOOTBOARD',
      'Upholstered Footboard (42.5 cm height)',
      0, totalW,
      totalD - railT, totalD,
      footH, railTopZ,
      rgbFrame, uphHex, 'bed_frame', 'beveled_panel',
      { bevelMm: 4 }
    );

    // Storage Box Interior Floor Liner (Z = 22..42 mm)
    addSkel(
      inst.id + '_STORAGE_FLOOR',
      'Under-Bed Storage Box Floor',
      railT, totalW - railT,
      headboardT, totalD - railT,
      22, 42,
      rgbInnerLiner, uphHex, 'bed_frame', 'box'
    );

    // Black Powder-Coated Steel Lift-Up Slat Frame (Z = 295..325 mm, matching dimension diagram)
    const steelBar = 32;
    const frameU0 = railT + 8, frameU1 = totalW - railT - 8;
    const frameV0 = headboardT + 8, frameV1 = totalD - railT - 8;
    const midU = totalW / 2;
    addSkel(inst.id + '_SLAT_FRAME_L', 'Lift-Up Steel Frame Left Rail', frameU0, frameU0 + steelBar, frameV0, frameV1, 295, slatTopZ, rgbSteel, '#22252A', 'bed_slat_frame', 'box');
    addSkel(inst.id + '_SLAT_FRAME_R', 'Lift-Up Steel Frame Right Rail', frameU1 - steelBar, frameU1, frameV0, frameV1, 295, slatTopZ, rgbSteel, '#22252A', 'bed_slat_frame', 'box');
    addSkel(inst.id + '_SLAT_FRAME_H', 'Lift-Up Steel Frame Head Rail', frameU0 + steelBar, frameU1 - steelBar, frameV0, frameV0 + steelBar, 295, slatTopZ, rgbSteel, '#22252A', 'bed_slat_frame', 'box');
    addSkel(inst.id + '_SLAT_FRAME_F', 'Lift-Up Steel Frame Foot Rail', frameU0 + steelBar, frameU1 - steelBar, frameV1 - steelBar, frameV1, 295, slatTopZ, rgbSteel, '#22252A', 'bed_slat_frame', 'box');
    addSkel(inst.id + '_SLAT_FRAME_MID', 'Lift-Up Steel Frame Center Spine', midU - 18, midU + 18, frameV0 + steelBar, frameV1 - steelBar, 295, slatTopZ, rgbSteel, '#22252A', 'bed_slat_frame', 'box');

    // Birch Bentwood Slats (14 pairs across left & right bays, Z = 312..324 mm)
    const slatCount = 14;
    const slatSpanV = (frameV1 - steelBar) - (frameV0 + steelBar);
    const slatStepV = slatSpanV / slatCount;
    for (let si = 0; si < slatCount; si++) {
      const sv0 = frameV0 + steelBar + si * slatStepV + 24;
      const sv1 = sv0 + 52;
      addSkel(inst.id + '_SLAT_L_' + (si + 1), 'Birch Slat L' + (si + 1), frameU0 + steelBar, midU - 18, sv0, sv1, 312, slatTopZ - 1, rgbSlatWood, '#D4B48C', 'bed_slat', 'box');
      addSkel(inst.id + '_SLAT_R_' + (si + 1), 'Birch Slat R' + (si + 1), midU + 18, frameU1 - steelBar, sv0, sv1, 312, slatTopZ - 1, rgbSlatWood, '#D4B48C', 'bed_slat', 'box');
    }

    // -------------------------------------------------------------------------
    // 2. FRONTS / SOFT FURNISHINGS: Channeled Headboard Flutes, 23 cm Mattress, Duvet, Throw & Pillows
    // -------------------------------------------------------------------------
    // Individually Sculpted Plush Vertical Headboard Channels (8 on King, 7 on Queen, Z = 420..1,100 mm)
    const chanW = totalW / channelCount;
    for (let ci = 0; ci < channelCount; ci++) {
      const cu0 = ci * chanW;
      const cu1 = (ci === channelCount - 1) ? totalW : (cu0 + chanW);
      // Alternating micro-tonal variation (+/-1.2%) brings out the tactile velvet sheen across channels
      const toneShift = (ci % 2 === 0) ? 1.01 : 0.99;
      addFront(
        inst.id + '_HB_CHAN_' + (ci + 1),
        'Headboard Vertical Channel #' + (ci + 1),
        cu0 + 1.5, cu1 - 1.5,
        headboardCoreT - 2, headboardT + 6,
        railTopZ - 5, headboardH,
        hexToRgb01(uphHex, toneShift), uphHex,
        'bed_headboard', 'headboard_channel',
        { seamLineRight: ci < channelCount - 1 }
      );
      // Recessed darkened vertical stitch shadow groove between flutes
      if (ci < channelCount - 1) {
        addFront(
          inst.id + '_HB_SEAM_' + (ci + 1),
          'Headboard Channel Stitch Seam #' + (ci + 1),
          cu1 - 3, cu1 + 3,
          headboardCoreT - 1, headboardCoreT + 7,
          railTopZ, headboardH - 5,
          rgbSeam, uphHex,
          'bed_headboard_seam', 'box'
        );
      }
    }

    // Exact 23 cm Quilted Mattress (160×200×23 cm Queen or 180×200×23 cm King, Z = 325..555 mm)
    addFront(
      inst.id + '_MATTRESS',
      `23 cm Quilted Mattress (${Math.round(mattressW / 10)}×200×23 cm)`,
      railT + 2, totalW - railT - 2,
      headboardT + 2, totalD - railT - 2,
      slatTopZ, mattressTopZ,
      rgbMattress, mattressHex,
      'bed_mattress', 'mattress'
    );

    // High-Resolution Sculpted Organic Linen Duvet (soft folds, tucking cleanly inside box rails)
    addFront(
      inst.id + '_DUVET',
      'Sculpted Organic Linen Duvet',
      railT + 1, totalW - railT - 1,
      headboardT + 480, totalD - railT - 1,
      railTopZ + 5, mattressTopZ + 22,
      rgbDuvet, bedHex,
      'bed_duvet', 'sculpted_duvet'
    );

    // Soft Folded Upper Duvet Turn-Down Cuff
    addFront(
      inst.id + '_DUVET_CUFF',
      'Folded Duvet Turn-Down Cuff',
      railT + 12, totalW - railT - 12,
      headboardT + 445, headboardT + 565,
      mattressTopZ - 10, mattressTopZ + 38,
      rgbDuvetCuff, bedHex,
      'bed_duvet', 'bolster_x'
    );

    // Sculpted Wavy Draped Throw Blanket (cascading softly across upper bed & mattress flanks)
    addFront(
      inst.id + '_THROW_BLANKET',
      'Draped Folded Throw Blanket',
      railT - 8, totalW - railT + 8,
      headboardT + 405, headboardT + 805,
      railTopZ + 22, mattressTopZ + 36,
      rgbThrow, throwHex,
      'bed_throw', 'sculpted_throw',
      { clothThicknessMm: 16 }
    );

    // Two Large Plump Reclined Sleeping Pillows (leaning naturally back against channeled headboard)
    const sleepPilW = isQueen ? 690 : 780;
    const sleepGap = isQueen ? 24 : 30;
    const sleepL0 = Math.round(midU - sleepGap / 2 - sleepPilW);
    const sleepR0 = Math.round(midU + sleepGap / 2);
    addFront(
      inst.id + '_SLEEP_PILLOW_L',
      'Left Sleeping Pillow',
      sleepL0, sleepL0 + sleepPilW,
      headboardT + 48, headboardT + 245,
      mattressTopZ - 18, mattressTopZ + 305,
      rgbSleepPillow, bedHex,
      'bed_pillow', 'tilted_pillow',
      { pitchDeg: 24, localRotDeg: 3, chopMm: 12, pXY: 0.56, pZ: 0.68 }
    );
    addFront(
      inst.id + '_SLEEP_PILLOW_R',
      'Right Sleeping Pillow',
      sleepR0, sleepR0 + sleepPilW,
      headboardT + 48, headboardT + 245,
      mattressTopZ - 18, mattressTopZ + 305,
      rgbSleepPillow, bedHex,
      'bed_pillow', 'tilted_pillow',
      { pitchDeg: 24, localRotDeg: -3, chopMm: 12, pXY: 0.56, pZ: 0.68 }
    );

    // Two Layered Flanking Decorative Cushions (warm taupe left, soft cream-sand right — matching photo!)
    const decoW = isQueen ? 400 : 445;
    const decoOffset = isQueen ? 290 : 335;
    addFront(
      inst.id + '_DECO_PILLOW_L',
      'Left Decorative Accent Cushion',
      Math.round(midU - decoOffset - decoW / 2), Math.round(midU - decoOffset + decoW / 2),
      headboardT + 195, headboardT + 345,
      mattressTopZ - 10, mattressTopZ + 255,
      rgbSidePillowL, sidePillowLeftHex,
      'bed_pillow', 'tilted_pillow',
      { pitchDeg: 19, localRotDeg: 7, chopMm: 14, pXY: 0.58, pZ: 0.70 }
    );
    addFront(
      inst.id + '_DECO_PILLOW_R',
      'Right Decorative Accent Cushion',
      Math.round(midU + decoOffset - decoW / 2), Math.round(midU + decoOffset + decoW / 2),
      headboardT + 195, headboardT + 345,
      mattressTopZ - 10, mattressTopZ + 255,
      rgbSidePillowR, sidePillowRightHex,
      'bed_pillow', 'tilted_pillow',
      { pitchDeg: 19, localRotDeg: -7, chopMm: 14, pXY: 0.58, pZ: 0.70 }
    );

    // Center Olive/Accent Lumbar Cushion (front-and-center with classic top-center crease!)
    const lumbarW = isQueen ? 460 : 510;
    addFront(
      inst.id + '_LUMBAR_PILLOW',
      'Center Accent Lumbar Cushion',
      Math.round(midU - lumbarW / 2), Math.round(midU + lumbarW / 2),
      headboardT + 290, headboardT + 425,
      mattressTopZ - 10, mattressTopZ + 235,
      rgbAccentPillow, accentHex,
      'bed_pillow', 'tilted_pillow',
      { pitchDeg: 14, localRotDeg: 0, chopMm: 22, pXY: 0.56, pZ: 0.68 }
    );

    return {
      widthMm: totalW,
      depthMm: totalD,
      heightMm: headboardH,
      skeletonBoxes: skeletonBoxes,
      frontBoxes: frontBoxes,
      localFootprint2D: [[ox, oy], [ox + totalW, oy], [ox + totalW, oy + totalD], [ox, oy + totalD]]
    };
  }

  function buildLocalGeometry(inst) {
    switch (inst.typeId) {
      case 'corner_sofa_l226':
        return buildCornerSofaL226Local(inst);
      case 'corner_sofa_chaise_l275':
        return buildChaiseSofaLocal(inst);
      case 'lounge_armchair_84':
        return buildArmchairLocal(inst);
      case 'coffee_table_rect_120':
        return buildTableLocal(inst, 1200, 700, 380);
      case 'dining_table_set_220':
        return buildTableLocal(inst, 2200, 1000, 760);
      case 'media_console_200':
        return buildMediaConsoleLocal(inst);
      case 'upholstered_bed_channeled':
        return buildChanneledBedLocal(inst);
      default:
        return buildCornerSofaL226Local(inst);
    }
  }

  // ---------------------------------------------------------------------------
  // Compile Full 3D B-Rep & 2D Footprint for Any Instance & Rotation Angle
  // ---------------------------------------------------------------------------
  function compileInstance3D(rawInst) {
    const inst = normalizeInstance(rawInst);
    if (!inst) return null;

    const spec = getCatalogType(inst.typeId);
    const localGeom = buildLocalGeometry(inst);

    const cx = inst.x;
    const cy = inst.y;
    const zBase = (inst.floor === 'first') ? 3330 : 0;
    const rotDeg = normalizeAngleDeg(inst.rotation);
    const rad = rotDeg * Math.PI / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // +lx is Right on the 2D floor plan (-worldX = East), +ly is Down on the 2D floor plan (+worldY = South)
    function toWorldPt(lx, ly, lz) {
      return [
        Math.round((cx - (lx * cosA - ly * sinA)) * 10) / 10,
        Math.round((cy + (lx * sinA + ly * cosA)) * 10) / 10,
        Math.round((zBase + lz) * 10) / 10
      ];
    }

    function toWorldNormal(nx, ny, nz) {
      return [
        Math.round((-(nx * cosA - ny * sinA)) * 1000) / 1000,
        Math.round((nx * sinA + lySin(nx, ny, sinA, cosA)) * 1000) / 1000,
        Math.round(nz * 1000) / 1000
      ];
    }

    function lySin(nx, ny, s, c) {
      return ny * c;
    }

    const skeletonParts3D = (localGeom.skeletonBoxes || []).map(b => buildRoundedBoxPart(b, toWorldPt, toWorldNormal));
    const frontParts3D = (localGeom.frontBoxes || []).map(b => buildRoundedBoxPart(b, toWorldPt, toWorldNormal));

    const worldFootprint2D = (localGeom.localFootprint2D || []).map(pt => {
      const wpt = toWorldPt(pt[0], pt[1], 0);
      return [Math.round(wpt[0]), Math.round(wpt[1])];
    });

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    worldFootprint2D.forEach(p => {
      if (p[0] < xMin) xMin = p[0];
      if (p[0] > xMax) xMax = p[0];
      if (p[1] < yMin) yMin = p[1];
      if (p[1] > yMax) yMax = p[1];
    });
    skeletonParts3D.concat(frontParts3D).forEach(p => {
      if (p.x0 < xMin) xMin = p.x0;
      if (p.x1 > xMax) xMax = p.x1;
      if (p.y0 < yMin) yMin = p.y0;
      if (p.y1 > yMax) yMax = p.y1;
    });

    const primaryColor = inst.properties.upholsteryColor || inst.properties.topColor || inst.properties.bodyColor || '#EFEAE1';
    const secondaryColor = inst.properties.pillowColor || inst.properties.beddingColor || inst.properties.baseColor || inst.properties.frontColor || primaryColor;

    return {
      id: inst.id,
      furnitureId: inst.id,
      typeId: inst.typeId,
      name: inst.name,
      shortLabel: spec ? spec.shortName : inst.id,
      floor: inst.floor,
      room: inst.room,
      category: spec ? spec.category : 'sofa',
      categoryLabel: spec ? spec.categoryLabel : 'Furniture',
      isRoomFurniture: true,
      x: cx,
      y: cy,
      rotation: rotDeg,
      properties: inst.properties,
      widthMm: localGeom.widthMm,
      depthMm: localGeom.depthMm,
      heightMm: localGeom.heightMm,
      zBottom: zBase,
      zTop: zBase + localGeom.heightMm,
      xMin: Math.round(xMin),
      xMax: Math.round(xMax),
      yMin: Math.round(yMin),
      yMax: Math.round(yMax),
      normal: toWorldNormal(0, 1, 0),
      carcassColorHex: primaryColor,
      frontColorHex: secondaryColor,
      localFootprint2D: localGeom.localFootprint2D,
      footprint2D: worldFootprint2D,
      skeletonParts3D: skeletonParts3D,
      frontParts3D: frontParts3D
    };
  }

  // ---------------------------------------------------------------------------
  // Public Store API
  // ---------------------------------------------------------------------------
  function getAll() {
    return _readAllNormalized();
  }

  function getByFloor(floor) {
    const fl = (floor === 'first' || floor === 1) ? 'first' : 'ground';
    return getAll().filter(item => item.floor === fl);
  }

  function get(id) {
    return getAll().find(item => item.id === id) || null;
  }

  function getAllCompiled3D() {
    return getAll().map(compileInstance3D).filter(Boolean);
  }

  function add(input) {
    const all = getAll();
    const spec = getCatalogType(input && input.typeId ? input.typeId : 'corner_sofa_l226');
    if (!spec) return null;

    const prefix = spec.category === 'corner_sofa'
      ? 'SOFA_'
      : (spec.category === 'bed' ? 'BED_' : 'FURN_');
    let maxNum = 0;
    all.forEach(item => {
      const m = String(item.id).match(/(\d+)$/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const newId = (input && input.id) ? String(input.id) : (prefix + (maxNum + 1));

    const instance = normalizeInstance({
      id: newId,
      typeId: spec.typeId,
      name: (input && input.name) ? input.name : spec.name,
      floor: (input && input.floor) ? input.floor : 'ground',
      room: (input && input.room) ? input.room : '0.11 Salon',
      x: (input && input.x !== undefined) ? input.x : 3400,
      y: (input && input.y !== undefined) ? input.y : 8600,
      rotation: (input && input.rotation !== undefined) ? input.rotation : 0,
      properties: Object.assign({}, spec.defaultProperties, (input && input.properties) || {})
    });

    all.push(instance);
    _saveAll(all);
    return instance;
  }

  function update(id, changes) {
    if (!id || !changes || typeof changes !== 'object') return null;
    const all = getAll();
    const idx = all.findIndex(item => item.id === id);
    if (idx === -1) return null;

    const current = all[idx];
    const mergedProps = Object.assign(
      {},
      current.properties,
      (changes.properties && typeof changes.properties === 'object') ? changes.properties : {}
    );

    const updated = normalizeInstance({
      id: current.id,
      typeId: changes.typeId !== undefined ? changes.typeId : current.typeId,
      name: changes.name !== undefined ? changes.name : current.name,
      floor: changes.floor !== undefined ? changes.floor : current.floor,
      room: changes.room !== undefined ? changes.room : current.room,
      x: changes.x !== undefined ? changes.x : current.x,
      y: changes.y !== undefined ? changes.y : current.y,
      rotation: changes.rotation !== undefined ? changes.rotation : current.rotation,
      properties: mergedProps
    });

    all[idx] = updated;
    _saveAll(all);
    return updated;
  }

  function duplicate(id) {
    const src = get(id);
    if (!src) return null;
    return add({
      typeId: src.typeId,
      name: src.name + ' (Copy)',
      floor: src.floor,
      room: src.room,
      x: clampCoord(src.x + 450, -500, 21000, src.x),
      y: clampCoord(src.y + 450, -500, 21500, src.y),
      rotation: src.rotation,
      properties: Object.assign({}, src.properties)
    });
  }

  function remove(id) {
    const all = getAll();
    const filtered = all.filter(item => item.id !== id);
    if (filtered.length === all.length) return false;
    _saveAll(filtered);
    return true;
  }

  function resetToDefaults() {
    if (typeof PersistenceService !== 'undefined' && typeof PersistenceService.resetToDefaults === 'function') {
      PersistenceService.resetToDefaults(DOMAIN);
    }
    _notify();
    return getAll();
  }

  function subscribe(fn) {
    if (typeof fn === 'function') _listeners.push(fn);
  }

  return {
    DOMAIN,
    getCatalog,
    getCatalogType,
    getAll,
    getByFloor,
    get,
    getAllCompiled3D,
    compileInstance3D,
    add,
    update,
    duplicate,
    remove,
    resetToDefaults,
    subscribe,
    sanitizeHexColor,
    normalizeAngleDeg
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.RoomFurnitureStore = RoomFurnitureStore;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoomFurnitureStore;
}
