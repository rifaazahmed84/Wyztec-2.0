export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  industries: string[];
  tagline: string;
  overview: string;
  features: string[];
  specs: { group?: string; label: string; value: string }[];
  applications: string[];
  selectionGuide?: string;
  images: { src: string; alt: string }[];
  lowRes?: boolean;
  documents?: { label: string; url: string }[];
  relatedSlugs?: string[];
  verified: boolean;
};
type Family = 'motor' | 'fan' | 'gearbox' | 'pneumatic' | 'instrument';
type Seed = {
  name: string;
  brand: string;
  category: string;
  family: Family;
  use: string;
  specs?: Record<string, string>;
  features?: string[];
  industries?: string[];
};
const all = [
  'Material Handling',
  'Water Treatment',
  'Oil & Gas',
  'Shipbuilding',
  'Food & Beverages',
  'Sugar Industries',
  'Concrete Industries',
  'Packaging Industries',
];
const typical: Record<Family, Record<string, string>> = {
  motor: {
    'Power range': '0.75–315 kW (1–422 HP), series dependent',
    'Poles / speed at 50 Hz':
      '2 / 4 / 6 / 8 poles; nominal 3000 / 1500 / 1000 / 750 rpm synchronous',
    'Voltage / frequency': '400 / 690 V, 50 Hz; 60 Hz variants on request',
    'Efficiency class': 'Confirm IEC 60034-30-1 class for selected rating',
    'Frame / mounting': 'IEC 80–355; B3, B5 or B35 options',
    Enclosure: 'IP55 typical; confirm selected model',
    'Insulation / rise': 'Class F; class B rise option to be confirmed',
    Duty: 'S1 continuous',
    Cooling: 'IC411, self-ventilated',
    Bearings: 'Rolling-element; sealed or regreasable by frame',
    'Frame material': 'Cast iron or aluminium, size dependent',
    'Ambient temperature': '−20 to +40 °C typical; derating above rated ambient',
  },
  fan: {
    Airflow: '1,000–50,000 m³/h, size dependent',
    'Static pressure': '100–1,000 Pa, duty dependent',
    'Impeller diameter': '315–1,250 mm typical',
    Speed: '750–2,900 rpm typical',
    'Motor power': '0.37–30 kW typical',
    'Blade material': 'Aluminium or coated steel, series dependent',
    'Air temperature': '−20 to +60 °C typical',
    'Drive arrangement': 'Direct drive; belt drive options by series',
    'Noise level': 'Application dependent; request sound data at duty point',
    'Electrical supply': 'Three phase 400 V / 50 Hz typical',
    Protection: 'IP55 motor typical',
  },
  gearbox: {
    'Ratio range': '5:1–200:1 typical; stages dependent',
    'Rated output torque': '100–50,000 Nm typical, size dependent',
    'Input power': '0.37–250 kW typical',
    Efficiency: '94–98% typical; ratio and stages dependent',
    'Service factor': 'Select against load class, starts/hour and duty',
    Mounting: 'Foot or flange; mounting position specified at order',
    Housing: 'Cast iron',
    Lubrication: 'Oil bath / splash; grade to manufacturer guidance',
    'Output shaft': 'Solid shaft; hollow shaft options by series',
    'Gear accuracy': 'Confirm applicable DIN / AGMA design basis',
    'Operating temperature': 'Confirm lubricant and thermal rating for site conditions',
  },
  pneumatic: {
    'Operating pressure': '2–8 bar typical; confirm selected component',
    Media: 'Filtered compressed air',
    Temperature: '−10 to +60 °C typical',
    'Port sizes': 'G1/8–G1/2 typical; model dependent',
    Materials: 'Aluminium body; elastomer seals by application',
    'Air quality': 'ISO 8573-1 class to be agreed for selected device',
    Installation: 'Select tubing, connections and mounting for application',
  },
  instrument: {
    Supply: '24 VDC typical; mains versions by model',
    Protection: 'IP65 front / field enclosure typical; verify configuration',
    'Output signals': '4–20 mA options; confirm ordered hardware',
    Communication: 'Model dependent; specify required interface',
    Display: 'Local display options by model',
    'Process connection': 'Application and sensor dependent',
    'Wetted materials': 'Confirm chemical compatibility with process',
    Calibration: 'Specify required calibration and traceability with enquiry',
  },
};
const seeds: Seed[] = [
  ...[
    'IE2 Motor',
    'IE3 Motor',
    'IE4 Motor',
    'Crane Duty Motor',
    'TEFC Motor',
    'Slip-Ring Motor',
  ].map((name): Seed => ({
    name,
    brand: 'Marathon',
    category: 'Marathon Motors',
    family: 'motor',
    use:
      name === 'Crane Duty Motor'
        ? 'frequent starts, reversing and hoisting duty'
        : name === 'Slip-Ring Motor'
          ? 'high starting torque with external rotor resistance'
          : 'reliable industrial pump, fan and conveyor drives',
    specs: name.startsWith('IE')
      ? {
          'Efficiency class': `${name.slice(0, 3)} per IEC 60034-30-1; verify rating and pole applicability`,
        }
      : name === 'Crane Duty Motor'
        ? {
            Duty: 'S3 / S4 intermittent; specify cyclic duration factor and starts/hour',
            'Power range': '1.5–200 kW typical; duty dependent',
          }
        : name === 'Slip-Ring Motor'
          ? {
              Rotor: 'Wound rotor with slip rings; external resistance starter required',
              Duty: 'Specify starting torque and operating cycle',
            }
          : { Enclosure: 'Totally enclosed fan cooled; IP55 typical' },
  })),
  ...['Axial Flow Fan', 'Exhaust Fan', 'Centrifugal Fan'].map((name): Seed => ({
    name,
    brand: 'Marathon',
    category: 'Marathon Industrial Fans',
    family: 'fan',
    use:
      name === 'Centrifugal Fan'
        ? 'ducted ventilation and process air systems with higher resistance'
        : 'high-volume industrial ventilation and heat extraction',
    specs:
      name === 'Centrifugal Fan'
        ? {
            'Static pressure': '500–5,000 Pa typical',
            'Blade material': 'Fabricated steel; impeller profile selected for duty',
            'Drive arrangement': 'Direct or belt drive',
          }
        : name === 'Exhaust Fan'
          ? {
              Airflow: '1,000–30,000 m³/h typical',
              'Drive arrangement': 'Wall or panel mount, direct drive',
              'Static pressure': '30–300 Pa typical',
            }
          : { 'Static pressure': '50–800 Pa typical' },
  })),
  ...['Induction Motor', 'IE4 Motor', 'Flange Mounting Motor', 'Flameproof Motors'].map(
    (name): Seed => ({
      name,
      brand: 'Siemens',
      category: 'Siemens Motors',
      family: 'motor',
      use:
        name === 'Flameproof Motors'
          ? 'drives in classified hazardous areas, subject to project approval'
          : name === 'Flange Mounting Motor'
            ? 'direct coupling to pumps and compact machinery'
            : 'efficient three-phase industrial drive systems',
      specs:
        name === 'IE4 Motor'
          ? { 'Efficiency class': 'IE4 per IEC 60034-30-1; confirm rated operating point' }
          : name === 'Flange Mounting Motor'
            ? {
                'Frame / mounting':
                  'IEC B5 flange or B35 foot / flange; verify shaft and flange dimensions',
              }
            : name === 'Flameproof Motors'
              ? {
                  'Hazardous-area approval':
                    'ATEX / IECEx documents must be supplied and checked for the exact model; no certification asserted',
                  'Area classification':
                    'Specify zone, gas group, temperature class and ambient before selection',
                  Enclosure: 'Flameproof construction; protection marking subject to certificate',
                }
              : {},
    }),
  ),
  ...['Helical Gearbox', 'Crane Duty Gearbox', 'Altra Gearbox', 'Bevel Helical Gearbox'].map(
    (name): Seed => ({
      name,
      brand: 'Premium Transmission',
      category: 'Premium Transmission Gearboxes',
      family: 'gearbox',
      use:
        name === 'Crane Duty Gearbox'
          ? 'hoisting and cross-travel drives with cyclic loading'
          : name === 'Bevel Helical Gearbox'
            ? 'right-angle power transmission where space is constrained'
            : 'speed reduction and torque multiplication in industrial machinery',
      specs:
        name === 'Bevel Helical Gearbox'
          ? {
              'Output shaft': 'Right-angle solid or hollow shaft options',
              'Ratio range': '8:1–200:1 typical',
            }
          : name === 'Crane Duty Gearbox'
            ? {
                'Service factor': 'Crane duty classification and load spectrum must be specified',
                'Output shaft': 'Solid shaft; drum / coupling interface to be confirmed',
              }
            : name === 'Altra Gearbox'
              ? {
                  'Product identification':
                    'Flyer designation; exact manufacturer, series and model to be confirmed before offer',
                  'Ratio range': 'Specify required input and output speed',
                }
              : {},
    }),
  ),
  {
    name: 'Pneumatic Cylinder',
    brand: 'Metal Work',
    category: 'Metal Work Pneumatics',
    family: 'pneumatic',
    use: 'repeatable linear movement in automated handling and production',
    specs: {
      'Bore / stroke': '32–125 mm bore; 25–1,000 mm stroke typical',
      'Operating pressure': 'Up to 10 bar for selected ISO cylinder series; verify variant',
      Construction: 'Double acting; magnetic piston options',
      Standards: 'ISO 15552 dimensional series; confirm selected cylinder',
      Cushioning: 'Adjustable pneumatic end cushioning options',
    },
  },
  {
    name: 'FRL Unit',
    brand: 'Metal Work',
    category: 'Metal Work Pneumatics',
    family: 'pneumatic',
    use: 'cleaning, pressure regulation and optional lubrication of compressed air',
    specs: {
      Filtration: '5 µm or 20 µm typical; element dependent',
      'Regulated pressure': '0.5–8 bar typical',
      'Flow rate': '500–5,000 Nl/min typical at stated test conditions',
      Components: 'Filter, regulator and optional lubricator',
      Drain: 'Manual or automatic options',
    },
  },
  {
    name: 'Pneumatic Fittings',
    brand: 'Metal Work',
    category: 'Metal Work Pneumatics',
    family: 'pneumatic',
    use: 'quick, serviceable connections in compressed-air circuits',
    specs: {
      'Tube outside diameter': '4–16 mm typical',
      Connection: 'Push-in tube; BSPP / BSPT thread options',
      'Operating pressure': 'Vacuum to 10 bar typical; series dependent',
      Materials: 'Nickel-plated brass or polymer; check series',
      'Flow rate': 'Dependent on tube diameter and fitting geometry',
    },
  },
  {
    name: 'Valve Island',
    brand: 'Metal Work',
    category: 'Metal Work Pneumatics',
    family: 'pneumatic',
    use: 'centralised control of multiple pneumatic actuators',
    specs: {
      'Valve functions': '3/2, 5/2 or 5/3 options',
      Stations: '4–16 typical; system dependent',
      'Control voltage': '24 VDC typical',
      Communication: 'Multipole or fieldbus options; specify protocol',
      'Flow rate': '200–1,000 Nl/min per station typical',
      Protection: 'IP65 for selected assembled configurations',
    },
  },
  {
    name: 'Solenoid Valve',
    brand: 'Metal Work',
    category: 'Metal Work Pneumatics',
    family: 'pneumatic',
    use: 'electrically switched directional control of compressed air',
    specs: {
      'Valve functions': '3/2, 5/2 or 5/3',
      'Coil voltage': '24 VDC, 110 / 230 VAC options; coil dependent',
      'Response time': '10–50 ms typical; pressure and configuration dependent',
      'Flow rate': '300–1,500 Nl/min typical',
      Protection: 'IP65 with correctly installed connector',
      Actuation: 'Direct or pilot operated; verify minimum pressure',
    },
  },
  {
    name: 'pH Sensor',
    brand: 'JUMO',
    category: 'JUMO Instrumentation',
    family: 'instrument',
    use: 'monitoring acidity and alkalinity in water and process liquids',
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    specs: {
      'Measuring range': '0–14 pH typical; sensor dependent',
      Accuracy: 'System accuracy depends on calibration, transmitter and process',
      Temperature: '0–80 °C typical; electrode dependent',
      'Process connection': 'Pg13.5 typical; holder dependent',
      'Output signals': 'High-impedance electrode mV signal to compatible pH transmitter',
      Supply: 'Passive electrode; compatible transmitter required',
      'Wetted materials': 'Glass body / diaphragm material selected for media',
      Protection: 'Connector and installation dependent',
    },
  },
  {
    name: 'JUMO AQUIS Touch',
    brand: 'JUMO',
    category: 'JUMO Instrumentation',
    family: 'instrument',
    use: 'multi-parameter liquid analysis and coordinated process control',
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    specs: {
      'Measured variables': 'pH, ORP, conductivity and temperature via appropriate inputs',
      Inputs: 'Modular analogue / digital sensor inputs; configuration dependent',
      Display: 'Colour touch display; panel / field variant dependent',
      'Output signals': 'Analogue and relay outputs according to module configuration',
      Communication: 'Ethernet / Modbus options; specify model and modules',
      Supply: 'AC / DC variants; confirm selected unit',
      Protection: 'Panel front / enclosure protection varies by variant',
    },
  },
  {
    name: 'JUMO CTI 750',
    brand: 'JUMO',
    category: 'JUMO Instrumentation',
    family: 'instrument',
    use: 'inductive conductivity monitoring in cleaning and concentration processes',
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    specs: {
      'Measuring range':
        'Selectable conductivity spans; typical application from approx. 100 µS/cm',
      Accuracy: 'Range dependent; consult type 202756 datasheet',
      Temperature: 'Process temperature depends on sensor material and connection',
      Supply: '19–31 VDC typical; verify version',
      'Output signals': 'Analogue conductivity and temperature outputs; configuration dependent',
      'Wetted materials': 'PEEK or PVDF sensor variants',
      'Process connection': 'Hygienic / industrial connections; specify installation',
    },
  },
  {
    name: 'Flowmeters',
    brand: 'JUMO',
    category: 'JUMO Instrumentation',
    family: 'instrument',
    use: 'flow monitoring and totalisation in liquid process lines',
    industries: ['Water Treatment', 'Food & Beverages', 'Oil & Gas'],
    specs: {
      'Measurement principle': 'Specify electromagnetic, ultrasonic or other suitable principle',
      'Measuring range': 'Pipe size and technology dependent; define min / normal / max flow',
      Accuracy: 'Typically ±0.5–2% of reading; technology and conditions dependent',
      'Process connection': 'Threaded or flanged; DN15–DN100 typical options',
      'Output signals': 'Pulse / frequency and 4–20 mA options by model',
      'Wetted materials': 'Select liner, electrodes and seals for the medium',
      Communication: 'Model dependent; specify required protocol',
    },
  },
  {
    name: 'Paperless Recorders',
    brand: 'JUMO',
    category: 'JUMO Instrumentation',
    family: 'instrument',
    use: 'digital visualisation and recording of industrial process measurements',
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries', 'Concrete Industries'],
    specs: {
      'Inputs / channels': '3–12 universal analogue inputs typical; recorder dependent',
      'Recording capacity': 'Model and sample interval dependent; specify retention period',
      'Input signals': 'Thermocouple, RTD and analogue current / voltage by model',
      Accuracy: 'Input-type dependent; verify recorder datasheet',
      Display: 'Colour TFT with chart / numeric views',
      Communication: 'Ethernet / USB options; serial interface by variant',
      Storage: 'Internal memory and export; verify media support',
      Supply: 'Mains or low-voltage variant; specify supply',
    },
  },
];
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Managed by scripts/process-images.ts. Keep all image metadata in this catalog file.
const productImageOverrides: Record<string, Pick<Product, 'images' | 'lowRes'>> = {};
// TODO: Validate EVERY range, feature and option against the exact manufacturer model / datasheet.
// These are application planning ranges, not guaranteed specifications or Wyztec stock claims.
export const products: Product[] = seeds.map((s, i) => {
  const industries = s.industries ?? (s.family === 'instrument' ? all.slice(1, 5) : all);
  const slug = slugify(`${s.brand}-${s.name}`);
  return {
    id: `WYZ-${String(i + 1).padStart(3, '0')}`,
    slug,
    name: s.name,
    brand: s.brand,
    category: s.category,
    industries,
    tagline: `${s.name} for ${s.use}.`,
    overview: `The ${s.brand} ${s.name} is offered for ${s.use}. Wyztec helps match the operating duty, installation dimensions and site conditions to an appropriate configuration. Share your required model or application data for a confirmed technical offer.`,
    features: s.features ?? [
      `Application selection focused on ${s.use}.`,
      s.family === 'motor'
        ? 'Mounting and shaft options to suit the driven equipment.'
        : s.family === 'fan'
          ? 'Duty-point selection based on airflow and system resistance.'
          : s.family === 'gearbox'
            ? 'Ratio and service-factor selection based on the actual load cycle.'
            : s.family === 'pneumatic'
              ? 'Connection and actuation options for integration into your air circuit.'
              : 'Sensor and signal configuration matched to the measurement task.',
      'Configuration reviewed against the supplied operating conditions.',
      'Replacement selection support using existing nameplate and installation data.',
      'Manufacturer documentation requested with the final technical offer.',
    ],
    specs: Object.entries({ ...typical[s.family], ...s.specs }).map(([label, value]) => ({
      group: 'Typical selection parameters',
      label,
      value,
    })),
    applications: industries.map((ind) => `${ind}: ${s.use}`),
    selectionGuide: `Choose this ${s.name.toLowerCase()} when your application requires ${s.use}. Include ${s.family === 'motor' ? 'power, speed, supply, mounting and duty cycle' : s.family === 'fan' ? 'airflow, static pressure, air temperature and installation space' : s.family === 'gearbox' ? 'input speed, required output torque, ratio, duty cycle and mounting position' : s.family === 'pneumatic' ? 'pressure, required force or flow, connection size and control voltage' : 'measurement range, process medium, temperature, connection and signal interface'} in your enquiry. Final suitability must be confirmed against the selected model.`,
    images: productImageOverrides[slug]?.images ?? [
      {
        src: `/images/products/${slug}/1.webp`,
        alt: `${s.brand} ${s.name} — ${s.use}`,
      },
    ],
    // TODO: replace with official manufacturer image
    lowRes: productImageOverrides[slug]?.lowRes ?? true,
    documents: [],
    verified: false,
    relatedSlugs: seeds
      .filter((other) => other.family === s.family && other !== s)
      .slice(0, 6)
      .map((other) => slugify(`${other.brand}-${other.name}`)),
  };
});
