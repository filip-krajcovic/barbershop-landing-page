import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import { NotificationsService } from './notifications.service.js';

/**
 * Pripomienka deň vopred. Posiela sa rezerváciám, ktoré začínajú o 2–24 h
 * a boli vytvorené viac ako deň vopred (pri rezervácii na dnes by bola zbytočná).
 * `reminder_sent_at` sa nastaví atomicky v UPDATE … RETURNING, takže ani pri viacerých
 * inštanciách API neodíde pripomienka dvakrát.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendDueReminders(now = new Date()): Promise<number> {
    const result = await this.db.execute<{
      code: string;
      phone: string;
      starts_at: Date;
      service_name: string;
      barber_name: string;
    }>(sql`
      UPDATE bookings b
         SET reminder_sent_at = ${now}
        FROM services s, barbers br
       WHERE s.id = b.service_id
         AND br.id = b.barber_id
         AND b.status = 'confirmed'
         AND b.reminder_sent_at IS NULL
         AND b.starts_at >  ${now}::timestamptz + interval '2 hours'
         AND b.starts_at <= ${now}::timestamptz + interval '24 hours'
         AND b.created_at <  b.starts_at - interval '24 hours'
      RETURNING b.code, b.phone, b.starts_at, s.name AS service_name, br.name AS barber_name
    `);

    for (const row of result.rows) {
      await this.notifications.bookingReminder({
        code: row.code,
        phone: row.phone,
        startsAt: new Date(row.starts_at),
        serviceName: row.service_name,
        barberName: row.barber_name,
      });
    }
    if (result.rows.length > 0) {
      this.logger.log(`Odoslané pripomienky: ${result.rows.length}`);
    }
    return result.rows.length;
  }
}
