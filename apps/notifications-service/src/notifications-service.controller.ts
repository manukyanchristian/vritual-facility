import { Controller, Logger } from '@nestjs/common';
import { NotificationsServiceService } from './notifications-service.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  constructor(
    private readonly notificationsServiceService: NotificationsServiceService,
  ) {}

  @EventPattern('notification.send')
  sendNotification(@Payload() data: unknown, @Ctx() context: RmqContext) {
    // INFO: in real world this service would be responsible for notificaiton other services (or users).
    // For example, it could send an email to the building manager/department about the alarm.
    // It could also send an SMS message to the maintenance team.

    this.logger.debug(
      `Sending notiifcation about the alarm ${JSON.stringify(data)}`,
    );

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    if (originalMsg.fields.redelivered) {
      this.logger.verbose(
        `Message was already redelivered. Acknowledging the message and discarding it.`,
      );

      return channel.ack(originalMsg);
    }

    channel.nack(originalMsg);
  }
}
