import type { NextFreeSlotResponse } from '@britva/shared';

/**
 * Najbližší voľný termín pre službu. Načíta sa iba v prehliadači – závisí od
 * aktuálneho času, takže výsledok zo SSR (alebo z cache) by rýchlo zastaral.
 */
export function useNextFreeSlot(serviceId: MaybeRefOrGetter<string | undefined>) {
  const api = useApi();
  return useLazyAsyncData(
    'next-free-slot',
    async () => {
      const id = toValue(serviceId);
      if (!id) return null;
      const res = await api<NextFreeSlotResponse>('/availability/next-free', {
        query: { serviceId: id },
      });
      return res.slot;
    },
    { server: false, watch: [() => toValue(serviceId)], default: () => null },
  );
}
