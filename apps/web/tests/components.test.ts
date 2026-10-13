import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import AppFooter from '~/components/layout/AppFooter.vue';
import AppHeader from '~/components/layout/AppHeader.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import StarRating from '~/components/ui/StarRating.vue';

describe('BaseButton', () => {
  it('bez odkazu je to <button type="button">', async () => {
    const wrapper = await mountSuspended(BaseButton, { slots: { default: () => 'Rezervovať' } });
    const button = wrapper.get('button');
    expect(button.attributes('type')).toBe('button');
    expect(button.text()).toBe('Rezervovať');
  });

  it('s `to` je to odkaz, s `newTab` otvára nové okno bezpečne', async () => {
    const internal = await mountSuspended(BaseButton, { props: { to: '/#sluzby' } });
    expect(internal.get('a').attributes('href')).toBe('/#sluzby');

    const external = await mountSuspended(BaseButton, {
      props: { href: 'https://www.google.com/maps', newTab: true },
    });
    const a = external.get('a');
    expect(a.attributes('target')).toBe('_blank');
    expect(a.attributes('rel')).toContain('noopener');
  });

  it('disabled tlačidlo', async () => {
    const wrapper = await mountSuspended(BaseButton, { props: { disabled: true } });
    expect(wrapper.get('button').attributes()).toHaveProperty('disabled');
  });
});

describe('StarRating', () => {
  it('má prístupný popis a zaokrúhli počet plných hviezd', async () => {
    const wrapper = await mountSuspended(StarRating, { props: { value: 4.9 } });
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('Hodnotenie 4,9 z 5');
    expect(wrapper.findAll('svg[data-filled="true"]')).toHaveLength(5);

    const four = await mountSuspended(StarRating, { props: { value: 4 } });
    expect(four.findAll('svg[data-filled="true"]')).toHaveLength(4);
  });
});

describe('AppHeader a AppFooter', () => {
  it('hlavička má navigáciu na sekcie a tlačidlo rezervácie', async () => {
    const wrapper = await mountSuspended(AppHeader);
    const nav = wrapper.get('nav[aria-label="Hlavná navigácia"]');
    const hrefs = nav.findAll('a').map((a) => a.attributes('href'));
    expect(hrefs).toEqual(['/#sluzby', '/#recenzie', '/#lokalita']);

    await nav.get('button').trigger('click');
    expect(useBooking().state.value).toMatchObject({ isOpen: true, step: 1 });
  });

  it('pätička má rok a odkaz na ochranu súkromia', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()}`);
    expect(wrapper.find('a[href="/ochrana-sukromia"]').exists()).toBe(true);
  });
});
