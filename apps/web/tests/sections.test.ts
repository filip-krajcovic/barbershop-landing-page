import type { NextFreeSlot, Service } from '@britva/shared';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it } from 'vitest';
import { ref } from 'vue';
import NextSlotCard from '~/components/sections/NextSlotCard.vue';
import ReviewsSection from '~/components/sections/ReviewsSection.vue';
import ServicesSection from '~/components/sections/ServicesSection.vue';
import { reviews } from '~/data/reviews';

const services: Service[] = [
  {
    id: '1b4e28ba-2fa1-4d3b-a3f5-ef19b5a7633b',
    slug: 'pansky-strih',
    name: 'Pánsky strih',
    description: 'Konzultácia a strih.',
    durationMin: 45,
    priceCents: 2200,
  },
  {
    id: '2c5f39cb-3ab2-4e4c-b4a6-f02ac6b8744c',
    slug: 'skin-fade',
    name: 'Skin fade',
    description: 'Prechod do kože.',
    durationMin: 50,
    priceCents: 2550,
  },
];

const state = {
  services: ref<Service[]>(services),
  servicesError: ref<Error | null>(null),
  slot: ref<NextFreeSlot>(null),
  slotStatus: ref<'idle' | 'pending' | 'success' | 'error'>('success'),
};

mockNuxtImport('useServices', () => () => ({ data: state.services, error: state.servicesError }));
mockNuxtImport('useNextFreeSlot', () => () => ({ data: state.slot, status: state.slotStatus }));

beforeEach(() => {
  state.services.value = services;
  state.servicesError.value = null;
  state.slot.value = null;
  state.slotStatus.value = 'success';
});

describe('ServicesSection', () => {
  it('zobrazí služby s cenou a trvaním', async () => {
    const wrapper = await mountSuspended(ServicesSection);
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]!.text()).toContain('Pánsky strih');
    expect(items[0]!.text()).toContain('22 €');
    expect(items[1]!.text()).toContain('25,50 €');
    expect(items[1]!.text()).toContain('50 min');
    const button = items[1]!.get('button');
    expect(button.attributes('aria-label')).toBe('Rezervovať: Skin fade');
    await button.trigger('click');
    expect(useBooking().state.value).toMatchObject({
      isOpen: true,
      step: 2,
      serviceId: services[1]!.id,
    });
  });

  it('pri chybe API ukáže telefón namiesto cenníka', async () => {
    state.servicesError.value = new Error('API nedostupné');
    const wrapper = await mountSuspended(ServicesSection);
    expect(wrapper.find('[role="alert"]').text()).toContain('+421 900 123 456');
    expect(wrapper.findAll('li')).toHaveLength(0);
  });
});

describe('NextSlotCard', () => {
  it('zobrazí najbližší termín a prvú službu', async () => {
    const startsAt = new Date(Date.now() + 2 * 24 * 3600_000);
    startsAt.setUTCHours(8, 0, 0, 0);
    state.slot.value = {
      serviceId: services[0]!.id,
      barberId: '3d6a4adc-4bc3-4f5d-85b7-a13bd7c9855d',
      startsAt: startsAt.toISOString(),
      endsAt: startsAt.toISOString(),
    };
    const wrapper = await mountSuspended(NextSlotCard);
    expect(wrapper.text()).toContain('Pánsky strih · 45 min');
    expect(wrapper.get('[data-testid="next-slot"]').text()).toMatch(/· \d{1,2}:\d{2}$/);
    expect(wrapper.text()).toContain('Vybrať tento termín');
  });

  it('bez voľného termínu ponúkne online rezerváciu, počas načítania skeleton', async () => {
    const empty = await mountSuspended(NextSlotCard);
    expect(empty.get('[data-testid="next-slot"]').text()).toBe('Rezervuj online');

    state.slotStatus.value = 'pending';
    const loading = await mountSuspended(NextSlotCard);
    expect(loading.get('[data-testid="next-slot"]').text()).toContain('Načítavam');
  });
});

describe('ReviewsSection', () => {
  it('zobrazí všetky recenzie s hodnotením', async () => {
    const wrapper = await mountSuspended(ReviewsSection);
    expect(wrapper.findAll('figure')).toHaveLength(reviews.length);
    expect(wrapper.findAll('[role="img"]').length).toBe(reviews.length + 1);
  });
});
