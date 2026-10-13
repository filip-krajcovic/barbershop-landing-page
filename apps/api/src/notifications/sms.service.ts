import { Injectable, Logger } from '@nestjs/common';

/** Injection token pre odosielanie SMS. */
export const SMS_SENDER = Symbol('SMS_SENDER');

export interface SmsSender {
  send(to: string, text: string): Promise<void>;
}

/**
 * Vývojová implementácia – SMS iba zaloguje.
 * Skutočného poskytovateľa (napr. GoSMS, Twilio) stačí pridať ako ďalšiu implementáciu `SmsSender`.
 */
@Injectable()
export class LoggingSmsSender implements SmsSender {
  private readonly logger = new Logger('SMS');

  async send(to: string, text: string): Promise<void> {
    this.logger.log(`→ ${to}: ${text}`);
  }
}
