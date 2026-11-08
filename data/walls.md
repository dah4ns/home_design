# 3D B-Rep Wall Data Model Documentation (`data/walls.js`)

This document describes the schema, coordinate system, and every field of the wall objects defined in [`data/walls.js`](file:///Users/dhans/jetski_workshop/data/walls.js) and processed by [`js/wall-service.js`](file:///Users/dhans/jetski_workshop/js/wall-service.js).

---

## 1. Global 3D Coordinate System `(x, y, z)` (Right-Handed, Z-Up)

All coordinates in [`data/walls.js`](file:///Users/dhans/jetski_workshop/data/walls.js) are expressed in **millimeters (`mm`)** in a standard right-handed 3D architectural coordinate frame `[x, y, z]` ($\hat{x} \times \hat{y} = \hat{z}$):

| Coordinate | Axis Direction | Datum (`0 mm`) | Range in Building | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **`x`** | **East → West** (1st Horizontal Axis, grows right) | Structural Grid **Axis 6** (`x = 0 mm`) | `-285 mm` (East outer face) to `20,705 mm` (West outer face) | Horizontal position from East to West (grows to the right in the 3D North view and North Facade). |
| **`y`** | **North → South** (2nd Horizontal Axis, depth) | Structural Grid **Axis A** (`y = 0 mm`) | `-290 mm` (Garage North outer face) to `21,130 mm` (SW Wing South outer face) | Second horizontal floor-plan axis from North (street/front) to South (garden), matching [`data/windows.js`](file:///Users/dhans/jetski_workshop/data/windows.js). |
| **`z`** | **Bottom → Top** (Vertical Height Axis, grows up) | Finished Ground Floor level **±0.00 m** (`z = 0 mm`) | `0 mm` to `6,130 mm` (roof parapet at `6,880 mm`) | Vertical height / elevation above the Ground Floor finished floor level. |

### Standard Vertical Height Levels (`z` axis)

```
z = 6,880 mm (+6.88 m) ─── Flat Roof Parapet Top
z = 6,130 mm (+6.13 m) ─── Upper Floor (Piętro) Ceiling / Roof Slab Bottom  ◄── zTop (First Floor walls)
        │
        │  2,700 mm clear room height on Upper Floor (Piętro)
        │  • Floor plan horizontal slice plane: z = 4,630 mm (1,200 mm above 3,430 mm)
        │
z = 3,430 mm (+3.43 m) ─── Upper Floor (Piętro) Finished Floor Level        ◄── zBottom (First Floor walls)
z = 2,800 mm (+2.80 m) ─── Ground Floor (Parter) Ceiling / Slab Bottom      ◄── zTop (Ground Floor walls)
        │
        │  2,800 mm clear room height on Ground Floor (Parter)
        │  • Floor plan horizontal slice plane: z = 1,200 mm
        │
z =     0 mm (±0.00 m) ─── Ground Floor (Parter) Finished Floor Level       ◄── zBottom (Ground Floor walls)
```

---

## 2. Top-Level Wall Object Fields

Each entry in `WALL_DATABASE.walls` represents a single physical wall (either an exterior structural wall or an interior partition wall):

```js
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
    sides: [ /* sideA, sideB */ ]
}
```

### Field Reference

| Field | Type | Used By | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `string` | `WallService`, [`floor_plan.html`](file:///Users/dhans/jetski_workshop/floor_plan.html), [`north_facade.html`](file:///Users/dhans/jetski_workshop/north_facade.html), [`objects_3d.html`](file:///Users/dhans/jetski_workshop/objects_3d.html) | Unique identifier of the wall (`EW_*` = Ground Floor exterior, `GW_*` = Ground Floor internal, `UW_*` = Upper Floor exterior, `FW_*` = Upper Floor internal). |
| **`name`** | `string` | Floor Plan & 3D Inspector UI | Human-readable title displayed in the Inspector panel when the wall is selected. |
| **`floor`** | `'ground' \| 'first'` | `WallService.getWalls()`, `getFloorPlanSlice()` | Which story the wall belongs to (`'ground'` = Parter A.02, `'first'` = Piętro A.03). |
| **`category`** | `'exterior' \| 'internal'` | `WallService`, [`floor_plan.html`](file:///Users/dhans/jetski_workshop/floor_plan.html) | `'exterior'` walls form the mitered thermal building envelope (`layer-shell`); `'internal'` walls are interior room partitions (`layer-internal-walls`). |
| **`zBottom`** | `number` (`mm`) | `WallService` 3D B-Rep & Slicer | **Vertical height (`Z` coordinate in mm) of the bottom of the wall** relative to the Ground Floor datum (`±0.00 m = 0 mm`).<br/>• **`0`** for Ground Floor walls (starts at `±0.00 m`).<br/>• **`3430`** for Upper Floor walls (starts at `+3.43 m`, on top of the `630 mm` inter-floor slab/cornice zone `2,800..3,430 mm`). |
| **`zTop`** | `number` (`mm`) | `WallService` 3D B-Rep & Slicer | **Vertical height (`Z` coordinate in mm) of the top of the wall** (ceiling slab soffit) relative to `±0.00 m = 0 mm`.<br/>• **`2800`** for Ground Floor walls (`+2.80 m`, giving a wall height of `2800 - 0 = 2,800 mm`).<br/>• **`6130`** for Upper Floor walls (`+6.13 m`, giving a wall height of `6130 - 3430 = 2,700 mm`). |
| **`thickness`** | `number` (`mm`) | `WallService.compileWall()`, Floor Plan dimensions & Inspector | **Perpendicular thickness of the wall in millimeters** (e.g. `400` = 40 cm, `380` = 38 cm, `180` = 18 cm, `120` = 12 cm).<br/>• If `thickness` is edited and differs from the geometric distance between `sideA` and `sideB`, `WallService` automatically shifts `sideA` along its outward normal vector and reconciles the miter corners with neighboring exterior walls.<br/>• If `thickness` is omitted, `WallService` computes it automatically from the perpendicular distance between `sideA` and `sideB`. |
| **`rooms`** | `string` | Floor Plan & 3D Inspector UI | Informational text listing the spaces or rooms separated by the wall (e.g. `'0.01 Garaż (605 cm) ↔ 0.02 Magazyn & 0.03 Kotłownia (200 cm)'`). |
| **`specs`** | `string` | Floor Plan Inspector UI ("CAD Reference" row) | **Informational architectural summary / CAD note** displayed in the Inspector panel when you click a wall in [`floor_plan.html`](file:///Users/dhans/jetski_workshop/floor_plan.html). It is **not** used for geometric calculations—only for human documentation in the UI. |
| **`openings`** | `string[]` | `WallService.resolveWallOpenings()` | List of window/door IDs from [`data/windows.js`](file:///Users/dhans/jetski_workshop/data/windows.js) (e.g. `['O2', 'O1']`, `['Z2']`) hosted by this wall. Allows `WallService` to dynamically update the wall's 3D `holes` whenever a window is resized or shifted in `WindowStore`. |
| **`doors`** | `Object[]` | `WallService.resolveWallOpenings()`, [`floor_plan.html`](file:///Users/dhans/jetski_workshop/floor_plan.html) | Metadata for interior partition doors (`{ id, start, end, sillMm, heightMm, swingDir, hingeStart }`) used to draw 2D door swing arcs/thresholds and to cross-check doorway notches. |
| **`axis`** | `'x' \| 'y'` *(optional)* | `WallService` | Primary horizontal axis along which the wall runs (`'x'` = East–West wall, `'y'` = North–South wall). If omitted, `WallService` derives it automatically from `sideA`. |
| **`x1, y1, x2, y2`** | `number` *(optional)* | `WallService` fallback | 2D horizontal bounding box `[minX, minY, maxX, maxY]` in `mm`. Automatically recomputed by `WallService` from `sideA` and `sideB`. |
| **`sides`** | `[SideA, SideB]` | `WallService` | Two-element array defining the two opposite faces of the wall (`sides[0]` = `sideA`, `sides[1]` = `sideB`). |

---

## 3. Wall Side Object Fields (`sides: [sideA, sideB]`)

Every wall is bounded by two opposing vertical faces (`sideA` and `sideB`). By storing both sides' endpoints (`p1 -> p2`), mitered corners where two walls meet (at 90° or any diagonal angle) form a closed 4-vertex polygon `[sideA.p1, sideA.p2, sideB.p1, sideB.p2]` with **zero corner overlap** and **no boolean union required**.

```js
{
    id: 'EW_NORTH_RECESSED_EXT',
    role: 'exterior',
    material: 'clinker_brick',
    materialLabel: 'Dark Graphite Clinker Brick',
    normal: [0, -1, 0],
    p1: [-285, 2790],
    p2: [11715, 2790],
    facadeBounds: { xMinMm: -270, xMaxMm: 11740, lengthMm: 12010, svgGroupId: 'ground-recessed-facade' },
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
        }
    ]
}
```

### Side Field Reference

| Field | Type | Used By | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `string` | `WallService`, SVG `data-brep-wall-surface` | Unique identifier of this specific face (e.g. `EW_NORTH_RECESSED_EXT` vs. `EW_NORTH_RECESSED_INT`). |
| **`role`** | `'exterior' \| 'interior'` | `WallService.getVisibleFacesForView()` | Distinguishes weather-facing exterior facade surfaces (`'exterior'`) from indoor room surfaces (`'interior'`). |
| **`material`** | `string` | `WallService`, 3D/Facade renderers | Machine-readable surface finish key (`'clinker_brick'`, `'timber_slats'`, `'plaster_white'`). |
| **`materialLabel`** | `string` | Floor Plan & 3D Inspector UI | Human-readable finish description shown in the Inspector panel. |
| **`normal`** | `[nx, ny, nz]` | `WallService` back-face culling & thickness offset | **3D outward unit normal vector** pointing perpendicularly away from the wall surface into open space:<br/>• `[0, -1, 0]` = faces North (`-Y`)<br/>• `[0, 1, 0]` = faces South (`+Y`)<br/>• `[-1, 0, 0]` = faces East (`-X`)<br/>• `[1, 0, 0]` = faces West (`+X`)<br/>• Supports arbitrary unit vectors `[nx, ny, 0]` for diagonal walls.<br/>• Used by `getVisibleFacesForView()` via dot product $\vec{n} \cdot \vec{v}_{\text{look}} < 0$ to determine which walls are visible in any facade/elevation view. |
| **`p1`**, **`p2`** | `[x, y]` (`mm`) | `WallService` 2D footprint & miter solver | Start and end `[x, y]` horizontal plan coordinates of this face along the floor. Directed so that `sideA` (`p1 → p2`) and `sideB` (`p1 → p2`) wind consistently around the wall perimeter `[sideA.p1, sideA.p2, sideB.p1, sideB.p2]`. |
| **`outerLoop`** | `[[x, y, z], ...]` | `WallService.sliceFace3DAtElevation()`, `getVisibleFacesForView()`, [`objects_3d.html`](file:///Users/dhans/jetski_workshop/objects_3d.html) | **Connected list of 3D `[x, y, z]` vertices** tracing the outer boundary of this wall face.<br/>• For a simple solid wall or a wall with only mid-wall windows, `outerLoop` has 4 vertices (`zBottom` to `zTop`).<br/>• **For a wall with doors** (which start at the floor `z = zBottom` and stop below the ceiling at `z = 2,050..2,250 mm`), `outerLoop` steps up and over each doorway lintel (`[xDoorStart, y, zBottom] → [xDoorStart, y, zDoorTop] → [xDoorEnd, y, zDoorTop] → [xDoorEnd, y, zBottom]`), keeping the wall a single connected 3D polygon with a solid lintel above the door. |
| **`holes`** | `Array<{ id, kind, loop: [[x, y, z], ...] }>` | `WallService.sliceFace3DAtElevation()`, `getVisibleFacesForView()`, [`objects_3d.html`](file:///Users/dhans/jetski_workshop/objects_3d.html) | **Interior opening loops** (`[[x, y, z], ...]`) completely inside the face perimeter (such as windows `O1`, `O2`, `O5`, `14a`, `O15`, `O11_2`, `O11_3`, `O13a`).<br/>• In 2D elevation views ([`north_facade.html`](file:///Users/dhans/jetski_workshop/north_facade.html)), `outerLoop` + `holes` compile directly into compound SVG paths (`<path fill-rule="evenodd" d="M ... Z M ... Z">`) that cut true physical holes out of the wall surface. |
| **`facadeBounds`** | `Object` *(optional)* | `WallService.syncNorthFacadeSVG()` | Optional elevation projection overrides (`{ xMinMm, xMaxMm, lengthMm, svgGroupId }`) mapping the 3D wall face to its target `<g id="...">` container and corner return trim on [`north_facade.html`](file:///Users/dhans/jetski_workshop/north_facade.html). |

---

## 4. How Doors vs. Windows Are Modeled in 3D (`outerLoop` vs. `holes`)

```
   A) Wall with Doorway Notch in outerLoop              B) Wall with Window Hole in holes[]
   (e.g. GW_4, GW_1, EW_GARAGE_WEST)                    (e.g. EW_NORTH_RECESSED with O2 & O1)

   zTop = 2800 ┌───────────────────────────┐            zTop = 2800 ┌───────────────────────────┐
               │    Solid Lintel Wall      │                        │                           │
   z = 2050    │       ┌───────────┐       │            z = 2500    │      ┌─────────────┐      │
               │       │           │       │                        │      │  Hole Loop  │      │
   zSlice=1200 ├───────┤  Doorway  ├───────┤            zSlice=1200 ├──────┤  (Window)   ├──────┤
               │ Seg 1 │   Notch   │ Seg 2 │                        │      └─────────────┘      │
               │       │           │       │            z = 800     │        Sill Wall          │
   zBottom = 0 └───────┘           └───────┘            zBottom = 0 └───────────────────────────┘
```

1. **Horizontal Floor-Plan Slicing (`zSlice = 1,200 mm` on Parter, `4,630 mm` on Piętro):**
   - [`WallService.sliceFace3DAtElevation(outerLoop, holes, axis, zSlice)`](file:///Users/dhans/jetski_workshop/js/wall-service.js#L126-L181) intersects the horizontal plane $Z = z_{\text{slice}}$ with all edges of `outerLoop` and `holes`.
   - At $Z = 1,200\text{ mm}$, the plane crosses the vertical jamb edges of both doorways and standard windows, splitting the wall into solid 2D segments (`solidPolygons2D`) and open gaps (`cutOpeningsAtSlice`).
   - At $Z = 2,500\text{ mm}$ (above the $2,050\text{ mm}$ doors), the horizontal plane does not intersect the doorway notch, so `sliceFace3DAtElevation` returns a single continuous lintel polygon across the top of the door.
   - High clerestory windows like **`O8a`** ($Z = 2,060..2,800\text{ mm}$ in `EW_WEST_SOUTH`) are above $Z = 1,200\text{ mm}$, so the wall remains solid at the $1,200\text{ mm}$ floor-plan cut.
