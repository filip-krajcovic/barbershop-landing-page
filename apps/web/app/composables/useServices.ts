import type { Service } from '@britva/shared';

/**
 * Cenník služieb z API. Načíta sa pri SSR a zdieľa sa (rovnaký kľúč) medzi
 * hero kartou, cenníkom a rezervačným dialógom – request ide iba raz.
 */
export function useServices() {
  const api = useApi();
  return useAsyncData('services', () => api<Service[]>('/services'), {
    default: () => [] as Service[],
  });
}
