<script setup lang="ts">
import { site } from '~/data/site';

const { public: config } = useRuntimeConfig();

// Štruktúrované dáta pre vyhľadávače (Google: názov, adresa, otváracie hodiny, poloha).
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BarberShop',
        name: site.name,
        url: config.siteUrl,
        telephone: site.phone.href.replace('tel:', ''),
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          postalCode: site.address.city.split(' ').slice(0, 2).join(' '),
          addressLocality: 'Trnava',
          addressCountry: 'SK',
        },
        geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '19:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '08:00',
            closes: '13:00',
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <div>
    <HeroSection />
    <ServicesSection />
    <BookingCta />
    <ReviewsSection />
    <LocationSection />
  </div>
</template>
