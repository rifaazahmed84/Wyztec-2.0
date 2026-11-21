export const company = {
  name: 'Wyztec Solutions FZ-LLC',
  phone: '+971 5512 64045',
  tel: '+971551264045',
  email: 'sales@wyztec.com',
  address: 'P.O. Box 16111, Al Hamra Industrial Zone-FZ, Ras Al Khaimah, United Arab Emirates',
  url: import.meta.env.VITE_SITE_URL || 'https://wyztec.com',
  whatsapp:
    'https://wa.me/971551264045?text=Hello%20Wyztec%2C%20I%20would%20like%20to%20discuss%20an%20industrial%20product%20requirement.',
};
// Add official company profile URLs to enable social links. Unconfigured links are not rendered.
export const socialLinks: { label: string; url: string }[] = [];
export const navigation = [
  ['Home', '/'],
  ['About', '/about'],
  ['Industries', '/industries'],
  ['Market Segments', '/market-segments'],
  ['Products', '/products'],
  ['Contact', '/contact'],
];
