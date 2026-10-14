import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from '@britva/shared';
import { describe, expect, it } from 'vitest';
import { apiProxyHeaders, apiProxyTarget } from '../shared/utils/api-proxy';

describe('api-proxy', () => {
  it('apiProxyTarget spojí URL API s cestou a query', () => {
    expect(apiProxyTarget('https://api.example.sk', '/api/services?x=1')).toBe(
      'https://api.example.sk/api/services?x=1',
    );
    expect(apiProxyTarget('http://localhost:3001/', '/api/auth/get-session')).toBe(
      'http://localhost:3001/api/auth/get-session',
    );
  });

  it('apiProxyHeaders vždy prepíše tajný kľúč aj IP (aj prázdnymi hodnotami)', () => {
    expect(apiProxyHeaders('tajne', '203.0.113.7')).toEqual({
      [PROXY_SECRET_HEADER]: 'tajne',
      [CLIENT_IP_HEADER]: '203.0.113.7',
    });
    expect(apiProxyHeaders('', undefined)).toEqual({
      [PROXY_SECRET_HEADER]: '',
      [CLIENT_IP_HEADER]: '',
    });
  });

  it('useApiTarget v prehliadači volá vlastný origin webu bez extra hlavičiek', () => {
    const target = useApiTarget();
    expect(target.origin).toBe(window.location.origin);
    expect(target.headers).toBeUndefined();
  });
});
