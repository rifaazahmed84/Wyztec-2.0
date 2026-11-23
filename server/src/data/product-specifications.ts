import type { Product } from './products.js';

type Specifications = Pick<Product, 'specs' | 'specificationNote' | 'modelTable'>;
const rows = (values: Record<string, string>): Product['specs'] =>
  Object.entries(values).map(([label, value]) => ({ label, value }));
const reference = (specificationNote: string, values: Record<string, string>): Specifications => ({
  specificationNote,
  specs: rows(values),
});

// Transcribed from the supplied Meknoid Industrial Buyer Guide, 23 November 2026.
// Page references below identify the evidence; see PRODUCT-SPECIFICATIONS-REVIEW.txt.
// Replace the old defaults in full. Family maxima and worked examples are not
// guaranteed ratings for a single order code. Keep exact-model verification separate.
export const productSpecifications: Record<string, Specifications> = {
  // Guide pp. 3 and 13.
  'meknoid-marathon-ie2-motor': reference(
    'TerraMAX SCA family data. The 15 kW figures describe one four-pole catalog example; confirm the data for your selected rating and supply.',
    {
      'Reference series': 'Marathon TerraMAX SCA',
      'Efficiency class': 'IE2',
      'Published family power range': '0.75–375 kW',
      '15 kW example: poles / speed': '4 poles / 1,465 rpm',
      '15 kW example: full-load efficiency': '90.6%',
      '15 kW example: IEC frame': '160L',
      '15 kW example: mass': '140 kg',
      '15 kW example: locked-rotor current': '6.5 times rated current',
      'Order selection':
        'Confirm winding, supply, mounting dimensions and applicable efficiency requirements.',
    },
  ),
  'meknoid-marathon-ie3-motor': reference(
    'TerraMAX TCA family data. The schedule contains selected four-pole examples with current stated at 415 V; each line is a different motor rating.',
    {
      'Reference series': 'Marathon TerraMAX TCA',
      'Efficiency class': 'IE3',
      'Published family power range': '0.75–375 kW',
      '7.5 kW example (4-pole)':
        'Frame 132M; 1,470 rpm; 13.9 A at 415 V; 90.4% full-load efficiency; 93 kg',
      '15 kW example (4-pole)':
        'Frame 160L; 1,476 rpm; 26.7 A at 415 V; 92.1% full-load efficiency; 178 kg',
      '30 kW example (4-pole)':
        'Frame 200L; 1,479 rpm; 52 A at 415 V; 93.6% full-load efficiency; 271 kg',
      '55 kW example (4-pole)':
        'Frame 250M; 1,487 rpm; 94 A at 415 V; 94.6% full-load efficiency; 535 kg',
      '90 kW example (4-pole)':
        'Frame 280M; 1,489 rpm; 151 A at 415 V; 95.2% full-load efficiency; 755 kg',
      '132 kW example (4-pole)':
        'Frame 315M; 1,488 rpm; 218 A at 415 V; 95.6% full-load efficiency; 1,016 kg',
      '15 kW example: locked-rotor current': '7.6 times rated current',
    },
  ),
  // Guide pp. 3, 4 and 13.
  'meknoid-marathon-ie4-motor': reference(
    'TerraMAX QCA catalog-family data. Limits and mounting depend on the order code; the 15 kW example must not be applied to other ratings.',
    {
      'Reference series': 'Marathon TerraMAX QCA',
      'Efficiency class': 'IE4',
      'Published family power range': '0.75–315 kW',
      'Pole range': '2–8 poles, according to rating',
      'IEC frame range': '80–355',
      'Base-design protection': 'IP55',
      'Insulation / temperature rise': 'Class F insulation / class B rise',
      'Base-design ambient': '40 °C',
      '15 kW, four-pole example': '93.9% full-load efficiency; frame 160L; 192 kg',
      '15 kW example: locked-rotor current': '8.5 times rated current',
      'Supply and drive selection':
        'Specify winding, frequency, VFD speed range and load torque curve.',
    },
  ),
  // Guide p. 3.
  'meknoid-marathon-crane-duty-motor': reference(
    'SCV / TCV family ranges for intermittent crane service. Thermal suitability depends on the complete operating cycle, not shaft power alone.',
    {
      'Reference series': 'Marathon SCV / TCV',
      'Operating duty': 'Intermittent crane duty',
      'Four-pole family power range': '0.37–375 kW',
      'Six-pole family power range': '0.37–315 kW',
      'Movement to specify': 'Hoist, cross travel or long travel',
      'Duty inputs required':
        'Starts per hour, duty factor, reflected inertia, braking and reversals',
    },
  ),
  'meknoid-marathon-tefc-motor': reference(
    'Flowpak family reference. Maximum power and voltage describe available family options and are not a single motor rating.',
    {
      'Reference series': 'Marathon Flowpak',
      'Motor construction': 'Cage induction motor',
      'Cooling / enclosure': 'Totally enclosed, fan-cooled (TEFC)',
      'Published family output': 'Up to 800 kW',
      'Published family voltage': 'Up to 6.6 kV',
      'Mounting arrangements': 'Horizontal or vertical builds',
      'Installation selection':
        'Confirm enclosure, cooling-air clearance, supply voltage and motor protection.',
    },
  ),
  'meknoid-marathon-slip-ring-motor': reference(
    'KS construction and selection data. The guide does not give a power or voltage schedule for this family; supply the motor and rotor nameplates for a rated selection.',
    {
      'Reference series': 'Marathon KS',
      'Rotor construction': 'Wound rotor with slip rings',
      'Starting arrangement': 'External rotor resistance for controlled acceleration',
      'Rotor electrical data': 'Specify rotor voltage and current for the selected motor.',
      'Starting-duty inputs': 'Resistor stages, starting time and driven-load inertia',
      'Maintenance provision': 'Access for slip-ring and brush maintenance',
    },
  ),
  // Guide p. 5. Keep family maxima and individual fan examples distinct.
  'meknoid-marathon-axial-flow-fan': reference(
    'Published Marathon axial-fan family limits. Maximum air delivery, diameter and motor power may belong to different selections; request the fan curve at your duty point.',
    {
      'Fan arrangement': 'Axial flow',
      'Published diameter range': '12–75 in',
      'Family motor-power range': '0.37–110 kW',
      'Motor pole options': '2 / 4 / 6 / 8 poles',
      'Family air-delivery limit': 'Up to 300,000 m³/h',
      'Duty-point inputs': 'Required airflow, system static pressure and air density',
    },
  ),
  'meknoid-marathon-exhaust-fan': reference(
    'The guide lists individual propeller-fan examples and a separate roof-extractor range. These figures do not describe one interchangeable fan.',
    {
      'Reference family': 'Marathon exhaust / propeller fans',
      'GPN30061 example': '300 mm diameter; single phase; 900 rpm',
      'GPN45063 example': '450 mm diameter; three phase; 900 rpm',
      'Roof-extractor family diameter': '19–60 in',
      'System allowances': 'Louver, guard, backdraft shutter and make-up air path',
      'Installation conditions': 'Specify wall or roof mounting and weather exposure.',
    },
  ),
  'meknoid-marathon-centrifugal-fan': reference(
    'Published family maxima are separate limits, not a simultaneous operating point. Confirm airflow, pressure, shaft power and material suitability on the selected fan curve.',
    {
      'Fan arrangement': 'Centrifugal',
      'Impeller families': 'Backward-curved, forward-curved and radial',
      'Family air-delivery limit': 'Up to 300,000 m³/h',
      'Family static-pressure limit': 'Up to 800 mm water gauge (approximately 7.85 kPa)',
      'Process inputs': 'Dust loading, erosion risk, air temperature and density',
      'Required performance data':
        'Plotted duty point, efficiency, shaft power, sound conditions and stable operating region',
    },
  ),
  // Guide p. 4. General motor entries are selection references, not fixed SKUs.
  'siemens-induction-motor': reference(
    'GP asynchronous-motor selection reference for Siemens SIMOTICS replacement enquiries. Exact electrical and mechanical ratings require the installed nameplate and a current order code.',
    {
      'Reference family': 'Innomotics GP / Siemens SIMOTICS enquiry',
      'Motor principle': 'Asynchronous induction motor',
      'Pole selections discussed': '2 / 4 / 6 poles; verify loaded speed',
      'Drive method': 'Direct-on-line or converter duty, selected by model',
      'Electrical selection': 'Specify rated output, voltage and required operating speed.',
      'Mechanical selection': 'Confirm IEC frame, shaft height and installation drawing.',
    },
  ),
  'siemens-ie4-motor': reference(
    'GP / SD IE4 configuration reference. The guide supplies selection criteria rather than a fixed power, voltage or frame schedule for this listing.',
    {
      'Reference families': 'Innomotics GP / SD',
      'Efficiency class': 'IE4 configurations',
      'Efficiency comparison': 'Use full-load and partial-load values for the selected rating.',
      'Electrical checks': 'Power factor and acceleration current',
      'Converter-duty checks': 'Cooling performance at the minimum required VFD speed',
      'Replacement identification': 'Match the installed Siemens SIMOTICS nameplate and drawing.',
    },
  ),
  'siemens-flange-mounting-motor': reference(
    'Mounting-selection information. B5 and B14 are different interfaces; confirm every dimension on the selected motor and driven-machine drawings.',
    {
      'Mounting selection': 'B5 or B14, as required by the machine',
      'B5 flange form': 'Generally a through-hole flange',
      'B14 flange form': 'Smaller tapped-face mounting',
      'Flange dimensions to match': 'Pilot diameter, bolt circle and thread',
      'Shaft interface': 'Confirm shaft extension and coupling dimensions.',
      'Load check': 'Verify permissible axial load for the selected bearing arrangement.',
    },
  ),
  'siemens-flameproof-motors': reference(
    'D81.1 example for XP 1MB1553 / 1MB1563, not a blanket rating for every flameproof motor. The selected certificate must match the site classification and drive method.',
    {
      'Example series': 'Innomotics XP 1MB1553 / 1MB1563',
      'Example efficiency class': 'IE3',
      'Example family power range': '0.09–90 kW',
      'Example housing': 'Cast iron',
      'Example application zone': 'Zone 1, subject to the selected certification',
      'Protection markings to confirm': 'Ex db or Ex db eb, according to the model certificate',
      'Certificate selection':
        'Gas group, temperature class, ambient limits and permitted drive method',
    },
  ),
  // Guide p. 6. kNm is intentionally retained; it must not be silently read as Nm.
  'meknoid-helical-gearbox': reference(
    'Premium SMH parallel-helical series ranges. Each stage arrangement has its own ratio and torque range; use the chosen size and service duty for final selection.',
    {
      'Reference family': 'Premium SMH parallel helical',
      'SMH1 ratio range': '2–5.6:1',
      'SMH1 torque range': '3.4–257 kNm',
      'SMH2 ratio range': '6.3–22.4:1',
      'SMH2 torque range': '3.2–357 kNm',
      'SMH3 ratio range': '22.4–112:1',
      'SMH3 torque range': '3.6–792 kNm',
      'SMH4 ratio range': '112–630:1',
      'SMH4 torque range': '9–796 kNm',
      'Sizing inputs':
        'Input/output rpm, design torque, service factor and allowable overhung load',
    },
  ),
  'meknoid-bevel-helical-gearbox': reference(
    'Premium SMB right-angle series ranges. Ratio and torque limits vary by stage arrangement and size; confirm mounting orientation and lubrication for the selected gearbox.',
    {
      'Reference family': 'Premium SMB bevel helical',
      'Shaft arrangement': 'Right angle',
      'SMB2 ratio range': '5.6–16:1',
      'SMB2 torque range': '3.2–200 kNm',
      'SMB3 ratio range': '14–90:1',
      'SMB3 torque range': '3.4–785 kNm',
      'SMB4 ratio range': '90–400:1',
      'SMB4 torque range': '3.4–788 kNm',
      'Installation selection':
        'Shaft hand, mounting orientation, oil level, fill and drain access',
    },
  ),
  'meknoid-crane-duty-gearbox': reference(
    'Published Premium crane-range limits. Maximum power, ratio and center distance are family limits; selection must use the actual lifting or travel load spectrum.',
    {
      'Reference family': 'Premium crane-duty gearboxes',
      'Family power limit': 'Up to 950 kW',
      'Family reduction-ratio limit': 'Up to 380:1',
      'Center-distance range': '125–1,000 mm',
      'Hoist geometry inputs': 'Drum diameter, reeving and required lift speed',
      'Duty inputs': 'Hours per day, starts per hour and load spectrum',
      'Drive interfaces': 'Brake torque, coupling and shaft arrangement',
    },
  ),
  'meknoid-altra-gearbox': reference(
    'The supplied guide identifies the Premium Altra ALM worm-gearbox family. Confirm the actual ALM size and nameplate before applying these family ranges to a replacement.',
    {
      'Reference family': 'Premium Altra ALM worm gearbox',
      'Size range': 'ALM25–ALM130',
      'Family input-power range': '0.1–7.5 kW',
      'Reduction-ratio range': '7.5–100:1',
      'Housing through size 90': 'Aluminium',
      'Housing from size 110': 'Cast iron',
      'Drive arrangement': 'Compact right-angle drive',
      'Duty checks':
        'Confirm efficiency and thermal rating; use an independent holding brake when required.',
    },
  ),
  // Guide p. 7. Do not transfer one pneumatic series' limits to other components.
  'meknoid-metalwork-pneumatic-cylinder': reference(
    'The guide distinguishes ISO 15552 profile cylinders from ISO 6432 mini cylinders. The stated pressure limit applies to the mini-cylinder variants described, not every cylinder.',
    {
      'Profile-cylinder reference': 'ISO 15552 mounting interchangeability',
      'Mini-cylinder reference': 'ISO 6432 variants',
      'Mini-cylinder pressure limit': 'Up to 10 bar, according to variant',
      'Dimensions to specify': 'Bore, rod diameter and stroke',
      'Configuration to specify': 'Mounting, cushioning, seals and magnetic switches',
      'Force selection':
        'Use the lowest available cylinder pressure and account for side loads and rod buckling.',
    },
  ),
  'meknoid-metalwork-frl-unit': reference(
    'Syntesi filter/regulator reference. Element size is a selectable option; pressure range, rated flow and drain arrangement depend on the ordered assembly.',
    {
      'Reference series': 'Metal Work Syntesi',
      'Filter-element options': '5 / 20 / 50 µm',
      'Pressure regulation': 'Multiple regulating ranges; specify the required outlet pressure.',
      'Flow selection': 'Size to the required circuit flow at operating conditions.',
      'Assembly options to specify': 'Drain type, pressure gauge and bowl material',
      'Lubrication selection': 'Only where accepted by downstream components and the process',
    },
  ),
  'meknoid-metalwork-pneumatic-fittings': reference(
    'R-series push-in fitting ranges are separated by material. The permissible assembly pressure also depends on the tubing and operating temperature.',
    {
      'Reference family': 'Metal Work R-series push-in fittings',
      'Brass fitting pressure range': '−0.99 to 16 bar',
      'Technopolymer fitting pressure range': '−0.99 to 12 bar',
      'Connection selection': 'Tube outside diameter, compatible tube material and port thread',
      'Operating checks': 'Pressure/temperature duty and chemical resistance',
      'Moving-line checks': 'Tube bending radius and routing in cable carriers',
    },
  ),
  'metal-work-valve-island': reference(
    'EB 80 reference data. Holding power is specified after the switching pulse; confirm protection and electrical requirements for the complete configured assembly.',
    {
      'Reference series': 'Metal Work EB 80',
      'Assembly type': 'Modular valve manifold',
      'Published protection': 'IP65, subject to the selected assembly',
      'Solenoid holding power': '0.3 W per solenoid after the switching pulse',
      'Configuration inputs': 'I/O, fieldbus, pilot supply, exhaust zones and spare stations',
      'Control integration': 'Confirm PLC compatibility and diagnostic mapping for the chosen bus.',
    },
  ),
  'metal-work-solenoid-valve': reference(
    'Series 70 flow figures apply at 6 bar supply with a 1 bar pressure drop. The operating-pressure range below applies to monostable differential versions only.',
    {
      'Reference series': 'Metal Work Series 70',
      'Valve-function choices': '3/2, 5/2 or 5/3, according to version',
      'Flow test conditions': '6 bar supply; 1 bar pressure drop',
      '1/8 in port: nominal flow': '550 Nl/min',
      '1/4 in port: nominal flow': '1,100 Nl/min',
      '3/8 in port: nominal flow': '2,150 Nl/min',
      '1/2 in port: nominal flow': '4,600 Nl/min',
      'Monostable differential pressure range': '2.5–10 bar',
      'Electrical selection': 'Specify coil voltage, connector and required de-energized state.',
    },
  ),
  // Guide p. 8.
  'jumo-ph-sensor': reference(
    'tecLine pH type 201020 family limits. Temperature, pressure and chemical resistance depend on the chosen glass, diaphragm and connection; maxima are not automatically simultaneous.',
    {
      'Reference family': 'JUMO tecLine pH',
      'Basic type': '201020',
      'Family temperature envelope': '−5 to +135 °C',
      'Published pressure limit': 'Up to 10 bar at 50 °C',
      'Glass choices': 'UW for water; HA for strong alkali; HT for higher temperature',
      'Diaphragm / junction variants': 'Ceramic, PTFE ring and open-junction options',
      'Process selection': 'Specify pH range, temperature, pressure, fouling and solids.',
      'Installation and calibration':
        'Confirm head, cable, holder, cleaning limits and calibration buffers.',
    },
  ),
  'jumo-jumo-aquis-touch': reference(
    'These figures apply to AQUIS touch S type 202581. Other AQUIS touch variants may differ; the installed modules determine the available channels and interfaces.',
    {
      'Reference model': 'JUMO AQUIS touch S',
      'Basic type': '202581',
      'Surface-housing protection': 'IP67',
      Display: '5.5 in touchscreen',
      'Analysis inputs': 'Up to 4',
      'Standard inputs/outputs': '14',
      'Module slots': '13',
      'Interface options':
        'Ethernet, USB, RS422/485 Modbus and PROFIBUS DP, according to configuration',
      'Channel configuration':
        'Specify sensor technologies, measurement channels, control loops, relays and outputs.',
    },
  ),
  'jumo-jumo-cti-750': reference(
    'CTI-750 type 202756 data. Range selection, compensation and concentration curves depend on the application; the highest conductivity range is uncompensated.',
    {
      'Reference model': 'JUMO CTI-750',
      'Basic type': '202756',
      'Measured variables': 'Inductive conductivity and temperature',
      'Typical application threshold': 'Around 100 µS/cm',
      'Selectable conductivity ranges': 'Extend to 2,000 mS/cm; highest range uncompensated',
      'Output signals': '4–20 mA and other configurable current or voltage signals',
      'Built-in NaOH concentration curves': '0–15% or 25–50% by weight',
      'NaOH curve temperature range': '0–90 °C',
      'Chemical-mixture check': 'Verify concentration calibration for the actual process mixture.',
    },
  ),
  'jumo-dtrans-as-02': reference(
    'dTRANS AS 02 type 202553 base and optional capabilities. Maximum output counts depend on the build and must not be assumed to be available together.',
    {
      'Reference model': 'JUMO dTRANS AS 02',
      'Basic type': '202553',
      'Base standard-signal inputs': '1',
      'Base binary inputs': '2',
      'I/O expansion': 'Optional input/output boards',
      'Analog outputs': 'Up to 3, depending on build',
      'Relay outputs': 'Up to 7, depending on build',
      'Controller functions': 'P / PI / PD / PID',
      'Additional functions': 'Wash timer and calibration log',
      'Sensor interface':
        'Use a compatible transmitter or input module; specify input scaling and output action.',
      'Order selection': 'Confirm controller mode, supply and mounting variant.',
    },
  ),
  // Guide p. 9; accuracy wording checked against JUMO data sheet 406065, p. 4.
  'jumo-flowtrans-mag-h20': reference(
    'Type 406065 data is separated by nominal size and communication variant. Accuracy includes a fixed velocity term; confirm the allowable pressure/temperature combination and keep the measuring pipe full.',
    {
      Model: 'JUMO flowTRANS MAG H20',
      'Basic type': '406065',
      'Measuring principle': 'Electromagnetic, for conductive liquids',
      'DN 6 flow range': '0.005–5 L/min',
      'DN 15 flow range': '0.05–35 L/min',
      'DN 20 flow range': '0.1–75 L/min',
      'DN 25 flow range': '0.2–150 L/min',
      'Reference-condition accuracy': '0.5% of measured value ±1.5 mm/s',
      'Application-condition accuracy': '0.8% of measured value ±1.5 mm/s',
      'Reference test conditions':
        'Water; medium and ambient 23 ±5 °C; 1–4 bar; horizontal measuring pipe',
      'Reference response time (t90)': '≤250 ms',
      'Medium temperature': '−20 to +90 °C',
      'Maximum viscosity': '70 mPa·s',
      'Minimum conductivity': '20 µS/cm',
      'Nominal pressure': 'PN16',
      'Standard insertion length': '110 mm, except DN 25 Tri-Clamp',
      'Process connections': 'G external thread or clamp, according to order code',
      'IO-Link variant': 'IO-Link with analog/digital I/O',
      'SPE variant': 'Single Pair Ethernet with Power over Data Line (PoDL) and Modbus TCP',
      'Display / configuration':
        'Specify display and Bluetooth configuration access where offered.',
      'Protection options': 'IP65 / IP67 / IP69, according to the selected configuration',
    },
  ),
  // Guide p. 10. Physical I/O counts are not the same as recorded signal counts.
  'jumo-logoscreen-700': reference(
    'LOGOSCREEN 700 type 706530 capabilities depend on the installed hardware and options. Recorded signals received through interfaces do not increase the number of physical input terminals.',
    {
      Model: 'JUMO LOGOSCREEN 700',
      'Basic type': '706530',
      Display: '5.7 in resistive color touchscreen; 640 × 480 pixels',
      Mounting: 'Panel mounting',
      'Front / rear protection': 'IP65 front / IP20 rear',
      'Physical analog inputs': 'Up to 18 universal inputs',
      'Physical analog outputs': 'Up to 3',
      'Physical digital inputs': 'Up to 18',
      'Configurable digital I/O':
        'Up to 24 individually configurable channels, according to the module combination',
      'Relay outputs': 'Up to 7, according to configuration',
      'Recorded analog signals': 'Up to 60',
      'Recorded digital signals': 'Up to 60',
      'Alarm signals': 'Up to 120',
      'Internal counter channels': 'Up to 30',
      'Measuring groups': 'Up to 10',
      'Internal memory': '1 GB',
      'Recording interval': 'From 125 ms',
      'Standard interfaces': 'Ethernet Modbus TCP, RS232/485, USB host and USB device',
      'Optional network interface': 'PROFINET IO device',
      'AC supply option': '110–240 V AC (+10/−15%), 48–63 Hz',
      'Low-voltage supply option': '20–30 V AC/DC, according to order code',
      'Optional extra code 888':
        'Functions for regulated recording applications; access roles, audit trail, signatures and site validation must be specified.',
    },
  ),
  // Guide p. 11. Use the existing optional three-column table for the five types.
  'jumo-thermocouples': {
    ...reference(
      'Family envelopes are shown by thermocouple type. Actual limits depend on the alloy, sheath, diameter and atmosphere; specify sensing-tip and head/cable temperatures separately.',
      {
        'Product family': 'JUMO thermocouples',
        'Types covered': '901020 / 901030 / 901110 / 901120 / 901250',
        'Dimensional selection': 'Specify sheath diameter, insertion depth and process connection.',
        '901250 junction selection':
          'Specify grounded or insulated junction, bend allowance, cable and connector.',
        'Calibration requirements':
          'Specify temperature points, tolerance class, traceability and calibration interval.',
      },
    ),
    modelTable: {
      headings: ['Model', 'Construction / options', 'Family temperature range'],
      rows: [
        [
          '901020',
          'Screw-in; replaceable insert and extension tube; 1.4571 stainless fitting; IP65; J/K/L; one or two circuits',
          '−200 to +800 °C',
        ],
        [
          '901030',
          'Thread or union-nut connection; 1.4571 stainless; IP65; J/K/L',
          '−200 to +800 °C',
        ],
        [
          '901110',
          'Straight push-in; steel or ceramic protection tube; flange or compression fitting; IP54',
          '−200 to +1,600 °C across variants',
        ],
        [
          '901120',
          'Straight assembly; flange or compression fitting; IP65; one or two circuits',
          '−200 to +1,600 °C across variants',
        ],
        [
          '901250',
          'Flexible mineral-insulated assembly; limits depend on sheath and diameter',
          'Type K: −200 to +1,200 °C; J/L: up to +800 °C',
        ],
      ],
    },
  },
  // No matching model data in the supplied guide: remove guessed numeric defaults.
  'jumo-flowmeters': reference(
    'Exact model required. This is a general flowmeter listing; MAG H20 figures belong to its separate product page. The entries below are selection requirements, not certified ratings.',
    {
      'Catalog scope': 'JUMO flowmeter family enquiry',
      'Model identification': 'Provide the model or basic type and complete order code.',
      'Flow duty to specify': 'Minimum, normal and maximum flow with pipe size',
      'Process conditions to specify': 'Medium, conductivity, temperature and pressure',
      'Integration to specify': 'Process connection, output signal and communication interface',
    },
  ),
  'jumo-paperless-recorders': reference(
    'Exact model required. This is a general recorder listing; LOGOSCREEN 700 capabilities belong to its separate product page. The entries below are selection requirements, not certified ratings.',
    {
      'Catalog scope': 'JUMO paperless-recorder family enquiry',
      'Model identification': 'Provide the model or basic type and complete order code.',
      'Acquisition to specify': 'Physical input types and channel count',
      'Recording to specify': 'Recording interval, storage retention and export requirements',
      'Integration to specify': 'Supply, mounting, network interface and software options',
    },
  ),
};
