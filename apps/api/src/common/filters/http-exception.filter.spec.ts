import { ArgumentsHost, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

function mockHost() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('zachová status, správu aj zoznam chýb', () => {
    const { host, status, json } = mockHost();
    filter.catch(
      new BadRequestException({ message: 'Neplatné', errors: [{ path: 'a', message: 'b' }] }),
      host,
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Neplatné',
      errors: [{ path: 'a', message: 'b' }],
    });
  });

  it('spracuje štandardnú Nest výnimku', () => {
    const { host, json } = mockHost();
    filter.catch(new NotFoundException('Nenájdené'), host);
    expect(json).toHaveBeenCalledWith({ statusCode: 404, message: 'Nenájdené' });
  });

  it('neočakávanú chybu zaloguje a nevráti jej detaily', () => {
    const log = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { host, status, json } = mockHost();
    filter.catch(new Error('db password leaked'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Nastala neočakávaná chyba.',
    });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
