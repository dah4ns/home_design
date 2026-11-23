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
  },
  {
    typeId: 'upholstered_bed_channeled',
    name: 'Channeled Upholstered Storage Bed (Queen 160 / King 180 × 200 cm)',
    shortName: 'Channeled Bed',
    category: 'bed',
    categoryLabel: 'Bed',
    description: 'Modern upholstered lift-up storage bed with 110 cm tall vertically channeled headboard (8 plush flutes on King / 7 on Queen), 41 cm box rails on 1.5 cm glides (42.5 cm rail top), 23 cm quilted mattress, sculpted linen duvet, wavy draped throw blanket, 2 reclined sleeping pillows & 3 layered accent cushions.',
    dimensionsMm: {
      queenWidthMm: 1650,
      kingWidthMm: 1850,
      lengthMm: 2095,
      headboardHeightMm: 1100,
      headboardThicknessMm: 70,
      frameHeightMm: 425,
      framePanelHeightMm: 410,
      footHeightMm: 15,
      railThicknessMm: 25,
      queenMattressWidthMm: 1600,
      kingMattressWidthMm: 1800,
      mattressLengthMm: 2000,
      mattressHeightMm: 230
    },
    defaultProperties: {
      bedSize: 'king',
      upholsteryColor: '#D5CEC5',
      beddingColor: '#F2F0EC',
      throwColor: '#7D7265',
      accentPillowColor: '#6D6B44'
    },
    propertiesSchema: [
      {
        key: 'bedSize',
        label: 'Bed Size (Mattress & Frame)',
        type: 'select',
        default: 'king',
        options: [
          { label: 'King — 180 × 200 cm mattress (Frame 185 × 209.5 × H110 cm)', value: 'king' },
          { label: 'Queen — 160 × 200 cm mattress (Frame 165 × 209.5 × H110 cm)', value: 'queen' }
        ]
      },
      {
        key: 'upholsteryColor',
        label: 'Bed Frame & Headboard Upholstery',
        type: 'color_swatches',
        default: '#D5CEC5',
        swatches: [
          { label: 'Warm Cashmere Beige (Photo Default)', value: '#D5CEC5' },
          { label: 'Pearl Ivory', value: '#ECE8E1' },
          { label: 'Warm Sand Beige', value: '#DECBB7' },
          { label: 'Light Dove Grey', value: '#C4C5C2' },
          { label: 'Architectural Stone Grey', value: '#8B9097' },
          { label: 'Deep Charcoal Grey', value: '#3F434B' },
          { label: 'Matte Onyx Black', value: '#1F2126' },
          { label: 'Rich Maroon / Burgundy', value: '#6B2737' },
          { label: 'Dusty Rose Taupe', value: '#A88A87' },
          { label: 'Terracotta Clay', value: '#B96950' },
          { label: 'Sage Olive Velvet', value: '#748272' },
          { label: 'Nordic Fjord Navy', value: '#2C3F56' }
        ]
      },
      {
        key: 'beddingColor',
        label: 'Duvet & Sleeping Pillows Linen',
        type: 'color_swatches',
        default: '#F2F0EC',
        swatches: [
          { label: 'Crisp White Linen (Photo Default)', value: '#F2F0EC' },
          { label: 'Warm Pearl Ivory', value: '#ECE6DA' },
          { label: 'Cool Mist Grey', value: '#DDE0E3' },
          { label: 'Oatmeal Sand', value: '#DDD2C3' },
          { label: 'Soft Sage Linen', value: '#CFD6CC' },
          { label: 'Slate Grey', value: '#6B727B' },
          { label: 'Charcoal Cotton', value: '#363A42' }
        ]
      },
      {
        key: 'throwColor',
        label: 'Draped Throw Blanket',
        type: 'color_swatches',
        default: '#7D7265',
        swatches: [
          { label: 'Warm Stone Taupe (Photo Default)', value: '#7D7265' },
          { label: 'Olive Moss Wool', value: '#6B6947' },
          { label: 'Oatmeal Cream Knit', value: '#D6C9B8' },
          { label: 'Deep Maroon Cashmere', value: '#652A36' },
          { label: 'Charcoal Wool', value: '#3A3E46' },
          { label: 'Rust Terracotta', value: '#A85D44' },
          { label: 'Deep Fjord Navy', value: '#2B3E54' }
        ]
      },
      {
        key: 'accentPillowColor',
        label: 'Center Accent Cushion',
        type: 'color_swatches',
        default: '#6D6B44',
        swatches: [
          { label: 'Olive Moss Velvet (Photo Default)', value: '#6D6B44' },
          { label: 'Warm Taupe Linen', value: '#9C8E7E' },
          { label: 'Deep Maroon Velvet', value: '#6B2737' },
          { label: 'Terracotta Clay', value: '#B5634A' },
          { label: 'Pearl Sand', value: '#E7E1D6' },
          { label: 'Charcoal Velvet', value: '#3D414A' },
          { label: 'Nordic Navy', value: '#344B63' }
        ]
      }
    ]
  },
  {
    typeId: 'bookshelf_cabinet_30',
    name: 'Architectural Bookshelf Cabinet (110 × 30 × H280 cm)',
    shortName: 'Bookshelf 30 cm',
    category: 'bookcase',
    categoryLabel: 'Bookshelf',
    description: 'Bespoke 30 cm deep tall bookshelf cabinet with a recessed 8 cm plinth, lower closed push-to-open storage doors, staggered architectural cubby dividers, warm shelf accent lighting, and curated hardcover books & ceramic vessels.',
    dimensionsMm: {
      widthMm: 1100,
      depthMm: 300,
      heightMm: 2800,
      plinthHeightMm: 80,
      lowerCabinetTopMm: 760,
      shelfThicknessMm: 24
    },
    defaultProperties: {
      widthVariant: '110',
      heightVariant: '280',
      bodyColor: '#B5895A',
      doorColor: '#D8CFC2',
      backColor: '#A67C52',
      shelfStyling: 'styled'
    },
    propertiesSchema: [
      {
        key: 'widthVariant',
        label: 'Cabinet Width (Depth fixed 30 cm)',
        type: 'select',
        default: '110',
        options: [
          { label: '110 × 30 cm (Master Bedroom East Niche Fit)', value: '110' },
          { label: '100 × 30 cm (Standard)', value: '100' },
          { label: '90 × 30 cm (Compact)', value: '90' },
          { label: '120 × 30 cm (Wide)', value: '120' }
        ]
      },
      {
        key: 'heightVariant',
        label: 'Cabinet Height',
        type: 'select',
        default: '280',
        options: [
          { label: '280 cm (Aligned with Balcony Window Top)', value: '280' },
          { label: '240 cm (Tall Freestanding)', value: '240' },
          { label: '295 cm (Full Ceiling Built-In)', value: '295' }
        ]
      },
      {
        key: 'bodyColor',
        label: 'Bookcase Frame & Shelves Finish',
        type: 'color_swatches',
        default: '#B5895A',
        swatches: [
          { label: 'Warm Natural Oak (Default)', value: '#B5895A' },
          { label: 'Smoked Walnut', value: '#5C402C' },
          { label: 'Warm Cashmere Beige', value: '#D8CFC2' },
          { label: 'Pearl Matte White', value: '#EFECE6' },
          { label: 'Light Dove Grey', value: '#BFC2C0' },
          { label: 'Architectural Stone Grey', value: '#7E848C' },
          { label: 'Matte Charcoal Graphite', value: '#36393F' },
          { label: 'Matte Onyx Black', value: '#222429' },
          { label: 'Sage Olive Lacquer', value: '#6F7E6D' },
          { label: 'Rich Maroon Lacquer', value: '#6B2737' }
        ]
      },
      {
        key: 'doorColor',
        label: 'Lower Closed Doors Finish',
        type: 'color_swatches',
        default: '#D8CFC2',
        swatches: [
          { label: 'Warm Cashmere Matte (Default)', value: '#D8CFC2' },
          { label: 'Warm Natural Oak', value: '#B5895A' },
          { label: 'Smoked Walnut', value: '#5C402C' },
          { label: 'Pearl Matte White', value: '#EFECE6' },
          { label: 'Architectural Stone Grey', value: '#7E848C' },
          { label: 'Matte Graphite', value: '#36393F' },
          { label: 'Matte Onyx Black', value: '#222429' },
          { label: 'Sage Olive', value: '#6F7E6D' },
          { label: 'Deep Maroon', value: '#6B2737' }
        ]
      },
      {
        key: 'backColor',
        label: 'Recessed Back Panel Finish',
        type: 'color_swatches',
        default: '#A67C52',
        swatches: [
          { label: 'Warm Oak Veneer (Default)', value: '#A67C52' },
          { label: 'Warm Cashmere Plaster', value: '#CFC6B9' },
          { label: 'Soft Pearl Cream', value: '#ECE7DF' },
          { label: 'Smoked Walnut', value: '#4E3624' },
          { label: 'Matte Anthracite', value: '#2F3238' }
        ]
      },
      {
        key: 'shelfStyling',
        label: 'Books & Decorative Styling',
        type: 'select',
        default: 'styled',
        options: [
          { label: 'Curated Books & Ceramic Decor (Default)', value: 'styled' },
          { label: 'Hardcover Books Only', value: 'books_only' },
          { label: 'Empty Shelves Only', value: 'empty' }
        ]
      }
    ]
  }
];

