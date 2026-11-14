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

  // Extrude a 2D cross-section profile (with smooth per-vertex normals) along a local axis
  // or build a rounded cushion / bolster / armrest with soft curved edges!
  function buildRoundedBoxPart(spec, transformFn, normalFn) {
    const x0 = spec.lx0, x1 = spec.lx1;
    const y0 = spec.ly0, y1 = spec.ly1;
    const z0 = spec.lz0, z1 = spec.lz1;
    const w = x1 - x0;
    const d = y1 - y0;
    const h = z1 - z0;
    const shape = spec.shape || 'box'; // 'box' | 'cushion' | 'bolster_x' | 'bolster_y' | 'pillow' | 'armrest_x' | 'armrest_y'

    const { mapPt, mapN } = createLocalTransform(spec, transformFn, normalFn);

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
    const secondaryColor = inst.properties.pillowColor || inst.properties.baseColor || inst.properties.frontColor || primaryColor;

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

    const prefix = spec.category === 'corner_sofa' ? 'SOFA_' : 'FURN_';
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
