/** Údaje o prevádzke na jednom mieste (kontakt, adresa, otváracie hodiny, sociálne siete). */
export const site = {
  name: 'Britva Barber',
  company: 'Britva Barber s.r.o.',
  founded: 2017,
  phone: { display: '+421 900 123 456', href: 'tel:+421900123456' },
  address: {
    street: 'Štefánikova 8',
    city: '917 01 Trnava',
    note: '2 min pešo od Trojičného námestia',
  },
  geo: { lat: 48.37782, lng: 17.58851 },
  parking: 'Parkovací dom Kollárova (3 min) — v centre platená zóna',
  openingHours: [
    { days: 'Po – Pi', hours: '9:00 – 19:00' },
    { days: 'Sobota', hours: '8:00 – 13:00' },
    { days: 'Nedeľa', hours: 'zatvorené' },
  ],
  rating: { value: 4.9, count: 312 },
  social: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
  ],
} as const;

const coords = `${site.geo.lat.toFixed(6)},${site.geo.lng.toFixed(6)}`;

export const mapsLinks = {
  search: `https://www.google.com/maps/search/?api=1&query=${coords}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
};
