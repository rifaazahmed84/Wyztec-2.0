// Explicit replacements avoid merging distinct brands or model-specific instruments.
// Legacy URLs and enquiry references continue to resolve to the clearer-image record.
export const productSlugAliases: Record<string, string> = {
  'marathon-ie2-motor': 'meknoid-marathon-ie2-motor',
  'marathon-ie3-motor': 'meknoid-marathon-ie3-motor',
  'marathon-ie4-motor': 'meknoid-marathon-ie4-motor',
  'marathon-crane-duty-motor': 'meknoid-marathon-crane-duty-motor',
  'marathon-tefc-motor': 'meknoid-marathon-tefc-motor',
  'marathon-slip-ring-motor': 'meknoid-marathon-slip-ring-motor',
  'marathon-axial-flow-fan': 'meknoid-marathon-axial-flow-fan',
  'marathon-exhaust-fan': 'meknoid-marathon-exhaust-fan',
  'marathon-centrifugal-fan': 'meknoid-marathon-centrifugal-fan',
  'metal-work-pneumatic-cylinder': 'meknoid-metalwork-pneumatic-cylinder',
  'metal-work-frl-unit': 'meknoid-metalwork-frl-unit',
  'metal-work-pneumatic-fittings': 'meknoid-metalwork-pneumatic-fittings',
  'premium-transmission-helical-gearbox': 'meknoid-helical-gearbox',
  'premium-transmission-crane-duty-gearbox': 'meknoid-crane-duty-gearbox',
  'premium-transmission-altra-gearbox': 'meknoid-altra-gearbox',
  'premium-transmission-bevel-helical-gearbox': 'meknoid-bevel-helical-gearbox',
};
