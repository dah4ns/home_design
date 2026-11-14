// =============================================================================
// MOVABLE ROOM FURNITURE CATALOG & DEFAULT SEED DATA
// =============================================================================
// Coordinates are in canonical floor-plan millimeters (mm):
//   - X axis: East (0) -> West (20,415 mm)
//   - Y axis: North (0) -> South (20,840 mm)
//   - Z axis: Vertical elevation above floor (mm)
//   - rotation: Continuous rotation angle in degrees (0°..360°) around (x, y)
//
// Each catalog type defines its `propertiesSchema` so the UI inspector dynamically
// renders properties tailored to the selected furniture type (e.g. upholsteryColor
// for corner sofas, tabletopMaterial for coffee tables, woodTone for media consoles).

const ROOM_FURNITURE_CATALOG = [
  {
    typeId: 'corner_sofa_l226',
    name: 'Modular Corner Sofa (L226 × 226 × H81 cm)',
    shortName: 'Corner Sofa L226×226',
    category: 'corner_sofa',
    categoryLabel: 'Corner Sofa',
    description: '5-module symmetric L-shaped corner sofa based on attached specification plan: 226×226 cm outer wings, 81 cm total height, 43 cm seat height, 6.5 cm feet, 9×68×63 cm armrests with side pocket, 70×52 cm seats, 68×44 cm backrests, 2×(65×44 cm) arm cushions & 3×(40×40 cm) throw pillows.',
    dimensionsMm: {
      leftWingMm: 2260,
      rightWingMm: 2260,
      depthMm: 710,
      seatDepthMm: 520,
      backDepthMm: 190,
      heightMm: 810,
      seatHeightMm: 430,
      footHeightMm: 65,
      armWidthMm: 90,
      armDepthMm: 680,
      armHeightMm: 630,
      backCushionWidthMm: 680,
      backCushionHeightMm: 440,
      armPillowWidthMm: 650,
      armPillowHeightMm: 440,
      throwPillowSizeMm: 400
    },
    defaultProperties: {
      upholsteryColor: '#EFEAE1',
      pillowColor: '#E2DBD0',
      legColor: '#232528',
      wingVariant: '226x226'
    },
    propertiesSchema: [
      {
        key: 'upholsteryColor',
        label: 'Upholstery Fabric Color',
        type: 'color_swatches',
        default: '#EFEAE1',
        swatches: [
          { label: 'Cream Bouclé (Plan Default)', value: '#EFEAE1' },
          { label: 'Warm Oatmeal Linen', value: '#DECBB7' },
          { label: 'Pearl Dove Grey', value: '#C5C7C4' },
          { label: 'Architectural Stone Grey', value: '#8E959E' },
          { label: 'Anthracite Charcoal', value: '#3E434C' },
          { label: 'Sage Olive Velvet', value: '#7A8B7B' },
          { label: 'Terracotta Clay', value: '#C46D53' },
          { label: 'Nordic Fjord Navy', value: '#2F455C' },
          { label: 'Cognac Saddle', value: '#9C5E3C' }
        ]
      },
      {
        key: 'pillowColor',
        label: 'Throw Pillows Color',
        type: 'color_swatches',
        default: '#E2DBD0',
        swatches: [
          { label: 'Matching Soft Sand', value: '#E2DBD0' },
          { label: 'Ivory Cream', value: '#F5F2EB' },
          { label: 'Warm Taupe', value: '#B8A99A' },
          { label: 'Slate Grey', value: '#6C737E' },
          { label: 'Forest Sage', value: '#5F7364' },
          { label: 'Rust Accent', value: '#B85A40' },
          { label: 'Mustard Ochre', value: '#CFA146' }
        ]
      },
      {
        key: 'wingVariant',
        label: 'Modular Wing Layout',
        type: 'select',
        default: '226x226',
        options: [
          { label: 'Symmetric L-Shape (226 × 226 cm — Diagram Arrows)', value: '226x226' },
          { label: 'Extended Right Wing (226 × 260 cm — Header Spec)', value: '226x260' },
          { label: 'Extended Left Wing (260 × 226 cm)', value: '260x226' }
        ]
      },
      {
        key: 'legColor',
        label: 'Feet Finish (H 6.5 cm)',
        type: 'color_swatches',
        default: '#232528',
        swatches: [
          { label: 'Matte Black / Charcoal', value: '#232528' },
          { label: 'Dark Espresso Walnut', value: '#4A3525' },
          { label: 'Natural Oak', value: '#B5895A' },
          { label: 'Brushed Champagne Metal', value: '#A89F91' }
        ]
      }
    ]
  },
  {
    typeId: 'corner_sofa_chaise_l275',
    name: 'Lounger Chaise Corner Sofa (L275 × 175 × H80 cm)',
    shortName: 'Chaise Sofa L275×175',
    category: 'corner_sofa',
    categoryLabel: 'Corner Sofa',
    description: 'Wide 3-seater sofa with an open-end chaise longue peninsula (275×175 cm, height 80 cm, seat height 42 cm).',
    dimensionsMm: {
      widthMm: 2750,
      chaiseDepthMm: 1750,
      seatDepthMm: 950,
      chaiseWidthMm: 1020,
      heightMm: 800,
      seatHeightMm: 420,
      footHeightMm: 55,
      armWidthMm: 140,
      armHeightMm: 610
    },
    defaultProperties: {
      upholsteryColor: '#D8CFC2',
      pillowColor: '#EFECE6',
      chaiseSide: 'right',
      legColor: '#232528'
    },
    propertiesSchema: [
      {
        key: 'upholsteryColor',
        label: 'Upholstery Fabric Color',
        type: 'color_swatches',
        default: '#D8CFC2',
        swatches: [
          { label: 'Warm Greige Linen', value: '#D8CFC2' },
          { label: 'Cream Bouclé', value: '#EFEAE1' },
          { label: 'Stone Grey', value: '#8E959E' },
          { label: 'Anthracite Charcoal', value: '#3E434C' },
          { label: 'Sage Olive', value: '#7A8B7B' },
          { label: 'Terracotta Clay', value: '#C46D53' },
          { label: 'Fjord Navy', value: '#2F455C' }
        ]
      },
      {
        key: 'pillowColor',
        label: 'Throw Pillows Color',
        type: 'color_swatches',
        default: '#EFECE6',
        swatches: [
          { label: 'Ivory Cream', value: '#EFECE6' },
          { label: 'Warm Taupe', value: '#B8A99A' },
          { label: 'Slate Grey', value: '#6C737E' },
          { label: 'Rust Accent', value: '#B85A40' }
        ]
      },
      {
        key: 'chaiseSide',
        label: 'Chaise Longue Orientation',
        type: 'select',
        default: 'right',
        options: [
          { label: 'Right-Hand Chaise', value: 'right' },
          { label: 'Left-Hand Chaise', value: 'left' }
        ]
      }
    ]
  },
  {
    typeId: 'lounge_armchair_84',
    name: 'Sculpted Lounge Armchair (84 × 82 × H78 cm)',
    shortName: 'Armchair 84×82',
    category: 'armchair',
    categoryLabel: 'Armchair',
    description: 'Accent living room armchair with upholstered shell, plush seat & back cushion, and timber/metal legs.',
    dimensionsMm: {
      widthMm: 840,
      depthMm: 820,
      heightMm: 780,
      seatHeightMm: 420,
      footHeightMm: 140,
      armWidthMm: 100,
      armHeightMm: 610
    },
    defaultProperties: {
      upholsteryColor: '#C46D53',
      legColor: '#4A3525'
    },
    propertiesSchema: [
      {
        key: 'upholsteryColor',
        label: 'Upholstery Fabric Color',
        type: 'color_swatches',
        default: '#C46D53',
        swatches: [
          { label: 'Terracotta Clay', value: '#C46D53' },
          { label: 'Cream Bouclé', value: '#EFEAE1' },
          { label: 'Warm Oatmeal', value: '#DECBB7' },
          { label: 'Sage Olive', value: '#7A8B7B' },
          { label: 'Anthracite Charcoal', value: '#3E434C' },
          { label: 'Mustard Ochre', value: '#CFA146' },
          { label: 'Fjord Navy', value: '#2F455C' }
        ]
      },
      {
        key: 'legColor',
        label: 'Leg Finish',
        type: 'color_swatches',
        default: '#4A3525',
        swatches: [
          { label: 'Smoked Walnut', value: '#4A3525' },
          { label: 'Natural Oak', value: '#B5895A' },
          { label: 'Matte Black Steel', value: '#232528' }
        ]
      }
    ]
  },
  {
    typeId: 'coffee_table_rect_120',
    name: 'Architectural Coffee Table (120 × 70 × H38 cm)',
    shortName: 'Coffee Table 120×70',
    category: 'table',
    categoryLabel: 'Coffee Table',
    description: 'Low-profile rectangular living room coffee table with plinth/frame base.',
    dimensionsMm: {
      widthMm: 1200,
      depthMm: 700,
      heightMm: 380,
      topThicknessMm: 35
    },
    defaultProperties: {
      topColor: '#E8E2D5',
      baseColor: '#4A3525'
    },
    propertiesSchema: [
      {
        key: 'topColor',
        label: 'Tabletop Surface Finish',
        type: 'color_swatches',
        default: '#E8E2D5',
        swatches: [
          { label: 'Travertine Stone', value: '#E8E2D5' },
          { label: 'Natural Oak Veneer', value: '#B88B58' },
          { label: 'Smoked Walnut', value: '#5C402C' },
          { label: 'Nero Marquina Dark Stone', value: '#2B2D30' }
        ]
      },
      {
        key: 'baseColor',
        label: 'Base Frame Finish',
        type: 'color_swatches',
        default: '#4A3525',
        swatches: [
          { label: 'Smoked Walnut', value: '#4A3525' },
          { label: 'Natural Oak', value: '#B5895A' },
          { label: 'Matte Black Metal', value: '#232528' },
          { label: 'Travertine Monolith', value: '#DCD5C6' }
        ]
      }
    ]
  },
  {
    typeId: 'dining_table_set_220',
    name: 'Oak Dining Table (220 × 100 × H76 cm)',
    shortName: 'Dining Table 220×100',
    category: 'table',
    categoryLabel: 'Dining Table',
    description: 'Solid architectural dining table for 6–8 guests.',
    dimensionsMm: {
      widthMm: 2200,
      depthMm: 1000,
      heightMm: 760,
      topThicknessMm: 40
    },
    defaultProperties: {
      topColor: '#BA8C5B',
      baseColor: '#26282B'
    },
    propertiesSchema: [
      {
        key: 'topColor',
        label: 'Tabletop Finish',
        type: 'color_swatches',
        default: '#BA8C5B',
        swatches: [
          { label: 'Natural European Oak', value: '#BA8C5B' },
          { label: 'Smoked Walnut', value: '#5C402C' },
          { label: 'Sintered Stone Ivory', value: '#ECE8DF' },
          { label: 'Matte Anthracite Oak', value: '#383A3F' }
        ]
      },
      {
        key: 'baseColor',
        label: 'Trestle Legs Finish',
        type: 'color_swatches',
        default: '#26282B',
        swatches: [
          { label: 'Matte Black Steel', value: '#26282B' },
          { label: 'Matching Natural Oak', value: '#BA8C5B' },
          { label: 'Smoked Walnut', value: '#5C402C' }
        ]
      }
    ]
  },
  {
    typeId: 'media_console_200',
    name: 'Low Media & TV Console (200 × 45 × H48 cm)',
    shortName: 'TV Console 200×45',
    category: 'storage',
    categoryLabel: 'Media Console',
    description: 'Low-slung living room credenza / TV cabinet with slatted fronts.',
    dimensionsMm: {
      widthMm: 2000,
      depthMm: 450,
      heightMm: 480,
      footHeightMm: 100
    },
    defaultProperties: {
      bodyColor: '#B5895A',
      frontColor: '#9E7347'
    },
    propertiesSchema: [
      {
        key: 'bodyColor',
        label: 'Cabinet Carcass Finish',
        type: 'color_swatches',
        default: '#B5895A',
        swatches: [
          { label: 'Warm Natural Oak', value: '#B5895A' },
          { label: 'Smoked Walnut', value: '#5C402C' },
          { label: 'Cashmere Matte Lacquer', value: '#D8CFC2' },
          { label: 'Matte Graphite', value: '#36393F' }
        ]
      },
      {
        key: 'frontColor',
        label: 'Front Door Slats Finish',
        type: 'color_swatches',
        default: '#9E7347',
        swatches: [
          { label: 'Fluted Ribbed Oak', value: '#9E7347' },
          { label: 'Fluted Walnut', value: '#4D3422' },
          { label: 'Warm Cashmere Matte', value: '#E5DEC9' },
          { label: 'Matte Anthracite', value: '#2B2E33' }
        ]
      }
    ]
  }
];

// Default Placed Room Furniture Instances:
// Includes the Modular Corner Sofa (L226×226×H81 cm) from the attached plan
// placed in 0.11 Salon (Living Room: X = 95..6,315 mm, Y = 6,290..11,200 mm).
const DEFAULT_ROOM_FURNITURE = [
  {
    id: 'SOFA_LIVING_1',
    typeId: 'corner_sofa_l226',
    name: 'Living Room Corner Sofa (0.11 Salon)',
    floor: 'ground',
    room: '0.11 Salon',
    x: 3150,
    y: 8550,
    rotation: 0,
    properties: {
      upholsteryColor: '#EFEAE1',
      pillowColor: '#E2DBD0',
      legColor: '#232528',
      wingVariant: '226x226'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROOM_FURNITURE_CATALOG,
    DEFAULT_ROOM_FURNITURE
  };
}
