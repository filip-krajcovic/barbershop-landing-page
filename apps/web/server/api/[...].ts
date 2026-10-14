/**
 * Preposiela `/api/**` na NestJS API (`NUXT_API_PROXY_URL`). Prehliadač tak volá iba doménu
 * webu a session cookie better-auth je first-party, aj keď API beží inde (napr. za Cloudflare
 * Tunnel na lokálnom PC). IP návštevníka sa posiela pre rate limit rezervácií.
 */
export default defineEventHandler((event) => {
  const { apiProxyUrl, apiProxySecret } = useRuntimeConfig(event);
  // cf-connecting-ip nastavuje Cloudflare a návštevník ho nevie podvrhnúť
  const clientIp = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestIP(event);
  return proxyRequest(event, apiProxyTarget(apiProxyUrl, event.path), {
    headers: apiProxyHeaders(apiProxySecret, clientIp),
  });
});
