import type { Product } from './products.js';

// Additive catalog entries from the supplied product brief. No family defaults.
type Addition = Product & { sourceImages: string[] };
const contact = 'Contact Wyztec for specifications, sizing and availability.';
const base = (
  id: string,
  slug: string,
  name: string,
  brand: string,
  category: string,
  overview: string,
  sourceImages: string[],
): Addition => ({
  id,
  slug,
  name,
  brand,
  category,
  overview,
  tagline: overview,
  industries: [],
  features: [],
  specs: [],
  applications: [],
  selectionGuide: contact,
  images: sourceImages.map((_, index) => ({
    src: `/images/products/${slug}/${index + 1}.webp`,
    alt: name,
  })),
  // TODO: replace with official manufacturer image
  lowRes: true,
  verified: false,
  documents: [],
  relatedSlugs: [],
  sourceImages,
});
const specRows = (values: Record<string, string>) =>
  Object.entries(values).map(([label, value]) => ({ label, value }));

const additions: Addition[] = [
  {
    ...base(
      'WYZ-028',
      'jumo-flowtrans-mag-h20',
      'Electromagnetic Flowmeter - flowTRANS MAG H20',
      'JUMO',
      'JUMO Instrumentation',
      'Electromagnetic flowmeter with a digital TFT display. Connections and communication depend on the selected configuration.',
      ['jumo/jumo-flowtrans-mag-h20.jpeg'],
    ),
    specs: specRows({
      Model: 'flowTRANS MAG H20',
      'Basic type': '406065',
      'Measuring principle': 'Electromagnetic',
      'Flow range': '0.005-150 L/min',
      'Nominal sizes': 'DN6, DN15, DN20, DN25',
      'Medium temperature': '-20 to +90°C',
      'Nominal pressure': 'PN16',
      'Measuring accuracy': '0.5% of measured value under reference conditions',
      'Medium conductivity': 'Minimum 20 µS/cm',
      Protection: 'IP65/IP67/IP69, depending on configuration',
      Display: 'Digital TFT display',
      Communication: 'Bluetooth, IO-Link or SPE with PoDL, depending on variant',
      'Process connection': 'G-type external thread / Tri-Clamp',
    }),
  },
  {
    ...base(
      'WYZ-029',
      'jumo-dtrans-as-02',
      'Industrial Transmitter - JUMO dTRANS AS 02',
      'JUMO',
      'JUMO Instrumentation',
      'Compact industrial transmitter and controller for standard analog signals and temperature measurement and control in process industries.',
      ['jumo/jumo-dtrans-as-02.jpeg'],
    ),
    features: [
      'Multi-channel transmitter + controller',
      'Supports temperature and standard signals',
      'PID / continuous control functions',
      'Modular optional I/O boards',
      'Relay and analog outputs',
      'DIN panel/control cabinet mounting',
      'Used in furnaces, process plants, water treatment, OEM panels, etc.',
    ],
    industries: ['Water Treatment'],
    applications: [
      'Furnace temperature control',
      'Process automation panels',
      'Chemical plants',
      'Water treatment systems',
    ],
  },
  {
    ...base(
      'WYZ-030',
      'jumo-logoscreen-700',
      'Paperless Recorder - JUMO LOGOSCREEN 700',
      'JUMO',
      'JUMO Instrumentation',
      'Panel-mounted paperless recorder with a resistive touchscreen and a 5.7-inch TFT colour display.',
      ['jumo/jumo-logoscreen-700.jpeg'],
    ),
    specs: specRows({
      Make: 'JUMO',
      Model: 'LOGOSCREEN 700',
      Display: '5.7-inch TFT colour',
      'Display resolution': '640 × 480 pixels',
      Operation: 'Resistive touchscreen',
      'Maximum analogue inputs': '18',
      'Maximum analogue outputs': '3',
      'Maximum digital inputs': '18',
      'Digital inputs/outputs': 'Up to 24',
      'Relay outputs': 'Up to 7',
      'Internal memory': '1 GB',
      'Recording cycle': 'From 125 ms',
      Ethernet: 'Standard',
      USB: '1 host + 1 device',
      Communication: 'RS232/RS485, Modbus TCP',
      'Optional communication': 'PROFINET IO',
      'Front protection': 'IP65',
      'Rear protection': 'IP20',
      Mounting: 'Panel mounting',
    }),
  },
  {
    ...base(
      'WYZ-031',
      'jumo-thermocouples',
      'Thermocouples - JUMO',
      'JUMO',
      'JUMO Instrumentation',
      'JUMO thermocouples for temperature measurement. The gallery shows two thermocouple styles.',
      ['jumo/jumo-thermocouple-1.jpeg', 'jumo/jumo-thermocouple-2.jpeg'],
    ),
    modelTable: {
      headings: ['Model', 'Product', 'Temperature range'],
      rows: [
        ['901020', 'Screw-in thermocouple', '-200 to +800°C'],
        ['901030', 'Screw-in thermocouple', '-200 to +800°C'],
        ['901110', 'Push-in thermocouple', '-200 to +1600°C'],
        ['901120', 'Push-in thermocouple', 'Up to +1600°C'],
        ['901250', 'Mineral-insulated thermocouple', '-200 to +1200°C'],
      ],
    },
  },
];

