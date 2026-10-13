const whole = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const cents = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

/** Cena v centoch → „22 €“, „22,50 €“ (bežná medzera namiesto nedeliteľnej z Intl). */
export function formatPrice(amountCents: number): string {
  const formatter = amountCents % 100 === 0 ? whole : cents;
  return formatter.format(amountCents / 100).replace(/\s/g, ' ');
}
