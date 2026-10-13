import type { Barber } from '@britva/shared';

/** Barberi, ktorí robia danú službu. Kľúč závisí od služby, takže sa dáta zdieľajú v dialógu. */
export function useBarbers(serviceId: MaybeRefOrGetter<string | null>) {
  const api = useApi();
  return useAsyncData(
    () => `barbers-${toValue(serviceId) ?? 'none'}`,
    async () => {
      const id = toValue(serviceId);
      return id ? api<Barber[]>('/barbers', { query: { serviceId: id } }) : [];
    },
    { default: () => [] as Barber[], server: false },
  );
}
