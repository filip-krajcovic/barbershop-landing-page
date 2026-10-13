import { Inject, Injectable, Logger } from '@nestjs/common';
import { confirmationText, reminderText, type BookingMessageData } from './messages.js';
import { SMS_SENDER, type SmsSender } from './sms.service.js';

export interface BookingNotification extends BookingMessageData {
  phone: string;
}

/**
 * Notifikácie zákazníkom. Chyba odoslania sa zaloguje, ale nikdy nezhodí
 * operáciu, ktorá ju vyvolala (rezervácia platí aj bez SMS).
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@Inject(SMS_SENDER) private readonly sms: SmsSender) {}

  bookingConfirmed(booking: BookingNotification): Promise<boolean> {
    return this.safeSend(booking.phone, confirmationText(booking), booking.code);
  }

  bookingReminder(booking: BookingNotification): Promise<boolean> {
    return this.safeSend(booking.phone, reminderText(booking), booking.code);
  }

  private async safeSend(to: string, text: string, code: string): Promise<boolean> {
    try {
      await this.sms.send(to, text);
      return true;
    } catch (error) {
      this.logger.error(`SMS pre rezerváciu ${code} sa nepodarilo odoslať: ${String(error)}`);
      return false;
    }
  }
}
