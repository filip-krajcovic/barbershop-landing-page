/**
 * Recenzie zobrazené na landing page.
 *
 * POZOR: ide o UKÁŽKOVÉ texty z dizajnu. Pred spustením webu ich nahraď skutočnými
 * recenziami z Google (so súhlasom autorov), rovnako ako `site.rating` v `site.ts`.
 */
export interface Review {
  name: string;
  when: string;
  stars: number;
  text: string;
}

export const reviews: Review[] = [
  {
    name: 'Martin Kováč',
    when: 'pred 2 týždňami',
    stars: 5,
    text: 'Konečne barber, ktorý počúva. Marek sa najprv opýtal, ako sa o vlasy starám, a podľa toho navrhol strih. Drží aj po troch týždňoch.',
  },
  {
    name: 'Peter Hudec',
    when: 'pred mesiacom',
    stars: 5,
    text: 'Holenie britvou s horúcim uterákom je zážitok. Pokojná atmosféra, dobrá káva a žiadny zhon. Odchádzal som ako nový.',
  },
  {
    name: 'Lukáš Brezina',
    when: 'pred mesiacom',
    stars: 5,
    text: 'Rezervácia online za minútu, prišiel som a išiel som hneď na rad. Upozornili ma aj na platenú zónu, ušetrili mi pokutu.',
  },
  {
    name: 'Jakub Ondrejka',
    when: 'pred 2 mesiacmi',
    stars: 5,
    text: 'Tomáš mi dal bradu do poriadku a poradil, aký olej používať. Čisto, voňavo, profesionálne. Odporúčam každému.',
  },
  {
    name: 'Samuel Mikuš',
    when: 'pred 3 mesiacmi',
    stars: 4,
    text: 'Super fade, presné kontúry. Jediné mínus je, že v sobotu je ťažké nájsť voľný termín, treba rezervovať dopredu.',
  },
  {
    name: 'Richard Polák',
    when: 'pred 3 mesiacmi',
    stars: 5,
    text: 'Chodím sem so synom, obaja spokojní. Dávid má trpezlivosť aj s malým a výsledok vždy sedí.',
  },
];
