import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
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
  it('desktop navigácia má odkazy na sekcie, účet a tlačidlo rezervácie', async () => {
    const wrapper = await mountSuspended(AppHeader);
    const nav = wrapper.get('[data-testid="desktop-nav"]');
    const hrefs = nav.findAll('a').map((a) => a.attributes('href'));
    expect(hrefs).toEqual(['/#sluzby', '/#recenzie', '/#lokalita', '/prihlasenie']);

    await nav.get('button').trigger('click');
    expect(useBooking().state.value).toMatchObject({ isOpen: true, step: 1 });
    useBooking().close();
  });

  it('pätička má rok a odkaz na ochranu súkromia', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()}`);
    expect(wrapper.find('a[href="/ochrana-sukromia"]').exists()).toBe(true);
  });
});

describe('AppHeader – mobilné menu', () => {
  const toggle = (w: Awaited<ReturnType<typeof mountSuspended>>) =>
    w.get('button[aria-controls="mobile-menu"]');

  it('tlačidlo otvorí a zavrie menu, aria-expanded a popis sa menia', async () => {
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);
    expect(toggle(wrapper).attributes('aria-expanded')).toBe('false');
    expect(toggle(wrapper).attributes('aria-label')).toBe('Otvoriť menu');

    await toggle(wrapper).trigger('click');
    const nav = wrapper.get('[data-testid="mobile-nav"]');
    expect(nav.attributes('id')).toBe('mobile-menu');
    expect(nav.findAll('a').map((a) => a.attributes('href'))).toEqual([
      '/#sluzby',
      '/#recenzie',
      '/#lokalita',
      '/prihlasenie',
    ]);
    expect(toggle(wrapper).attributes('aria-expanded')).toBe('true');
    expect(toggle(wrapper).attributes('aria-label')).toBe('Zavrieť menu');

    await toggle(wrapper).trigger('click');
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);
  });

  it('klik na odkaz a na pozadie menu zavrie', async () => {
    const wrapper = await mountSuspended(AppHeader);
    await toggle(wrapper).trigger('click');
    await wrapper.get('[data-testid="mobile-nav"] a').trigger('click');
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);

    await toggle(wrapper).trigger('click');
    await wrapper.get('[data-testid="menu-backdrop"]').trigger('click');
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);
  });

  it('Esc menu zavrie a vráti focus na tlačidlo', async () => {
    const wrapper = await mountSuspended(AppHeader, { attachTo: document.body });
    await toggle(wrapper).trigger('click');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);
    expect(document.activeElement).toBe(toggle(wrapper).element);
    wrapper.unmount();
  });

  it('Rezervovať termín zavrie menu a otvorí rezervačný dialóg', async () => {
    const wrapper = await mountSuspended(AppHeader);
    await toggle(wrapper).trigger('click');
    await wrapper.get('[data-testid="mobile-nav"] button').trigger('click');
    expect(wrapper.find('[data-testid="mobile-nav"]').exists()).toBe(false);
    expect(useBooking().state.value.isOpen).toBe(true);
    useBooking().close();
  });
});
