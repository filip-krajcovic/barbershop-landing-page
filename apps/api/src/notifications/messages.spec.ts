import { confirmationText, formatLocalDateTime, reminderText } from './messages.js';

const data = {
  code: 'BB-7K3QXM',
  startsAt: new Date('2026-10-14T07:30:00Z'), // 9:30 v Bratislave (letný čas)
  serviceName: 'Pánsky strih',
  barberName: 'Marek',
};

describe('SMS správy', () => {
  it('formátuje dátum v miestnom čase', () => {
    expect(formatLocalDateTime(data.startsAt)).toBe('streda 14. 10. o 9:30');
    expect(formatLocalDateTime(new Date('2026-12-01T16:05:00Z'))).toBe('utorok 1. 12. o 17:05');
  });

  it('potvrdenie a pripomienka obsahujú službu, barbera, čas a kód', () => {
    for (const text of [confirmationText(data), reminderText(data)]) {
      expect(text).toContain('Pánsky strih');
      expect(text).toContain('Marek');
      expect(text).toContain('streda 14. 10. o 9:30');
      expect(text).toContain('BB-7K3QXM');
    }
  });
});