// Default Placed Room Furniture Instances:
// Includes the Modular Corner Sofa (L226×226×H81 cm) in 0.11 Salon,
// the Channeled Upholstered King Storage Bed (185×209.5×H110 cm) in 1.01 Master Bedroom,
// and the 30 cm deep Architectural Bookshelf Cabinet along the East wall of 1.01 Master Bedroom.
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
  },
  {
    id: 'BED_MASTER_1',
    typeId: 'upholstered_bed_channeled',
    name: 'Master Bedroom Channeled Bed (1.01 Sypialnia)',
    floor: 'first',
    room: '1.01 Sypialnia',
    x: 8010,
    y: 5892,
    rotation: 180,
    properties: {
      bedSize: 'king',
      upholsteryColor: '#D5CEC5',
      beddingColor: '#F2F0EC',
      throwColor: '#7D7265',
      accentPillowColor: '#6D6B44'
    }
  },
  {
    id: 'BOOKCASE_MASTER_1',
    typeId: 'bookshelf_cabinet_30',
    name: 'Master Bedroom Bookshelf (1.01 Sypialnia, 30 cm)',
    floor: 'first',
    room: '1.01 Sypialnia',
    x: 6646,
    y: 6370,
    rotation: 90,
    properties: {
      widthVariant: '110',
      heightVariant: '280',
      bodyColor: '#B5895A',
      doorColor: '#D8CFC2',
      backColor: '#A67C52',
      shelfStyling: 'styled'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROOM_FURNITURE_CATALOG,
    DEFAULT_ROOM_FURNITURE
  };
}
