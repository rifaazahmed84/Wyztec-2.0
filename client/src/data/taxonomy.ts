import {
  Forklift,
  Droplets,
  Fuel,
  Ship,
  Wine,
  Wheat,
  Construction,
  Package,
  Settings2,
  Power,
  Workflow,
  Gauge,
  Component,
  Wind,
  Cable,
} from 'lucide-react';
export const industries = [
  {
    name: 'Material Handling',
    icon: Forklift,
    description:
      'Conveyors, forklifts, pallet jacks and storage systems designed to streamline your workflow.',
    detail:
      'Keep goods moving with drive components, pneumatic handling and dependable power transmission.',
  },
  {
    name: 'Water Treatment',
    icon: Droplets,
    description:
      'Pumps, filtration systems and chemical handling tools for efficient, safe water treatment.',
    detail:
      'Monitor water quality and control flow with application-matched motors, sensors and instrumentation.',
  },
  {
    name: 'Oil & Gas',
    icon: Fuel,
    description:
      'Drive equipment, process instrumentation and pneumatic components for demanding oil and gas applications.',
    detail:
      'Specify your hazardous-area classification, process conditions and documentation requirements with your enquiry.',
  },
  {
    name: 'Shipbuilding',
    icon: Ship,
    description:
      'Motors, ventilation and transmission components for shipyard machinery and marine support systems.',
    detail:
      'Match equipment to duty cycles, corrosion exposure and the applicable project approval requirements.',
  },
  {
    name: 'Food & Beverages',
    icon: Wine,
    description:
      'Drive systems, pneumatic automation and liquid analysis for food and beverage production.',
    detail:
      'Discuss hygiene, washdown conditions and food-contact material requirements before product selection.',
  },
  {
    name: 'Sugar Industries',
    icon: Wheat,
    description:
      'Power transmission, industrial ventilation and process measurement for sugar processing operations.',
    detail:
      'Select equipment for conveyors, mills and process lines using the actual load and environmental conditions.',
  },
  {
    name: 'Concrete Industries',
    icon: Construction,
    description:
      'Motors, gearboxes and pneumatic components for batching, conveying and concrete production.',
    detail:
      'Plan for dust, cyclic loads and demanding start-up conditions across mixing and handling equipment.',
  },
  {
    name: 'Packaging Industries',
    icon: Package,
    description:
      'Compact drives, pneumatic actuation and control components for packaging and material flow.',
    detail:
      'Coordinate motion, changeovers and repeatable handling with components selected for your production cycle.',
  },
];
export const segments = [
  {
    name: 'Pumps & Motors',
    icon: Power,
    description:
      'Electric motors and pump drive solutions selected for operating duty, efficiency and installation.',
    query: 'Motor',
  },
  {
    name: 'Valves',
    icon: Settings2,
    description: 'Pneumatic switching and control valves for reliable direction and flow control.',
    query: 'Valve',
  },
  {
    name: 'Automation Products',
    icon: Workflow,
    description:
      'Our comprehensive range includes PLCs, HMI panels, sensors, and actuators designed to streamline operations and enhance efficiency.',
    query: 'Sensor',
  },
  {
    name: 'Flow & Transmitter',
    icon: Gauge,
    description:
      'Flow measurement and liquid analysis to bring clarity to critical process parameters.',
    query: 'JUMO',
  },
  {
    name: 'Industrial Fittings',
    icon: Component,
    description:
      'Fittings and connections matched to the pressure, media and geometry of your installation.',
    query: 'Fittings',
  },
  {
    name: 'Pneumatic & Hydraulic',
    icon: Wind,
    description:
      'Air preparation, cylinders and pneumatic control, with hydraulic requirements sourced on enquiry.',
    query: 'Pneumatic',
  },
  {
    name: 'Cables & Switchgears',
    icon: Cable,
    description: 'Power and control connection requirements sourced to your project specification.',
    query: '',
  },
];
