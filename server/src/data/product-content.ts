import type { Product } from './products.js';

type ProductContent = Required<
  Pick<
    Product,
    'tagline' | 'overview' | 'features' | 'applications' | 'industries' | 'selectionGuide'
  >
>;

// Editorial content for the active catalog. Sources and scope are documented in
// PRODUCT-CONTENT-SOURCES.txt. Family entries do not imply a specific model,
// certification, stock status, or guaranteed performance.
export const productContent: Record<string, ProductContent> = {
  'meknoid-marathon-ie2-motor': {
    tagline: 'IE2 induction motors for everyday pumping, ventilation and conveying duties.',
    overview:
      'Keep essential plant equipment moving with Marathon IE2 motors. This range provides a practical drive option for pumps, fans and conveyors, with frame size, speed and mounting selected to match your machine.',
    features: [
      'IE2 efficiency class for applications specified around this motor standard.',
      'Squirrel-cage induction design for industrial rotating equipment.',
      'Totally enclosed fan cooling in the TerraMAX SCA family.',
      'Foot and flange mounting configurations available within the range.',
    ],
    applications: [
      'Water circulation and transfer pumps.',
      'Factory ventilation fan drives.',
      'Belt conveyors and material transfer equipment.',
      'General production machinery and replacement drives.',
    ],
    industries: ['Water Treatment', 'Material Handling', 'Packaging Industries'],
    selectionGuide:
      'Share the required power, loaded speed, supply voltage, mounting code and daily operating hours. Include the existing nameplate when replacing a motor.',
  },
  'meknoid-marathon-ie3-motor': {
    tagline: 'Premium-efficiency motors for production lines with long operating hours.',
    overview:
      'Marathon IE3 motors combine industrial induction-motor operation with the IE3 premium-efficiency class. They are a useful choice when upgrading regularly operated pumps, fans or conveyors and evaluating energy use over the life of the equipment.',
    features: [
      'IE3 efficiency class for projects specifying premium-efficiency motors.',
      'Enclosed fan-cooled construction in the TerraMAX TCA family.',
      'A choice of frame sizes and pole counts to match the driven load.',
      'Mounting options for new installations and dimension-matched replacements.',
    ],
    applications: [
      'Process-water pump drives.',
      'Production-line conveyors.',
      'Ventilation and air-handling equipment.',
      'Motor replacement projects with an efficiency requirement.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Material Handling'],
    selectionGuide:
      'Provide the load profile, power, speed and annual running hours. Confirm shaft dimensions, starting method and any inverter operation before selecting the motor.',
  },
  'meknoid-marathon-ie4-motor': {
    tagline: 'Super-premium efficiency for industrial drives that work throughout the day.',
    overview:
      'Marathon IE4 motors bring super-premium efficiency to frequently operated industrial equipment. Select this range for a new drive or an efficiency upgrade, with the final motor matched to the real load rather than nameplate power alone.',
    features: [
      'IE4 efficiency class in the TerraMAX QCA family.',
      'Cast-iron, totally enclosed fan-cooled construction within that family.',
      'Motor sizes and speeds for a range of industrial drive requirements.',
      'Foot or flange mounting options according to the selected frame.',
    ],
    applications: [
      'Pumps running for extended production periods.',
      'Fans and ventilation drives.',
      'Conveyor and packaging-machine drives.',
      'Efficiency-focused replacement of existing induction motors.',
    ],
    industries: ['Water Treatment', 'Packaging Industries', 'Material Handling'],
    selectionGuide:
      'Share the duty point, operating hours, mounting dimensions and starter or drive details. Compare energy use using the selected motor data and actual load.',
  },
  'meknoid-marathon-crane-duty-motor': {
    tagline: 'Motor selection built around repeated lifting, travel and reversing cycles.',
    overview:
      'Crane movement places different demands on a motor from a continuously running pump. Marathon crane-duty motors address intermittent lifting and travel duties, where starts, stops, reversals and load inertia are central to selection.',
    features: [
      'Motor families intended for cyclic crane and hoist service.',
      'Selection based on operating cycles and starts per hour.',
      'Direct-on-line and inverter-duty families available for different control schemes.',
      'Torque and thermal suitability evaluated against the complete movement cycle.',
    ],
    applications: [
      'Overhead-crane long travel.',
      'Cross-travel trolley drives.',
      'Hoisting mechanisms with a matched brake and drive system.',
      'Winch and handling equipment with repeated start-stop operation.',
    ],
    industries: ['Material Handling', 'Shipbuilding', 'Concrete Industries'],
    selectionGuide:
      'Specify the lifting or travel duty, load, starts per hour, duty class, brake arrangement and control method. Motor selection must cover the entire operating cycle.',
  },
  'meknoid-marathon-tefc-motor': {
    tagline: 'Enclosed motor construction with external fan cooling for plant machinery.',
    overview:
      'A totally enclosed fan-cooled motor uses an external fan to carry heat away from the motor housing. Marathon TEFC motors serve industrial pump, fan and conveyor duties where this enclosure and cooling arrangement suit the installation.',
    features: [
      'External fan cooling without a normal airflow path through the windings.',
      'Cage-induction motor construction within the Flowpak family.',
      'Horizontal and vertical mounting arrangements available by model.',
      'Cooling and enclosure selection matched to the installation environment.',
    ],
    applications: [
      'Water-transfer and process pump drives.',
      'Industrial fans and blowers.',
      'Conveyors in manufacturing plants.',
      'Auxiliary drives in bulk-material processing.',
    ],
    industries: ['Water Treatment', 'Concrete Industries', 'Sugar Industries'],
    selectionGuide:
      'Provide voltage, power, speed, mounting and ambient conditions. TEFC describes cooling construction; specify ingress protection or hazardous-area requirements separately.',
  },
  'meknoid-marathon-slip-ring-motor': {
    tagline: 'Wound-rotor motors for controlled starting of demanding mechanical loads.',
    overview:
      'Marathon slip-ring motors use a wound rotor with accessible rotor connections for an external starting circuit. They suit duties where starting torque, acceleration and repeated movement need to be coordinated with the driven machine.',
    features: [
      'Wound-rotor construction with slip-ring connections.',
      'External rotor resistance can shape starting torque and current.',
      'Crane-focused KS family for intermittent lifting and travel duties.',
      'Starting equipment and rotor-circuit ratings selected as a matched system.',
    ],
    applications: [
      'Crane hoisting drives.',
      'Long-travel and cross-travel crane mechanisms.',
      'Hauling machinery with demanding starting loads.',
      'Replacement of existing wound-rotor drive installations.',
    ],
    industries: ['Material Handling', 'Shipbuilding', 'Concrete Industries'],
    selectionGuide:
      'Send the stator and rotor nameplate details, driven-load inertia, start frequency and resistor-controller information. Allow maintenance access to the slip rings and brushes.',
  },
  'meknoid-marathon-axial-flow-fan': {
    tagline: 'Direct airflow for industrial ventilation and air circulation.',
    overview:
      'Marathon axial-flow fans move air along the axis of the impeller, making them useful for ventilation routes with a relatively direct airflow path. Match the fan to both the required air volume and the resistance of the complete system.',
    features: [
      'Axial airflow arrangement for ventilation and circulation duties.',
      'Range includes duct, roof-extraction and belt-driven configurations.',
      'Impeller and motor combinations selected for the operating duty point.',
      'Installation arrangement chosen to suit the available space and air path.',
    ],
    applications: [
      'Fresh-air supply to production areas.',
      'Ducted factory ventilation.',
      'Roof extraction with an appropriate fan assembly.',
      'Air circulation around industrial equipment.',
    ],
    industries: ['Concrete Industries', 'Sugar Industries', 'Shipbuilding'],
    selectionGuide:
      'Provide airflow, static pressure, air temperature, contaminants and duct dimensions. Smoke extraction or hazardous atmospheres require a specifically approved fan configuration.',
  },
  'meknoid-marathon-exhaust-fan': {
    tagline: 'Ventilate work areas by removing warm, stale air at the source.',
    overview:
      'Marathon exhaust fans support everyday air exchange in workshops, utility rooms and production spaces. Propeller-style fans are particularly useful for short, low-resistance exhaust paths, with fresh make-up air included in the ventilation plan.',
    features: [
      'Propeller fan arrangement for general extraction and ventilation.',
      'Sizes and motor options selected around the required airflow.',
      'Suitable selection begins with the resistance of guards, louvers and openings.',
      'Can form part of a balanced supply-and-extract ventilation system.',
    ],
    applications: [
      'Workshop air exchange.',
      'Removal of warm air from machinery rooms.',
      'General factory-wall extraction.',
      'Ventilation of packing and storage areas.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Concrete Industries'],
    selectionGuide:
      'Share room size, heat load, mounting opening, supply voltage and discharge arrangement. Identify fumes or combustible dust so the correct extraction system can be specified.',
  },
  'meknoid-marathon-centrifugal-fan': {
    tagline: 'Air movement for ductwork, filtration and process ventilation systems.',
    overview:
      'Marathon centrifugal fans move air through an impeller and casing to serve systems with duct or filter resistance. A choice of impeller designs allows selection around the airflow, pressure and characteristics of the air being handled.',
    features: [
      'Centrifugal fan arrangement for pressure-dependent air movement.',
      'Backward-curved, forward-curved and radial impeller families available.',
      'Single-inlet and double-inlet designs within the manufacturer range.',
      'Duty-point selection considers system losses and operating air density.',
    ],
    applications: [
      'Ducted process ventilation.',
      'Air movement through filtration equipment.',
      'Drying and cooling systems with engineered temperature limits.',
      'Dust-extraction systems using a suitable impeller and materials.',
    ],
    industries: ['Concrete Industries', 'Sugar Industries', 'Packaging Industries'],
    selectionGuide:
      'Provide airflow, pressure, air temperature and dust or vapor details. Include a system sketch so inlet conditions, discharge orientation and material compatibility can be reviewed.',
  },
  'siemens-induction-motor': {
    tagline: 'Versatile induction drives for pumps, fans and production machinery.',
    overview:
      'Siemens industrial induction motors convert electrical power into the rotary motion that keeps plant equipment running. Choose the appropriate motor family for your load, installation and supply, whether fitting new machinery or replacing an existing drive.',
    features: [
      'Induction-motor operation for a broad range of industrial loads.',
      'General-purpose and more demanding-duty families available.',
      'Frame, speed and mounting options matched to the machine interface.',
      'Line or converter operation selected according to the specific motor design.',
    ],
    applications: [
      'Water-treatment pump drives.',
      'Production conveyors.',
      'Industrial ventilation fans.',
      'Auxiliary machinery and plant utility drives.',
    ],
    industries: ['Water Treatment', 'Material Handling', 'Packaging Industries'],
    selectionGuide:
      'Send the motor order number or nameplate, power, speed, voltage, mounting code and starting method. For inverter operation, include the required speed range.',
  },
  'siemens-ie4-motor': {
    tagline: 'Super-premium-efficiency drive options for frequently operated equipment.',
    overview:
      'Siemens IE4 motor selections focus on reducing motor losses in applications with substantial operating hours. Evaluate this efficiency class alongside the actual duty, installation dimensions and control system when planning a new drive or replacement.',
    features: [
      'IE4 super-premium efficiency class for the selected motor rating.',
      'Low-voltage motor options for industrial rotating equipment.',
      'Frame and mounting choices for integration with the driven machine.',
      'Application matching considers part-load operation as well as rated output.',
    ],
    applications: [
      'Long-running pump installations.',
      'Production ventilation and fan drives.',
      'Conveyors with extended daily operating hours.',
      'Plant motor-efficiency upgrade projects.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Material Handling'],
    selectionGuide:
      'Share operating hours, load profile and supply details with the required mounting dimensions. Confirm the efficiency data for the exact order code being quoted.',
  },
  'siemens-flange-mounting-motor': {
    tagline: 'A direct mechanical interface for pumps, gear units and machine assemblies.',
    overview:
      'A flange-mounted Siemens motor connects to the driven equipment through a defined mounting face. It is a practical arrangement for pump assemblies, gearbox inputs and machinery where the flange locates the motor and supports alignment.',
    features: [
      'Flange interface for direct attachment to compatible equipment.',
      'Mounting selection based on flange diameter, spigot and bolt pattern.',
      'Shaft dimensions matched to the coupling or gearbox input.',
      'Motor orientation and bearing loads checked for the intended installation.',
    ],
    applications: [
      'Close-coupled pump assemblies.',
      'Gearbox and geared-drive inputs.',
      'Vertical machine-drive arrangements where approved.',
      'Replacement motors for equipment with a fixed flange interface.',
    ],
    industries: ['Water Treatment', 'Packaging Industries', 'Food & Beverages'],
    selectionGuide:
      'Provide the mounting code, flange and spigot dimensions, shaft diameter and installation orientation. Include a drawing or existing motor order number for a dimensional match.',
  },
  'siemens-flameproof-motors': {
    tagline: 'Application-specific motor selection for classified hazardous locations.',
    overview:
      'Siemens flameproof motor selections serve projects where the motor must match a defined hazardous-area classification. The precise protection concept, gas group, temperature class and certificate belong to the selected model and must align with the site specification.',
    features: [
      'Flameproof motor families for appropriately classified installations.',
      'Enclosure and terminal-box protection checked against the order code.',
      'Electrical and mechanical options selected around the driven equipment.',
      'Manufacturer certification reviewed for the stated site and operating conditions.',
    ],
    applications: [
      'Pump drives in classified process areas.',
      'Compressor auxiliaries in specified hazardous locations.',
      'Ventilation equipment requiring a matching motor protection concept.',
      'Replacement of documented flameproof motor installations.',
    ],
    industries: ['Oil & Gas', 'Shipbuilding'],
    selectionGuide:
      'Provide the area classification, gas or dust group, temperature class, ambient range and required certification, along with power, speed and supply details.',
  },
  'meknoid-helical-gearbox': {
    tagline: 'Reduce speed and transmit torque to industrial conveying and processing equipment.',
    overview:
      'Premium Transmission helical gearboxes adapt motor speed to the needs of the driven machine. Their helical gear arrangement supports power transmission across a range of conveyor, mixer and bulk-handling duties when the ratio and load capacity are correctly selected.',
    features: [
      'Helical gearing for industrial speed reduction.',
      'Gearbox sizes and ratios selected to meet output-speed requirements.',
      'Shaft and mounting arrangements suited to different machine layouts.',
      'Selection accounts for service factor, peak torque and thermal loading.',
    ],
    applications: [
      'Belt and chain conveyor drives.',
      'Mixing and agitation equipment.',
      'Bulk-material transfer machinery.',
      'Sugar and concrete plant handling systems.',
    ],
    industries: ['Material Handling', 'Sugar Industries', 'Concrete Industries'],
    selectionGuide:
      'Specify input speed, required output speed and torque, daily duty, peak loads and mounting position. Share the existing gearbox ratio and dimensions for a replacement.',
  },
  'meknoid-crane-duty-gearbox': {
    tagline: 'Gear reduction selected around crane loads, movement and duty cycles.',
    overview:
      'Crane-duty gearboxes connect the motor to lifting or travel machinery while delivering the required output speed and torque. Selection must consider suspended loads, acceleration, braking and repeated cycles as part of the complete crane drive.',
    features: [
      'Reduction ratio matched to the required lifting or travel speed.',
      'Load assessment includes acceleration, reversal and braking torque.',
      'Shaft arrangement selected to suit the drum, wheel or coupling interface.',
      'Service-duty and lubrication requirements reviewed for the mounting position.',
    ],
    applications: [
      'Crane long-travel drives.',
      'Trolley cross-travel mechanisms.',
      'Engineered hoisting drives with a compatible holding brake.',
      'Material-handling winches selected for the specified duty.',
    ],
    industries: ['Material Handling', 'Shipbuilding', 'Concrete Industries'],
    selectionGuide:
      'Provide the crane duty class, lifted or moving load, speed, cycle frequency, brake details and shaft layout. Confirm lifting suitability for the exact gearbox model.',
  },
  'meknoid-altra-gearbox': {
    tagline: 'Gearbox sourcing matched to your existing drive and installation.',
    overview:
      'The ALTRA gearbox listing supports enquiries for a replacement or application-matched reduction drive. Share the series or nameplate details so Wyztec can identify the gear arrangement, mechanical interface and operating requirements before preparing an offer.',
    features: [
      'Selection starts from the existing gearbox model or machine requirement.',
      'Input and output speed matching for the required reduction ratio.',
      'Shaft, mounting and coupling dimensions reviewed together.',
      'Load cycle and installation orientation included in the selection process.',
    ],
    applications: [
      'Replacement of an identified gearbox on production machinery.',
      'Conveyor drive enquiries subject to model confirmation.',
      'Packaging-machine reduction-drive selection.',
      'General material-transfer drive refurbishment.',
    ],
    industries: ['Material Handling', 'Packaging Industries'],
    selectionGuide:
      'Send the ALM size or a readable nameplate photo, ratio, input power, shaft dimensions and mounting position. Confirm the selected gearbox torque and thermal rating for the duty.',
  },
  'meknoid-bevel-helical-gearbox': {
    tagline: 'Right-angle power transmission for machinery with a compact drive layout.',
    overview:
      'Bevel-helical gearboxes combine a change in shaft direction with speed reduction. This arrangement helps position the motor alongside the driven machine, making it useful where conveyor, mixer or handling equipment needs a right-angle drive.',
    features: [
      'Bevel and helical gearing within a right-angle drive arrangement.',
      'Reduction ratio selected for the required output speed.',
      'Shaft and mounting options depend on the chosen series.',
      'Sizing considers output torque, duty cycle and external shaft loads.',
    ],
    applications: [
      'Conveyor drives with limited installation space.',
      'Right-angle drives for mixing equipment.',
      'Bulk-handling and transfer machinery.',
      'Packaging-line drives needing a change in shaft direction.',
    ],
    industries: ['Material Handling', 'Packaging Industries', 'Sugar Industries'],
    selectionGuide:
      'Provide the ratio, output torque, shaft arrangement and mounting position, plus any radial or axial loads. Include installation drawings where space is restricted.',
  },
  'meknoid-metalwork-pneumatic-cylinder': {
    tagline: 'Linear motion for clamping, pushing and positioning on automated machinery.',
    overview:
      'Metal Work pneumatic cylinders turn compressed air into linear movement. From compact machine functions to longer travel, the cylinder is selected around the required force, stroke and cycle so it fits the motion task and installation space.',
    features: [
      'Cylinder families include standard, compact and rodless arrangements.',
      'Bore and stroke choices for different force and travel requirements.',
      'Mounting accessories matched to the machine geometry.',
      'Cushioning and position-sensing options vary by cylinder series.',
    ],
    applications: [
      'Clamping workpieces in machine fixtures.',
      'Pushing and diverting products on conveyors.',
      'Packaging-machine opening and closing movements.',
      'Positioning stops and gates in handling equipment.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Food & Beverages'],
    selectionGuide:
      'Share operating pressure, required force, stroke, cycle rate and mounting space. Include guidance arrangements and side loads so the cylinder is not used as an unsupported slide.',
  },
  'meknoid-metalwork-frl-unit': {
    tagline: 'Prepare compressed air and set working pressure at the point of use.',
    overview:
      'Metal Work air-preparation units help condition compressed air before it reaches valves and actuators. Select filtration and pressure regulation for the circuit, adding a lubricator only when the downstream equipment requires lubricated air.',
    features: [
      'Filter, regulator and lubricator functions available in modular ranges.',
      'Filtration selected to suit the required air quality.',
      'Pressure regulation for the downstream pneumatic circuit.',
      'Port size, flow capacity and condensate-drain options matched to the installation.',
    ],
    applications: [
      'Air preparation at automated machine inlets.',
      'Regulated supply to pneumatic cylinders and valves.',
      'Separate pressure zones on packaging equipment.',
      'Servicing existing pneumatic air-preparation assemblies.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Concrete Industries'],
    selectionGuide:
      'Specify inlet pressure, required outlet pressure, peak airflow, filtration requirement and drain preference. Confirm whether lubrication is permitted or required by the connected equipment.',
  },
  'meknoid-metalwork-pneumatic-fittings': {
    tagline: 'Build practical air connections between tubing, valves and actuators.',
    overview:
      'Metal Work pneumatic fittings connect the air circuit across your machine. Straight, elbow, tee and adapter arrangements help route tubing neatly, with the fitting material, thread and tube size selected for the operating conditions.',
    features: [
      'Push-in and other connection families for pneumatic tubing.',
      'Straight and angled configurations for accessible tube routing.',
      'Thread and tube-size options across the manufacturer range.',
      'Material choices selected for the medium and installation environment.',
    ],
    applications: [
      'Cylinder and directional-valve air connections.',
      'Pneumatic distribution on packaging machines.',
      'Tube-routing changes during machine maintenance.',
      'Branch connections for air-operated handling equipment.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Food & Beverages'],
    selectionGuide:
      'Specify tube outside diameter, tube material, thread standard, pressure and temperature. For washdown or food-related use, identify the required materials and applicable approvals.',
  },
  'metal-work-valve-island': {
    tagline: 'Group pneumatic control valves into a coordinated machine-level assembly.',
    overview:
      'Metal Work valve islands bring multiple directional valves together around a shared air supply. They help organize machines with several actuators, with electrical connections and communication options selected to suit the control architecture.',
    features: [
      'Multiple valve stations grouped in a modular assembly.',
      'Shared pneumatic supply and exhaust paths reduce scattered connections.',
      'Electrical connection options vary across valve-island families.',
      'Fieldbus integration is available in suitable system configurations.',
    ],
    applications: [
      'Multi-cylinder packaging machines.',
      'Sorting and transfer stations.',
      'Assembly fixtures with several pneumatic movements.',
      'Consolidating valve control during machine upgrades.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Food & Beverages'],
    selectionGuide:
      'List actuator quantities, valve functions, airflow and pressure zones. Include the PLC interface, communication protocol and required expansion capacity.',
  },
  'metal-work-solenoid-valve': {
    tagline: 'Electrical switching of compressed air for automated machine movements.',
    overview:
      'Metal Work solenoid valves direct compressed air in response to an electrical control signal. Choose the valve function and flow capacity to operate the connected actuator, then match the coil and connection arrangement to the machine controls.',
    features: [
      'Electrically actuated directional control for pneumatic circuits.',
      'Valve functions selected around single- or double-acting actuators.',
      'Port sizes and flow ratings vary with the valve series.',
      'Coil voltage, return arrangement and mounting specified for the application.',
    ],
    applications: [
      'Extending and retracting pneumatic cylinders.',
      'Automated clamping and release circuits.',
      'Air switching on packaging equipment.',
      'Replacement of individual valves on production machinery.',
    ],
    industries: ['Packaging Industries', 'Material Handling', 'Concrete Industries'],
    selectionGuide:
      'Provide the valve symbol or port configuration, coil voltage, working pressure, required flow and connector type. Specify the required state when electrical power is removed.',
  },
  'jumo-ph-sensor': {
    tagline: 'Measure acidity and alkalinity in water and aqueous process liquids.',
    overview:
      'JUMO pH sensors provide the measurement input for monitoring water chemistry and process conditions. Electrode glass, reference system and process mounting are selected together so the sensor suits the liquid and can be maintained and calibrated effectively.',
    features: [
      'Electrochemical pH measurement for water and aqueous media.',
      'Electrode and diaphragm options for different process conditions.',
      'Connection and insertion-length choices depend on the sensor series.',
      'Integration with a compatible pH transmitter or controller.',
    ],
    applications: [
      'Water-treatment pH monitoring.',
      'Wastewater neutralization control with a suitable controller.',
      'Process-water quality checks in food production.',
      'Monitoring aqueous cleaning and utility streams.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    selectionGuide:
      'Specify the liquid, pH range, temperature, pressure, solids content and transmitter. Include cleaning conditions and the mounting assembly when replacing an electrode.',
  },
  'jumo-jumo-aquis-touch': {
    tagline: 'Bring liquid-analysis measurements and control functions into one interface.',
    overview:
      'JUMO AQUIS touch is a modular platform for liquid-analysis measurement and control. It can bring several water-quality signals into one operator interface, with input modules, sensors and outputs configured around the process.',
    features: [
      'Multichannel architecture for liquid-analysis measurements.',
      'Touchscreen operation for viewing and configuring process values.',
      'Analysis-input options selected for parameters such as pH and conductivity.',
      'Configurable control and switching outputs according to the installed modules.',
    ],
    applications: [
      'Water-treatment monitoring panels.',
      'Combined pH and conductivity measurement stations.',
      'Process-water supervision in food and beverage facilities.',
      'Plant upgrades that consolidate multiple analysis instruments.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    selectionGuide:
      'List every measurement parameter and sensor, required control loops, outputs and communications. Confirm the AQUIS touch variant and installed modules before ordering.',
  },
  'jumo-jumo-cti-750': {
    tagline: 'Inductive conductivity measurement for liquid concentration and cleaning processes.',
    overview:
      'JUMO CTI-750 measures conductivity or concentration in liquid media using an inductive sensor. Integrated temperature measurement supports compensation, while its process functions make it useful for monitoring cleaning solutions and changes between liquid phases.',
    features: [
      'Inductive conductivity measurement without exposed measuring electrodes.',
      'Integrated temperature measurement for compensation.',
      'Switchable measurement ranges for different process phases.',
      'Concentration measurement and switching functions for configured media.',
    ],
    applications: [
      'Monitoring clean-in-place cleaning solutions.',
      'Tracking concentration of compatible acids or alkalis.',
      'Detecting transitions between rinse water and cleaning media.',
      'Conductivity monitoring in industrial process liquids.',
    ],
    industries: ['Food & Beverages', 'Water Treatment', 'Sugar Industries'],
    selectionGuide:
      'Provide liquid composition, conductivity or concentration range, temperature and process connection. Confirm chemical compatibility and the required output or switching functions.',
  },
  'jumo-flowmeters': {
    tagline: 'Track liquid movement across process lines and plant utilities.',
    overview:
      'JUMO flowmeters turn liquid flow into information that operators and control systems can use. Select the measuring principle, wetted materials and connection for the medium, whether monitoring a water circuit or a production process.',
    features: [
      'Flow-measurement families for different liquid-process requirements.',
      'Electromagnetic options for electrically conductive liquids.',
      'Process connections and wetted materials selected for the installation.',
      'Signal and communication options depend on the chosen transmitter.',
    ],
    applications: [
      'Monitoring process-water supply.',
      'Liquid-transfer measurement on production lines.',
      'Flow monitoring in cooling and utility circuits.',
      'Measurement inputs for dosing or batch-control systems.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    selectionGuide:
      'Specify the liquid, conductivity, minimum and maximum flow, pipe size, temperature, pressure and required signal. Include hygiene and cleaning requirements for food-process connections.',
  },
  'jumo-paperless-recorders': {
    tagline: 'Make process trends visible and retain measurement history digitally.',
    overview:
      'JUMO paperless recorders collect process signals and display their history without paper chart consumables. They help operators follow changing conditions, investigate deviations and retrieve records, with the recorder configuration matched to the signals and reporting needs.',
    features: [
      'Digital recording and visualization of connected process signals.',
      'Multiple measurement channels according to the recorder configuration.',
      'Trend displays for reviewing process changes over time.',
      'Data transfer and evaluation options depend on the model and software.',
    ],
    applications: [
      'Temperature histories for heating and cooling processes.',
      'Water-treatment measurement logs.',
      'Production troubleshooting using recorded process trends.',
      'Archiving signals from existing transmitters and controllers.',
    ],
    industries: ['Food & Beverages', 'Water Treatment', 'Sugar Industries'],
    selectionGuide:
      'List signal types, channel count, recording interval, retention needs and data-export requirements. Specify any audit-trail or regulatory requirements for the exact recorder configuration.',
  },
  'jumo-flowtrans-mag-h20': {
    tagline: 'Compact electromagnetic measurement of conductive-liquid flow and temperature.',
    overview:
      'JUMO flowTRANS MAG H20 combines electromagnetic flow measurement with temperature measurement in a compact instrument. It is designed for conductive liquids in process and auxiliary circuits, with display, connection and communication choices to suit the installation.',
    features: [
      'Electromagnetic measuring principle for conductive liquids.',
      'Flow and temperature measurements in one instrument.',
      'Digital display for reading process values at the measurement point.',
      'IO-Link or Single Pair Ethernet options depending on the ordered version.',
    ],
    applications: [
      'Monitoring cooling-water circuits.',
      'Flow measurement in process-water lines.',
      'Auxiliary liquid circuits in food and beverage equipment.',
      'Machine-level flow monitoring connected to an automation system.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Packaging Industries'],
    selectionGuide:
      'Provide flow range, conductivity, pipe size, medium temperature and pressure. Confirm the process connection and communication variant, including the required power-supply arrangement.',
  },
  'jumo-dtrans-as-02': {
    tagline: 'Combine standard-signal measurement and process control in one configurable device.',
    overview:
      'JUMO dTRANS AS 02 processes standard analog signals and temperature measurements for industrial monitoring and control. Its configurable controller functions and optional input/output modules allow the instrument to be adapted to a defined process task.',
    features: [
      'Measurement of standard signals and supported temperature inputs.',
      'Two-state, three-state, three-step and continuous controller functions.',
      'Optional boards extend input and output configurations.',
      'Parameter-set switching and mathematical functions support process adaptation.',
    ],
    applications: [
      'Temperature control in heating equipment.',
      'Supervision of transmitter signals in water-treatment panels.',
      'Control functions on process-automation skids.',
      'Retrofit of individual measurement and control loops.',
    ],
    industries: ['Water Treatment', 'Food & Beverages', 'Sugar Industries'],
    selectionGuide:
      'Specify sensor or signal type, control behavior, setpoint range, output requirements and supply. Include the existing order code when replacing a configured instrument.',
  },
  'jumo-logoscreen-700': {
    tagline: 'Touchscreen process recording with configurable channels and operator views.',
    overview:
      'JUMO LOGOSCREEN 700 combines digital process recording with an icon-based touchscreen interface. Configurable signal acquisition and process views help operators follow production conditions and review measurement history from a single panel-mounted instrument.',
    features: [
      'Color touchscreen with icon-based navigation.',
      'Configurable analog and digital inputs according to the hardware version.',
      'Customizable process screens for presenting relevant measurements.',
      'PROFINET IO available as an option for compatible automation systems.',
    ],
    applications: [
      'Recording heating and cooling cycles.',
      'Monitoring multiple process signals on a production line.',
      'Water-treatment trend recording.',
      'Investigating process deviations using stored measurement histories.',
    ],
    industries: ['Food & Beverages', 'Water Treatment', 'Sugar Industries'],
    selectionGuide:
      'Specify channel count, signal types, recording interval and required outputs. Include network, storage and software requirements so the correct hardware and options are selected.',
  },
  'jumo-thermocouples': {
    tagline: 'Temperature probes selected for the process, mounting and response needed.',
    overview:
      'JUMO thermocouples measure temperature through a thermoelectric sensing junction. Screw-in, push-in and mineral-insulated constructions offer different ways to position the sensor in ovens, process equipment and machinery, with sheath and junction choices matched to the environment.',
    features: [
      'Screw-in and push-in styles for different installation arrangements.',
      'Mineral-insulated versions for compact and adaptable probe construction.',
      'Thermocouple type and protection material selected for the process temperature.',
      'Connection and insertion-length choices matched to the instrument and mounting.',
    ],
    applications: [
      'Temperature measurement in industrial ovens and dryers.',
      'Monitoring heated tooling and packaging equipment.',
      'Process heating measurements in food-production machinery.',
      'Replacement probes for existing temperature-control loops.',
    ],
    industries: ['Packaging Industries', 'Food & Beverages', 'Sugar Industries'],
    selectionGuide:
      'Specify temperature range, thermocouple type, sheath material, diameter, insertion length and process connection. Confirm the permissible temperature for the complete selected probe assembly.',
  },
};
