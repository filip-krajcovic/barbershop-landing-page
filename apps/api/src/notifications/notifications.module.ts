import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { RemindersService } from './reminders.service.js';
import { LoggingSmsSender, SMS_SENDER } from './sms.service.js';

@Global()
@Module({
  providers: [
    { provide: SMS_SENDER, useClass: LoggingSmsSender },
    NotificationsService,
    RemindersService,
  ],
  exports: [NotificationsService, SMS_SENDER],
})
export class NotificationsModule {}