const meknoid: [name: string, brand: string, category: string, group: string, image: string][] = [
  ['IE2 MOTOR', 'MARATHON', 'Marathon Motors', 'MARATHON MOTOR', 'marathon-ie2-motor.jpeg'],
  ['IE3 MOTOR', 'MARATHON', 'Marathon Motors', 'MARATHON MOTOR', 'marathon-ie3-motor.png'],
  ['IE4 MOTOR', 'MARATHON', 'Marathon Motors', 'MARATHON MOTOR', 'marathon-ie4-motor.jpeg'],
  [
    'CRANE DUTY MOTOR',
    'MARATHON',
    'Marathon Motors',
    'MARATHON MOTOR',
    'marathon-crane-duty-motor.jpeg',
  ],
  ['TEFC MOTOR', 'MARATHON', 'Marathon Motors', 'MARATHON MOTOR', 'marathon-tefc-motor.png'],
  [
    'SLIP RING MOTOR',
    'MARATHON',
    'Marathon Motors',
    'MARATHON MOTOR',
    'marathon-slip-ring-motor.jpeg',
  ],
  [
    'AXIAL FLOW FAN',
    'MARATHON',
    'Marathon Industrial Fans',
    'MARATHON INDUSTRIAL FANS',
    'marathon-axial-flow-fan.png',
  ],
  [
    'EXHAUST FAN',
    'MARATHON',
    'Marathon Industrial Fans',
    'MARATHON INDUSTRIAL FANS',
    'marathon-exhaust-fan.jpeg',
  ],
  [
    'CENTRIFUGAL FAN',
    'MARATHON',
    'Marathon Industrial Fans',
    'MARATHON INDUSTRIAL FANS',
    'marathon-centrifugal-fan.jpeg',
  ],
  [
    'PNEUMATIC CYLINDER',
    'METAL WORK',
    'Metal Work Pneumatics',
    'METAL WORK PNEUMATICS',
    'metalwork-pneumatic-cylinder.jpeg',
  ],
  [
    'FRL UNIT',
    'METAL WORK',
    'Metal Work Pneumatics',
    'METAL WORK PNEUMATICS',
    'metalwork-frl-unit.jpeg',
  ],
  [
    'PNEUMATIC FITTINGS',
    'METAL WORK',
    'Metal Work Pneumatics',
    'METAL WORK PNEUMATICS',
    'metalwork-pneumatic-fittings.png',
  ],
  [
    'HELICAL GEARBOX',
    'PREMIUM TRANSMISSION',
    'Premium Transmission Gearboxes',
    'PREMIUM TRANSMISSION GEARBOXES',
    'helical-gearbox.jpeg',
  ],
  [
    'CRANE DUTY GEARBOX',
    'PREMIUM TRANSMISSION',
    'Premium Transmission Gearboxes',
    'PREMIUM TRANSMISSION GEARBOXES',
    'crane-duty-gearbox.jpeg',
  ],
  [
    'ALTRA GEARBOX',
    'ALTRA',
    'Premium Transmission Gearboxes',
    'PREMIUM TRANSMISSION GEARBOXES',
    'altra-gearbox.jpeg',
  ],
  [
    'BEVEL HELICAL GEARBOX',
    'PREMIUM TRANSMISSION',
    'Premium Transmission Gearboxes',
    'PREMIUM TRANSMISSION GEARBOXES',
    'bevel-helical-gearbox.jpeg',
  ],
];
for (const [index, [name, brand, category, group, image]] of meknoid.entries()) {
  // Separate URLs preserve all pre-existing products with similar names.
  const slug = `meknoid-${image.replace(/\.(jpeg|png)$/, '')}`;
  additions.push(
    base(
      `WYZ-${String(32 + index).padStart(3, '0')}`,
      slug,
      name,
      brand,
      category,
      `${name} from the ${group} range. ${contact}`,
      [`meknoid/${image}`],
    ),
  );
}

export const additionalProductSources = additions.map(({ slug, name, sourceImages }) => ({
  slug,
  name,
  sourceImages,
}));
export const additionalProducts: Product[] = additions.map(({ sourceImages, ...product }) => {
  void sourceImages;
  return product;
});
